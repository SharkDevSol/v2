const express = require('express');
const router = express.Router();
const { authenticateWithBranch } = require('../middleware/branchAuth');

// All report routes require authentication + branch
router.use(authenticateWithBranch);

// Helper: safe query against branch pool
async function q(pool, sql, params = []) {
  try {
    const r = await pool.query(sql, params);
    return r.rows;
  } catch (e) {
    return [];
  }
}

// Helper: get all class table names
async function getClassTables(pool) {
  try {
    const res = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'classes_schema' AND table_name NOT LIKE 'pg_%' ORDER BY table_name`
    );
    return res.rows.map(r => r.table_name);
  } catch (e) {
    return [];
  }
}

// ─── Students ────────────────────────────────────────────────────────────────
router.get('/students/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const tables = await getClassTables(pool);
    let total = 0, male = 0, female = 0;

    for (const t of tables) {
      try {
        const s = await pool.query(`
          SELECT 
            COUNT(*)::int as c, 
            COUNT(*) FILTER (WHERE LOWER(gender)='male')::int as m, 
            COUNT(*) FILTER (WHERE LOWER(gender)='female')::int as f 
          FROM classes_schema."${t}" 
          WHERE (is_active IS NULL OR is_active = TRUE)
        `);
        total += s.rows[0]?.c || 0;
        male += s.rows[0]?.m || 0;
        female += s.rows[0]?.f || 0;
      } catch (err) {}
    }

    res.json({
      success: true,
      data: {
        total,
        totalStudents: total,
        male,
        female,
        classCount: tables.length,
        trend: 0
      }
    });
  } catch (e) {
    res.json({ success: true, data: { total: 0, male: 0, female: 0, classCount: 0, trend: 0 } });
  }
});

router.get('/students/by-class', async (req, res) => {
  const pool = req.branchPool;
  try {
    const tables = await getClassTables(pool);
    const result = [];
    for (const t of tables) {
      try {
        const c = await pool.query(`SELECT COUNT(*)::int as count FROM classes_schema."${t}" WHERE (is_active IS NULL OR is_active = TRUE)`);
        result.push({ class_name: t, count: c.rows[0]?.count || 0 });
      } catch (e) {}
    }
    res.json({ success: true, data: result });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/students/by-gender', async (req, res) => {
  const pool = req.branchPool;
  try {
    const tables = await getClassTables(pool);
    let male = 0, female = 0;
    for (const t of tables) {
      try {
        const s = await pool.query(`
          SELECT 
            COUNT(*) FILTER (WHERE LOWER(gender)='male')::int as m, 
            COUNT(*) FILTER (WHERE LOWER(gender)='female')::int as f 
          FROM classes_schema."${t}" 
          WHERE (is_active IS NULL OR is_active = TRUE)
        `);
        male += s.rows[0]?.m || 0;
        female += s.rows[0]?.f || 0;
      } catch (e) {}
    }
    res.json({
      success: true,
      data: [
        { gender: 'male', count: male },
        { gender: 'female', count: female }
      ]
    });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

// ─── Staff ───────────────────────────────────────────────────────────────────
router.get('/staff/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const countInSchema = async (schemaName) => {
      try {
        const tables = await pool.query(
          `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name NOT LIKE 'pg_%'`, 
          [schemaName]
        );
        let total = 0;
        for (const t of tables.rows) {
          try {
            const c = await pool.query(`SELECT COUNT(*)::int as c FROM "${schemaName}"."${t.table_name}" WHERE (is_active IS NULL OR is_active = TRUE)`);
            total += c.rows[0]?.c || 0;
          } catch(e) {}
        }
        return total;
      } catch(e) { return 0; }
    };
    
    const teachers = await countInSchema('staff_teachers');
    const administrative = await countInSchema('staff_administrative_staff');
    const supportive = await countInSchema('staff_supportive_staff');
    const finance = await countInSchema('staff_finance');
    const total = teachers + administrative + supportive + finance;
    
    res.json({ success: true, data: {
      total,
      totalStaff: total,
      male: 0, female: 0,
      teachers, administrative, supportive, finance,
      trend: 0
    }});
  } catch(e) {
    res.json({ success: true, data: { total: 0, male: 0, female: 0, teachers: 0, administrative: 0, supportive: 0, finance: 0, trend: 0 }});
  }
});

router.get('/staff/by-type', async (req, res) => {
  const pool = req.branchPool;
  try {
    const schemas = [
      { name: 'Teachers', schema: 'staff_teachers' },
      { name: 'Administrative', schema: 'staff_administrative_staff' },
      { name: 'Supportive', schema: 'staff_supportive_staff' },
      { name: 'Finance', schema: 'staff_finance' }
    ];
    const data = [];
    for (const s of schemas) {
      try {
        const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name NOT LIKE 'pg_%'`, [s.schema]);
        let count = 0;
        for (const t of tables.rows) {
          const c = await pool.query(`SELECT COUNT(*)::int as c FROM "${s.schema}"."${t.table_name}" WHERE (is_active IS NULL OR is_active = TRUE)`);
          count += c.rows[0]?.c || 0;
        }
        data.push({ type: s.name, count });
      } catch(e) {}
    }
    res.json({ success: true, data });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/staff/by-role', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/staff/by-gender', async (req, res) => {
  res.json({ success: true, data: [] });
});

// ─── Academic ────────────────────────────────────────────────────────────────
router.get('/academic/class-performance', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT 
        COALESCE(ml.class_name, 'Class') as class_name,
        COALESCE(ROUND(AVG(sm.percentage)::numeric, 1), 0) as avg_score,
        COUNT(DISTINCT sm.student_name)::int as count
      FROM mark_lists ml
      LEFT JOIN student_marks sm ON sm.mark_list_id = ml.id
      GROUP BY ml.class_name
      ORDER BY avg_score DESC
    `).catch(() => ({ rows: [] }));

    if (rows.rows.length > 0) {
      return res.json({ success: true, data: rows.rows.map(r => ({
        className: r.class_name,
        averageScore: parseFloat(r.avg_score) || 0,
        studentCount: parseInt(r.count) || 0
      }))});
    }

    const tables = await getClassTables(pool);
    res.json({
      success: true,
      data: tables.map(t => ({
        className: t,
        averageScore: 0,
        studentCount: 0
      }))
    });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/academic/subject-averages', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT subject_name, ROUND(AVG(percentage)::numeric, 1) as avg
      FROM student_marks
      WHERE subject_name IS NOT NULL
      GROUP BY subject_name
      ORDER BY avg DESC
    `).catch(() => ({ rows: [] }));
    res.json({ success: true, data: rows.rows });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/academic/top-performers', async (req, res) => {
  const pool = req.branchPool;
  try {
    const limit = parseInt(req.query.limit) || 10;
    const rows = await pool.query(`
      SELECT student_name as full_name, ROUND(AVG(percentage)::numeric, 1) as avg_score
      FROM student_marks
      GROUP BY student_name
      ORDER BY avg_score DESC
      LIMIT $1
    `, [limit]).catch(() => ({ rows: [] }));
    res.json({ success: true, data: rows.rows });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/academic/bottom-performers', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/academic/class-rankings', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT ml.class_name, ROUND(AVG(sm.percentage)::numeric, 1) as avg
      FROM mark_lists ml
      LEFT JOIN student_marks sm ON sm.mark_list_id = ml.id
      GROUP BY ml.class_name
      ORDER BY avg DESC NULLS LAST
    `).catch(() => ({ rows: [] }));
    res.json({ success: true, data: rows.rows });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/academic/pass-fail-rates', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE percentage >= 50)::int as passed,
        COUNT(*) FILTER (WHERE percentage < 50)::int as failed,
        COUNT(*)::int as total
      FROM student_marks
    `).catch(() => ({ rows: [{ passed: 0, failed: 0, total: 0 }] }));
    res.json({ success: true, data: rows.rows[0] || { passed: 0, failed: 0, total: 0 } });
  } catch(e) {
    res.json({ success: true, data: { passed: 0, failed: 0, total: 0 } });
  }
});

// ─── Faults ──────────────────────────────────────────────────────────────────
router.get('/faults/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    let total = 0;
    let weekly = 0;
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'class_students_fault' ORDER BY table_name`
    ).catch(() => ({ rows: [] }));

    for (const t of tables.rows) {
      try {
        const c = await pool.query(`
          SELECT
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as weekly
          FROM class_students_fault."${t.table_name}"
        `);
        total += c.rows[0]?.total || 0;
        weekly += c.rows[0]?.weekly || 0;
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        total,
        totalFaults: total,
        weeklyFaults: weekly,
        criticalFaults: 0
      }
    });
  } catch (e) {
    res.json({ success: true, data: { total: 0, totalFaults: 0, weeklyFaults: 0, criticalFaults: 0 } });
  }
});

router.get('/faults/by-class', async (req, res) => {
  const pool = req.branchPool;
  try {
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'class_students_fault' ORDER BY table_name`
    ).catch(() => ({ rows: [] }));

    const data = [];
    for (const t of tables.rows) {
      try {
        const c = await pool.query(`SELECT COUNT(*)::int as count FROM class_students_fault."${t.table_name}"`);
        data.push({ class_name: t.table_name, count: c.rows[0]?.count || 0 });
      } catch(e) {}
    }
    res.json({ success: true, data });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/faults/by-type', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/faults/by-level', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/faults/recent', async (req, res) => {
  const pool = req.branchPool;
  try {
    const limit = parseInt(req.query.limit) || 5;
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'class_students_fault' ORDER BY table_name`
    ).catch(() => ({ rows: [] }));

    let allFaults = [];
    for (const t of tables.rows) {
      try {
        const f = await pool.query(`
          SELECT student_name, fault_type, description, created_at, '${t.table_name}' as class_name
          FROM class_students_fault."${t.table_name}"
          ORDER BY created_at DESC
          LIMIT 10
        `);
        allFaults = allFaults.concat(f.rows);
      } catch(e) {}
    }

    allFaults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ success: true, data: allFaults.slice(0, limit) });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/faults/top-offenders', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/faults/trends', async (req, res) => {
  res.json({ success: true, data: [] });
});

// ─── Attendance ──────────────────────────────────────────────────────────────
router.get('/attendance/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    // Check academic_student_attendance
    const rows = await pool.query(`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE LOWER(status)='present')::int as present,
        COUNT(*) FILTER (WHERE LOWER(status)='absent')::int as absent,
        COUNT(*) FILTER (WHERE LOWER(status)='late')::int as late
      FROM academic_student_attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
    `).catch(() => ({ rows: [] }));

    let r = rows.rows[0] || {};
    let total = r.total || 0;
    let present = r.present || 0;
    let absent = r.absent || 0;

    // Fallback: check all-time if last 30 days is 0
    if (total === 0) {
      const allRows = await pool.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE LOWER(status)='present')::int as present,
          COUNT(*) FILTER (WHERE LOWER(status)='absent')::int as absent
        FROM academic_student_attendance
      `).catch(() => ({ rows: [] }));
      r = allRows.rows[0] || {};
      total = r.total || 0;
      present = r.present || 0;
      absent = r.absent || 0;
    }

    const rate = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
    res.json({
      success: true,
      data: {
        total,
        present,
        absent,
        rate,
        attendanceRate: rate,
        trend: 0
      }
    });
  } catch (e) {
    res.json({ success: true, data: { total: 0, present: 0, absent: 0, rate: 0, attendanceRate: 0, trend: 0 } });
  }
});

router.get('/attendance/by-class', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT
        class_name,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE LOWER(status)='present')::int as present,
        COUNT(*) FILTER (WHERE LOWER(status)='absent')::int as absent
      FROM academic_student_attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY class_name
      ORDER BY class_name
    `).catch(() => ({ rows: [] }));
    res.json({ success: true, data: rows.rows });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/attendance/by-day', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT 
        TO_CHAR(attendance_date, 'Dy') as day,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE LOWER(status)='present')::int as present
      FROM academic_student_attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY TO_CHAR(attendance_date, 'Dy'), EXTRACT(DOW FROM attendance_date)
      ORDER BY EXTRACT(DOW FROM attendance_date)
    `).catch(() => ({ rows: [] }));
    res.json({ success: true, data: rows.rows });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/attendance/trends', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT
        attendance_date::text as date,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE LOWER(status)='present')::int as present,
        COUNT(*) FILTER (WHERE LOWER(status)='absent')::int as absent
      FROM academic_student_attendance
      GROUP BY attendance_date
      ORDER BY attendance_date DESC
      LIMIT 7
    `).catch(() => ({ rows: [] }));

    const formatted = rows.rows.reverse().map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: r.date,
      present: r.present || 0,
      absent: r.absent || 0,
      rate: r.total > 0 ? Math.round((r.present / r.total) * 100) : 0
    }));

    res.json({ success: true, data: formatted });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

router.get('/attendance/absentees', async (req, res) => {
  const pool = req.branchPool;
  try {
    const limit = parseInt(req.query.limit) || 10;
    const rows = await pool.query(`
      SELECT student_name as full_name, COUNT(*)::int as absent_count
      FROM academic_student_attendance
      WHERE LOWER(status) = 'absent'
      GROUP BY student_name
      ORDER BY absent_count DESC
      LIMIT $1
    `, [limit]).catch(() => ({ rows: [] }));
    res.json({ success: true, data: rows.rows });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

// ─── Finance ─────────────────────────────────────────────────────────────────
router.get('/finance/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const rows = await pool.query(`
      SELECT 
        COALESCE(SUM("paidAmount"), 0)::float as total_collected,
        COUNT(*)::int as payment_count,
        COALESCE(SUM(amount - "paidAmount"), 0)::float as pending
      FROM school_comms."Invoice"
    `).catch(() => ({ rows: [{ total_collected: 0, payment_count: 0, pending: 0 }] }));

    const r = rows.rows[0] || {};
    res.json({
      success: true,
      data: {
        totalCollected: r.total_collected || 0,
        revenue: r.total_collected || 0,
        paymentCount: r.payment_count || 0,
        pending: r.pending || 0,
        trend: 0
      }
    });
  } catch (e) {
    res.json({ success: true, data: { totalCollected: 0, revenue: 0, paymentCount: 0, pending: 0, trend: 0 } });
  }
});

// ─── HR ──────────────────────────────────────────────────────────────────────
router.get('/hr/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const schemas = ['staff_teachers', 'staff_administrative_staff', 'staff_supportive_staff', 'staff_finance'];
    let total = 0;
    for (const schema of schemas) {
      try {
        const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name NOT LIKE 'pg_%'`, [schema]);
        for (const t of tables.rows) {
          const c = await pool.query(`SELECT COUNT(*)::int as c FROM "${schema}"."${t.table_name}" WHERE (is_active IS NULL OR is_active = TRUE)`);
          total += c.rows[0]?.c || 0;
        }
      } catch(e) {}
    }
    res.json({ success: true, data: { total, present: total, absent: 0, onLeave: 0 } });
  } catch(e) {
    res.json({ success: true, data: { total: 0, present: 0, absent: 0, onLeave: 0 } });
  }
});

// ─── Inventory ───────────────────────────────────────────────────────────────
router.get('/inventory/summary', async (req, res) => {
  res.json({ success: true, data: { totalItems: 0, lowStock: 0, outOfStock: 0, totalValue: 0 } });
});

// ─── Assets ──────────────────────────────────────────────────────────────────
router.get('/assets/summary', async (req, res) => {
  res.json({ success: true, data: { totalAssets: 0, inUse: 0, maintenance: 0, totalValue: 0 } });
});

// ─── Evaluations ─────────────────────────────────────────────────────────────
router.get('/evaluations/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const evals = await pool.query(`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
        COUNT(*) FILTER (WHERE status = 'pending' OR status IS NULL)::int as pending
      FROM evaluations
    `).catch(() => ({ rows: [{ total: 0, completed: 0, pending: 0 }] }));
    const r = evals.rows[0] || {};
    res.json({ success: true, data: { total: r.total || 0, completed: r.completed || 0, pending: r.pending || 0 } });
  } catch(e) {
    res.json({ success: true, data: { total: 0, completed: 0, pending: 0 } });
  }
});

router.get('/evaluations/by-class', async (req, res) => { res.json({ success: true, data: [] }); });
router.get('/evaluations/response-rates', async (req, res) => { res.json({ success: true, data: [] }); });

// ─── Posts ───────────────────────────────────────────────────────────────────
router.get('/posts/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const posts = await pool.query(`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as this_week
      FROM posts_schema.posts
    `).catch(() => ({ rows: [{ total: 0, this_week: 0 }] }));
    const r = posts.rows[0] || {};
    res.json({ success: true, data: { total: r.total || 0, thisWeek: r.this_week || 0 } });
  } catch(e) {
    res.json({ success: true, data: { total: 0, thisWeek: 0 } });
  }
});

router.get('/posts/by-audience', async (req, res) => { res.json({ success: true, data: [] }); });
router.get('/posts/recent', async (req, res) => { res.json({ success: true, data: [] }); });

// ─── Schedule ────────────────────────────────────────────────────────────────
router.get('/schedule/summary', async (req, res) => { res.json({ success: true, data: {} }); });
router.get('/schedule/teacher-workload', async (req, res) => { res.json({ success: true, data: [] }); });

// ─── Guardians ───────────────────────────────────────────────────────────────
router.get('/guardians/summary', async (req, res) => {
  const pool = req.branchPool;
  try {
    const tables = await getClassTables(pool);
    const guardiansSet = new Set();
    for (const t of tables) {
      try {
        const g = await pool.query(`SELECT DISTINCT guardian_name, guardian_phone FROM classes_schema."${t}" WHERE guardian_name IS NOT NULL AND (is_active IS NULL OR is_active = TRUE)`);
        g.rows.forEach(r => guardiansSet.add(r.guardian_phone || r.guardian_name));
      } catch (e) {}
    }
    const total = guardiansSet.size;
    res.json({ success: true, data: { total, engagement: total > 0 ? 100 : 0 } });
  } catch(e) {
    res.json({ success: true, data: { total: 0, engagement: 0 } });
  }
});

router.get('/guardians/engagement', async (req, res) => { res.json({ success: true, data: [] }); });

// ─── Activity ────────────────────────────────────────────────────────────────
router.get('/activity/recent', async (req, res) => {
  const pool = req.branchPool;
  try {
    const limit = parseInt(req.query.limit) || 10;
    const rows = await pool.query(`
      SELECT student_name, status, attendance_date as date
      FROM academic_student_attendance
      ORDER BY attendance_date DESC, id DESC
      LIMIT $1
    `, [limit]).catch(() => ({ rows: [] }));

    const data = rows.rows.map(r => ({
      type: r.status,
      title: `${r.student_name} — ${r.status}`,
      date: r.date,
      daysAgo: Math.max(0, Math.floor((new Date() - new Date(r.date)) / 86400000))
    }));
    res.json({ success: true, data });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

// ─── Overview / Summary (legacy) ─────────────────────────────────────────────
router.get('/overview', async (req, res) => { res.redirect('/api/reports/students/summary'); });
router.get('/summary', async (req, res) => { res.json({ success: true, data: {} }); });

module.exports = router;

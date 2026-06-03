const express = require('express');
const router = express.Router();
const { authenticateWithBranch } = require('../middleware/branchAuth');

// All dashboard routes require authentication + branch
router.use(authenticateWithBranch);

// ─── Enhanced Dashboard Stats ────────────────────────────────────────────────
router.get('/enhanced-stats', async (req, res) => {
  const pool = req.branchPool;
  try {
    const [
      studentsResult,
      staffResult,
      classesResult,
      attendanceResult,
      marksResult,
      financeResult,
      faultsResult
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN LOWER(gender)='male'   THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN LOWER(gender)='female' THEN 1 ELSE 0 END) as female
        FROM students`).catch(() => ({ rows: [{ total: 0, male: 0, female: 0 }] })),

      pool.query(`SELECT COUNT(*) as total FROM staff`).catch(() => ({ rows: [{ total: 0 }] })),

      pool.query(`SELECT id, class_name, grade_level FROM classes ORDER BY class_name`).catch(() => ({ rows: [] })),

      pool.query(`SELECT
        COUNT(*) as total,
        SUM(CASE WHEN LOWER(status)='present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN LOWER(status)='absent'  THEN 1 ELSE 0 END) as absent
        FROM student_attendance
        WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'`).catch(() => ({ rows: [{ total: 0, present: 0, absent: 0 }] })),

      pool.query(`SELECT AVG(total_score) as avg_score, COUNT(*) as total
        FROM student_marks`).catch(() => ({ rows: [{ avg_score: 0, total: 0 }] })),

      pool.query(`SELECT
        SUM(amount) as total_collected,
        COUNT(*) as payment_count
        FROM monthly_payments
        WHERE EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)`).catch(() => ({ rows: [{ total_collected: 0, payment_count: 0 }] })),

      pool.query(`SELECT COUNT(*) as total FROM student_faults`).catch(() => ({ rows: [{ total: 0 }] }))
    ]);

    const students = studentsResult.rows[0];
    const attendanceRow = attendanceResult.rows[0];
    const totalAttendance = parseInt(attendanceRow.total) || 1;
    const presentCount = parseInt(attendanceRow.present) || 0;
    const attendanceRate = ((presentCount / totalAttendance) * 100).toFixed(1);

    // Top students
    const topStudentsResult = await pool.query(`
      SELECT s.full_name, s.class_id, AVG(sm.total_score) as avg_score
      FROM students s
      JOIN student_marks sm ON sm.student_id = s.id
      GROUP BY s.id, s.full_name, s.class_id
      ORDER BY avg_score DESC
      LIMIT 5
    `).catch(() => ({ rows: [] }));

    // Recent activity (recent attendance entries)
    const recentActivityResult = await pool.query(`
      SELECT s.full_name as student_name, sa.status, sa.attendance_date
      FROM student_attendance sa
      JOIN students s ON s.id = sa.student_id
      ORDER BY sa.attendance_date DESC
      LIMIT 10
    `).catch(() => ({ rows: [] }));

    const recentActivity = recentActivityResult.rows.map(row => ({
      type: row.status === 'absent' ? 'absence' : 'attendance',
      icon: row.status === 'absent' ? 'exclamation-triangle' : 'check-circle',
      color: row.status === 'absent' ? '#EF4444' : '#10B981',
      title: row.status === 'absent' ? 'Absence Recorded' : 'Attendance Marked',
      description: `${row.student_name} — ${row.status}`,
      date: row.attendance_date,
      daysAgo: Math.floor((new Date() - new Date(row.attendance_date)) / (1000 * 60 * 60 * 24))
    }));

    if (recentActivity.length === 0) {
      recentActivity.push({
        type: 'system',
        icon: 'info-circle',
        color: '#6B7280',
        title: 'Dashboard Ready',
        description: 'System running — data will appear as records are added',
        date: new Date().toISOString(),
        daysAgo: 0
      });
    }

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      basic: {
        totalStudents: parseInt(students.total) || 0,
        gender: {
          male: parseInt(students.male) || 0,
          female: parseInt(students.female) || 0
        },
        classes: classesResult.rows,
        totalClasses: classesResult.rows.length,
        staffCount: parseInt(staffResult.rows[0].total) || 0,
        totalFaults: parseInt(faultsResult.rows[0].total) || 0
      },
      attendance: {
        rate: parseFloat(attendanceRate),
        present: presentCount,
        absent: parseInt(attendanceRow.absent) || 0,
        total: totalAttendance
      },
      academic: {
        averageScore: parseFloat(marksResult.rows[0]?.avg_score || 0).toFixed(1),
        totalMarks: parseInt(marksResult.rows[0]?.total) || 0,
        topPerformers: topStudentsResult.rows.map(r => ({
          studentName: r.full_name,
          className: r.class_id,
          averageScore: parseFloat(r.avg_score).toFixed(1)
        })),
        bottomPerformers: [],
        subjectAverages: [],
        classAverages: []
      },
      finance: {
        totalCollected: parseFloat(financeResult.rows[0]?.total_collected) || 0,
        paymentCount: parseInt(financeResult.rows[0]?.payment_count) || 0
      },
      behavior: {
        mostFaults: [],
        recentFaults: [],
        faultTypes: [],
        faultLevels: []
      },
      classRankings: classesResult.rows.map((c, i) => ({
        className: c.class_name,
        position: i + 1,
        studentCount: 0,
        averageScore: 0
      })),
      topPerformers: topStudentsResult.rows.map(r => ({
        studentName: r.full_name,
        className: r.class_id,
        averageScore: parseFloat(r.avg_score).toFixed(1)
      })),
      recentActivity
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// ─── Simple Stats (legacy) ────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const pool = req.branchPool;
  try {
    const [students, staff, classes, attendance] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM students').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM staff').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query('SELECT COUNT(*) as count FROM classes').catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT
        SUM(CASE WHEN LOWER(status)='present' THEN 1 ELSE 0 END) as present,
        COUNT(*) as total
        FROM student_attendance
        WHERE attendance_date = CURRENT_DATE`).catch(() => ({ rows: [{ present: 0, total: 0 }] }))
    ]);

    const att = attendance.rows[0];
    const rate = att.total > 0 ? ((att.present / att.total) * 100).toFixed(1) : 0;

    res.json({
      students: parseInt(students.rows[0].count),
      staff: parseInt(staff.rows[0].count),
      classes: parseInt(classes.rows[0].count),
      attendanceRate: parseFloat(rate)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Recent Faults ────────────────────────────────────────────────────────────
router.get('/recent-faults', async (req, res) => {
  const pool = req.branchPool;
  try {
    const result = await pool.query(`
      SELECT f.*, s.full_name as student_name
      FROM student_faults f
      LEFT JOIN students s ON s.id = f.student_id
      ORDER BY f.created_at DESC LIMIT 10
    `).catch(() => ({ rows: [] }));
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Top Offenders ───────────────────────────────────────────────────────────
router.get('/top-offenders', async (req, res) => {
  const pool = req.branchPool;
  try {
    const result = await pool.query(`
      SELECT s.full_name, s.id, COUNT(f.id) as fault_count
      FROM students s
      JOIN student_faults f ON f.student_id = s.id
      GROUP BY s.id, s.full_name
      ORDER BY fault_count DESC LIMIT 5
    `).catch(() => ({ rows: [] }));
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

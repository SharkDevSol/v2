const express = require('express');
const router = express.Router();
const { authenticateWithBranch } = require('../middleware/branchAuth');

// All dashboard routes require authentication + branch
router.use(authenticateWithBranch);

// ─── Enhanced Dashboard Stats ────────────────────────────────────────────────
router.get('/enhanced-stats', async (req, res) => {
  const pool = req.branchPool;
  try {
    // Build dynamic UNION ALL query across all class tables
    const classTables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'classes_schema' AND table_name NOT LIKE 'pg_%' ORDER BY table_name`
    ).catch(() => ({ rows: [] }));
    
    let studentUnionQuery = '';
    let genderUnionQuery = '';
    const classNames = [];
    
    if (classTables.rows.length > 0) {
      const tables = classTables.rows.map(r => r.table_name);
      tables.forEach(t => classNames.push(t));
      studentUnionQuery = tables.map(t => 
        `SELECT student_name, '${t}' as class_name, gender FROM classes_schema."${t}"`
      ).join(' UNION ALL ');
      genderUnionQuery = tables.map(t => 
        `SELECT gender FROM classes_schema."${t}"`
      ).join(' UNION ALL ');
    }
    
    // Student counts
    let totalStudents = 0, maleCount = 0, femaleCount = 0;
    if (studentUnionQuery) {
      const studentResult = await pool.query(
        `SELECT COUNT(*) as total, 
          SUM(CASE WHEN LOWER(gender)='male' THEN 1 ELSE 0 END) as male,
          SUM(CASE WHEN LOWER(gender)='female' THEN 1 ELSE 0 END) as female
        FROM (${studentUnionQuery}) sub`
      ).catch(() => ({ rows: [{ total: 0, male: 0, female: 0 }] }));
      totalStudents = parseInt(studentResult.rows[0].total) || 0;
      maleCount = parseInt(studentResult.rows[0].male) || 0;
      femaleCount = parseInt(studentResult.rows[0].female) || 0;
    }
    
    // Class list from form structure
    const classesResult = await pool.query(
      `SELECT unnest(class_names) as class_name FROM school_schema_points.classes WHERE id = 1`
    ).catch(() => ({ rows: [] }));
    const classList = classesResult.rows.map(r => ({ class_name: r.class_name }));
    
    // Staff count from all staff schemas
    let staffCount = 0;
    const staffSchemas = await pool.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'staff_%'`
    ).catch(() => ({ rows: [] }));
    const schemas = staffSchemas.rows.map(r => r.schema_name);
    const staffTables = [];
    for (const schema of schemas) {
      const tables = await pool.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name NOT LIKE 'pg_%'`,
        [schema]
      ).catch(() => ({ rows: [] }));
      tables.rows.forEach(t => staffTables.push({ schema, table: t.table_name }));
    }
    
    for (const { schema, table } of staffTables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) as c FROM "${schema}"."${table}"`);
        staffCount += parseInt(count.rows[0].c) || 0;
      } catch (e) { /* table might not exist yet */ }
    }

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      basic: {
        totalStudents,
        gender: { male: maleCount, female: femaleCount },
        classes: classList,
        totalClasses: classList.length,
        staffCount,
        totalFaults: 0
      },
      attendance: { rate: 0, present: 0, absent: 0, total: 0 },
      academic: {
        averageScore: '0.0',
        totalMarks: 0,
        topPerformers: [],
        bottomPerformers: [],
        subjectAverages: [],
        classAverages: []
      },
      finance: { totalCollected: 0, paymentCount: 0 },
      behavior: { mostFaults: [], recentFaults: [], faultTypes: [], faultLevels: [] },
      classRankings: classList.map((c, i) => ({
        className: c.class_name, position: i + 1, studentCount: 0, averageScore: 0
      })),
      topPerformers: [],
      recentActivity: [{
        type: 'system', icon: 'info-circle', color: '#6B7280',
        title: 'Dashboard Ready',
        description: `Showing data from ${classList.length} classes, ${totalStudents} students, ${staffCount} staff`,
        date: new Date().toISOString(), daysAgo: 0
      }]
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
    // Count from class tables
    const classTables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'classes_schema' AND table_name NOT LIKE 'pg_%'`
    ).catch(() => ({ rows: [] }));
    let studentCount = 0;
    for (const t of classTables.rows) {
      try {
        const r = await pool.query(`SELECT COUNT(*) as c FROM classes_schema."${t.table_name}"`);
        studentCount += parseInt(r.rows[0].c) || 0;
      } catch(e) {}
    }
    
    const classesResult = await pool.query(
      `SELECT COUNT(*) as c FROM school_schema_points.classes WHERE id = 1`
    ).catch(() => ({ rows: [{ c: 0 }] }));
    
    res.json({
      students: studentCount,
      staff: 0,
      classes: parseInt(classesResult.rows[0].c) || 0,
      attendanceRate: 0
    });
  } catch (error) {
    res.json({ students: 0, staff: 0, classes: 0, attendanceRate: 0 });
  }
});

// ─── Recent Faults ────────────────────────────────────────────────────────────
router.get('/recent-faults', async (req, res) => {
  res.json([]);
});

// ─── Top Offenders ───────────────────────────────────────────────────────────
router.get('/top-offenders', async (req, res) => {
  res.json([]);
});

module.exports = router;

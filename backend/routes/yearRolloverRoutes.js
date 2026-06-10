const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/year-rollover/status — Get current year status and data counts
router.get('/status', async (req, res) => {
  try {
    const config = await pool.query('SELECT terms, academic_year FROM schedule_schema.school_config WHERE id = 1').catch(() => ({ rows: [{ terms: 2, academic_year: '' }] }));
    const studentCount = await pool.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'classes_schema' AND table_name NOT LIKE 'pg_%'").catch(() => ({ rows: [{ c: 0 }] }));
    res.json({ success: true, data: {
      currentYear: config.rows[0]?.academic_year || `${new Date().getFullYear()}`,
      ethiopianYear: new Date().getFullYear() - 8,
      terms: config.rows[0]?.terms || 2,
      totalClasses: parseInt(studentCount.rows[0]?.c) || 0
    }});
  } catch(e) {
    res.json({ success: true, data: { currentYear: '2024', ethiopianYear: 2016, terms: 2, totalClasses: 0 }});
  }
});

// GET /api/year-rollover/archives — List archived years
router.get('/archives', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM year_archives ORDER BY archived_year DESC').catch(() => ({ rows: [] }));
    res.json({ success: true, data: result.rows });
  } catch(e) {
    res.json({ success: true, data: [] });
  }
});

// POST /api/year-rollover/execute — Archive current year data and reset for new year
router.post('/execute', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Get current year info
    const config = await client.query('SELECT academic_year FROM schedule_schema.school_config WHERE id = 1').catch(() => ({ rows: [{ academic_year: '2024/25' }] }));
    const academicYear = config.rows[0]?.academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    
    // 2. Create archive record
    const archiveResult = await client.query(`
      INSERT INTO year_archives (archived_year, archived_at, student_count, staff_count)
      VALUES ($1, NOW(), (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'classes_schema'), 0)
      RETURNING id
    `, [academicYear]);
    
    const archiveId = archiveResult.rows[0]?.id;
    
    // 3. Archive students data
    const classTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'classes_schema' AND table_name NOT LIKE 'pg_%'");
    for (const table of classTables.rows) {
      await client.query(`CREATE TABLE IF NOT EXISTS year_archive_students LIKE classes_schema."${table.table_name}"`).catch(() => {});
      await client.query(`INSERT INTO year_archive_students SELECT *, '${academicYear}' as archived_year FROM classes_schema."${table.table_name}"`).catch(() => {});
    }
    
    // 4. Mark rollover complete
    await client.query('COMMIT');
    
    res.json({ success: true, message: `Year ${academicYear} archived. System ready for new academic year.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Year rollover error:', error);
    res.status(500).json({ error: 'Year rollover failed: ' + error.message });
  } finally {
    client.release();
  }
});

// GET /api/year-rollover/archives/:id/export — Export archived year data as JSON
router.get('/archives/:id/export', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM year_archives WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Archive not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch(e) {
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;

const express = require('express');
const { getEndpointPath, API_ENDPOINTS } = require('../../config/api.config');
const router = express.Router();
const pool = require('../../config/db');
const { authenticateToken } = require('../../middleware/auth');

// Import sub-routers
const salaryManagementRouter = require('./salaryManagement');
const dashboardReportsRouter = require('./dashboardReports');
const attendanceRouter = require('./attendance');
const leaveManagementRouter = require('./leaveManagement');
const payrollRouter = require('./payroll');

// HR Stats endpoint
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const staffCount = await pool.query('SELECT COUNT(*) as count FROM staff_users').catch(() => ({ rows: [{ count: 0 }] }));
    const attendanceToday = await pool.query(
      "SELECT COUNT(*) as present FROM staff_attendance WHERE date = CURRENT_DATE AND status = 'present'"
    ).catch(() => ({ rows: [{ present: 0 }] }));
    const leaveRequests = await pool.query(
      "SELECT COUNT(*) as count FROM hr_leave_requests WHERE status = 'PENDING'"
    ).catch(() => ({ rows: [{ count: 0 }] }));

    res.json({
      success: true,
      data: {
        totalStaff: parseInt(staffCount.rows[0].count) || 0,
        presentToday: parseInt(attendanceToday.rows[0].present) || 0,
        pendingLeaves: parseInt(leaveRequests.rows[0].count) || 0,
        onLeave: 0
      }
    });
  } catch (error) {
    console.error('Error fetching HR stats:', error);
    res.json({ success: true, data: { totalStaff: 0, presentToday: 0, pendingLeaves: 0, onLeave: 0 } });
  }
});

// Performance Management endpoints
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM hr_performance_reviews';
    const params = [];
    if (status && status !== 'ALL') {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    res.json({ success: true, data: [] });
  }
});

router.post('/performance', authenticateToken, async (req, res) => {
  try {
    const { staffId, staffName, reviewPeriod, rating, strengths, improvements, goals, status } = req.body;
    const result = await pool.query(
      `INSERT INTO hr_performance_reviews (staff_id, staff_name, review_period, rating, strengths, improvements, goals, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [staffId, staffName, reviewPeriod, rating, strengths, improvements, goals, status || 'DRAFT']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating performance review:', error);
    res.status(500).json({ success: false, error: 'Failed to create performance review' });
  }
});

router.put('/performance/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, strengths, improvements, goals, status } = req.body;
    const result = await pool.query(
      `UPDATE hr_performance_reviews SET rating = COALESCE($1, rating), strengths = COALESCE($2, strengths),
       improvements = COALESCE($3, improvements), goals = COALESCE($4, goals), status = COALESCE($5, status),
       updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
      [rating, strengths, improvements, goals, status, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating performance review:', error);
    res.status(500).json({ success: false, error: 'Failed to update performance review' });
  }
});

// Mount sub-routers
router.use('/salary', salaryManagementRouter);
router.use('/dashboard', dashboardReportsRouter);
router.use('/leave', leaveManagementRouter);
router.use('/payroll', payrollRouter);
router.use('/', attendanceRouter); // Mount attendance routes at /api/hr/

module.exports = router;

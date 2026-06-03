const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbManager = require('../services/DatabaseConnectionManager');
const crossBranchService = require('../services/CrossBranchAggregationService');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { JWT_SECRET } = require('../middleware/jwtValidator');

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = String(process.env.DB_PASSWORD || '12345678');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');

function getMasterPool() {
  return new Pool({
    host: DB_HOST, port: DB_PORT, database: 'skoolific_master',
    user: DB_USER, password: DB_PASSWORD, max: 5
  });
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const pool = getMasterPool();
    const result = await pool.query(
      'SELECT sa.*, s.school_name, s.school_code FROM super_admins sa JOIN schools s ON sa.school_id = s.id WHERE sa.username = $1 AND sa.is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      await pool.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      await pool.end();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: 'super_admin',
        schoolId: admin.school_id,
        schoolName: admin.school_name,
        schoolCode: admin.school_code
      },
      JWT_SECRET,
      { expiresIn: '24h', issuer: 'school-management-system', audience: 'school-app' }
    );

    await pool.query('UPDATE super_admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [admin.id]);
    await pool.end();

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        email: admin.email,
        role: 'super_admin',
        schoolName: admin.school_name,
        schoolCode: admin.school_code
      }
    });
  } catch (error) {
    console.error('Super Admin login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

router.get('/branches', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const branches = await dbManager.getAllBranches();
    res.json({ success: true, branches, total: branches.length });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

router.get('/aggregate/enrollment', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const data = await crossBranchService.aggregateStudentEnrollment();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Enrollment aggregation error:', error);
    res.status(500).json({ error: 'Aggregation failed', message: error.message });
  }
});

router.get('/aggregate/finance', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const data = await crossBranchService.aggregateFinancialData(req.query);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Finance aggregation error:', error);
    res.status(500).json({ error: 'Aggregation failed', message: error.message });
  }
});

router.get('/aggregate/attendance', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const data = await crossBranchService.aggregateAttendanceData(req.query);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Attendance aggregation error:', error);
    res.status(500).json({ error: 'Aggregation failed', message: error.message });
  }
});

router.get('/aggregate/academic', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const data = await crossBranchService.aggregateAcademicPerformance(req.query);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Academic aggregation error:', error);
    res.status(500).json({ error: 'Aggregation failed', message: error.message });
  }
});

router.get('/aggregate/all', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const [enrollment, finance, attendance, academic] = await Promise.all([
      crossBranchService.aggregateStudentEnrollment(),
      crossBranchService.aggregateFinancialData(req.query),
      crossBranchService.aggregateAttendanceData(req.query),
      crossBranchService.aggregateAcademicPerformance(req.query)
    ]);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: { enrollment, finance, attendance, academic }
    });
  } catch (error) {
    console.error('Full aggregation error:', error);
    res.status(500).json({ error: 'Aggregation failed', message: error.message });
  }
});

module.exports = router;

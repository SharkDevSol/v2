// branchRoutes.js - Branch Management API Routes
// Handles branch CRUD operations and branch code validation

const express = require('express');
const router = express.Router();
const dbManager = require('../services/DatabaseConnectionManager');
const { validateBranchCode, generateBranchToken } = require('../middleware/branchAuth');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');

/**
 * POST /api/v2/branches/validate
 * Validate branch code
 */
router.post('/validate', async (req, res) => {
  try {
    const { branchCode } = req.body;

    if (!branchCode) {
      return res.status(400).json({ error: 'Branch code is required' });
    }

    // Validate format
    if (!/^[A-Z0-9]{2,5}$/.test(branchCode)) {
      return res.status(400).json({ 
        error: 'Invalid branch code format',
        message: 'Branch code must be 2-5 uppercase letters/numbers'
      });
    }

    // Check if branch exists and is active
    const databaseName = await dbManager.resolveDatabaseName(branchCode);

    res.json({
      valid: true,
      branchCode: branchCode,
      databaseName: databaseName,
      message: 'Branch code is valid'
    });

  } catch (error) {
    res.status(404).json({
      valid: false,
      error: 'Branch not found',
      message: error.message
    });
  }
});

/**
 * POST /api/v2/branches/login
 * Enhanced login with branch code
 */
router.post('/login', async (req, res) => {
  try {
    const { branchCode, username, password, userType } = req.body;

    // Validate inputs
    if (!branchCode || !username || !password) {
      return res.status(400).json({ 
        error: 'Branch code, username, and password are required' 
      });
    }

    // Validate branch code
    const pool = await dbManager.getPool(branchCode);

    // Authenticate user based on userType
    let user = null;
    let role = null;

    if (userType === 'admin' || !userType) {
      // Check admin_users table
      const adminResult = await pool.query(
        'SELECT id, username, password_hash, name, email, role FROM admin_users WHERE username = $1',
        [username]
      );

      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(password, admin.password_hash);

        if (isValid) {
          user = admin;
          role = admin.role;
        }
      }
    }

    if (!user && (userType === 'student' || !userType)) {
      // Check students table
      const tables = (await pool.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
        ['classes_schema']
      )).rows.map(row => row.table_name);

      for (const table of tables) {
        const result = await pool.query(
          `SELECT * FROM classes_schema."${table}" WHERE username = $1 AND password = $2 LIMIT 1`,
          [username, password]
        );

        if (result.rows.length > 0) {
          user = result.rows[0];
          role = 'student';
          break;
        }
      }
    }

    if (!user && (userType === 'guardian' || !userType)) {
      // Check guardians table
      const tables = (await pool.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
        ['classes_schema']
      )).rows.map(row => row.table_name);

      for (const table of tables) {
        const result = await pool.query(
          `SELECT * FROM classes_schema."${table}" WHERE guardian_username = $1 AND guardian_password = $2 LIMIT 1`,
          [username, password]
        );

        if (result.rows.length > 0) {
          user = result.rows[0];
          role = 'guardian';
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with branch context
    const token = generateBranchToken(
      {
        id: user.id,
        username: username,
        role: role,
        userType: role
      },
      branchCode,
      '24h'
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: username,
        name: user.name || user.student_name || user.guardian_name,
        role: role,
        branchCode: branchCode
      }
    });

  } catch (error) {
    console.error('Branch login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * GET /api/v2/branches
 * Get all branches (Super Admin only)
 */
router.get('/', authenticateToken, authorizeRoles('super-admin'), async (req, res) => {
  try {
    const branches = await dbManager.getAllBranches();
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

/**
 * POST /api/v2/branches
 * Create new branch (Super Admin only)
 */
router.post('/', authenticateToken, authorizeRoles('super-admin'), async (req, res) => {
  try {
    const branch = await dbManager.createBranch(req.body);
    res.status(201).json({
      message: 'Branch created successfully',
      branch: branch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ 
      error: 'Failed to create branch',
      message: error.message
    });
  }
});

/**
 * GET /api/v2/branches/stats
 * Get connection pool statistics
 */
router.get('/stats', authenticateToken, authorizeRoles('super-admin'), (req, res) => {
  const { branchCode } = req.query;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }

  const stats = dbManager.getPoolStats(branchCode);
  
  if (!stats) {
    return res.status(404).json({ error: 'No active connection pool for this branch' });
  }

  res.json(stats);
});

module.exports = router;

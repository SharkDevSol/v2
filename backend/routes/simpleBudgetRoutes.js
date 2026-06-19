const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateWithBranch, validateBranchCode } = require('../middleware/branchAuth');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');

// Initialize budgets table
const initializeBudgetsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        budget_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        fiscal_year VARCHAR(10) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        spent_amount DECIMAL(12, 2) DEFAULT 0,
        description TEXT,
        status VARCHAR(50) DEFAULT 'DRAFT',
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add missing columns to existing table
    const columnsToAdd = [
      { name: 'department', type: 'VARCHAR(100) NOT NULL DEFAULT \'General\'' },
      { name: 'fiscal_year', type: 'VARCHAR(10) NOT NULL DEFAULT \'2024\'' },
      { name: 'spent_amount', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'status', type: 'VARCHAR(50) DEFAULT \'DRAFT\'' },
    ];
    
    for (const col of columnsToAdd) {
      try {
        await pool.query(`
          ALTER TABLE budgets 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
      } catch (err) {
        // ignore
      }
    }
    
    // Create indexes
    const indexes = [
      'idx_budgets_department ON budgets(department)',
      'idx_budgets_fiscal_year ON budgets(fiscal_year)',
      'idx_budgets_status ON budgets(status)',
    ];
    for (const idx of indexes) {
      try {
        await pool.query(`CREATE INDEX IF NOT EXISTS ${idx}`);
      } catch (err) {
        // ignore
      }
    }
    
    console.log('✅ Budgets table initialized');
  } catch (error) {
    console.error('Error initializing budgets table:', error);
  }
};

// Initialize on module load
initializeBudgetsTable().catch(err => console.error('Init error:', err));

// Generate budget number
const generateBudgetNumber = async () => {
  const year = new Date().getFullYear();
  
  const result = await pool.query(`
    SELECT COUNT(*) as count 
    FROM budgets 
    WHERE budget_number LIKE $1
  `, [`BDG-${year}%`]);
  
  const count = parseInt(result.rows[0].count) + 1;
  const sequence = String(count).padStart(4, '0');
  
  return `BDG-${year}-${sequence}`;
};

/**
 * GET /api/finance/budgets
 * Get all budgets with filtering
 */
router.get('/', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/finance/budgets - Request received');
  
  try {
    const { 
      department, 
      fiscalYear,
      status,
      page = 1,
      limit = 50
    } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;
    
    if (department) {
      whereConditions.push(`department = $${paramCount++}`);
      params.push(department);
    }
    
    if (fiscalYear) {
      whereConditions.push(`fiscal_year = $${paramCount++}`);
      params.push(fiscalYear);
    }
    
    if (status) {
      whereConditions.push(`status = $${paramCount++}`);
      params.push(status);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get budgets
    const budgetsQuery = `
      SELECT *
      FROM budgets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(budgetsQuery, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM budgets
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    
    // Format the data
    const formattedBudgets = result.rows.map(budget => ({
      id: budget.id,
      budgetNumber: budget.budget_number,
      name: budget.name,
      department: budget.department,
      fiscalYear: budget.fiscal_year,
      amount: budget.amount,
      spentAmount: budget.spent_amount,
      description: budget.description,
      status: budget.status,
      createdAt: budget.created_at,
      updatedAt: budget.updated_at
    }));
    
    console.log(`✅ Found ${result.rows.length} budgets`);
    
    res.json({
      success: true,
      data: formattedBudgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch budgets',
      details: error.message
    });
  }
});

/**
 * POST /api/finance/budgets
 * Create a new budget
 */
router.post('/', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 POST /api/finance/budgets - Request received');
  console.log('Body:', req.body);
  
  try {
    const {
      name,
      department,
      fiscalYear,
      amount,
      description
    } = req.body;
    
    // Validation
    if (!name || !department || !fiscalYear || !amount) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: name, department, fiscalYear, amount' }
      });
    }
    
    // Generate budget number
    const budgetNumber = await generateBudgetNumber();
    
    // Insert budget
    const result = await pool.query(`
      INSERT INTO budgets (
        budget_number,
        name,
        department,
        fiscal_year,
        amount,
        description,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      budgetNumber,
      name,
      department,
      fiscalYear,
      amount,
      description || null,
      'APPROVED',
      req.user.id
    ]);
    
    const budget = result.rows[0];
    
    // Format response
    const formattedBudget = {
      id: budget.id,
      budgetNumber: budget.budget_number,
      name: budget.name,
      department: budget.department,
      fiscalYear: budget.fiscal_year,
      amount: budget.amount,
      spentAmount: budget.spent_amount,
      description: budget.description,
      status: budget.status,
      createdAt: budget.created_at
    };
    
    console.log('✅ Budget created:', formattedBudget);
    
    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: formattedBudget
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create budget' },
      details: error.message
    });
  }
});

/**
 * PUT /api/finance/budgets/:id
 * Update a budget
 */
router.put('/:id', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 PUT /api/finance/budgets/:id - Request received');
  
  try {
    const { id } = req.params;
    const { name, department, fiscalYear, amount, description, status } = req.body;
    
    const updates = [];
    const params = [];
    let paramCount = 1;
    
    if (name) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    
    if (department) {
      updates.push(`department = $${paramCount++}`);
      params.push(department);
    }
    
    if (fiscalYear) {
      updates.push(`fiscal_year = $${paramCount++}`);
      params.push(fiscalYear);
    }
    
    if (amount) {
      updates.push(`amount = $${paramCount++}`);
      params.push(amount);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    
    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    
    const result = await pool.query(`
      UPDATE budgets
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Budget not found' }
      });
    }
    
    const budget = result.rows[0];
    
    const formattedBudget = {
      id: budget.id,
      budgetNumber: budget.budget_number,
      name: budget.name,
      department: budget.department,
      fiscalYear: budget.fiscal_year,
      amount: budget.amount,
      spentAmount: budget.spent_amount,
      description: budget.description,
      status: budget.status,
      updatedAt: budget.updated_at
    };
    
    console.log('✅ Budget updated:', id);
    
    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: formattedBudget
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update budget' },
      details: error.message
    });
  }
});

/**
 * DELETE /api/finance/budgets/:id
 * Delete a budget
 */
router.delete('/:id', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 DELETE /api/finance/budgets/:id - Request received');
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Budget not found' }
      });
    }
    
    console.log('✅ Budget deleted:', id);
    
    res.json({
      success: true,
      message: 'Budget deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete budget' },
      details: error.message
    });
  }
});

/**
 * GET /api/finance/budgets/summary/stats
 * Get budget summary statistics
 */
router.get('/summary/stats', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/finance/budgets/summary/stats - Request received');
  
  try {
    const { fiscalYear } = req.query;
    
    let whereClause = '';
    const params = [];
    
    if (fiscalYear) {
      whereClause = 'WHERE fiscal_year = $1';
      params.push(fiscalYear);
    }
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_budgets,
        SUM(amount) as total_allocated,
        SUM(spent_amount) as total_spent,
        SUM(amount - spent_amount) as total_remaining
      FROM budgets
      ${whereClause}
    `, params);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch budget summary' },
      details: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateWithBranch, validateBranchCode } = require('../middleware/branchAuth');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');

// Initialize expenses table
const initializeExpensesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        expense_number VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        requested_by VARCHAR(255),
        vendor_name VARCHAR(255),
        payment_method VARCHAR(50),
        po_number VARCHAR(100),
        source VARCHAR(50) DEFAULT 'MANUAL',
        status VARCHAR(50) DEFAULT 'DRAFT',
        created_by INTEGER,
        approved_by INTEGER,
        approved_at TIMESTAMP,
        rejected_by INTEGER,
        rejected_at TIMESTAMP,
        paid_by INTEGER,
        paid_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add new columns if they don't exist (for existing tables)
    const columnsToAdd = [
      { name: 'status', type: 'VARCHAR(50) DEFAULT \'DRAFT\'' },
      { name: 'approved_by', type: 'INTEGER' },
      { name: 'approved_at', type: 'TIMESTAMP' },
      { name: 'rejected_by', type: 'INTEGER' },
      { name: 'rejected_at', type: 'TIMESTAMP' },
      { name: 'paid_by', type: 'INTEGER' },
      { name: 'paid_at', type: 'TIMESTAMP' },
      { name: 'rejection_reason', type: 'TEXT' },
      { name: 'budget_id', type: 'INTEGER' }
    ];
    
    for (const col of columnsToAdd) {
      try {
        await pool.query(`
          ALTER TABLE expenses 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
      } catch (err) {
        // Column might already exist, ignore error
      }
    }
    
    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_status 
      ON expenses(status);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date 
      ON expenses(expense_date);
    `);
    
    console.log('✅ Expenses table initialized');
  } catch (error) {
    console.error('Error initializing expenses table:', error);
  }
};

// Initialize on module load
initializeExpensesTable().catch(err => console.error('Init error:', err));

// Generate expense number
const generateExpenseNumber = async () => {
  const year = new Date().getFullYear();
  
  const result = await pool.query(`
    SELECT COUNT(*) as count 
    FROM expenses 
    WHERE expense_number LIKE $1
  `, [`EXP-${year}%`]);
  
  const count = parseInt(result.rows[0].count) + 1;
  const sequence = String(count).padStart(6, '0');
  
  return `EXP-${year}-${sequence}`;
};

/**
 * GET /api/finance/expenses
 * Get all expenses with filtering
 */
router.get('/', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/finance/expenses - Request received');
  
  try {
    const { 
      status, 
      category, 
      source,
      fromDate, 
      toDate,
      page = 1,
      limit = 50
    } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;
    
    if (status) {
      whereConditions.push(`status = $${paramCount++}`);
      params.push(status);
    }
    
    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      params.push(category);
    }
    
    if (source) {
      whereConditions.push(`source = $${paramCount++}`);
      params.push(source);
    }
    
    if (fromDate) {
      whereConditions.push(`expense_date >= $${paramCount++}`);
      params.push(fromDate);
    }
    
    if (toDate) {
      whereConditions.push(`expense_date <= $${paramCount++}`);
      params.push(toDate);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get expenses
    const expensesQuery = `
      SELECT *
      FROM expenses
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(expensesQuery, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM expenses
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    
    // Format the data to match frontend expectations
    const formattedExpenses = result.rows.map(expense => ({
      id: expense.id,
      expenseNumber: expense.expense_number,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expense_date,
      requestedBy: expense.requested_by,
      vendorName: expense.vendor_name,
      paymentMethod: expense.payment_method,
      poNumber: expense.po_number,
      source: expense.source,
      status: expense.status,
      budgetId: expense.budget_id,
      approvedBy: expense.approved_by,
      approvedAt: expense.approved_at,
      rejectedBy: expense.rejected_by,
      rejectedAt: expense.rejected_at,
      rejectionReason: expense.rejection_reason,
      paidBy: expense.paid_by,
      paidAt: expense.paid_at,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at
    }));
    
    console.log(`✅ Found ${result.rows.length} expenses`);
    
    res.json({
      success: true,
      data: formattedExpenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expenses',
      details: error.message
    });
  }
});

/**
 * POST /api/finance/expenses
 * Create a new expense
 */
router.post('/', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 POST /api/finance/expenses - Request received');
  console.log('Body:', req.body);
  
  try {
    const {
      category,
      description,
      amount,
      expenseDate,
      requestedBy,
      vendorName,
      paymentMethod,
      poNumber,
      source = 'MANUAL',
      budgetId
    } = req.body;
    
    // Validation
    if (!category || !description || !amount || !expenseDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: category, description, amount, expenseDate' }
      });
    }
    
    // If category is BUDGET, budgetId is required
    if (category === 'BUDGET' && !budgetId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Budget selection is required when category is Budget' }
      });
    }
    
    // Generate expense number
    const expenseNumber = await generateExpenseNumber();
    
    // Insert expense
    const result = await pool.query(`
      INSERT INTO expenses (
        expense_number,
        category,
        description,
        amount,
        expense_date,
        requested_by,
        vendor_name,
        payment_method,
        po_number,
        source,
        status,
        created_by,
        budget_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      expenseNumber,
      category,
      description,
      amount,
      expenseDate,
      requestedBy || null,
      vendorName || null,
      paymentMethod || null,
      poNumber || null,
      source,
      'PENDING',
      req.user.id,
      budgetId || null
    ]);
    
    const expense = result.rows[0];
    
    // Format response
    const formattedExpense = {
      id: expense.id,
      expenseNumber: expense.expense_number,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expense_date,
      requestedBy: expense.requested_by,
      vendorName: expense.vendor_name,
      paymentMethod: expense.payment_method,
      poNumber: expense.po_number,
      source: expense.source,
      status: expense.status,
      budgetId: expense.budget_id,
      createdAt: expense.created_at
    };
    
    console.log('✅ Expense created:', formattedExpense);
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: formattedExpense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create expense' },
      details: error.message
    });
  }
});

/**
 * PUT /api/finance/expenses/:id
 * Update expense status
 */
router.put('/:id', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 PUT /api/finance/expenses/:id - Request received');
  
  try {
    const { id } = req.params;
    const { status, description, amount } = req.body;
    
    const updates = [];
    const params = [];
    let paramCount = 1;
    
    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }
    
    if (description) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    
    if (amount) {
      updates.push(`amount = $${paramCount++}`);
      params.push(amount);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    
    const result = await pool.query(`
      UPDATE expenses
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Expense not found' }
      });
    }
    
    console.log('✅ Expense updated:', id);
    
    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update expense' },
      details: error.message
    });
  }
});

/**
 * DELETE /api/finance/expenses/:id
 * Delete an expense
 */
router.delete('/:id', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 DELETE /api/finance/expenses/:id - Request received');
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Expense not found' }
      });
    }
    
    console.log('✅ Expense deleted:', id);
    
    res.json({
      success: true,
      message: 'Expense deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete expense' },
      details: error.message
    });
  }
});

/**
 * GET /api/finance/expenses/summary/by-category
 * Get expense summary by category
 */
router.get('/summary/by-category', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/finance/expenses/summary/by-category - Request received');
  
  try {
    const { fromDate, toDate, status = 'APPROVED' } = req.query;
    
    let whereConditions = ['status = $1'];
    let params = [status];
    let paramCount = 2;
    
    if (fromDate) {
      whereConditions.push(`expense_date >= $${paramCount++}`);
      params.push(fromDate);
    }
    
    if (toDate) {
      whereConditions.push(`expense_date <= $${paramCount++}`);
      params.push(toDate);
    }
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    const result = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM expenses
      ${whereClause}
      GROUP BY category
      ORDER BY total_amount DESC
    `, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch expense summary' },
      details: error.message
    });
  }
});

/**
 * PUT /api/finance/expenses/:id/approve
 * Approve an expense
 */
router.put('/:id/approve', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 PUT /api/finance/expenses/:id/approve - Request received');
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE expenses
      SET status = 'APPROVED',
          approved_by = $1,
          approved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [req.user.id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Expense not found' }
      });
    }
    
    console.log('✅ Expense approved:', id);
    
    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving expense:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to approve expense' },
      details: error.message
    });
  }
});

/**
 * PUT /api/finance/expenses/:id/reject
 * Reject an expense
 */
router.put('/:id/reject', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 PUT /api/finance/expenses/:id/reject - Request received');
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await pool.query(`
      UPDATE expenses
      SET status = 'REJECTED',
          rejected_by = $1,
          rejected_at = CURRENT_TIMESTAMP,
          rejection_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [req.user.id, reason || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Expense not found' }
      });
    }
    
    console.log('✅ Expense rejected:', id);
    
    res.json({
      success: true,
      message: 'Expense rejected successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting expense:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to reject expense' },
      details: error.message
    });
  }
});

/**
 * PUT /api/finance/expenses/:id/mark-paid
 * Mark expense as paid and update budget utilization
 */
router.put('/:id/mark-paid', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 PUT /api/finance/expenses/:id/mark-paid - Request received');
  
  try {
    const { id } = req.params;
    
    // Check if expense is approved and get budget_id
    const checkResult = await pool.query(
      'SELECT status, budget_id, amount FROM expenses WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Expense not found' }
      });
    }
    
    const expense = checkResult.rows[0];
    
    if (expense.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only approved expenses can be marked as paid' }
      });
    }
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Update expense status
      const result = await pool.query(`
        UPDATE expenses
        SET status = 'PAID',
            paid_by = $1,
            paid_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [req.user.id, id]);
      
      // If expense is linked to a budget, update budget's spent_amount
      if (expense.budget_id) {
        await pool.query(`
          UPDATE budgets
          SET spent_amount = spent_amount + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [expense.amount, expense.budget_id]);
        
        console.log(`✅ Updated budget ${expense.budget_id} spent_amount by $${expense.amount}`);
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      console.log('✅ Expense marked as paid:', id);
      
      res.json({
        success: true,
        message: 'Expense marked as paid successfully',
        data: result.rows[0]
      });
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error marking expense as paid:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark expense as paid' },
      details: error.message
    });
  }
});

module.exports = router;

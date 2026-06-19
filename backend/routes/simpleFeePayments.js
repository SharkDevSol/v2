const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateWithBranch, validateBranchCode } = require('../middleware/branchAuth');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');

// Initialize fee payments table
const initializeFeePaymentsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        id SERIAL PRIMARY KEY,
        receipt_number VARCHAR(50) UNIQUE NOT NULL,
        fee_structure_id INTEGER REFERENCES simple_fee_structures(id) ON DELETE CASCADE,
        student_id VARCHAR(100) NOT NULL,
        student_name VARCHAR(255),
        class_name VARCHAR(100),
        amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_number VARCHAR(100),
        notes TEXT,
        status VARCHAR(20) DEFAULT 'COMPLETED',
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_fee_payments_student 
      ON fee_payments(student_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_structure 
      ON fee_payments(fee_structure_id);
    `);
    
    console.log('✅ Fee payments table initialized');
  } catch (error) {
    console.error('Error initializing fee payments table:', error);
  }
};

// Initialize on module load
initializeFeePaymentsTable().catch(err => console.error('Init error:', err));

// Generate receipt number
const generateReceiptNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get count of payments today
  const result = await pool.query(`
    SELECT COUNT(*) as count 
    FROM fee_payments 
    WHERE DATE(created_at) = CURRENT_DATE
  `);
  
  const count = parseInt(result.rows[0].count) + 1;
  const sequence = String(count).padStart(4, '0');
  
  return `RCP-${year}${month}-${sequence}`;
};

/**
 * GET /api/fee-payments
 * Get all fee payments with filtering
 */
router.get('/', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/fee-payments - Request received');
  
  try {
    const { 
      studentId, 
      feeStructureId, 
      status, 
      fromDate, 
      toDate,
      search,
      page = 1,
      limit = 50
    } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;
    
    if (studentId) {
      whereConditions.push(`student_id = $${paramCount++}`);
      params.push(studentId);
    }
    
    if (feeStructureId) {
      whereConditions.push(`fee_structure_id = $${paramCount++}`);
      params.push(feeStructureId);
    }
    
    if (status) {
      whereConditions.push(`status = $${paramCount++}`);
      params.push(status);
    }
    
    if (fromDate) {
      whereConditions.push(`payment_date >= $${paramCount++}`);
      params.push(fromDate);
    }
    
    if (toDate) {
      whereConditions.push(`payment_date <= $${paramCount++}`);
      params.push(toDate);
    }
    
    if (search) {
      whereConditions.push(`(
        receipt_number ILIKE $${paramCount} OR 
        student_id ILIKE $${paramCount} OR 
        student_name ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get payments with fee structure details and calculate balances
    const paymentsQuery = `
      SELECT 
        fp.*,
        fs.name as fee_name,
        fs.fee_type,
        fs.custom_fee_name,
        fs.academic_year,
        fs.term,
        fs.amount as fee_amount,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM fee_payments
          WHERE student_id = fp.student_id 
          AND fee_structure_id = fp.fee_structure_id
        ) as total_paid
      FROM fee_payments fp
      LEFT JOIN simple_fee_structures fs ON fp.fee_structure_id = fs.id
      ${whereClause}
      ORDER BY fp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(paymentsQuery, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM fee_payments fp
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    
    console.log(`✅ Found ${result.rows.length} payments`);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching fee payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
      details: error.message
    });
  }
});

/**
 * POST /api/fee-payments
 * Record a new fee payment
 */
router.post('/', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 POST /api/fee-payments - Request received');
  console.log('Body:', req.body);
  
  try {
    const {
      feeStructureId,
      studentId,
      studentName,
      className,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes
    } = req.body;
    
    // Validation
    if (!feeStructureId || !studentId || !amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: 'Fee structure, student ID, amount, payment date, and payment method are required'
      });
    }
    
    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();
    
    // Insert payment
    const result = await pool.query(`
      INSERT INTO fee_payments (
        receipt_number,
        fee_structure_id,
        student_id,
        student_name,
        class_name,
        amount,
        payment_date,
        payment_method,
        reference_number,
        notes,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      receiptNumber,
      feeStructureId,
      studentId,
      studentName || null,
      className || null,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber || null,
      notes || null,
      req.user.id
    ]);
    
    console.log('✅ Payment recorded:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record payment',
      details: error.message
    });
  }
});

/**
 * GET /api/fee-payments/student/:studentId
 * Get payment history for a specific student
 */
router.get('/student/:studentId', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/fee-payments/student/:studentId - Request received');
  
  try {
    const { studentId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        fp.*,
        fs.name as fee_name,
        fs.fee_type,
        fs.custom_fee_name,
        fs.academic_year,
        fs.term
      FROM fee_payments fp
      LEFT JOIN simple_fee_structures fs ON fp.fee_structure_id = fs.id
      WHERE fp.student_id = $1
      ORDER BY fp.payment_date DESC
    `, [studentId]);
    
    // Calculate totals
    const totals = await pool.query(`
      SELECT 
        COUNT(*) as payment_count,
        SUM(amount) as total_paid
      FROM fee_payments
      WHERE student_id = $1
    `, [studentId]);
    
    res.json({
      success: true,
      data: {
        payments: result.rows,
        summary: {
          paymentCount: parseInt(totals.rows[0].payment_count),
          totalPaid: parseFloat(totals.rows[0].total_paid || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student payments',
      details: error.message
    });
  }
});

/**
 * GET /api/fee-payments/fee-structure/:id
 * Get payments for a specific fee structure
 */
router.get('/fee-structure/:id', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/fee-payments/fee-structure/:id - Request received');
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        fp.*,
        fs.name as fee_name,
        fs.fee_type,
        fs.custom_fee_name
      FROM fee_payments fp
      LEFT JOIN simple_fee_structures fs ON fp.fee_structure_id = fs.id
      WHERE fp.fee_structure_id = $1
      ORDER BY fp.payment_date DESC
    `, [id]);
    
    // Calculate collection stats
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT student_id) as students_paid,
        COUNT(*) as payment_count,
        SUM(amount) as total_collected
      FROM fee_payments
      WHERE fee_structure_id = $1
    `, [id]);
    
    res.json({
      success: true,
      data: {
        payments: result.rows,
        stats: {
          studentsPaid: parseInt(stats.rows[0].students_paid),
          paymentCount: parseInt(stats.rows[0].payment_count),
          totalCollected: parseFloat(stats.rows[0].total_collected || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching fee structure payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fee structure payments',
      details: error.message
    });
  }
});

/**
 * DELETE /api/fee-payments/:id
 * Delete a payment record
 */
router.delete('/:id', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 DELETE /api/fee-payments/:id - Request received');
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM fee_payments WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    console.log('✅ Payment deleted:', id);
    
    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment',
      details: error.message
    });
  }
});

/**
 * GET /api/fee-payments/students/:className
 * Get students from a specific class
 */
router.get('/students/:className', authenticateWithBranch, async (req, res) => {
  console.log('\n📥 GET /api/fee-payments/students/:className - Request received');
  
  try {
    const { className } = req.params;
    
    // Check if class table exists
    const tableExists = await pool.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'classes_schema' AND table_name = $1
    `, [className]);
    
    if (tableExists.rows.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Get students from class
    const result = await pool.query(`
      SELECT 
        school_id as student_id,
        student_name,
        class as class_name
      FROM classes_schema."${className}"
      WHERE school_id IS NOT NULL 
        AND student_name IS NOT NULL
        AND (is_active = TRUE OR is_active IS NULL)
      ORDER BY student_name ASC
    `);
    
    console.log(`✅ Found ${result.rows.length} students in class ${className}`);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      details: error.message
    });
  }
});

module.exports = router;

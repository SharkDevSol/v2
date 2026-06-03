const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cors = require('cors');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');

// Enable CORS for all finance routes
router.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-branch-code']
}));

// Security middleware
const { authenticateWithBranch, validateBranchCode } = require('../middleware/branchAuth');
const { requirePermission, FINANCE_PERMISSIONS } = require('../middleware/financeAuth');

/**
 * POST /api/finance/fee-structures
 * Create a new fee structure with validation
 */
router.post('/', authenticateWithBranch, requirePermission(FINANCE_PERMISSIONS.FEE_STRUCTURES_CREATE), async (req, res) => {
  console.log('\n📥 POST /api/finance/fee-structures - Request received');
  console.log('User:', req.user);
  console.log('Body:', req.body);
  
  try {
    const { 
      name, 
      academicYearId, 
      termId, 
      gradeLevel, 
      campusId, 
      studentCategory,
      description, // Add description field
      items 
    } = req.body;

    // Validation
    if (!name || !academicYearId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'name', message: 'Fee structure name is required', code: 'REQUIRED_FIELD' },
          { field: 'academicYearId', message: 'Academic year is required', code: 'REQUIRED_FIELD' },
          { field: 'items', message: 'At least one fee item is required', code: 'REQUIRED_FIELD' }
        ].filter(d => 
          (!name && d.field === 'name') || 
          (!academicYearId && d.field === 'academicYearId') ||
          ((!items || !Array.isArray(items) || items.length === 0) && d.field === 'items')
        )
      });
    }

    // Validate fee items
    const validPaymentTypes = ['ONE_TIME', 'RECURRING', 'INSTALLMENT'];
    const validFeeCategories = ['TUITION', 'TRANSPORT', 'LAB', 'EXAM', 'LIBRARY', 'SPORTS', 'BOOKS', 'PHONE', 'UNIFORM', 'MEALS', 'CUSTOM'];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.feeCategory || !item.amount || !item.accountId || !item.paymentType) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: `Fee item ${i + 1} is missing required fields`,
          details: [
            { field: `items[${i}]`, message: 'Fee category, amount, account, and payment type are required', code: 'REQUIRED_FIELD' }
          ]
        });
      }

      // Allow custom fee categories (any string value)
      // No validation needed for feeCategory since it's a flexible string field

      if (!validPaymentTypes.includes(item.paymentType)) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: `Invalid payment type in item ${i + 1}`,
          details: [
            { field: `items[${i}].paymentType`, message: `Payment type must be one of: ${validPaymentTypes.join(', ')}`, code: 'INVALID_TYPE' }
          ]
        });
      }

      if (item.amount <= 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: `Invalid amount in item ${i + 1}`,
          details: [
            { field: `items[${i}].amount`, message: 'Amount must be positive', code: 'INVALID_AMOUNT' }
          ]
        });
      }

      // Validate account exists and is active
      const account = await prisma.account.findUnique({
        where: { id: item.accountId }
      });

      if (!account) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: `Account not found for item ${i + 1}`,
          details: {
            entityType: 'Account',
            entityId: item.accountId
          }
        });
      }

      if (!account.isActive) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: `Account is not active for item ${i + 1}`,
          details: [
            { field: `items[${i}].accountId`, message: 'Cannot use inactive account', code: 'INACTIVE_ACCOUNT' }
          ]
        });
      }

      // Validate installment-specific fields
      if (item.paymentType === 'INSTALLMENT') {
        if (!item.installmentCount || item.installmentCount < 2) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: `Invalid installment count in item ${i + 1}`,
            details: [
              { field: `items[${i}].installmentCount`, message: 'Installment count must be at least 2', code: 'INVALID_INSTALLMENT_COUNT' }
            ]
          });
        }
      }
    }

    // Create fee structure with items in a transaction
    const feeStructure = await prisma.$transaction(async (tx) => {
      // Create fee structure
      const structure = await tx.feeStructure.create({
        data: {
          name,
          academicYearId,
          termId: termId || null,
          gradeLevel: gradeLevel || null,
          campusId: campusId || null,
          studentCategory: studentCategory || null,
          description: description || null, // Add description field
          isActive: true
        }
      });

      // Create fee structure items
      const createdItems = await Promise.all(
        items.map(item => 
          tx.feeStructureItem.create({
            data: {
              feeStructureId: structure.id,
              feeCategory: item.feeCategory,
              amount: item.amount,
              accountId: item.accountId,
              paymentType: item.paymentType,
              dueDate: item.dueDate || null,
              installmentCount: item.installmentCount || null,
              description: item.description || null
            }
          })
        )
      );

      // Create audit log
      // Convert integer user ID to UUID format for audit log
      const userIdAsUuid = '00000000-0000-0000-0000-' + String(req.user.id).padStart(12, '0');
      
      await tx.auditLog.create({
        data: {
          entityType: 'FeeStructure',
          entityId: structure.id,
          action: 'CREATE',
          userId: userIdAsUuid,
          newValue: { ...structure, items: createdItems },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return { ...structure, items: createdItems };
    });

    res.status(201).json({
      message: 'Fee structure created successfully',
      data: feeStructure
    });

  } catch (error) {
    console.error('Create fee structure error:', error);
    res.status(500).json({
      error: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred',
      details: {
        errorId: `error-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/finance/fee-structures
 * List fee structures with filtering
 */
router.get('/', authenticateWithBranch, requirePermission(FINANCE_PERMISSIONS.FEE_STRUCTURES_VIEW), async (req, res) => {
  console.log('\n📥 GET /api/finance/fee-structures - Request received');
  console.log('User:', req.user);
  console.log('Query params:', req.query);
  
  try {
    const { 
      academicYearId, 
      termId, 
      gradeLevel, 
      campusId, 
      studentCategory,
      isActive, 
      search, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Build filter
    const where = {};
    
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }
    
    if (termId) {
      where.termId = termId;
    }
    
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }
    
    if (campusId) {
      where.campusId = campusId;
    }
    
    if (studentCategory) {
      where.studentCategory = studentCategory;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Fetch fee structures
    const [feeStructures, total] = await Promise.all([
      prisma.feeStructure.findMany({
        where,
        skip,
        take,
        orderBy: [
          { createdAt: 'desc' }
        ],
        include: {
          items: {
            include: {
              account: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  type: true
                }
              }
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        }
      }),
      prisma.feeStructure.count({ where })
    ]);

    res.json({
      data: feeStructures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('List fee structures error:', error);
    res.status(500).json({
      error: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred',
      details: {
        errorId: `error-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/finance/fee-structures/:id
 * Get fee structure details
 */
router.get('/:id', authenticateWithBranch, requirePermission(FINANCE_PERMISSIONS.FEE_STRUCTURES_VIEW), async (req, res) => {
  try {
    const { id } = req.params;

    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true
              }
            }
          },
          orderBy: { feeCategory: 'asc' }
        },
        _count: {
          select: {
            invoices: true
          }
        }
      }
    });

    if (!feeStructure) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Fee structure not found',
        details: {
          entityType: 'FeeStructure',
          entityId: id
        }
      });
    }

    res.json({
      data: feeStructure
    });

  } catch (error) {
    console.error('Get fee structure error:', error);
    res.status(500).json({
      error: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred',
      details: {
        errorId: `error-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * PUT /api/finance/fee-structures/:id
 * Update fee structure
 */
router.put('/:id', authenticateWithBranch, requirePermission(FINANCE_PERMISSIONS.FEE_STRUCTURES_UPDATE), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      isActive,
      termId, 
      gradeLevel, 
      campusId, 
      studentCategory,
      items 
    } = req.body;

    // Check if fee structure exists
    const existingStructure = await prisma.feeStructure.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!existingStructure) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Fee structure not found',
        details: {
          entityType: 'FeeStructure',
          entityId: id
        }
      });
    }

    // Note: Invoice checking removed - invoices relation not yet implemented
    // In future, add: if (existingStructure._count.invoices > 0 && items) { ... }

    // Validate items if provided
    if (items && Array.isArray(items)) {
      const validPaymentTypes = ['ONE_TIME', 'RECURRING', 'INSTALLMENT'];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (!item.feeCategory || !item.amount || !item.accountId || !item.paymentType) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: `Fee item ${i + 1} is missing required fields`,
            details: [
              { field: `items[${i}]`, message: 'Fee category, amount, account, and payment type are required', code: 'REQUIRED_FIELD' }
            ]
          });
        }

        // Allow custom fee categories (any string value)
        // No validation needed for feeCategory since it's a flexible string field

        if (!validPaymentTypes.includes(item.paymentType)) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: `Invalid payment type in item ${i + 1}`,
            details: [
              { field: `items[${i}].paymentType`, message: `Payment type must be one of: ${validPaymentTypes.join(', ')}`, code: 'INVALID_TYPE' }
            ]
          });
        }

        if (item.amount <= 0) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: `Invalid amount in item ${i + 1}`,
            details: [
              { field: `items[${i}].amount`, message: 'Amount must be positive', code: 'INVALID_AMOUNT' }
            ]
          });
        }

        // Validate account exists and is active
        const account = await prisma.account.findUnique({
          where: { id: item.accountId }
        });

        if (!account) {
          return res.status(404).json({
            error: 'NOT_FOUND',
            message: `Account not found for item ${i + 1}`,
            details: {
              entityType: 'Account',
              entityId: item.accountId
            }
          });
        }

        if (!account.isActive) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: `Account is not active for item ${i + 1}`,
            details: [
              { field: `items[${i}].accountId`, message: 'Cannot use inactive account', code: 'INACTIVE_ACCOUNT' }
            ]
          });
        }
      }
    }

    // Update fee structure in a transaction
    const updatedStructure = await prisma.$transaction(async (tx) => {
      // Update fee structure
      const structure = await tx.feeStructure.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(isActive !== undefined && { isActive }),
          ...(termId !== undefined && { termId: termId || null }),
          ...(gradeLevel !== undefined && { gradeLevel: gradeLevel || null }),
          ...(campusId !== undefined && { campusId: campusId || null }),
          ...(studentCategory !== undefined && { studentCategory: studentCategory || null })
        }
      });

      // Update items if provided
      let updatedItems = existingStructure.items;
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx.feeStructureItem.deleteMany({
          where: { feeStructureId: id }
        });

        // Create new items
        updatedItems = await Promise.all(
          items.map(item => 
            tx.feeStructureItem.create({
              data: {
                feeStructureId: id,
                feeCategory: item.feeCategory,
                amount: item.amount,
                accountId: item.accountId,
                paymentType: item.paymentType,
                dueDate: item.dueDate || null,
                installmentCount: item.installmentCount || null,
                description: item.description || null
              }
            })
          )
        );
      }

      // Create audit log
      // Convert integer user ID to UUID format for audit log
      const userIdAsUuid = '00000000-0000-0000-0000-' + String(req.user.id).padStart(12, '0');
      
      await tx.auditLog.create({
        data: {
          entityType: 'FeeStructure',
          entityId: id,
          action: 'UPDATE',
          userId: userIdAsUuid,
          oldValue: existingStructure,
          newValue: { ...structure, items: updatedItems },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return { ...structure, items: updatedItems };
    });

    res.json({
      message: 'Fee structure updated successfully',
      data: updatedStructure
    });

  } catch (error) {
    console.error('Update fee structure error:', error);
    res.status(500).json({
      error: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred',
      details: {
        errorId: `error-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;


/**
 * DELETE /api/finance/fee-structures/:id
 * Delete a fee structure and all related invoices
 */
router.delete('/:id', authenticateWithBranch, requirePermission(FINANCE_PERMISSIONS.FEE_STRUCTURES_DELETE), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if fee structure exists
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    if (!feeStructure) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Fee structure not found'
      });
    }

    // Delete in a transaction to ensure all related data is removed
    await prisma.$transaction(async (tx) => {
      // First, get all invoices for this fee structure
      const invoices = await tx.invoice.findMany({
        where: { feeStructureId: id },
        select: { id: true }
      });

      const invoiceIds = invoices.map(inv => inv.id);

      if (invoiceIds.length > 0) {
        // Delete payment allocations for these invoices
        await tx.paymentAllocation.deleteMany({
          where: { invoiceId: { in: invoiceIds } }
        });

        // Delete invoice items
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: { in: invoiceIds } }
        });

        // Delete invoices
        await tx.invoice.deleteMany({
          where: { feeStructureId: id }
        });
      }

      // Delete fee structure items
      await tx.feeStructureItem.deleteMany({
        where: { feeStructureId: id }
      });

      // Finally, delete the fee structure
      await tx.feeStructure.delete({
        where: { id }
      });
    });

    res.json({
      message: 'Fee structure and all related invoices deleted successfully',
      data: { id }
    });

  } catch (error) {
    console.error('Delete fee structure error:', error);
    res.status(500).json({
      error: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred while deleting fee structure',
      details: error.message
    });
  }
});

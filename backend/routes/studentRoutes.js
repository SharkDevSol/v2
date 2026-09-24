const express = require('express');
const router = express.Router();
const cors = require('cors');
const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');
require('dotenv').config();

// Security middleware
const { authorizeRoles } = require('../middleware/auth');
const { authenticateWithBranch, validateBranchCode } = require('../middleware/branchAuth');
const { sanitizeInputs } = require('../middleware/inputValidation');
const { multerFileFilter } = require('../middleware/fileValidation');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Enable CORS for all routes in this router
router.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('skoolific.com')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-branch-code'],
  credentials: true
}));

// Apply input sanitization
router.use(sanitizeInputs);

// Branch code gate: ALL student routes require a branch code (header, query, or body)
router.use(validateBranchCode);

// Configure multer for file uploads - support multiple file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Use the centralized file filter from security middleware
const fileFilter = multerFileFilter;

// Allowed MIME types for reference (actual validation in multerFileFilter)
const allowedMimes = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Ensure global_machine_ids table exists
const initGlobalMachineIds = async () => {
  try {
    await db.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
    await db.query(`
      CREATE TABLE IF NOT EXISTS school_schema_points.global_machine_ids (
        smachine_id VARCHAR(50) PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        school_id INTEGER,
        class_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_global_machine_ids_class
      ON school_schema_points.global_machine_ids(class_name)
    `);
  } catch (e) {
    console.error('global_machine_ids init error:', e.message);
  }
};
initGlobalMachineIds();

// Get all classes
router.get('/classes', authenticateWithBranch, async (req, res) => {
  try {
    const pool = req.branchPool;
    const result = await pool.query('SELECT unnest(class_names) as class_name FROM school_schema_points.classes WHERE id = 1 ORDER BY class_name');
    res.json(result.rows.map(row => row.class_name));
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get columns for a specific class
router.get('/columns/:className', async (req, res) => {
  const { className } = req.params;
  try {
    const result = await db.query(
      'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
      ['classes_schema', className]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching columns:', err);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

// Get form structure including custom field metadata
router.get('/form-structure', async (req, res) => {
  try {
    // First check if the table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'school_schema_points' 
        AND table_name = 'classes'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      return res.json({ classes: [], customFields: [] });
    }
    
    // Check if custom_fields column exists
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'school_schema_points' 
      AND table_name = 'classes' 
      AND column_name = 'custom_fields'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Column doesn't exist, return empty custom fields
      const result = await db.query('SELECT class_names FROM school_schema_points.classes WHERE id = 1');
      if (result.rows.length > 0) {
        return res.json({
          classes: result.rows[0].class_names,
          customFields: []
        });
      } else {
        return res.json({ classes: [], customFields: [] });
      }
    }
    
    // Add class_configs column if not exists
    await db.query(`ALTER TABLE school_schema_points.classes ADD COLUMN IF NOT EXISTS class_configs JSONB DEFAULT '{}'::jsonb`);
    
    // Column exists, query with custom_fields
    const result = await db.query('SELECT class_names, custom_fields, class_configs FROM school_schema_points.classes WHERE id = 1');
    if (result.rows.length > 0) {
      let customFields = [];
      let classConfigs = {};
      try {
        // Parse the JSONB field if it exists and is valid
        if (result.rows[0].custom_fields) {
          customFields = Array.isArray(result.rows[0].custom_fields) 
            ? result.rows[0].custom_fields 
            : JSON.parse(result.rows[0].custom_fields);
        }
        if (result.rows[0].class_configs) {
          classConfigs = typeof result.rows[0].class_configs === 'object'
            ? result.rows[0].class_configs
            : JSON.parse(result.rows[0].class_configs);
        }
      } catch (err) {
        console.error('Error parsing form structure:', err);
      }
      
      res.json({
        classes: result.rows[0].class_names,
        customFields: customFields,
        classConfigs: classConfigs
      });
    } else {
      res.json({ classes: [], customFields: [], classConfigs: {} });
    }
  } catch (err) {
    console.error('Error fetching form structure:', err);
    // If any error, return empty
    return res.json({ classes: [], customFields: [] });
  }
});

// Search for guardian by phone
router.get('/search-guardian/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const tables = (await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['classes_schema'])).rows.map(row => row.table_name);
    console.log(`Searching for guardian with phone: ${phone} across tables: ${tables.join(', ')}`);
    for (const table of tables) {
      // Check if is_active column exists
      const columnCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'classes_schema' 
          AND table_name = $1 
          AND column_name = 'is_active'
      `, [table]);
      
      const hasIsActive = columnCheck.rows.length > 0;
      const whereClause = hasIsActive ? 'AND (is_active = TRUE OR is_active IS NULL)' : '';
      
      const result = await db.query(
        `SELECT guardian_name, guardian_username, guardian_password FROM classes_schema."${table}" WHERE guardian_phone = $1 ${whereClause} LIMIT 1`,
        [phone]
      );
      if (result.rows.length > 0) {
        console.log(`Guardian found in table ${table}:`, result.rows[0]);
        return res.json({
          guardian_name: result.rows[0].guardian_name,
          guardian_username: result.rows[0].guardian_username,
          guardian_password: result.rows[0].guardian_password
        });
      }
    }
    console.log(`No guardian found for phone: ${phone}`);
    res.status(404).json({ error: 'Guardian not found for the provided phone number' });
  } catch (err) {
    console.error('Error searching guardian:', err);
    res.status(500).json({ error: 'Failed to search guardian', details: err.message });
  }
});

// Create form structure - FIXED JSON SERIALIZATION
router.post('/create-form', async (req, res) => {
  const { classCount, classes, customFields, classConfigs } = req.body;
  
  // Validate input
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    return res.status(400).json({ error: 'Classes array is required and cannot be empty' });
  }

  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    // Don't drop schema — create if not exists, preserve existing class data
    await client.query('CREATE SCHEMA IF NOT EXISTS classes_schema');
    
    // Create tables for each class (only if they don't already exist)
    for (const className of classes) {
      // Check if table already exists
      // Basic columns that every table should have
      const baseColumns = [
        'id SERIAL PRIMARY KEY',
        'school_id INTEGER',
        'class_id INTEGER',
        'image_student VARCHAR(255)',
        'student_name VARCHAR(255) NOT NULL',
        'smachine_id VARCHAR(50) UNIQUE',
        'age INTEGER NOT NULL',
        'gender VARCHAR(50) NOT NULL',
        'class VARCHAR(50) NOT NULL',
        'username VARCHAR(255)',
        'password VARCHAR(255)',
        'guardian_name VARCHAR(255) NOT NULL',
        'guardian_phone VARCHAR(20) NOT NULL',
        'guardian_relation VARCHAR(50) NOT NULL',
        'guardian_username VARCHAR(255)',
        'guardian_password VARCHAR(255)',
        // Finance-related columns (required for monthly payment tracking)
        'is_active BOOLEAN DEFAULT TRUE',
        'is_free BOOLEAN DEFAULT FALSE',
        'exemption_type VARCHAR(50)',
        'exemption_reason TEXT'
      ];
      
      // Add custom fields
      const customColumns = [];
      if (customFields && Array.isArray(customFields)) {
        customFields.forEach(field => {
          if (!field.name || !field.type) {
            throw new Error('Invalid custom field: name and type are required');
          }
          
          let columnType;
          switch (field.type) {
            case 'number':
              columnType = 'INTEGER';
              break;
            case 'date':
              columnType = 'DATE';
              break;
            case 'checkbox':
              columnType = 'BOOLEAN';
              break;
            case 'textarea':
            case 'multi-select':
              columnType = 'TEXT';
              break;
            case 'select':
            case 'upload':
            case 'text':
            default:
              columnType = 'VARCHAR(255)';
          }
          
          const notNull = field.required ? ' NOT NULL' : '';
          customColumns.push(`${field.name} ${columnType}${notNull}`);
        });
      }
      
      // Combine all columns
      const allColumns = [...baseColumns, ...customColumns];
      const createTableSQL = `CREATE TABLE IF NOT EXISTS classes_schema."${className}" (${allColumns.join(', ')})`;
      
      console.log(`Ensuring table: ${className}`);
      await client.query(createTableSQL);
      // Add new columns if they don't exist (for existing tables)
      for (const col of allColumns) {
        const colName = col.split(' ')[0];
        if (colName === 'id') continue;
        try { await client.query(`ALTER TABLE classes_schema."${className}" ADD COLUMN IF NOT EXISTS ${col}`); } catch(e) { /* column may already exist */ }
      }
    }

    // Ensure school_schema_points schema exists
    await client.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
    
    // Create global ID tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS school_schema_points.global_id_tracker (
        id SERIAL PRIMARY KEY,
        last_school_id INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Initialize global ID tracker if empty
    const trackerCheck = await client.query('SELECT COUNT(*) FROM school_schema_points.global_id_tracker');
    if (parseInt(trackerCheck.rows[0].count) === 0) {
      await client.query('INSERT INTO school_schema_points.global_id_tracker (last_school_id) VALUES (0)');
    }
    
    // Upsert metadata into school_schema_points.classes
    await client.query(`
      CREATE TABLE IF NOT EXISTS school_schema_points.classes (
        id INTEGER PRIMARY KEY, 
        class_count INTEGER NOT NULL, 
        class_names TEXT[] NOT NULL,
        custom_fields JSONB DEFAULT '[]'::jsonb,
        class_configs JSONB DEFAULT '{}'::jsonb
      )
    `);
    // FIX: Properly serialize customFields for JSONB
    let customFieldsForDB = null;
    if (customFields && Array.isArray(customFields) && customFields.length > 0) {
      customFieldsForDB = JSON.stringify(customFields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type,
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options : []
      })));
    } else {
      customFieldsForDB = JSON.stringify([]);
    }
    
    let classConfigsForDB = JSON.stringify(classConfigs || {});
    
    await client.query(`
      INSERT INTO school_schema_points.classes (id, class_count, class_names, custom_fields, class_configs)
      VALUES (1, $1, $2, $3::jsonb, $4::jsonb)
      ON CONFLICT (id) DO UPDATE 
      SET class_count = EXCLUDED.class_count, 
          class_names = EXCLUDED.class_names, 
          custom_fields = EXCLUDED.custom_fields,
          class_configs = EXCLUDED.class_configs
    `, [classes.length, classes, customFieldsForDB, classConfigsForDB]);

    await client.query('COMMIT');
    
    res.json({ 
      message: 'Form structure created successfully',
      classes,
      customFields: customFieldsForDB ? JSON.parse(customFieldsForDB) : []
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating form:', err);
    res.status(500).json({ error: 'Failed to create form', details: err.message });
  } finally {
    client.release();
  }
});

// Fix constraints for existing tables
router.post('/fix-constraints', async (req, res) => {
  try {
    const tables = (await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['classes_schema'])).rows.map(row => row.table_name);
    
    for (const table of tables) {
      const constraints = await db.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = (
          SELECT oid FROM pg_class WHERE relname = $1
        ) AND contype = 'u'
      `, [table]);
      
      for (const constraint of constraints.rows) {
        await db.query(`ALTER TABLE classes_schema."${table}" DROP CONSTRAINT IF EXISTS "${constraint.conname}"`);
      }
    }
    
    res.json({ message: 'Constraints fixed successfully' });
  } catch (err) {
    console.error('Error fixing constraints:', err);
    res.status(500).json({ error: 'Failed to fix constraints', details: err.message });
  }
});

// Helper to safely execute a query within an existing transaction using PostgreSQL SAVEPOINTS
const safeTxQuery = async (client, sql, params = []) => {
  try {
    await client.query('SAVEPOINT sp_safe');
    const r = await client.query(sql, params);
    await client.query('RELEASE SAVEPOINT sp_safe');
    return r;
  } catch (err) {
    await client.query('ROLLBACK TO SAVEPOINT sp_safe');
    return null;
  }
};

/**
 * Propagate class rename across 100% of tables, schemas, and subsystem references.
 * Preserves students, invoices, fee structures, mark tables, attendance, biometrics, schedules, etc.
 */
async function propagateClassRename(client, oldClassName, newClassName) {
  if (!oldClassName || !newClassName || oldClassName === newClassName) return;

  // 1. Rename table in classes_schema if exists
  const tblCheck = await safeTxQuery(client, `
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'classes_schema' AND table_name = $1
  `, [oldClassName]);
  if (tblCheck?.rows?.length > 0) {
    await client.query(`ALTER TABLE classes_schema."${oldClassName}" RENAME TO "${newClassName}"`);
    await client.query(`UPDATE classes_schema."${newClassName}" SET class = $1`, [newClassName]);
  }

  // 2. FeeStructure in school_comms (Monthly Payment Settings & Progressive Invoices)
  await safeTxQuery(client, `
    UPDATE school_comms."FeeStructure" 
    SET "gradeLevel" = $1, 
        name = regexp_replace(name, '(?<![a-zA-Z0-9])' || $2 || '(?![a-zA-Z0-9])', $1, 'g')
    WHERE "gradeLevel" = $2
  `, [newClassName, oldClassName]);

  // 3. Simple fee structures (array of class_names)
  await safeTxQuery(client, `
    UPDATE simple_fee_structures 
    SET class_names = array_replace(class_names, $2, $1) 
    WHERE $2 = ANY(class_names)
  `, [newClassName, oldClassName]);

  // 4. Fee payments
  await safeTxQuery(client, `UPDATE fee_payments SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);

  // 5. Attendance (records + attendance schema)
  await safeTxQuery(client, `UPDATE public.academic_student_attendance SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE public.student_attendance SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  const attSchema = await safeTxQuery(client, `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`, [`class_${oldClassName}_attendance`]);
  if (attSchema?.rows?.length > 0) {
    await safeTxQuery(client, `ALTER SCHEMA "class_${oldClassName}_attendance" RENAME TO "class_${newClassName}_attendance"`);
  }

  // 6. Subject mappings & teachers_subjects
  await safeTxQuery(client, `
    UPDATE subjects_of_school_schema.subject_class_mappings 
    SET class_name = $1 
    WHERE class_name = $2
  `, [newClassName, oldClassName]);

  await safeTxQuery(client, `
    UPDATE subjects_of_school_schema.teachers_subjects 
    SET subject_class = regexp_replace(subject_class, ' Class ' || $1 || '$', ' Class ' || $2)
    WHERE subject_class LIKE '% Class ' || $1
  `, [oldClassName, newClassName]);

  // 7. Subject schemas (form_config & mark tables)
  const subjectSchemas = await safeTxQuery(client, `
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name LIKE 'subject_%_schema' AND schema_name != 'subjects_of_school_schema'
  `);
  if (subjectSchemas?.rows) {
    for (const s of subjectSchemas.rows) {
      await safeTxQuery(client, `
        UPDATE ${s.schema_name}.form_config 
        SET class_name = $1 
        WHERE class_name = $2
      `, [newClassName, oldClassName]);

      const markTables = await safeTxQuery(client, `
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name ILIKE $2
      `, [s.schema_name, `${oldClassName.toLowerCase()}_term_%`]);

      if (markTables?.rows) {
        for (const mt of markTables.rows) {
          const newMt = mt.table_name.replace(
            new RegExp(`^${oldClassName.toLowerCase()}_`, 'i'), 
            `${newClassName.toLowerCase()}_`
          );
          await safeTxQuery(client, `
            ALTER TABLE ${s.schema_name}."${mt.table_name}" RENAME TO "${newMt}"
          `);
        }
      }
    }
  }

  // 8. Fault table
  const faultCheck = await safeTxQuery(client, `
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'class_students_fault' AND table_name = $1
  `, [oldClassName]);
  if (faultCheck?.rows?.length > 0) {
    await safeTxQuery(client, `ALTER TABLE class_students_fault."${oldClassName}" RENAME TO "${newClassName}"`);
  }

  // 9. Biometric / Machine IDs
  await safeTxQuery(client, `
    UPDATE school_schema_points.global_machine_ids 
    SET class_name = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE class_name = $2
  `, [newClassName, oldClassName]);

  // 10. Academic shift assignment
  await safeTxQuery(client, `UPDATE academic_class_shift_assignment SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);

  // 11. Teachers & Schedule
  await safeTxQuery(client, `UPDATE school_schema_points.class_teachers SET assigned_class = $1 WHERE assigned_class = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE school_schema_points.teachers_period SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `
    UPDATE schedule_schema.class_subject_configs 
    SET subject_class = regexp_replace(subject_class, ' Class ' || $1 || '$', ' Class ' || $2)
    WHERE subject_class LIKE '% Class ' || $1
  `, [oldClassName, newClassName]);
  await safeTxQuery(client, `UPDATE schedule_schema.schedule_conflicts SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE schedule_schema.schedule_slots SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);

  // 12. Evaluation book, responses & exams
  await safeTxQuery(client, `UPDATE evaluation_book_daily_entries SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE evaluation_book_teacher_assignments SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE evaluation_responses SET student_class = $1 WHERE student_class = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE evaluations SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE published_ai_tests SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE student_exams SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);

  // 13. Conversations, messages, archived, staff
  await safeTxQuery(client, `UPDATE conversations SET teacher_class = $1 WHERE teacher_class = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE class_messages SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE archived_students SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
  await safeTxQuery(client, `UPDATE staff_users SET class_name = $1 WHERE class_name = $2`, [newClassName, oldClassName]);
}

/**
 * Clone configurations for newly created sections from the source section.
 * Sets up fee structures, subject mappings, teachers, mark tables, shift assignments, and fault tables.
 */
async function cloneSectionSetup(client, sourceSection, newSection, shift) {
  // 1. FeeStructure in school_comms: clone from sourceSection for newSection
  const feeRes = await safeTxQuery(client, `SELECT * FROM school_comms."FeeStructure" WHERE "gradeLevel" = $1 LIMIT 1`, [sourceSection]);
  if (feeRes?.rows?.length > 0) {
    const existingFee = await safeTxQuery(client, `SELECT 1 FROM school_comms."FeeStructure" WHERE "gradeLevel" = $1`, [newSection]);
    if (existingFee?.rows?.length === 0) {
      const fa = feeRes.rows[0];
      const newName = fa.name.replace(sourceSection, newSection);
      const insertedFee = await safeTxQuery(client, `
        INSERT INTO school_comms."FeeStructure" 
          (id, name, "academicYearId", "termId", "gradeLevel", "campusId", "studentCategory", description, "isActive", "createdAt", "updatedAt")
        VALUES 
          (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `, [newName, fa.academicYearId, fa.termId, newSection, fa.campusId, fa.studentCategory, fa.description, fa.isActive]);

      if (insertedFee?.rows?.length > 0) {
        const newFeeId = insertedFee.rows[0].id;
        const items = await safeTxQuery(client, `SELECT * FROM school_comms."FeeStructureItem" WHERE "feeStructureId" = $1`, [fa.id]);
        if (items?.rows) {
          for (const it of items.rows) {
            await safeTxQuery(client, `
              INSERT INTO school_comms."FeeStructureItem"
                (id, "feeStructureId", "feeCategory", amount, "accountId", "paymentType", "dueDate", "installmentCount", description)
              VALUES
                (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
            `, [newFeeId, it.feeCategory, it.amount, it.accountId, it.paymentType, it.dueDate, it.installmentCount, it.description]);
          }
        }
      }
    }
  }

  // 2. Simple fee structures
  await safeTxQuery(client, `
    UPDATE simple_fee_structures 
    SET class_names = array_append(class_names, $1) 
    WHERE $2 = ANY(class_names) AND NOT ($1 = ANY(class_names))
  `, [newSection, sourceSection]);

  // 3. Academic shift assignment
  await safeTxQuery(client, `
    INSERT INTO academic_class_shift_assignment (class_name, shift_number)
    VALUES ($1, $2)
    ON CONFLICT (class_name) DO UPDATE SET shift_number = EXCLUDED.shift_number
  `, [newSection, shift || 1]);

  // 4. Subject class mappings
  const mappings = await safeTxQuery(client, `SELECT subject_name FROM subjects_of_school_schema.subject_class_mappings WHERE class_name = $1`, [sourceSection]);
  if (mappings?.rows) {
    for (const m of mappings.rows) {
      await safeTxQuery(client, `
        INSERT INTO subjects_of_school_schema.subject_class_mappings (subject_name, class_name)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [m.subject_name, newSection]);
    }
  }

  // 5. Teachers subjects
  const teachers = await safeTxQuery(client, `SELECT teacher_name, subject_class FROM subjects_of_school_schema.teachers_subjects WHERE subject_class LIKE '% Class ' || $1`, [sourceSection]);
  if (teachers?.rows) {
    for (const t of teachers.rows) {
      const newSubjectClass = t.subject_class.replace(` Class ${sourceSection}`, ` Class ${newSection}`);
      await safeTxQuery(client, `
        INSERT INTO subjects_of_school_schema.teachers_subjects (teacher_name, subject_class, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING
      `, [t.teacher_name, newSubjectClass]);
    }
  }

  // 6. Subject schemas form_config & Mark tables
  const subSchemas = await safeTxQuery(client, `
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name LIKE 'subject_%_schema' AND schema_name != 'subjects_of_school_schema'
  `);
  if (subSchemas?.rows) {
    for (const s of subSchemas.rows) {
      // Clone form_config
      const fcs = await safeTxQuery(client, `SELECT * FROM ${s.schema_name}.form_config WHERE class_name = $1`, [sourceSection]);
      if (fcs?.rows) {
        for (const fc of fcs.rows) {
          const cols = Object.keys(fc).filter(k => k !== 'id');
          const vals = cols.map(k => k === 'class_name' ? newSection : fc[k]);
          const colNames = cols.map(c => `"${c}"`).join(', ');
          const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
          await safeTxQuery(client, `
            INSERT INTO ${s.schema_name}.form_config (${colNames}) 
            VALUES (${placeholders}) 
            ON CONFLICT DO NOTHING
          `, vals);
        }
      }

      // Clone mark tables (empty tables with same structure)
      const markTables = await safeTxQuery(client, `
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name ILIKE $2
      `, [s.schema_name, `${sourceSection.toLowerCase()}_term_%`]);
      if (markTables?.rows) {
        for (const mt of markTables.rows) {
          const targetTable = mt.table_name.replace(new RegExp(`^${sourceSection.toLowerCase()}_`, 'i'), `${newSection.toLowerCase()}_`);
          await safeTxQuery(client, `
            CREATE TABLE IF NOT EXISTS ${s.schema_name}."${targetTable}" 
            (LIKE ${s.schema_name}."${mt.table_name}" INCLUDING ALL)
          `);
        }
      }
    }
  }

  // 7. Fault table
  const faultCheck = await safeTxQuery(client, `
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'class_students_fault' AND table_name = $1
  `, [sourceSection]);
  if (faultCheck?.rows?.length > 0) {
    await safeTxQuery(client, `
      CREATE TABLE IF NOT EXISTS class_students_fault."${newSection}" 
      (LIKE class_students_fault."${sourceSection}" INCLUDING ALL)
    `);
  }
}

// Split a class into multiple sections (e.g. G4 -> G4A, G4B, G4C)
// Preserves all student records and data by renaming the original class table to the first section
router.post('/split-class-sections', async (req, res) => {
  const { originalClass, sections, shift, isKG } = req.body;

  if (!originalClass || typeof originalClass !== 'string') {
    return res.status(400).json({ error: 'originalClass is required' });
  }

  if (!sections || !Array.isArray(sections) || sections.length < 2) {
    return res.status(400).json({ error: 'sections array with at least 2 sections is required' });
  }

  // Validate class names
  for (const sec of sections) {
    if (!/^[a-zA-Z0-9_]+$/.test(sec)) {
      return res.status(400).json({ error: `Invalid section name "${sec}": letters, numbers, and underscores only` });
    }
  }

  // Check for duplicates in sections
  if (new Set(sections).size !== sections.length) {
    return res.status(400).json({ error: 'Section names must be unique' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    await client.query('CREATE SCHEMA IF NOT EXISTS classes_schema');
    await client.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');

    const targetFirstSection = sections[0];

    // Check if original class table exists
    const origExistsRes = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'classes_schema' AND table_name = $1
      )
    `, [originalClass]);
    const origExists = origExistsRes.rows[0].exists;

    // Check if any NEW section names already exist as tables (excluding originalClass)
    for (const sec of sections) {
      if (sec === originalClass) continue;
      const secExistsRes = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'classes_schema' AND table_name = $1
        )
      `, [sec]);
      if (secExistsRes.rows[0].exists) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Table for section "${sec}" already exists in database` });
      }
    }

    // 1. Rename existing class table and all its references to first section (preserves 100% of data)
    if (origExists && originalClass !== targetFirstSection) {
      console.log(`Propagating rename: ${originalClass} -> ${targetFirstSection}`);
      await propagateClassRename(client, originalClass, targetFirstSection);
    }

    // 2. Fetch custom fields metadata for creating new sections
    const metaRes = await safeTxQuery(client, 'SELECT custom_fields, class_configs FROM school_schema_points.classes WHERE id = 1');
    let customFields = [];
    if (metaRes?.rows?.length > 0 && metaRes.rows[0].custom_fields) {
      customFields = Array.isArray(metaRes.rows[0].custom_fields)
        ? metaRes.rows[0].custom_fields
        : JSON.parse(metaRes.rows[0].custom_fields);
    }

    // Determine sections to create from scratch (all except first section if original existed)
    const sectionsToCreate = origExists ? sections.slice(1) : sections;

    const baseColumns = [
      'id SERIAL PRIMARY KEY',
      'school_id INTEGER',
      'class_id INTEGER',
      'image_student VARCHAR(255)',
      'student_name VARCHAR(255) NOT NULL',
      'smachine_id VARCHAR(50) UNIQUE',
      'age INTEGER NOT NULL',
      'gender VARCHAR(50) NOT NULL',
      'class VARCHAR(50) NOT NULL',
      'username VARCHAR(255)',
      'password VARCHAR(255)',
      'guardian_name VARCHAR(255) NOT NULL',
      'guardian_phone VARCHAR(20) NOT NULL',
      'guardian_relation VARCHAR(50) NOT NULL',
      'guardian_username VARCHAR(255)',
      'guardian_password VARCHAR(255)',
      'is_active BOOLEAN DEFAULT TRUE',
      'is_free BOOLEAN DEFAULT FALSE',
      'exemption_type VARCHAR(50)',
      'exemption_reason TEXT',
      'registration_fee_type VARCHAR(50)'
    ];

    const customColumns = [];
    if (customFields && Array.isArray(customFields)) {
      customFields.forEach(field => {
        if (!field.name || !field.type) return;
        let colType;
        switch (field.type) {
          case 'number': colType = 'INTEGER'; break;
          case 'date': colType = 'DATE'; break;
          case 'checkbox': colType = 'BOOLEAN'; break;
          case 'textarea':
          case 'multi-select': colType = 'TEXT'; break;
          default: colType = 'VARCHAR(255)';
        }
        customColumns.push(`"${field.name}" ${colType}`);
      });
    }

    const allColumns = [...baseColumns, ...customColumns];

    // Create tables and clone setup for each new section
    for (const secName of sectionsToCreate) {
      console.log(`Creating new section table: classes_schema."${secName}"`);
      await client.query(`CREATE TABLE IF NOT EXISTS classes_schema."${secName}" (${allColumns.join(', ')})`);

      // If first section existed, copy any other missing columns to ensure 100% schema symmetry
      if (origExists) {
        const existingCols = await safeTxQuery(client, `
          SELECT column_name, data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_schema = 'classes_schema' AND table_name = $1
        `, [targetFirstSection]);

        if (existingCols?.rows) {
          for (const c of existingCols.rows) {
            if (c.column_name === 'id') continue;
            const typeStr = c.character_maximum_length ? `${c.data_type}(${c.character_maximum_length})` : c.data_type;
            await safeTxQuery(client, `
              ALTER TABLE classes_schema."${secName}" ADD COLUMN IF NOT EXISTS "${c.column_name}" ${typeStr}
            `);
          }
        }

        // Clone fee structures, subject mappings, teachers, mark tables, and shift for this section
        await cloneSectionSetup(client, targetFirstSection, secName, shift);
      }
    }

    // 3. Update school_schema_points.classes metadata
    const curMeta = await client.query('SELECT class_names, class_configs FROM school_schema_points.classes WHERE id = 1');
    let classNames = [];
    let configs = {};
    if (curMeta.rows.length > 0) {
      classNames = curMeta.rows[0].class_names || [];
      configs = curMeta.rows[0].class_configs || {};
    }

    const origIdx = classNames.indexOf(originalClass);
    if (origIdx !== -1) {
      classNames.splice(origIdx, 1, ...sections);
    } else {
      for (const s of sections) {
        if (!classNames.includes(s)) classNames.push(s);
      }
    }

    const origConfig = configs[originalClass] || { isKG: Boolean(isKG), shift: shift || 1 };
    delete configs[originalClass];
    for (const s of sections) {
      configs[s] = {
        ...origConfig,
        ...(shift !== undefined ? { shift } : {}),
        ...(isKG !== undefined ? { isKG: Boolean(isKG) } : {})
      };
    }

    await client.query(`
      INSERT INTO school_schema_points.classes (id, class_count, class_names, class_configs)
      VALUES (1, $1, $2, $3::jsonb)
      ON CONFLICT (id) DO UPDATE 
      SET class_count = EXCLUDED.class_count,
          class_names = EXCLUDED.class_names,
          class_configs = EXCLUDED.class_configs
    `, [classNames.length, classNames, JSON.stringify(configs)]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Class "${originalClass}" successfully split into sections: ${sections.join(', ')}`,
      originalClass,
      sections,
      classNames,
      classConfigs: configs
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error splitting class sections:', err);
    res.status(500).json({ error: 'Failed to split class into sections', details: err.message });
  } finally {
    client.release();
  }
});

// Rename class safely, preserving all data across all tables and schemas
router.post('/rename-class', async (req, res) => {
  const { oldClassName, newClassName } = req.body;

  if (!oldClassName || !newClassName) {
    return res.status(400).json({ error: 'Both oldClassName and newClassName are required' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(newClassName)) {
    return res.status(400).json({ error: 'New class name must only contain letters, numbers, and underscores' });
  }

  if (oldClassName === newClassName) {
    return res.json({ success: true, message: 'Class name unchanged' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Check if new table already exists
    const newExists = await client.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'classes_schema' AND table_name = $1)
    `, [newClassName]);
    if (newExists.rows[0].exists) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Class "${newClassName}" already exists in database` });
    }

    // Comprehensive propagation across all subsystems
    await propagateClassRename(client, oldClassName, newClassName);

    // Update school_schema_points.classes
    const metaResult = await client.query('SELECT class_names, class_configs FROM school_schema_points.classes WHERE id = 1');
    let classNames = [];
    let classConfigs = {};
    if (metaResult.rows.length > 0) {
      classNames = metaResult.rows[0].class_names || [];
      classConfigs = metaResult.rows[0].class_configs || {};
      const idx = classNames.indexOf(oldClassName);
      if (idx !== -1) classNames[idx] = newClassName;
      if (classConfigs[oldClassName]) {
        classConfigs[newClassName] = classConfigs[oldClassName];
        delete classConfigs[oldClassName];
      }
      await client.query(`
        UPDATE school_schema_points.classes 
        SET class_names = $1, class_configs = $2::jsonb 
        WHERE id = 1
      `, [classNames, JSON.stringify(classConfigs)]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Class "${oldClassName}" renamed to "${newClassName}"`, oldClassName, newClassName, classNames, classConfigs });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error renaming class:', err);
    res.status(500).json({ error: 'Failed to rename class', details: err.message });
  } finally {
    client.release();
  }
});

// Delete form structure
router.delete('/delete-form', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    await client.query('DROP SCHEMA IF EXISTS classes_schema CASCADE');
    
    // Also clear the form structure data
    await client.query('DELETE FROM school_schema_points.classes WHERE id = 1');
    
    await client.query('COMMIT');
    res.json({ message: 'Form structure deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting form:', err);
    res.status(500).json({ error: 'Failed to delete form', details: err.message });
  } finally {
    client.release();
  }
});

// Initialize global ID tracker (can be called separately to fix the missing table issue)
router.post('/init-global-tracker', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Ensure schema exists
    await client.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
    
    // Create global ID tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS school_schema_points.global_id_tracker (
        id SERIAL PRIMARY KEY,
        last_school_id INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Initialize if empty
    const trackerCheck = await client.query('SELECT COUNT(*) FROM school_schema_points.global_id_tracker');
    if (parseInt(trackerCheck.rows[0].count) === 0) {
      await client.query('INSERT INTO school_schema_points.global_id_tracker (last_school_id) VALUES (0)');
    }
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Global ID tracker initialized successfully',
      details: 'The global_id_tracker table has been created and initialized'
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing global tracker:', err);
    res.status(500).json({ error: 'Failed to initialize global tracker', details: err.message });
  } finally {
    client.release();
  }
});

// Add student - UPDATED WITH AUTO-TABLE CREATION AND GLOBAL ID LOGIC
router.post('/add-student', upload.any(), async (req, res) => {
  // Restore branch context if lost across multer
  const { getBranchCode, setBranchCode } = require('../config/db');
  const headerCode = req.headers['x-branch-code'];
  if (headerCode && !getBranchCode()) {
    setBranchCode(headerCode);
  }
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const formData = req.body;
    const files = req.files || [];
    const className = formData.class;
    
    // DEBUG: log what the frontend actually sent for the image
    console.log('=== ADD-STUDENT DEBUG ===');
    console.log('files received:', files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, filename: f.filename, mimetype: f.mimetype, size: f.size })));
    console.log('body.image_student:', JSON.stringify(formData.image_student));
    console.log('=== END ADD-STUDENT DEBUG ===');
    
    if (!className) {
      throw new Error('Class name is required');
    }

    // Branch code guard — fail if no branch code available for routing
    if (!req.branchCode && !req.headers['x-branch-code']) {
      throw new Error('Branch code is required. Student registration needs a valid branch to save to.');
    }
    
    // Ensure global_id_tracker + global_machine_ids tables exist (auto-create if missing)
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS school_schema_points.global_id_tracker (
          id SERIAL PRIMARY KEY,
          last_school_id INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Initialize if empty
      const trackerCheck = await client.query('SELECT COUNT(*) FROM school_schema_points.global_id_tracker');
      if (parseInt(trackerCheck.rows[0].count) === 0) {
        await client.query('INSERT INTO school_schema_points.global_id_tracker (last_school_id) VALUES (0)');
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS school_schema_points.global_machine_ids (
          smachine_id VARCHAR(50) PRIMARY KEY,
          student_name VARCHAR(255) NOT NULL,
          class_name VARCHAR(100) NOT NULL,
          school_id INTEGER,
          class_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      try {
        await client.query('ALTER TABLE school_schema_points.global_machine_ids ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      } catch (e) { /* column may already exist */ }
    } catch (err) {
      console.error('Error ensuring global_id_tracker exists:', err);
      throw new Error('Failed to initialize global ID tracking system');
    }
    
    // Generate automatic IDs with new logic:
    // school_id: Global sequential counter across ALL classes
    // class_id: Sequential counter within each class
    
    // Step 1: Get and increment global school_id
    const globalIdResult = await client.query(`
      UPDATE school_schema_points.global_id_tracker 
      SET last_school_id = last_school_id + 1, updated_at = CURRENT_TIMESTAMP
      RETURNING last_school_id
    `);
    
    const newSchoolId = globalIdResult.rows[0].last_school_id;
    
    // Step 2: Get the maximum class_id for this specific class
    const classIdResult = await client.query(
      `SELECT COALESCE(MAX(class_id), 0) as max_class_id 
       FROM classes_schema."${className}"`
    );
    
    const newClassId = (classIdResult.rows[0].max_class_id || 0) + 1;
    
    // Generate student credentials
    const studentUsername = `${formData.student_name.toLowerCase().replace(/\s/g, '')}_${Math.floor(Math.random() * 10000)}`;
    const studentPassword = uuidv4().slice(0, 8);
    
    // Check if guardian already exists by phone number across all classes
    let guardianUsername, guardianPassword, guardianName;
    let guardianFound = false;
    
    if (formData.guardian_phone) {
      // Get all available classes
      const availableClasses = (await client.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
        ['classes_schema']
      )).rows.map(row => row.table_name);
      
      // Search for existing guardian in all available classes
      for (const cls of availableClasses) {
        try {
          const existingGuardianQuery = `
            SELECT guardian_username, guardian_password, guardian_name 
            FROM classes_schema."${cls}" 
            WHERE guardian_phone = $1 
            LIMIT 1
          `;
          const existingGuardianResult = await client.query(existingGuardianQuery, [formData.guardian_phone]);
          
          if (existingGuardianResult.rows.length > 0) {
            // Guardian exists - reuse credentials and name
            guardianUsername = existingGuardianResult.rows[0].guardian_username;
            guardianPassword = existingGuardianResult.rows[0].guardian_password;
            guardianName = existingGuardianResult.rows[0].guardian_name;
            guardianFound = true;
            console.log(`Found existing guardian: ${guardianUsername} for phone ${formData.guardian_phone}`);
            break;
          }
        } catch (err) {
          // Skip if table doesn't have guardian columns
          continue;
        }
      }
    }
    
    if (!guardianFound) {
      // New guardian - create credentials
      guardianUsername = formData.guardian_username || `${formData.guardian_name.toLowerCase().replace(/\s/g, '')}_${Math.floor(Math.random() * 10000)}`;
      guardianPassword = formData.guardian_password || uuidv4().slice(0, 8);
      guardianName = formData.guardian_name;
      console.log(`Creating new guardian: ${guardianUsername} for phone ${formData.guardian_phone}`);
    }
    
    console.log(`DEBUG: About to get columns for className = "${className}"`);
    console.log(`DEBUG: formData.class = "${formData.class}"`);
    
    // Get columns with their data types
    const columnsResult = await client.query(
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
      ['classes_schema', className]
    );
    
    console.log(`DEBUG: Found ${columnsResult.rows.length} columns for table ${className}`);
    console.log(`DEBUG: Columns: ${columnsResult.rows.map(r => r.column_name).join(', ')}`);
    
    const validColumns = columnsResult.rows.map(row => row.column_name);
    
    const insertData = {
      school_id: newSchoolId,
      class_id: newClassId,
      student_name: formData.student_name,
      age: parseInt(formData.age),
      gender: formData.gender,
      class: className,
      username: studentUsername,
      password: studentPassword,
      guardian_name: formData.guardian_name,
      guardian_phone: formData.guardian_phone,
      guardian_relation: formData.guardian_relation,
      guardian_username: guardianUsername,
      guardian_password: guardianPassword
    };
    
    // V2 Enhancement: Add KG and evening class support
    if (validColumns.includes('is_kg')) {
      insertData.is_kg = formData.is_kg === 'true' || formData.is_kg === true || formData.is_kg === 'on';
    }
    
    if (validColumns.includes('is_evening_class')) {
      insertData.is_evening_class = formData.is_evening_class === 'true' || formData.is_evening_class === true || formData.is_evening_class === 'on';
    }
    
    // V2 Enhancement: Set student_type based on KG and evening class flags
    if (validColumns.includes('student_type')) {
      const isKG = insertData.is_kg || false;
      const isEvening = insertData.is_evening_class || false;
      
      if (isKG && isEvening) {
        insertData.student_type = 'kg_evening';
      } else if (isKG) {
        insertData.student_type = 'kg';
      } else if (isEvening) {
        insertData.student_type = 'evening';
      } else {
        insertData.student_type = 'regular';
      }
    }
    
    // Validate smachine_id uniqueness across ALL classes if provided
    if (formData.smachine_id) {
      // Check global tracker table first (most reliable) - skip gracefully if table missing
      let globalDuplicate = null;
      try {
        const globalCheck = await client.query(
          'SELECT student_name, class_name FROM school_schema_points.global_machine_ids WHERE smachine_id = $1',
          [formData.smachine_id]
        );
        if (globalCheck.rows.length > 0) {
          globalDuplicate = globalCheck.rows[0];
        }
      } catch (e) {
        if (e.code !== '42P01') {
          console.warn('Global machine ID check failed (continuing with class checks):', e.message);
        }
      }
      
      if (globalDuplicate) {
        throw new Error(
          `Machine ID ${formData.smachine_id} already added. This ID is used by student "${globalDuplicate.student_name}" in ${globalDuplicate.class_name}.`
        );
      }
      
      // Fallback: Check all class tables (in case tracker table doesn't exist yet)
      const allClasses = (await client.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
        ['classes_schema']
      )).rows.map(row => row.table_name);
      
      for (const cls of allClasses) {
        const existingMachineId = await client.query(
          `SELECT student_name, class FROM classes_schema."${cls}" WHERE smachine_id = $1`,
          [formData.smachine_id]
        );
        
        if (existingMachineId.rows.length > 0) {
          throw new Error(
            `Machine ID ${formData.smachine_id} already added. This ID is used by student "${existingMachineId.rows[0].student_name}" in ${existingMachineId.rows[0].class}.`
          );
        }
      }
      
      insertData.smachine_id = formData.smachine_id;
    }
    
    // Handle student image
    const imageFile = files.find(file => file.fieldname === 'image_student');
    if (imageFile) {
      insertData.image_student = `/Uploads/${imageFile.filename}`;
    }
    
    // Process custom fields based on their data types
    Object.keys(formData).forEach(key => {
      if (validColumns.includes(key) && !insertData[key]) {
        const col = columnsResult.rows.find(col => col.column_name === key);
        if (!col) return;
        
        const value = formData[key];
        
        switch (col.data_type) {
          case 'integer':
            insertData[key] = value ? parseInt(value) : null;
            break;
          case 'boolean':
            insertData[key] = value === 'true' || value === true || value === 'on';
            break;
          case 'text':
            // Handle textarea and multi-select fields
            insertData[key] = value || null;
            break;
          case 'date':
            insertData[key] = value || null;
            break;
          default:
            insertData[key] = value || null;
        }
      }
    });
    
    // Handle file uploads for custom upload fields
    files.forEach(file => {
      if (file.fieldname !== 'image_student' && validColumns.includes(file.fieldname)) {
        insertData[file.fieldname] = `/Uploads/${file.filename}`;
      }
    });
    
    const columns = Object.keys(insertData).filter(key => validColumns.includes(key));
    const values = columns.map(key => insertData[key]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    console.log(`DEBUG: className = "${className}"`);
    console.log(`DEBUG: columns = [${columns.join(', ')}]`);
    console.log(`DEBUG: placeholders = ${placeholders}`);
    
    const insertQuery = `INSERT INTO classes_schema."${className}" (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    console.log(`DEBUG: Full INSERT query = ${insertQuery}`);
    const result = await client.query(insertQuery, values);
    
    // Verify the student was actually saved to the database
    const verifyResult = await client.query(
      `SELECT id FROM classes_schema."${className}" WHERE student_name = $1 AND guardian_phone = $2`,
      [formData.student_name, formData.guardian_phone]
    );
    
    if (verifyResult.rows.length === 0) {
      throw new Error('Student registration failed - record not saved to database. Please try again.');
    }
    
    console.log(`✅ Verified: Student saved with ID ${verifyResult.rows[0].id}`);
    
    // Add to global machine ID tracker if smachine_id was provided
    if (formData.smachine_id) {
      // Use a SAVEPOINT so a tracker failure can NEVER abort/silently roll back the whole registration
      try {
        await client.query('SAVEPOINT machine_id_tracker');
        await client.query(`
          INSERT INTO school_schema_points.global_machine_ids 
          (smachine_id, student_name, class_name, school_id, class_id)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (smachine_id) DO UPDATE 
          SET student_name = EXCLUDED.student_name,
              class_name = EXCLUDED.class_name,
              school_id = EXCLUDED.school_id,
              class_id = EXCLUDED.class_id,
              updated_at = CURRENT_TIMESTAMP
        `, [formData.smachine_id, formData.student_name, className, newSchoolId, newClassId]);
        await client.query('RELEASE SAVEPOINT machine_id_tracker');
      } catch (err) {
        // Tracker table might not exist yet, that's okay — roll back only the tracker insert
        try { await client.query('ROLLBACK TO SAVEPOINT machine_id_tracker'); } catch (e) { /* ignore */ }
        console.log('Note: Global machine ID tracker not available:', err.message);
      }
    }
    
    await client.query('COMMIT');
    
    // ---- Auto-generate monthly invoices for new student ----
    try {
      const { getBranchPrisma } = require('../services/BranchPrismaService');
      const prisma = getBranchPrisma();
      
      // Build student UUID: 00000000-0000-0000-{schoolId}-{classId}
      const schoolIdPadded = String(newSchoolId).padStart(4, '0');
      const classIdPadded = String(newClassId).padStart(12, '0');
      const studentUuid = `00000000-0000-0000-${schoolIdPadded}-${classIdPadded}`;
      
      // Find active fee structures for this class
      const feeStructures = await prisma.feeStructure.findMany({
        where: { gradeLevel: className, isActive: true },
        include: { items: true }
      });
      
      if (feeStructures.length === 0) {
        console.warn(`⚠️ No active fee structure found for class "${className}" — no invoices generated. Check Payment Settings gradeLevel matches class name exactly.`);
      }
      
      if (feeStructures.length > 0) {
        console.log(`📋 Found ${feeStructures.length} fee structure(s) for class "${className}" — generating invoices for new student...`);
        
        const ethiopianMonthNames = [
          'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
          'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
        ];
        
        for (const feeStructure of feeStructures) {
          // Parse months data from description
          let selectedMonths = [];
          let oldRegistrationFee = 0;
          let newRegistrationFee = 0;
          try {
            let desc = feeStructure.description || '{}';
            desc = desc.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            const monthsData = JSON.parse(desc);
            selectedMonths = monthsData.months || [];
            oldRegistrationFee = parseFloat(monthsData.oldRegistrationFee) || 0;
            newRegistrationFee = parseFloat(monthsData.newRegistrationFee) || parseFloat(monthsData.registrationFee) || 0;
          } catch (e) {
            console.warn(`⚠️ Could not parse months data for fee structure ${feeStructure.id}:`, e.message);
          }
          
          if (selectedMonths.length === 0) {
            console.log(`⏭️ Fee structure ${feeStructure.id} has no months configured — skipping`);
            continue;
          }
          
          selectedMonths.sort((a, b) => a - b);
          
          // Use the Ethiopian calendar utility for ACCURATE dates
          // (handles leap years, Pagume days, and month boundaries correctly)
          const { toEthiopian, toGregorian } = require('../utils/ethiopianCalendar');
          
          const today = new Date();
          const ethNow = toEthiopian(today);
          const ethiopianYear = ethNow.year;
          
          // Generate invoices for ALL months configured in payment settings
          console.log(`📅 Generating invoices for ALL configured months: ${selectedMonths.join(', ')}`);
          
          // Get monthly amount from first fee structure item
          const monthlyAmount = feeStructure.items.length > 0 ? parseFloat(feeStructure.items[0].amount) : 0;
          if (monthlyAmount <= 0) continue;
          
          const academicYearId = feeStructure.academicYearId || '00000000-0000-0000-0000-000000000001';
          const campusId = feeStructure.campusId || '00000000-0000-0000-0000-000000000001';
          const accountId = feeStructure.items[0]?.accountId || '00000000-0000-0000-0000-000000000001';
          
          // Pagume (month 13) has 5 days in a normal year, 6 in a leap year
          const gregYear = ethiopianYear + 7;
          const pagumeDays = ((gregYear + 1) % 4 === 0 && ((gregYear + 1) % 100 !== 0 || (gregYear + 1) % 400 === 0)) ? 6 : 5;
          
          for (let monthIndex = 0; monthIndex < selectedMonths.length; monthIndex++) {
            const targetMonth = selectedMonths[monthIndex];
            const isFirstMonth = monthIndex === 0;
            const monthName = ethiopianMonthNames[targetMonth - 1] || `Month ${targetMonth}`;

            // DUPLICATE GUARD: never create a second invoice for the same student + month
            const existingInvoices = await prisma.invoice.findMany({
              where: { studentId: studentUuid },
              select: { metadata: true }
            });
            const alreadyHasMonth = existingInvoices.some(inv => inv.metadata && inv.metadata.monthNumber === targetMonth);
            if (alreadyHasMonth) {
              console.log(`⏭️ Invoice for month ${targetMonth} already exists for ${studentUuid} — skipping (duplicate guard)`);
              continue;
            }
            
            // FIX: Due date = LAST day of the target Ethiopian month (accurate).
            // Months 1-12 have 30 days; Pagume (13) has 5-6 days.
            const lastDayOfMonth = targetMonth === 13 ? pagumeDays : 30;
            let dueDate = toGregorian(ethiopianYear, targetMonth, lastDayOfMonth);
            // Normalize to NOON local time so the date displays correctly in any timezone
            dueDate.setHours(12, 0, 0, 0);
            if (dueDate < today) {
              dueDate = new Date(today);
              dueDate.setHours(12, 0, 0, 0);
              dueDate.setDate(dueDate.getDate() + 10);
            }
            
            // Calculate amount with registration fee for first month only
            // Fee type: OLD students pay the old registration fee, NEW students pay the new one
            const studentFeeType = (formData.old_or_new && String(formData.old_or_new).toLowerCase() === 'old') ? 'old' : 'new';
            const chosenRegFee = (studentFeeType === 'old' && oldRegistrationFee > 0)
              ? oldRegistrationFee
              : newRegistrationFee;
            const registrationFee = isFirstMonth ? chosenRegFee : 0;
            const invoiceAmount = monthlyAmount + registrationFee;
            
            // Build invoice items
            const invoiceItems = [
              {
                description: `${monthName} Monthly Fee (Month ${monthIndex + 1} of ${selectedMonths.length})`,
                feeCategory: 'TUITION',
                amount: monthlyAmount,
                accountId: accountId
              }
            ];
            
            if (isFirstMonth && registrationFee > 0) {
              invoiceItems.push({
                description: `Registration Fee (${studentFeeType === 'old' ? 'Old' : 'New'} Student)`,
                feeCategory: 'TUITION',
                amount: registrationFee,
                accountId: accountId
              });
            }
            
            // Create the invoice
            const invoiceNumber = `INV-${Date.now()}-${studentUuid.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}-M${monthIndex + 1}`;
            
            // Generate unique 10-digit invoice reference code
            const { generateUniqueInvoiceRefCode } = require('../utils/invoiceRefCode');
            const invoiceRefCode = await generateUniqueInvoiceRefCode(async (code) => {
              const existing = await prisma.invoice.findUnique({ where: { invoiceRefCode: code } });
              return !!existing;
            });

            await prisma.invoice.create({
              data: {
                invoiceNumber,
                invoiceRefCode,
                studentId: studentUuid,
                academicYearId,
                feeStructureId: feeStructure.id,
                issueDate: new Date(),
                dueDate,
                totalAmount: invoiceAmount,
                discountAmount: 0,
                lateFeeAmount: 0,
                netAmount: invoiceAmount,
                paidAmount: 0,
                status: 'ISSUED',
                campusId,
                createdBy: '00000000-0000-0000-0000-000000000001',
                  metadata: {
                    month: monthName,
                    monthNumber: targetMonth,
                    monthIndex: monthIndex + 1,
                    totalMonths: selectedMonths.length,
                    oldRegistrationFee: isFirstMonth ? oldRegistrationFee : 0,
                    newRegistrationFee: isFirstMonth ? newRegistrationFee : 0,
                    studentType: isFirstMonth ? studentFeeType : null,
                    isAutoGenerated: true,
                    registrationFee
                  },
                items: { create: invoiceItems }
              }
            });
          }
          
          console.log(`✅ Generated ${selectedMonths.length} invoices for new student in "${className}" (fee structure: ${feeStructure.name})`);
        }
      }
      
      // Do NOT disconnect shared branch Prisma client
    } catch (autoInvoiceErr) {
      console.error('⚠️ Auto-invoice generation failed (non-blocking):', autoInvoiceErr.message);
      console.error(autoInvoiceErr.stack);
    }
    
    // ---- Send welcome SMS (branch-specific templates) ----
    if (formData.guardian_phone && studentUsername) {
      try {
        const { sendSMS } = require('../services/SMSService');
        const { getRenderedTemplate } = require('./smsRoutes');
        const vars = {
          student_name: formData.student_name || '',
          student_username: studentUsername || '',
          student_password: studentPassword || '',
          guardian_name: guardianName || 'Guardian',
          guardian_username: guardianUsername || '',
          guardian_password: guardianPassword || '',
          school_name: 'SCHOOL ACADEMY',
          guardian_app_link: 'https://iqra.skoolific.com/app/guardian-login',
          branch_code: req.branchCode || ''
        };
        const guardianMsg = await getRenderedTemplate('guardian_welcome', vars);
        if (guardianUsername && guardianMsg) {
          sendSMS(formData.guardian_phone, guardianMsg, null, {
            templateKey: 'guardian_welcome',
            recipientName: guardianName || 'Guardian'
          }).catch(e => console.warn('Guardian SMS failed:', e.message));
        }
        // NOTE: student_welcome SMS is intentionally DISABLED (only guardian SMS is sent).
      } catch (smsErr) {
        console.warn('Could not send welcome SMS:', smsErr.message);
      }
    }

    res.json({
      message: 'Student added successfully',
      student_username: studentUsername,
      student_password: studentPassword,
      guardian_username: guardianUsername,
      guardian_password: guardianPassword,
      generated_ids: {
        school_id: newSchoolId,
        class_id: newClassId
      },
      id_explanation: {
        school_id: 'Unique across all students in all classes',
        class_id: `Unique within ${className} class only`
      }
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting student:', err);
    
    if (err.message.includes('not saved to database')) {
      return res.status(500).json({ 
        error: 'Registration failed',
        message: err.message
      });
    }
    
    if (err.code === '23505') {
      // Unique constraint violation
      if (err.constraint && err.constraint.includes('guardian_username')) {
        return res.status(400).json({ 
          error: 'Duplicate guardian',
          message: 'A guardian with this username already exists. Please use a different guardian name or phone number.'
        });
      }
      if (err.constraint && err.constraint.includes('smachine_id')) {
        return res.status(400).json({ 
          error: 'Duplicate machine ID',
          message: 'This machine ID is already registered to another student.'
        });
      }
      return res.status(400).json({ 
        error: 'Duplicate entry',
        message: 'A student with this information already exists.'
      });
    }
    
    if (err.code === '42P01') {
      // Table doesn't exist
      return res.status(400).json({ 
        error: 'Class not found',
        message: `The class "${err.detail || 'unknown'}" does not exist. Please create the class first.`
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An unexpected error occurred. Please try again.',
      details: err.message 
    });
  } finally {
    client.release();
  }
});

// Get global ID statistics
router.get('/id-statistics', async (req, res) => {
  try {
    // Ensure global_id_tracker table exists first
    try {
      await db.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
      await db.query(`
        CREATE TABLE IF NOT EXISTS school_schema_points.global_id_tracker (
          id SERIAL PRIMARY KEY,
          last_school_id INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (err) {
      console.error('Error ensuring global_id_tracker exists:', err);
    }
    
    // Get current global school_id
    const globalIdResult = await db.query('SELECT last_school_id FROM school_schema_points.global_id_tracker LIMIT 1');
    
    // Get class-wise student counts
    const tables = (await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['classes_schema'])).rows.map(row => row.table_name);
    
    const classStats = [];
    for (const table of tables) {
      // Check if is_active column exists
      const columnCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'classes_schema' 
          AND table_name = $1 
          AND column_name = 'is_active'
      `, [table]);
      
      const hasIsActive = columnCheck.rows.length > 0;
      const whereClause = hasIsActive ? 'WHERE is_active = TRUE OR is_active IS NULL' : '';
      
      const countResult = await db.query(`SELECT COUNT(*) as student_count FROM classes_schema."${table}" ${whereClause}`);
      const maxClassIdResult = await db.query(`SELECT COALESCE(MAX(class_id), 0) as max_class_id FROM classes_schema."${table}"`);
      
      classStats.push({
        class_name: table,
        student_count: parseInt(countResult.rows[0].student_count),
        max_class_id: parseInt(maxClassIdResult.rows[0].max_class_id)
      });
    }
    
    res.json({
      global_school_id: globalIdResult.rows[0]?.last_school_id || 0,
      class_statistics: classStats
    });
    
  } catch (err) {
    console.error('Error fetching ID statistics:', err);
    res.status(500).json({ error: 'Failed to fetch ID statistics', details: err.message });
  }
});

// Reset global ID counter (admin function)
router.post('/reset-global-ids', async (req, res) => {
  const { confirmation } = req.body;
  
  if (confirmation !== 'RESET_ALL_IDS') {
    return res.status(400).json({ error: 'Confirmation code required to reset global IDs' });
  }
  
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Ensure global_id_tracker exists
    await client.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
    await client.query(`
      CREATE TABLE IF NOT EXISTS school_schema_points.global_id_tracker (
        id SERIAL PRIMARY KEY,
        last_school_id INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Reset global ID tracker
    await client.query('UPDATE school_schema_points.global_id_tracker SET last_school_id = 0, updated_at = CURRENT_TIMESTAMP');
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Global school ID counter reset to 0',
      note: 'Class IDs remain unchanged in individual class tables'
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error resetting global IDs:', err);
    res.status(500).json({ error: 'Failed to reset global IDs', details: err.message });
  } finally {
    client.release();
  }
});

// Student and Guardian Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const tables = (await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['classes_schema'])).rows.map(row => row.table_name);
    
    let user = null;
    let role = null;
    
    // Search for student
    for (const table of tables) {
      // Check if is_active column exists
      const columnCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'classes_schema' 
          AND table_name = $1 
          AND column_name = 'is_active'
      `, [table]);
      
      const hasIsActive = columnCheck.rows.length > 0;
      const whereClause = hasIsActive ? 'AND (is_active = TRUE OR is_active IS NULL)' : '';
      
      const result = await db.query(
        `SELECT * FROM classes_schema."${table}" WHERE username = $1 AND password = $2 ${whereClause}`,
        [username, password]
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'student';
        break;
      }
    }
    
    // If not found as student, search for guardian
    if (!user) {
      for (const table of tables) {
        // Check if is_active column exists
        const columnCheck = await db.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'classes_schema' 
            AND table_name = $1 
            AND column_name = 'is_active'
        `, [table]);
        
        const hasIsActive = columnCheck.rows.length > 0;
        const whereClause = hasIsActive ? 'AND (is_active = TRUE OR is_active IS NULL)' : '';
        
        const result = await db.query(
          `SELECT * FROM classes_schema."${table}" WHERE guardian_username = $1 AND guardian_password = $2 ${whereClause}`,
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
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    res.json({
      role,
      student: user
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get student profile
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const tables = (await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['classes_schema'])).rows.map(row => row.table_name);
    
    let student = null;
    
    for (const table of tables) {
      // Check if is_active column exists
      const columnCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'classes_schema' 
          AND table_name = $1 
          AND column_name = 'is_active'
      `, [table]);
      
      const hasIsActive = columnCheck.rows.length > 0;
      const whereClause = hasIsActive ? 'AND (is_active = TRUE OR is_active IS NULL)' : '';
      
      const result = await db.query(
        `SELECT * FROM classes_schema."${table}" WHERE username = $1 ${whereClause}`,
        [username]
      );
      
      if (result.rows.length > 0) {
        student = result.rows[0];
        break;
      }
    }
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      role: 'student',
      student
    });
    
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get guardian profile with all their wards
router.get('/guardian-profile/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const tables = (await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['classes_schema'])).rows.map(row => row.table_name);
    
    let wards = [];
    
    for (const table of tables) {
      // Check if is_active column exists
      const columnCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'classes_schema' 
          AND table_name = $1 
          AND column_name = 'is_active'
      `, [table]);
      
      const hasIsActive = columnCheck.rows.length > 0;
      const whereClause = hasIsActive ? 'AND (is_active = TRUE OR is_active IS NULL)' : '';
      
      const result = await db.query(
        `SELECT * FROM classes_schema."${table}" WHERE guardian_username = $1 ${whereClause}`,
        [username]
      );
      
      if (result.rows.length > 0) {
        wards = wards.concat(result.rows);
      }
    }
    
    if (wards.length === 0) {
      return res.status(404).json({ error: 'Guardian not found' });
    }
    
    res.json({
      role: 'guardian',
      student: wards
    });
    
  } catch (err) {
    console.error('Guardian profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch guardian profile' });
  }
});

// Bulk import students from Excel
router.post('/bulk-import', async (req, res) => {
  const { className, students } = req.body;
  
  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Students array is required' });
  }
  
  const client = await db.connect();
  
  try {
    // Ensure global_id_tracker table exists
    
    // Ensure global_id_tracker table exists
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS school_schema_points');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS school_schema_points.global_id_tracker (
          id SERIAL PRIMARY KEY,
          last_school_id INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      const trackerCheck = await client.query('SELECT COUNT(*) FROM school_schema_points.global_id_tracker');
      if (parseInt(trackerCheck.rows[0].count) === 0) {
        await client.query('INSERT INTO school_schema_points.global_id_tracker (last_school_id) VALUES (0)');
      }
    } catch (err) {
      console.error('Error ensuring global_id_tracker exists:', err);
      throw new Error('Failed to initialize global ID tracking system');
    }
    
    // Get all available classes
    const classesResult = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
      ['classes_schema']
    );
    const availableClasses = classesResult.rows.map(row => row.table_name);
    
    // Group students by their class from Excel
    const studentsByClass = {};
    students.forEach((student, index) => {
      const targetClass = student.class || className; // Use class from Excel, fallback to selected class
      if (!studentsByClass[targetClass]) {
        studentsByClass[targetClass] = [];
      }
      studentsByClass[targetClass].push({ ...student, originalIndex: index });
    });
    
    // Validate all classes exist
    const missingClasses = [];
    for (const cls of Object.keys(studentsByClass)) {
      if (!availableClasses.includes(cls)) {
        missingClasses.push(cls);
      }
    }
    
    if (missingClasses.length > 0) {
      client.release();
      return res.status(400).json({ 
        error: `The following classes do not exist: ${missingClasses.join(', ')}. Please create them first at the "Create Form Structure" page.`,
        missingClasses,
        availableClasses,
        hint: 'Go to Tasks > Create Form Structure to add these classes before importing students.'
      });
    }
    
    // Get class_id counters for each class
    const classIdCounters = {};
    for (const cls of Object.keys(studentsByClass)) {
      const classIdResult = await client.query(
        `SELECT COALESCE(MAX(class_id), 0) as max_class_id FROM classes_schema."${cls}"`
      );
      classIdCounters[cls] = classIdResult.rows[0].max_class_id || 0;
    }
    
    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [],
      classSummary: {}
    };
    
    // Process each class group
    for (const [targetClass, classStudents] of Object.entries(studentsByClass)) {
      // Get columns with their data types for this class
      const columnsResult = await client.query(
        'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
        ['classes_schema', targetClass]
      );
      
      const validColumns = columnsResult.rows.map(row => row.column_name);
      const columnTypes = {};
      columnsResult.rows.forEach(row => {
        columnTypes[row.column_name] = row.data_type;
      });
      
      let currentClassId = classIdCounters[targetClass];
      
      // Process each student in this class
      for (const studentData of classStudents) {
        const i = studentData.originalIndex;
        
        try {
          // Validate required fields
          if (!studentData.student_name || !studentData.age || !studentData.gender) {
            results.failedCount++;
            results.errors.push({
              row: i + 2,
              class: targetClass,
              error: 'Missing required fields: student_name, age, or gender'
            });
            continue;
          }
          
          if (!studentData.guardian_name || !studentData.guardian_phone || !studentData.guardian_relation) {
            results.failedCount++;
            results.errors.push({
              row: i + 2,
              class: targetClass,
              error: 'Missing required guardian fields: guardian_name, guardian_phone, or guardian_relation'
            });
            continue;
          }
          
          // Get and increment global school_id
          const globalIdResult = await client.query(`
            UPDATE school_schema_points.global_id_tracker 
            SET last_school_id = last_school_id + 1, updated_at = CURRENT_TIMESTAMP
            RETURNING last_school_id
          `);
          const newSchoolId = globalIdResult.rows[0].last_school_id;
          
          // Increment class_id for this specific class
          currentClassId++;
          
          // Generate student credentials
          const studentUsername = `${studentData.student_name.toLowerCase().replace(/\s/g, '')}_${Math.floor(Math.random() * 10000)}`;
          const studentPassword = uuidv4().slice(0, 8);
          
          // Check if guardian already exists by phone number across all classes
          let guardianUsername, guardianPassword, guardianName;
          let guardianFound = false;
          
          // Search for existing guardian in all available classes
          for (const cls of availableClasses) {
            try {
              const existingGuardianQuery = `
                SELECT guardian_username, guardian_password, guardian_name 
                FROM classes_schema."${cls}" 
                WHERE guardian_phone = $1 
                LIMIT 1
              `;
              const existingGuardianResult = await client.query(existingGuardianQuery, [studentData.guardian_phone]);
              
              if (existingGuardianResult.rows.length > 0) {
                // Guardian exists - reuse credentials and name
                guardianUsername = existingGuardianResult.rows[0].guardian_username;
                guardianPassword = existingGuardianResult.rows[0].guardian_password;
                guardianName = existingGuardianResult.rows[0].guardian_name;
                guardianFound = true;
                break;
              }
            } catch (err) {
              // Skip if table doesn't have guardian columns
              continue;
            }
          }
          
          if (!guardianFound) {
            // New guardian - create credentials
            guardianUsername = `${studentData.guardian_name.toLowerCase().replace(/\s/g, '')}_${Math.floor(Math.random() * 10000)}`;
            guardianPassword = uuidv4().slice(0, 8);
            guardianName = studentData.guardian_name;
          }
          
          // Build insert data
          const insertData = {
            school_id: newSchoolId,
            class_id: currentClassId,
            student_name: studentData.student_name,
            age: parseInt(studentData.age),
            gender: studentData.gender,
            class: targetClass,
            username: studentUsername,
            password: studentPassword,
            guardian_name: guardianName,
            guardian_phone: studentData.guardian_phone,
            guardian_relation: studentData.guardian_relation,
            guardian_username: guardianUsername,
            guardian_password: guardianPassword
          };
          
          // Validate and add smachine_id if provided
          if (studentData.smachine_id) {
            // Check global tracker table first (most reliable)
            try {
              const globalCheck = await client.query(
                'SELECT student_name, class_name FROM school_schema_points.global_machine_ids WHERE smachine_id = $1',
                [studentData.smachine_id]
              );
              
              if (globalCheck.rows.length > 0) {
                results.failedCount++;
                results.errors.push({
                  row: i + 2,
                  class: targetClass,
                  student: studentData.student_name || 'Unknown',
                  error: `Machine ID ${studentData.smachine_id} already added. This ID is used by student "${globalCheck.rows[0].student_name}" in ${globalCheck.rows[0].class_name}.`
                });
                continue; // Skip this student
              }
            } catch (err) {
              // Tracker table might not exist, fall back to checking all classes
            }
            
            // Fallback: Check if smachine_id already exists in ANY class
            let machineIdExists = false;
            let existingStudent = null;
            
            for (const cls of availableClasses) {
              try {
                const existingMachineId = await client.query(
                  `SELECT student_name, class FROM classes_schema."${cls}" WHERE smachine_id = $1`,
                  [studentData.smachine_id]
                );
                
                if (existingMachineId.rows.length > 0) {
                  machineIdExists = true;
                  existingStudent = existingMachineId.rows[0];
                  break;
                }
              } catch (err) {
                // Skip if table doesn't have smachine_id column
                continue;
              }
            }
            
            if (machineIdExists) {
              results.failedCount++;
              results.errors.push({
                row: i + 2,
                class: targetClass,
                student: studentData.student_name || 'Unknown',
                error: `Machine ID ${studentData.smachine_id} already added. This ID is used by student "${existingStudent.student_name}" in ${existingStudent.class}.`
              });
              continue; // Skip this student
            }
            
            insertData.smachine_id = studentData.smachine_id;
          }
          
          // Process custom fields based on their data types
          Object.keys(studentData).forEach(key => {
            if (validColumns.includes(key) && !insertData[key]) {
              const value = studentData[key];
              const dataType = columnTypes[key];
              
              switch (dataType) {
                case 'integer':
                  insertData[key] = value ? parseInt(value) : null;
                  break;
                case 'boolean':
                  insertData[key] = value === 'true' || value === true || value === 'TRUE' || value === 1;
                  break;
                case 'date':
                  insertData[key] = value || null;
                  break;
                default:
                  insertData[key] = value || null;
              }
            }
          });
          
          // Insert student
          const columns = Object.keys(insertData).filter(key => validColumns.includes(key));
          const values = columns.map(key => insertData[key]);
          const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
          
          const insertQuery = `INSERT INTO classes_schema."${targetClass}" (${columns.join(', ')}) VALUES (${placeholders})`;
          await client.query(insertQuery, values);
          
          // Add to global machine ID tracker if smachine_id was provided
          if (studentData.smachine_id) {
            try {
              await client.query(`
                INSERT INTO school_schema_points.global_machine_ids 
                (smachine_id, student_name, class_name, school_id, class_id)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (smachine_id) DO UPDATE 
                SET student_name = EXCLUDED.student_name,
                    class_name = EXCLUDED.class_name,
                    school_id = EXCLUDED.school_id,
                    class_id = EXCLUDED.class_id,
                    updated_at = CURRENT_TIMESTAMP
              `, [studentData.smachine_id, studentData.student_name, targetClass, newSchoolId, currentClassId]);
            } catch (err) {
              // Tracker table might not exist yet, that's okay
              console.log('Note: Global machine ID tracker not available:', err.message);
            }
          }
          
          results.successCount++;
          
          // Track class summary
          if (!results.classSummary[targetClass]) {
            results.classSummary[targetClass] = 0;
          }
          results.classSummary[targetClass]++;
          
        } catch (err) {
          console.error(`Error inserting student at row ${i + 2}:`, err);
          results.failedCount++;
          results.errors.push({
            row: i + 2,
            class: targetClass,
            student: studentData.student_name || 'Unknown',
            error: err.message
          });
        }
      }
      
      // Update the counter for this class
      classIdCounters[targetClass] = currentClassId;
    }
    
    res.json({
      message: `Bulk import completed`,
      successCount: results.successCount,
      failedCount: results.failedCount,
      classSummary: results.classSummary,
      errors: results.errors.length > 0 ? results.errors : undefined
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in bulk import:', err);
    res.status(500).json({ error: 'Failed to import students', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
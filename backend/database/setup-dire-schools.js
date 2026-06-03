const { Client, Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MASTER_DB = 'skoolific_master';
const MAIN_DB = process.env.DB_NAME || 'skoolific';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = String(process.env.DB_PASSWORD || '12345678');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function queryAll(client, sql, params = []) {
  try {
    const result = await client.query(sql, params);
    return result;
  } catch (err) {
    console.error(`   SQL Error: ${err.message}`);
    throw err;
  }
}

async function setupDireSchools() {
  console.log('\n' + '='.repeat(60));
  console.log('  🏫 DIRE SCHOOLS SETUP');
  console.log('='.repeat(60) + '\n');

  // ============================================================
  // STEP 1: Connect to PostgreSQL
  // ============================================================
  const adminClient = new Client({
    host: DB_HOST, port: DB_PORT, database: 'postgres',
    user: DB_USER, password: DB_PASSWORD
  });
  await adminClient.connect();
  console.log('✅ Connected to PostgreSQL\n');

  // ============================================================
  // STEP 2: Add branch entries to branch_config in main DB
  // ============================================================
  console.log('1. Adding branches to branch_config...');
  const mainPool = new Pool({
    host: DB_HOST, port: DB_PORT, database: MAIN_DB,
    user: DB_USER, password: DB_PASSWORD, max: 5
  });

  // Ensure branch_config table exists in main DB
  await mainPool.query(`
    CREATE TABLE IF NOT EXISTS branch_config (
      id SERIAL PRIMARY KEY,
      branch_name VARCHAR(255) NOT NULL,
      branch_code VARCHAR(10) UNIQUE NOT NULL,
      database_name VARCHAR(100) UNIQUE NOT NULL,
      database_host VARCHAR(255) DEFAULT 'localhost',
      database_port INTEGER DEFAULT 5432,
      database_user VARCHAR(100),
      database_password VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      school_address TEXT,
      school_phone VARCHAR(50),
      school_email VARCHAR(100),
      admin_name VARCHAR(255),
      admin_email VARCHAR(255),
      admin_phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('   ✓ branch_config table ready');

  const branches = [
    {
      name: 'Dire Branch 1',
      code: 'DB1',
      dbName: 'direb1_db',
      address: 'Dire Dawa, Ethiopia - Branch 1',
      phone: '+251-11-111-1111',
      email: 'branch1@dire.school',
      adminName: 'Branch 1 Admin',
      adminEmail: 'admin1@dire.school'
    },
    {
      name: 'Dire Branch 2',
      code: 'DB2',
      dbName: 'direb2_db',
      address: 'Dire Dawa, Ethiopia - Branch 2',
      phone: '+251-11-222-2222',
      email: 'branch2@dire.school',
      adminName: 'Branch 2 Admin',
      adminEmail: 'admin2@dire.school'
    }
  ];

  for (const b of branches) {
    await mainPool.query(`
      INSERT INTO branch_config (branch_name, branch_code, database_name, database_host, database_port, database_user, database_password, is_active, school_address, school_phone, school_email, admin_name, admin_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10, $11, $12)
      ON CONFLICT (branch_code) DO NOTHING
    `, [b.name, b.code, b.dbName, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, b.address, b.phone, b.email, b.adminName, b.adminEmail]);
    console.log(`   ✓ ${b.name} (${b.code}) -> ${b.dbName}`);
  }

  // ============================================================
  // STEP 3: Create databases for each branch
  // ============================================================
  console.log('\n2. Creating branch databases...');
  for (const b of branches) {
    try {
      // Terminate existing connections first
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid()
      `, [b.dbName]);
    } catch (e) { /* ignore */ }

    try {
      await adminClient.query(`CREATE DATABASE ${b.dbName} OWNER ${DB_USER}`);
      console.log(`   ✓ ${b.dbName} created`);
    } catch (err) {
      if (err.code === '42P04') console.log(`   ⚠️  ${b.dbName} already exists`);
      else throw err;
    }
  }

  console.log('\n⏳ Waiting 2s for databases to settle...');
  await sleep(2000);

  // ============================================================
  // STEP 4: Run migrations on each branch database
  // ============================================================
  console.log('\n3. Running migrations on branch databases...');
  const migrationFiles = [
    '002_create_migrations_table.sql',
    '003_create_school_config.sql',
    '004_create_classes_and_shifts.sql',
    '005_create_students_table.sql',
    '006_create_staff_table.sql',
    '007_create_guardians_table.sql',
    '008_create_subjects_table.sql',
    '009_create_attendance_tables.sql',
    '010_create_marks_tables.sql'
  ];

  for (const b of branches) {
    console.log(`   Running migrations on ${b.dbName}...`);
    const branchClient = new Client({
      host: DB_HOST, port: DB_PORT, database: b.dbName,
      user: DB_USER, password: DB_PASSWORD
    });
    await branchClient.connect();

    const migrationsDir = path.join(__dirname, 'migrations');
    const fs = require('fs');

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        console.log(`     ⚠️  ${file} not found, skipping`);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await branchClient.query(sql);
        console.log(`     ✓ ${file}`);
      } catch (err) {
        console.log(`     ⚠️  ${file}: ${err.message}`);
      }
    }

    // Add class_name column to students (needed by CrossBranchAggregationService)
    try {
      await branchClient.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS class_name VARCHAR(100)`);
    } catch (e) { /* ignore if already exists */ }

    await branchClient.end();
    console.log(`   ✅ ${b.dbName} migrations complete\n`);
  }

  // ============================================================
  // STEP 5: Seed data - Branch 1
  // ============================================================
  console.log('4. Seeding data into Dire Branch 1 (DB1)...\n');
  const db1 = new Client({
    host: DB_HOST, port: DB_PORT, database: 'direb1_db',
    user: DB_USER, password: DB_PASSWORD
  });
  await db1.connect();

  // Shifts
  await db1.query(`INSERT INTO shifts (shift_name, start_time, end_time, is_morning) VALUES
    ('Morning Shift', '08:00', '12:30', true),
    ('Afternoon Shift', '13:30', '17:00', false)
  ON CONFLICT DO NOTHING`);

  // Classes
  await db1.query(`INSERT INTO classes (class_name, class_type, shift_id, grade_level, capacity, section) VALUES
    ('Grade 1A', 'regular', 1, 1, 40, 'A'),
    ('Grade 1B', 'regular', 2, 1, 40, 'B'),
    ('Grade 2A', 'regular', 1, 2, 40, 'A')
  ON CONFLICT DO NOTHING`);

  // Students (Ethiopian names) - Branch 1
  await db1.query(`INSERT INTO students (student_id, first_name, middle_name, last_name, class_id, gender, status, academic_year, class_name) VALUES
    ('DB1-STU-001', 'Abebe', 'Kebede', 'Tesfaye', 1, 'Male', 'active', '2025/26', 'Grade 1A'),
    ('DB1-STU-002', 'Almaz', 'Desta', 'Worku', 1, 'Female', 'active', '2025/26', 'Grade 1A'),
    ('DB1-STU-003', 'Biruk', 'Lemma', 'Hailu', 1, 'Male', 'active', '2025/26', 'Grade 1A'),
    ('DB1-STU-004', 'Chaltu', 'Ayana', 'Gudeta', 2, 'Female', 'active', '2025/26', 'Grade 1B'),
    ('DB1-STU-005', 'Dawit', 'Mekonnen', 'Ayele', 2, 'Male', 'active', '2025/26', 'Grade 1B'),
    ('DB1-STU-006', 'Eyerusalem', 'Tadesse', 'Belay', 3, 'Female', 'active', '2025/26', 'Grade 2A'),
    ('DB1-STU-007', 'Fikadu', 'Girma', 'Tsegaye', 3, 'Male', 'active', '2025/26', 'Grade 2A'),
    ('DB1-STU-008', 'Genet', 'Alemu', 'Mengistu', 3, 'Female', 'active', '2025/26', 'Grade 2A'),
    ('DB1-STU-009', 'Haile', 'Belete', 'Wondimu', 1, 'Male', 'inactive', '2025/26', 'Grade 1A'),
    ('DB1-STU-010', 'Iman', 'Usman', 'Hussein', 2, 'Female', 'active', '2025/26', 'Grade 1B')
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ 10 students seeded');

  // Staff - Branch 1
  await db1.query(`INSERT INTO staff (staff_id, first_name, middle_name, last_name, staff_type, email, phone_number, gender, salary, status) VALUES
    ('DB1-STF-001', 'Teshome', 'Dibaba', 'Gutema', 'Teacher', 'teshome@direb1.school', '+251911111111', 'Male', 15000.00, 'active'),
    ('DB1-STF-002', 'Mekdes', 'Assefa', 'Lemma', 'Teacher', 'mekdes@direb1.school', '+251922222222', 'Female', 14000.00, 'active'),
    ('DB1-STF-003', 'Tsegaye', 'Berhanu', 'Seyoum', 'Administrative', 'tsegaye@direb1.school', '+251933333333', 'Male', 18000.00, 'active')
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ 3 staff seeded');

  // Subjects
  await db1.query(`INSERT INTO subjects (subject_code, subject_name, grade_level, is_active) VALUES
    ('MATH1', 'Mathematics', 1, true),
    ('ENG1', 'English', 1, true),
    ('AMH1', 'Amharic', 1, true),
    ('SCI1', 'Science', 1, true)
  ON CONFLICT DO NOTHING`);

  // Attendance records - Branch 1 (this month)
  const today = new Date();
  for (let day = 1; day <= 20; day++) {
    for (let sid = 1; sid <= 10; sid++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const statuses = ['present', 'present', 'present', 'present', 'absent', 'present', 'present', 'late', 'present', 'present'];
      const status = statuses[(sid + day) % statuses.length];
      await db1.query(`INSERT INTO student_attendance (student_id, class_id, attendance_date, status, marked_at)
        VALUES ($1, (SELECT class_id FROM students WHERE id = $1), $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, attendance_date) DO NOTHING`,
        [sid, date.toISOString().split('T')[0], status]);
    }
  }
  console.log('   ✓ Attendance records seeded');

  // Marks - Branch 1
  await db1.query(`INSERT INTO mark_lists (subject_id, class_id, teacher_id, term, academic_year, component_type, total_marks) VALUES
    (1, 1, 1, 1, '2025/26', 'test1', 100),
    (2, 1, 1, 1, '2025/26', 'test1', 100),
    (3, 1, 1, 1, '2025/26', 'test1', 100)
  ON CONFLICT DO NOTHING`);

  await db1.query(`INSERT INTO student_marks (mark_list_id, student_id, marks_obtained, percentage) VALUES
    (1, 1, 85, 85.00), (1, 2, 92, 92.00), (1, 3, 78, 78.00),
    (1, 4, 88, 88.00), (1, 5, 76, 76.00), (1, 6, 95, 95.00),
    (1, 7, 82, 82.00), (1, 8, 90, 90.00), (1, 10, 70, 70.00),
    (2, 1, 90, 90.00), (2, 2, 85, 85.00), (2, 3, 88, 88.00),
    (2, 4, 92, 92.00), (2, 5, 80, 80.00), (2, 6, 96, 96.00),
    (2, 7, 75, 75.00), (2, 8, 88, 88.00), (2, 10, 72, 72.00)
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ Marks seeded');

  // Monthly payments + expenses for finance aggregation
  await db1.query(`CREATE TABLE IF NOT EXISTS monthly_payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    fee_type VARCHAR(50),
    amount_due DECIMAL(12,2),
    amount_paid DECIMAL(12,2),
    payment_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending',
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db1.query(`INSERT INTO monthly_payments (student_id, fee_type, amount_due, amount_paid, payment_date, payment_status, academic_year) VALUES
    (1, 'TUITION', 1000, 1000, '2026-01-15', 'paid', '2025/26'),
    (2, 'TUITION', 1000, 1000, '2026-01-15', 'paid', '2025/26'),
    (3, 'TUITION', 1000, 500, '2026-01-20', 'partial', '2025/26'),
    (4, 'TUITION', 1000, 1000, '2026-01-15', 'paid', '2025/26'),
    (5, 'TUITION', 1000, 0, NULL, 'pending', '2025/26'),
    (6, 'TUITION', 1000, 1000, '2026-01-10', 'paid', '2025/26'),
    (7, 'TUITION', 1000, 1000, '2026-01-12', 'paid', '2025/26'),
    (8, 'TUITION', 1000, 1000, '2026-01-18', 'paid', '2025/26'),
    (1, 'TRANSPORT', 500, 500, '2026-01-15', 'paid', '2025/26'),
    (2, 'TRANSPORT', 500, 500, '2026-01-15', 'paid', '2025/26'),
    (3, 'TRANSPORT', 500, 250, '2026-01-20', 'partial', '2025/26'),
    (4, 'TRANSPORT', 500, 500, '2026-01-15', 'paid', '2025/26')
  ON CONFLICT DO NOTHING`);

  await db1.query(`CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_number VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12,2),
    expense_date DATE,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db1.query(`INSERT INTO expenses (expense_number, category, description, amount, expense_date, status) VALUES
    ('EXP-DB1-001', 'UTILITIES', 'Electricity Bill - Jan', 5000.00, '2026-01-10', 'approved'),
    ('EXP-DB1-002', 'SUPPLIES', 'Stationery', 2000.00, '2026-01-15', 'approved'),
    ('EXP-DB1-003', 'MAINTENANCE', 'Classroom Repair', 8000.00, '2026-01-20', 'approved')
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ Finance data seeded');

  await db1.end();
  console.log('\n   ✅ Dire Branch 1 seeding complete\n');

  // ============================================================
  // STEP 6: Seed data - Branch 2
  // ============================================================
  console.log('5. Seeding data into Dire Branch 2 (DB2)...\n');
  const db2 = new Client({
    host: DB_HOST, port: DB_PORT, database: 'direb2_db',
    user: DB_USER, password: DB_PASSWORD
  });
  await db2.connect();

  // Shifts
  await db2.query(`INSERT INTO shifts (shift_name, start_time, end_time, is_morning) VALUES
    ('Morning Shift', '08:00', '12:30', true),
    ('Afternoon Shift', '13:30', '17:00', false)
  ON CONFLICT DO NOTHING`);

  // Classes
  await db2.query(`INSERT INTO classes (class_name, class_type, shift_id, grade_level, capacity, section) VALUES
    ('Grade 1A', 'regular', 1, 1, 35, 'A'),
    ('Grade 2A', 'regular', 1, 2, 35, 'A'),
    ('Grade 3A', 'regular', 2, 3, 30, 'A')
  ON CONFLICT DO NOTHING`);

  // Different students in Branch 2
  await db2.query(`INSERT INTO students (student_id, first_name, middle_name, last_name, class_id, gender, status, academic_year, class_name) VALUES
    ('DB2-STU-001', 'Kebede', 'Alamirew', 'Sisay', 1, 'Male', 'active', '2025/26', 'Grade 1A'),
    ('DB2-STU-002', 'Lemlem', 'Gebre', 'Haileselassie', 1, 'Female', 'active', '2025/26', 'Grade 1A'),
    ('DB2-STU-003', 'Mulugeta', 'Tadesse', 'Wolde', 2, 'Male', 'active', '2025/26', 'Grade 2A'),
    ('DB2-STU-004', 'Nigist', 'Berhe', 'Asfaw', 2, 'Female', 'active', '2025/26', 'Grade 2A'),
    ('DB2-STU-005', 'Obsa', 'Gammachiis', 'Fayyisaa', 3, 'Male', 'active', '2025/26', 'Grade 3A'),
    ('DB2-STU-006', 'Rahel', 'Tekle', 'Mariam', 3, 'Female', 'active', '2025/26', 'Grade 3A'),
    ('DB2-STU-007', 'Solomon', 'Wondimu', 'Desta', 1, 'Male', 'active', '2025/26', 'Grade 1A'),
    ('DB2-STU-008', 'Tiru', 'Getachew', 'Abebe', 1, 'Female', 'graduated', '2025/26', 'Grade 1A')
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ 8 students seeded');

  // Staff - Branch 2
  await db2.query(`INSERT INTO staff (staff_id, first_name, middle_name, last_name, staff_type, email, phone_number, gender, salary, status) VALUES
    ('DB2-STF-001', 'Worku', 'Fantaye', 'Teka', 'Teacher', 'worku@direb2.school', '+251944444444', 'Male', 16000.00, 'active'),
    ('DB2-STF-002', 'Zewdie', 'Mamo', 'Wakjira', 'Administrative', 'zewdie@direb2.school', '+251955555555', 'Male', 20000.00, 'active')
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ 2 staff seeded');

  // Subjects
  await db2.query(`INSERT INTO subjects (subject_code, subject_name, grade_level, is_active) VALUES
    ('MATH1', 'Mathematics', 1, true),
    ('ENG1', 'English', 1, true),
    ('AMH1', 'Amharic', 1, true),
    ('SCI1', 'Science', 1, true),
    ('MATH2', 'Mathematics', 2, true),
    ('ENG2', 'English', 2, true)
  ON CONFLICT DO NOTHING`);

  // Attendance records - Branch 2
  for (let day = 1; day <= 20; day++) {
    for (let sid = 1; sid <= 8; sid++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const statuses = ['present', 'present', 'present', 'absent', 'present', 'present', 'late', 'present'];
      const status = statuses[(sid + day) % statuses.length];
      await db2.query(`INSERT INTO student_attendance (student_id, class_id, attendance_date, status, marked_at)
        VALUES ($1, (SELECT class_id FROM students WHERE id = $1), $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, attendance_date) DO NOTHING`,
        [sid, date.toISOString().split('T')[0], status]);
    }
  }
  console.log('   ✓ Attendance records seeded');

  // Marks - Branch 2
  await db2.query(`INSERT INTO mark_lists (subject_id, class_id, teacher_id, term, academic_year, component_type, total_marks) VALUES
    (1, 1, 1, 1, '2025/26', 'test1', 100),
    (2, 1, 1, 1, '2025/26', 'test1', 100)
  ON CONFLICT DO NOTHING`);

  await db2.query(`INSERT INTO student_marks (mark_list_id, student_id, marks_obtained, percentage) VALUES
    (1, 1, 80, 80.00), (1, 2, 95, 95.00), (1, 3, 72, 72.00),
    (1, 4, 88, 88.00), (1, 5, 65, 65.00), (1, 6, 91, 91.00),
    (1, 7, 78, 78.00),
    (2, 1, 85, 85.00), (2, 2, 98, 98.00), (2, 3, 75, 75.00),
    (2, 4, 90, 90.00), (2, 5, 70, 70.00), (2, 6, 93, 93.00),
    (2, 7, 82, 82.00)
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ Marks seeded');

  // Monthly payments + expenses - Branch 2
  await db2.query(`CREATE TABLE IF NOT EXISTS monthly_payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    fee_type VARCHAR(50),
    amount_due DECIMAL(12,2),
    amount_paid DECIMAL(12,2),
    payment_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending',
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db2.query(`INSERT INTO monthly_payments (student_id, fee_type, amount_due, amount_paid, payment_date, payment_status, academic_year) VALUES
    (1, 'TUITION', 1200, 1200, '2026-01-15', 'paid', '2025/26'),
    (2, 'TUITION', 1200, 1200, '2026-01-15', 'paid', '2025/26'),
    (3, 'TUITION', 1200, 600, '2026-01-20', 'partial', '2025/26'),
    (4, 'TUITION', 1200, 0, NULL, 'pending', '2025/26'),
    (5, 'TUITION', 1200, 1200, '2026-01-10', 'paid', '2025/26'),
    (6, 'TUITION', 1200, 1200, '2026-01-12', 'paid', '2025/26'),
    (1, 'TRANSPORT', 600, 600, '2026-01-15', 'paid', '2025/26'),
    (2, 'TRANSPORT', 600, 600, '2026-01-15', 'paid', '2025/26'),
    (3, 'TRANSPORT', 600, 300, '2026-01-20', 'partial', '2025/26')
  ON CONFLICT DO NOTHING`);

  await db2.query(`CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_number VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12,2),
    expense_date DATE,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db2.query(`INSERT INTO expenses (expense_number, category, description, amount, expense_date, status) VALUES
    ('EXP-DB2-001', 'SALARY', 'Teacher Salaries - Jan', 36000.00, '2026-01-28', 'approved'),
    ('EXP-DB2-002', 'SUPPLIES', 'Lab Equipment', 12000.00, '2026-01-20', 'approved'),
    ('EXP-DB2-003', 'UTILITIES', 'Water Bill - Jan', 3000.00, '2026-01-10', 'approved'),
    ('EXP-DB2-004', 'TRANSPORT', 'Bus Maintenance', 15000.00, '2026-01-25', 'approved')
  ON CONFLICT DO NOTHING`);
  console.log('   ✓ Finance data seeded');

  await db2.end();
  console.log('\n   ✅ Dire Branch 2 seeding complete\n');

  // ============================================================
  // STEP 7: Create super admin for Dire Schools
  // ============================================================
  console.log('6. Creating Super Admin account...');

  // Create skoolific_master database if not exists
  try {
    await adminClient.query('CREATE DATABASE skoolific_master');
    console.log('   ✓ skoolific_master database created');
  } catch (err) {
    if (err.code === '42P04') console.log('   ⚠️  skoolific_master already exists');
    else throw err;
  }

  const masterClient = new Client({
    host: DB_HOST, port: DB_PORT, database: 'skoolific_master',
    user: DB_USER, password: DB_PASSWORD
  });
  await masterClient.connect();

  // Create schools table
  await masterClient.query(`
    CREATE TABLE IF NOT EXISTS schools (
      id SERIAL PRIMARY KEY,
      school_name VARCHAR(100) NOT NULL UNIQUE,
      school_code VARCHAR(20) NOT NULL UNIQUE,
      db_user VARCHAR(50) NOT NULL DEFAULT '${DB_USER}',
      db_password VARCHAR(255) NOT NULL DEFAULT '${DB_PASSWORD}',
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create branches table
  await masterClient.query(`
    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      branch_name VARCHAR(100) NOT NULL,
      branch_code VARCHAR(20) NOT NULL UNIQUE,
      database_name VARCHAR(100) NOT NULL UNIQUE,
      database_host VARCHAR(100) DEFAULT 'localhost',
      database_port INTEGER DEFAULT 5432,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create super_admins table
  await masterClient.query(`
    CREATE TABLE IF NOT EXISTS super_admins (
      id SERIAL PRIMARY KEY,
      school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      role VARCHAR(50) DEFAULT 'super_admin',
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert Dire Schools
  await masterClient.query(`
    INSERT INTO schools (school_name, school_code, db_user, db_password, description)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (school_code) DO NOTHING
    RETURNING id
  `, ['Dire Schools', 'DIRE', DB_USER, DB_PASSWORD, 'Dire Schools - Dire Dawa, Ethiopia']);

  const schoolResult = await masterClient.query('SELECT id FROM schools WHERE school_code = $1', ['DIRE']);
  const schoolId = schoolResult.rows[0].id;

  // Insert branches
  for (const b of branches) {
    await masterClient.query(`
      INSERT INTO branches (school_id, branch_name, branch_code, database_name, database_host, database_port)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (branch_code) DO NOTHING
    `, [schoolId, b.name, b.code, b.dbName, DB_HOST, DB_PORT]);
  }

  // Create super admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await masterClient.query(`
    INSERT INTO super_admins (school_id, username, password_hash, full_name, email, phone, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (username) DO NOTHING
    RETURNING id
  `, [schoolId, 'diradmin', passwordHash, 'Dire Schools Super Admin', 'admin@dire.school', '+251911000000', 'super_admin']);

  console.log('   ✓ Super Admin created:');
  console.log('     Username: diradmin');
  console.log('     Password: admin123');

  // ============================================================
  // DONE
  // ============================================================
  await masterClient.end();
  await mainPool.end();
  await adminClient.end();

  console.log('\n' + '='.repeat(60));
  console.log('  ✅ DIRE SCHOOLS SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Summary:');
  console.log('   School: Dire Schools');
  console.log('   Branch 1: DB1 (direb1_db) - 10 students, 3 staff');
  console.log('   Branch 2: DB2 (direb2_db) - 8 students, 2 staff');
  console.log('   Super Admin: diradmin / admin123');
  console.log('\n🔗 API Endpoints:');
  console.log('   POST /api/super-admin/login - Super admin login');
  console.log('   GET  /api/super-admin/branches - List branches');
  console.log('   GET  /api/super-admin/aggregate/enrollment - Student enrollment');
  console.log('   GET  /api/super-admin/aggregate/finance - Financial data');
  console.log('   GET  /api/super-admin/aggregate/attendance - Attendance');
  console.log('   GET  /api/super-admin/aggregate/academic - Academic performance\n');
}

setupDireSchools().catch(err => {
  console.error('\n❌ Setup failed:', err);
  process.exit(1);
});

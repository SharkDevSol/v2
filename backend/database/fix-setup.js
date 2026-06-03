const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = String(process.env.DB_PASSWORD || '12341234');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fix() {
  console.log('Fixing Dire Schools databases...\n');

  // Drop and recreate databases
  const admin = new Client({ host: DB_HOST, port: DB_PORT, database: 'postgres', user: DB_USER, password: DB_PASSWORD });
  await admin.connect();

  for (const db of ['direb1_db', 'direb2_db']) {
    await admin.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid()`, [db]).catch(() => {});
    await admin.query(`DROP DATABASE IF EXISTS ${db}`);
    await admin.query(`CREATE DATABASE ${db} OWNER ${DB_USER}`);
    console.log(`  ✓ ${db} recreated`);
  }
  await admin.end();

  await sleep(1000);

  const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS shifts (
      id SERIAL PRIMARY KEY,
      shift_name VARCHAR(50) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_morning BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      class_name VARCHAR(100) NOT NULL,
      class_type VARCHAR(20) NOT NULL DEFAULT 'regular',
      shift_id INTEGER REFERENCES shifts(id) ON DELETE SET NULL,
      grade_level INTEGER,
      capacity INTEGER DEFAULT 40,
      section VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      class_name VARCHAR(100),
      date_of_birth DATE,
      gender VARCHAR(10),
      phone_number VARCHAR(20),
      email VARCHAR(100),
      guardian_id INTEGER,
      enrollment_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      academic_year VARCHAR(20),
      address TEXT,
      emergency_contact_name VARCHAR(100),
      emergency_contact_phone VARCHAR(20),
      medical_conditions TEXT,
      photo_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      staff_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      staff_type VARCHAR(20) NOT NULL,
      email VARCHAR(100) UNIQUE,
      phone_number VARCHAR(20) NOT NULL,
      date_of_birth DATE,
      gender VARCHAR(10),
      hire_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      address TEXT,
      emergency_contact_name VARCHAR(100),
      emergency_contact_phone VARCHAR(20),
      qualification VARCHAR(100),
      specialization VARCHAR(100),
      salary DECIMAL(12, 2),
      photo_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guardians (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      phone_number VARCHAR(20) NOT NULL,
      address TEXT,
      occupation VARCHAR(100),
      relationship VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id SERIAL PRIMARY KEY,
      subject_code VARCHAR(20) UNIQUE NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      grade_level INTEGER,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      attendance_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL,
      marked_by INTEGER REFERENCES staff(id) ON DELETE SET NULL,
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      sync_status VARCHAR(20) DEFAULT 'synced',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, attendance_date)
    );

    CREATE TABLE IF NOT EXISTS mark_lists (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
      class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
      teacher_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
      term INTEGER NOT NULL,
      academic_year VARCHAR(20) NOT NULL,
      component_type VARCHAR(50) NOT NULL,
      total_marks INTEGER NOT NULL,
      is_locked BOOLEAN DEFAULT FALSE,
      locked_at TIMESTAMP,
      locked_by INTEGER REFERENCES staff(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_marks (
      id SERIAL PRIMARY KEY,
      mark_list_id INTEGER REFERENCES mark_lists(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      marks_obtained DECIMAL(5, 2),
      percentage DECIMAL(5, 2),
      grade VARCHAR(2),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monthly_payments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id),
      fee_type VARCHAR(50),
      amount_due DECIMAL(12,2),
      amount_paid DECIMAL(12,2),
      payment_date DATE,
      payment_status VARCHAR(20) DEFAULT 'pending',
      academic_year VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      expense_number VARCHAR(50) UNIQUE,
      category VARCHAR(100),
      description TEXT,
      amount DECIMAL(12,2),
      expense_date DATE,
      status VARCHAR(20) DEFAULT 'approved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) DEFAULT 'Administrator',
      email VARCHAR(255),
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    );
  `;

  const seeds = [
    {
      // ===== DIRE BRANCH 1 (DB1) =====
      db: 'direb1_db',
      shifts: `('Morning Shift', '08:00', '12:30', true), ('Afternoon Shift', '13:30', '17:00', false)`,
      classes: `('Grade 1A', 'regular', 1, 1, 40, 'A'), ('Grade 1B', 'regular', 2, 1, 40, 'B'), ('Grade 2A', 'regular', 1, 2, 40, 'A')`,
      students: [
        `('DB1-STU-001', 'Abebe', 'Kebede', 'Tesfaye', 1, 'Grade 1A', 'Male', 'active', '2025/26')`,
        `('DB1-STU-002', 'Almaz', 'Desta', 'Worku', 1, 'Grade 1A', 'Female', 'active', '2025/26')`,
        `('DB1-STU-003', 'Biruk', 'Lemma', 'Hailu', 1, 'Grade 1A', 'Male', 'active', '2025/26')`,
        `('DB1-STU-004', 'Chaltu', 'Ayana', 'Gudeta', 2, 'Grade 1B', 'Female', 'active', '2025/26')`,
        `('DB1-STU-005', 'Dawit', 'Mekonnen', 'Ayele', 2, 'Grade 1B', 'Male', 'active', '2025/26')`,
        `('DB1-STU-006', 'Eyerusalem', 'Tadesse', 'Belay', 3, 'Grade 2A', 'Female', 'active', '2025/26')`,
        `('DB1-STU-007', 'Fikadu', 'Girma', 'Tsegaye', 3, 'Grade 2A', 'Male', 'active', '2025/26')`,
        `('DB1-STU-008', 'Genet', 'Alemu', 'Mengistu', 3, 'Grade 2A', 'Female', 'active', '2025/26')`,
        `('DB1-STU-009', 'Haile', 'Belete', 'Wondimu', 1, 'Grade 1A', 'Male', 'inactive', '2025/26')`,
        `('DB1-STU-010', 'Iman', 'Usman', 'Hussein', 2, 'Grade 1B', 'Female', 'active', '2025/26')`
      ],
      staff: [
        `('DB1-STF-001', 'Teshome', 'Dibaba', 'Gutema', 'Teacher', 'teshome@direb1.school', '+251911111111', 'Male', 15000.00, 'active')`,
        `('DB1-STF-002', 'Mekdes', 'Assefa', 'Lemma', 'Teacher', 'mekdes@direb1.school', '+251922222222', 'Female', 14000.00, 'active')`,
        `('DB1-STF-003', 'Tsegaye', 'Berhanu', 'Seyoum', 'Administrative', 'tsegaye@direb1.school', '+251933333333', 'Male', 18000.00, 'active')`
      ],
      subjects: [
        `('MATH1', 'Mathematics', 1, true)`, `('ENG1', 'English', 1, true)`, `('AMH1', 'Amharic', 1, true)`, `('SCI1', 'Science', 1, true)`
      ],
      payments: [
        `(1, 'TUITION', 1000, 1000, '2026-01-15', 'paid', '2025/26'), (2, 'TUITION', 1000, 1000, '2026-01-15', 'paid', '2025/26'), (3, 'TUITION', 1000, 500, '2026-01-20', 'partial', '2025/26'), (4, 'TUITION', 1000, 1000, '2026-01-15', 'paid', '2025/26'), (5, 'TUITION', 1000, 0, NULL, 'pending', '2025/26'), (6, 'TUITION', 1000, 1000, '2026-01-10', 'paid', '2025/26'), (7, 'TUITION', 1000, 1000, '2026-01-12', 'paid', '2025/26'), (8, 'TUITION', 1000, 1000, '2026-01-18', 'paid', '2025/26'), (1, 'TRANSPORT', 500, 500, '2026-01-15', 'paid', '2025/26'), (2, 'TRANSPORT', 500, 500, '2026-01-15', 'paid', '2025/26'), (3, 'TRANSPORT', 500, 250, '2026-01-20', 'partial', '2025/26'), (4, 'TRANSPORT', 500, 500, '2026-01-15', 'paid', '2025/26')`
      ],
      expenses: [
        `('EXP-DB1-001', 'UTILITIES', 'Electricity Bill - Jan', 5000.00, '2026-01-10', 'approved'), ('EXP-DB1-002', 'SUPPLIES', 'Stationery', 2000.00, '2026-01-15', 'approved'), ('EXP-DB1-003', 'MAINTENANCE', 'Classroom Repair', 8000.00, '2026-01-20', 'approved')`
      ]
    },
    {
      // ===== DIRE BRANCH 2 (DB2) =====
      db: 'direb2_db',
      shifts: `('Morning Shift', '08:00', '12:30', true), ('Afternoon Shift', '13:30', '17:00', false)`,
      classes: `('Grade 1A', 'regular', 1, 1, 35, 'A'), ('Grade 2A', 'regular', 1, 2, 35, 'A'), ('Grade 3A', 'regular', 2, 3, 30, 'A')`,
      students: [
        `('DB2-STU-001', 'Kebede', 'Alamirew', 'Sisay', 1, 'Grade 1A', 'Male', 'active', '2025/26')`,
        `('DB2-STU-002', 'Lemlem', 'Gebre', 'Haileselassie', 1, 'Grade 1A', 'Female', 'active', '2025/26')`,
        `('DB2-STU-003', 'Mulugeta', 'Tadesse', 'Wolde', 2, 'Grade 2A', 'Male', 'active', '2025/26')`,
        `('DB2-STU-004', 'Nigist', 'Berhe', 'Asfaw', 2, 'Grade 2A', 'Female', 'active', '2025/26')`,
        `('DB2-STU-005', 'Obsa', 'Gammachiis', 'Fayyisaa', 3, 'Grade 3A', 'Male', 'active', '2025/26')`,
        `('DB2-STU-006', 'Rahel', 'Tekle', 'Mariam', 3, 'Grade 3A', 'Female', 'active', '2025/26')`,
        `('DB2-STU-007', 'Solomon', 'Wondimu', 'Desta', 1, 'Grade 1A', 'Male', 'active', '2025/26')`,
        `('DB2-STU-008', 'Tiru', 'Getachew', 'Abebe', 1, 'Grade 1A', 'Female', 'graduated', '2025/26')`
      ],
      staff: [
        `('DB2-STF-001', 'Worku', 'Fantaye', 'Teka', 'Teacher', 'worku@direb2.school', '+251944444444', 'Male', 16000.00, 'active')`,
        `('DB2-STF-002', 'Zewdie', 'Mamo', 'Wakjira', 'Administrative', 'zewdie@direb2.school', '+251955555555', 'Male', 20000.00, 'active')`
      ],
      subjects: [
        `('MATH1', 'Mathematics', 1, true)`, `('ENG1', 'English', 1, true)`, `('AMH1', 'Amharic', 1, true)`, `('SCI1', 'Science', 1, true)`, `('MATH2', 'Mathematics', 2, true)`, `('ENG2', 'English', 2, true)`
      ],
      payments: [
        `(1, 'TUITION', 1200, 1200, '2026-01-15', 'paid', '2025/26'), (2, 'TUITION', 1200, 1200, '2026-01-15', 'paid', '2025/26'), (3, 'TUITION', 1200, 600, '2026-01-20', 'partial', '2025/26'), (4, 'TUITION', 1200, 0, NULL, 'pending', '2025/26'), (5, 'TUITION', 1200, 1200, '2026-01-10', 'paid', '2025/26'), (6, 'TUITION', 1200, 1200, '2026-01-12', 'paid', '2025/26'), (1, 'TRANSPORT', 600, 600, '2026-01-15', 'paid', '2025/26'), (2, 'TRANSPORT', 600, 600, '2026-01-15', 'paid', '2025/26'), (3, 'TRANSPORT', 600, 300, '2026-01-20', 'partial', '2025/26')`
      ],
      expenses: [
        `('EXP-DB2-001', 'SALARY', 'Teacher Salaries - Jan', 36000.00, '2026-01-28', 'approved'), ('EXP-DB2-002', 'SUPPLIES', 'Lab Equipment', 12000.00, '2026-01-20', 'approved'), ('EXP-DB2-003', 'UTILITIES', 'Water Bill - Jan', 3000.00, '2026-01-10', 'approved'), ('EXP-DB2-004', 'TRANSPORT', 'Bus Maintenance', 15000.00, '2026-01-25', 'approved')`
      ]
    }
  ];

  for (const s of seeds) {
    const cl = new Client({ host: DB_HOST, port: DB_PORT, database: s.db, user: DB_USER, password: DB_PASSWORD });
    await cl.connect();

    // Create all tables
    for (const statement of SCHEMA_SQL.split(';').filter(st => st.trim().length > 0)) {
      await cl.query(statement);
    }

    // Seed shifts
    await cl.query(`INSERT INTO shifts (shift_name, start_time, end_time, is_morning) VALUES ${s.shifts} ON CONFLICT DO NOTHING`);
    // Seed classes
    await cl.query(`INSERT INTO classes (class_name, class_type, shift_id, grade_level, capacity, section) VALUES ${s.classes} ON CONFLICT DO NOTHING`);
    // Seed students
    for (const stu of s.students) {
      await cl.query(`INSERT INTO students (student_id, first_name, middle_name, last_name, class_id, class_name, gender, status, academic_year) VALUES ${stu} ON CONFLICT DO NOTHING`);
    }
    // Seed staff
    for (const stf of s.staff) {
      await cl.query(`INSERT INTO staff (staff_id, first_name, middle_name, last_name, staff_type, email, phone_number, gender, salary, status) VALUES ${stf} ON CONFLICT DO NOTHING`);
    }
    // Seed subjects
    for (const subj of s.subjects) {
      await cl.query(`INSERT INTO subjects (subject_code, subject_name, grade_level, is_active) VALUES ${subj} ON CONFLICT DO NOTHING`);
    }

    // Attendance (20 days)
    const today = new Date();
    const studentRows = (await cl.query('SELECT id, class_id FROM students')).rows;
    for (let day = 1; day <= 20; day++) {
      for (const row of studentRows) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const statuses = ['present', 'present', 'present', 'present', 'absent', 'present', 'present', 'late', 'present', 'excused'];
        const status = statuses[(row.id + day) % statuses.length];
        await cl.query(`INSERT INTO student_attendance (student_id, class_id, attendance_date, status, marked_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (student_id, attendance_date) DO NOTHING`, [row.id, row.class_id, date.toISOString().split('T')[0], status]);
      }
    }

    // Seed marks
    const subjects = (await cl.query('SELECT id FROM subjects LIMIT 2')).rows;
    const teachers = (await cl.query('SELECT id FROM staff LIMIT 1')).rows;
    const classes = (await cl.query('SELECT id FROM classes LIMIT 1')).rows;
    if (subjects.length && teachers.length && classes.length) {
      // Create mark list
      const mlResult = await cl.query(`INSERT INTO mark_lists (subject_id, class_id, teacher_id, term, academic_year, component_type, total_marks) VALUES ($1, $2, $3, 1, '2025/26', 'test1', 100) RETURNING id`, [subjects[0].id, classes[0].id, teachers[0].id]);
      const mlId = mlResult.rows[0].id;
      // Add marks for each active student
      const activeStudents = (await cl.query("SELECT id FROM students WHERE status = 'active'")).rows;
      for (const stu of activeStudents) {
        const score = 50 + Math.floor(Math.random() * 50);
        await cl.query(`INSERT INTO student_marks (mark_list_id, student_id, marks_obtained, percentage) VALUES ($1, $2, $3, $3) ON CONFLICT DO NOTHING`, [mlId, stu.id, score]);
      }
    }

    // Seed payments & expenses
    await cl.query(`INSERT INTO monthly_payments (student_id, fee_type, amount_due, amount_paid, payment_date, payment_status, academic_year) VALUES ${s.payments} ON CONFLICT DO NOTHING`);
    await cl.query(`INSERT INTO expenses (expense_number, category, description, amount, expense_date, status) VALUES ${s.expenses} ON CONFLICT DO NOTHING`);

    // Add admin user
    const hash = await bcrypt.hash('admin123', 10);
    await cl.query(`INSERT INTO admin_users (username, password_hash, name, email, role) VALUES ($1, $2, $3, $4, 'admin') ON CONFLICT (username) DO NOTHING`,
      ['admin', hash, `${s.db} Admin`, `admin@${s.db.replace('_db', '')}.dire.school`]);

    await cl.end();
    console.log(`  ✅ ${s.db} — tables created + data seeded + admin added`);
  }

  console.log('\n✅ Fix complete! Restart the server now.');
}

fix().catch(err => { console.error('❌', err); process.exit(1); });

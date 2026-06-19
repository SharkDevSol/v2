/**
 * Database Initialization Module
 * Automatically creates required tables on server startup
 * Prevents missing table errors when moving to new devices or resetting database
 */

const pool = require('./db');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database tables...');

    // Create staff_attendance_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_attendance_profiles (
          id SERIAL PRIMARY KEY,
          staff_id VARCHAR(50) NOT NULL UNIQUE,
          staff_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ staff_attendance_profiles table ready');

    // Create staff_attendance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_attendance (
          id SERIAL PRIMARY KEY,
          staff_id VARCHAR(50) NOT NULL,
          staff_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('Teacher', 'General Staff', 'Administrator', 'Support Staff')),
          date DATE NOT NULL,
          time_in TIMESTAMP NOT NULL,
          time_out TIMESTAMP,
          step1_timestamp TIMESTAMP,
          step2_timestamp TIMESTAMP,
          verification_status VARCHAR(20) DEFAULT 'single_step' CHECK (verification_status IN ('single_step', 'verified', 'pending')),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(staff_id, date)
      );
    `);
    console.log('  ✓ staff_attendance table ready');

    // Create staff_attendance_pending table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_attendance_pending (
          id SERIAL PRIMARY KEY,
          staff_id VARCHAR(50) NOT NULL,
          staff_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          step1_timestamp TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'pending_step2' CHECK (status IN ('pending_step2', 'completed', 'cancelled', 'expired')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
      );
    `);
    console.log('  ✓ staff_attendance_pending table ready');

    // Create staff_attendance_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_attendance_logs (
          id SERIAL PRIMARY KEY,
          attendance_id INTEGER REFERENCES staff_attendance(id) ON DELETE CASCADE,
          action VARCHAR(50) NOT NULL,
          performed_by VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          details JSONB
      );
    `);
    console.log('  ✓ staff_attendance_logs table ready');

    // Create indexes (each wrapped to handle pre-existing schema differences)
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_id ON staff_attendance(staff_id)',
      'CREATE INDEX IF NOT EXISTS idx_staff_attendance_role ON staff_attendance(role)',
      'CREATE INDEX IF NOT EXISTS idx_staff_attendance_verification ON staff_attendance(verification_status)',
      'CREATE INDEX IF NOT EXISTS idx_staff_attendance_profiles_staff_id ON staff_attendance_profiles(staff_id)',
      'CREATE INDEX IF NOT EXISTS idx_staff_attendance_profiles_active ON staff_attendance_profiles(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_pending_staff_id ON staff_attendance_pending(staff_id)',
      'CREATE INDEX IF NOT EXISTS idx_pending_status ON staff_attendance_pending(status)',
    ];
    for (const q of indexQueries) {
      try { await client.query(q); } catch (_) {}
    }
    // date index — may fail if column doesn't exist in existing table
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(date)');
    } catch (_) {}
    console.log('  ✓ Database indexes ready');

    console.log('✅ Database initialization complete\n');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { initializeDatabase };

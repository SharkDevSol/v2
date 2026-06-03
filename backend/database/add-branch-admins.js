const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = String(process.env.DB_PASSWORD || '12341234');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');

async function addBranchAdmins() {
  console.log('Adding branch-level admin accounts...\n');

  const branches = [
    { dbName: 'direb1_db', code: 'DB1', name: 'Dire Branch 1' },
    { dbName: 'direb2_db', code: 'DB2', name: 'Dire Branch 2' }
  ];

  for (const b of branches) {
    const client = new Client({
      host: DB_HOST, port: DB_PORT, database: b.dbName,
      user: DB_USER, password: DB_PASSWORD
    });
    await client.connect();

    // Create admin_users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT 'Administrator',
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);

    // Create admin account
    const hash = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO admin_users (username, password_hash, name, email, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', hash, `${b.name} Admin`, `admin@${b.code.toLowerCase()}.dire.school`, 'admin']);

    console.log(`  ✓ ${b.name} (${b.dbName}) — admin / admin123`);
    await client.end();
  }

  console.log('\n✅ Branch admin accounts created!');
  console.log('\n📋 Branch Login: POST /api/v2/branches/login');
  console.log('   Body: { "branchCode": "DB1", "username": "admin", "password": "admin123", "userType": "admin" }');
}

addBranchAdmins().catch(console.error);

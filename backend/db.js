const { Pool } = require('pg');
require('dotenv').config();

// connect to the render postgres instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// run once at startup to make sure all tables exist
const initDB = async () => {
  try {
    // USERS TABLE (base)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ADD missing columns safely 
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS contact VARCHAR(20),
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';
    `);

    // ITEMS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        location VARCHAR(200),
        type VARCHAR(10) CHECK (type IN ('lost', 'found')) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // CLAIM REQUESTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS claim_requests (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        claimant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database tables are ready');
  } catch (err) {
    console.error('Error setting up tables:', err.message);
  }
};

module.exports = { pool, initDB };
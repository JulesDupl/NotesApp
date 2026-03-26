require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required by Supabase
});

// Create the notes table if it doesn't exist yet
pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id         SERIAL PRIMARY KEY,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`).catch(err => {
  console.error('Failed to initialise database table:', err.message);
  // Remove the process.exit(1) line — let the server keep running
});

module.exports = pool;
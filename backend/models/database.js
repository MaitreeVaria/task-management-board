const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'task_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'task_board',
  password: process.env.DB_PASSWORD || 'password123',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;

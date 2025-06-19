const { Pool } = require('pg');

const pool = new Pool({
  user: 'maitree',  
  host: 'localhost',
  database: 'task_board',
  password: '',
  port: 5432,
});

module.exports = pool;
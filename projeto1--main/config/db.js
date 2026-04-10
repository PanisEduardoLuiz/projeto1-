const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin', 
  host: 'localhost', 
  database: 'financas', 
  password: '123', 
  port: 15432,
});

module.exports = pool;

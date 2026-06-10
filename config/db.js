require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'financas',
  password: process.env.DB_PASSWORD || '123',
  port: parseInt(process.env.DB_PORT || '15432', 10),
});

module.exports = pool;

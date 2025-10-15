// backend/db.js
const mysql = require('mysql2/promise'); // ← use promise version
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
    process.exit(1);
  });

module.exports = pool;

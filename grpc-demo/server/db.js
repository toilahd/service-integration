const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MySQL:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};

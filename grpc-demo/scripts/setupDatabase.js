const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Connect without database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    await connection.end();

    // Connect to the specific database
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Create table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await dbConnection.query(createTableQuery);
    console.log('Products table created successfully');

    // Insert sample data
    const insertQuery = `
      INSERT INTO products (name, description, price, stock) VALUES
      ('Laptop', 'High-performance laptop for developers', 1299.99, 50),
      ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200),
      ('Mechanical Keyboard', 'RGB mechanical gaming keyboard', 89.99, 100),
      ('USB-C Hub', '7-in-1 USB-C hub with HDMI', 49.99, 150),
      ('Webcam', '1080p HD webcam', 79.99, 75)
      ON DUPLICATE KEY UPDATE id=id;
    `;

    await dbConnection.query(insertQuery);
    console.log('Sample data inserted successfully');

    await dbConnection.end();
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();

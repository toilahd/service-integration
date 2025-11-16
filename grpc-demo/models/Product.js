const { pool } = require('../server/db');

class Product {
  // Create a new product
  static async create(productData) {
    const { name, description, price, stock } = productData;
    const query = `
      INSERT INTO products (name, description, price, stock)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [name, description, price, stock]);
    return result.insertId;
  }

  // Get product by ID
  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  // Update product
  static async update(id, productData) {
    const { name, description, price, stock } = productData;
    const query = `
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [name, description, price, stock, id]);
    return result.affectedRows > 0;
  }

  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }

  // List all products with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
    const total = countResult[0].total;

    // Get paginated results
    const query = 'SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [limit, offset]);

    return {
      products: rows,
      total
    };
  }
}

module.exports = Product;

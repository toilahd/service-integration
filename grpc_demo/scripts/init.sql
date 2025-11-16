-- Create products table
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

-- Insert sample data
INSERT INTO products (name, description, price, stock) VALUES
('Laptop', 'High-performance laptop for developers', 1299.99, 50),
('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200),
('Mechanical Keyboard', 'RGB mechanical gaming keyboard', 89.99, 100),
('USB-C Hub', '7-in-1 USB-C hub with HDMI', 49.99, 150),
('Webcam', '1080p HD webcam', 79.99, 75);

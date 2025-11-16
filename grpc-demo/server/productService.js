const grpc = require('@grpc/grpc-js');
const Product = require('../models/Product');

// Implement CreateProduct RPC
async function createProduct(call, callback) {
  try {
    const { name, description, price, stock } = call.request;

    // Validate input
    if (!name || !price) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Name and price are required'
      });
    }

    if (price < 0 || stock < 0) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Price and stock must be non-negative'
      });
    }

    // Create product
    const productId = await Product.create({
      name,
      description: description || '',
      price,
      stock: stock || 0
    });

    // Fetch created product
    const product = await Product.findById(productId);

    callback(null, {
      success: true,
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

// Implement GetProduct RPC
async function getProduct(call, callback) {
  try {
    const { id } = call.request;

    if (!id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `Product with ID ${id} not found`
      });
    }

    callback(null, {
      success: true,
      message: 'Product retrieved successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting product:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

// Implement UpdateProduct RPC
async function updateProduct(call, callback) {
  try {
    const { id, name, description, price, stock } = call.request;

    if (!id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `Product with ID ${id} not found`
      });
    }

    // Validate input
    if (price < 0 || stock < 0) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Price and stock must be non-negative'
      });
    }

    // Update product
    const updated = await Product.update(id, {
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      price: price || existingProduct.price,
      stock: stock !== undefined ? stock : existingProduct.stock
    });

    if (!updated) {
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update product'
      });
    }

    // Fetch updated product
    const product = await Product.findById(id);

    callback(null, {
      success: true,
      message: 'Product updated successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

// Implement DeleteProduct RPC
async function deleteProduct(call, callback) {
  try {
    const { id } = call.request;

    if (!id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `Product with ID ${id} not found`
      });
    }

    // Delete product
    const deleted = await Product.delete(id);

    if (!deleted) {
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete product'
      });
    }

    callback(null, {
      success: true,
      message: `Product with ID ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

// Implement ListProducts RPC
async function listProducts(call, callback) {
  try {
    const { page, limit } = call.request;
    const currentPage = page || 1;
    const pageLimit = limit || 10;

    if (currentPage < 1 || pageLimit < 1) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Page and limit must be positive integers'
      });
    }

    const { products, total } = await Product.findAll(currentPage, pageLimit);

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString()
    }));

    callback(null, {
      success: true,
      message: 'Products retrieved successfully',
      products: formattedProducts,
      total: total
    });
  } catch (error) {
    console.error('Error listing products:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts
};

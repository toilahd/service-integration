const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load proto file
const PROTO_PATH = path.join(__dirname, '../proto/product.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// Create gRPC client
const GRPC_HOST = 'localhost';
const GRPC_PORT = process.env.GRPC_PORT || 50051;
const client = new productProto.ProductService(
  `${GRPC_HOST}:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
);

// Helper function to promisify gRPC calls
const callGrpc = (method, request) => {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Routes

// GET /api/products/stream - Stream products with Server-Sent Events (SSE)
// IMPORTANT: This must come BEFORE /api/products/:id to avoid route conflict
app.get('/api/products/stream', (req, res) => {
  try {
    const delay = parseInt(req.query.delay) || 500;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log(`📡 Starting product stream with ${delay}ms delay...`);

    // Create gRPC streaming call
    const call = client.StreamProducts({ delay_ms: delay });

    // Handle each streamed product
    call.on('data', (response) => {
      const data = {
        product: response.product,
        index: response.index,
        total: response.total
      };
      // Send as SSE event
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      res.flush && res.flush(); // Flush immediately if available
    });

    // Handle stream end
    call.on('end', () => {
      res.write('data: {"done": true}\n\n');
      res.end();
      console.log('✅ Product stream completed');
    });

    // Handle errors
    call.on('error', (error) => {
      console.error('❌ Stream error:', error);
      res.write(`data: {"error": "${error.message}"}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      console.log('⚠️  Client disconnected from stream');
      call.cancel();
    });
  } catch (error) {
    console.error('Error setting up stream:', error);
    res.status(500).json({
      success: false,
      message: error.details || 'Internal server error'
    });
  }
});

// GET /api/products - List all products
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const response = await callGrpc('ListProducts', { page, limit });
    
    res.json({
      success: response.success,
      message: response.message,
      data: response.products,
      total: response.total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({
      success: false,
      message: error.details || 'Internal server error'
    });
  }
});

// GET /api/products/:id - Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const response = await callGrpc('GetProduct', { id });
    
    res.json({
      success: response.success,
      message: response.message,
      data: response.product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    if (error.code === grpc.status.NOT_FOUND) {
      return res.status(404).json({
        success: false,
        message: error.details
      });
    }
    res.status(500).json({
      success: false,
      message: error.details || 'Internal server error'
    });
  }
});

// POST /api/products - Create new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    const response = await callGrpc('CreateProduct', {
      name,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock) || 0
    });
    
    res.status(201).json({
      success: response.success,
      message: response.message,
      data: response.product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.details || 'Internal server error'
    });
  }
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, stock } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const response = await callGrpc('UpdateProduct', {
      id,
      name,
      description,
      price: price ? parseFloat(price) : 0,
      stock: stock !== undefined ? parseInt(stock) : 0
    });
    
    res.json({
      success: response.success,
      message: response.message,
      data: response.product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === grpc.status.NOT_FOUND) {
      return res.status(404).json({
        success: false,
        message: error.details
      });
    }
    res.status(500).json({
      success: false,
      message: error.details || 'Internal server error'
    });
  }
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const response = await callGrpc('DeleteProduct', { id });
    
    res.json({
      success: response.success,
      message: response.message
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === grpc.status.NOT_FOUND) {
      return res.status(404).json({
        success: false,
        message: error.details
      });
    }
    res.status(500).json({
      success: false,
      message: error.details || 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'REST Gateway is running' });
});

// Serve streaming demo page
app.get('/stream-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'stream-demo.html'));
});

// Start server
const PORT = process.env.REST_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 REST Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Connected to gRPC server at ${GRPC_HOST}:${GRPC_PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    http://localhost:${PORT}/api/products`);
  console.log(`  GET    http://localhost:${PORT}/api/products/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/products`);
  console.log(`  PUT    http://localhost:${PORT}/api/products/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/products/:id`);
  console.log(`  GET    http://localhost:${PORT}/api/products/stream`);
  console.log(`\n🎨 Stream Demo: http://localhost:${PORT}/stream-demo`);
});

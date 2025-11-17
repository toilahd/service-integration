const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db');
const productService = require('./productService');

// Load proto file
const PROD_PROTO_PATH = path.join(__dirname, '../proto/product.proto');
const RAND_PROTO_PATH = path.join(__dirname, '../proto/something.proto');

const packageDefinition = protoLoader.loadSync(PROD_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const randomPackageDef = protoLoader.loadSync(RAND_PROTO_PATH)

const productProto = grpc.loadPackageDefinition(packageDefinition).product;
const randomProto = grpc.loadPackageDefinition(randomPackageDef)

// Start gRPC server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Create gRPC server
  const server = new grpc.Server();

  // Add ProductService implementation
  server.addService(productProto.ProductService.service, {
    CreateProduct: productService.createProduct,
    GetProduct: productService.getProduct,
    UpdateProduct: productService.updateProduct,
    DeleteProduct: productService.deleteProduct,
    ListProducts: productService.listProducts,
    StreamProducts: productService.streamProducts
  });

  server.addService(randomProto.RandomService.service, {
    GetRandomNumber: () => 3434,
    GetRandomObject: () => 9343
  })

  // Bind server to port
  const PORT = process.env.GRPC_PORT || 50051;
  const HOST = '0.0.0.0';
  
  server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to bind server:', error);
        return;
      }
      console.log(`🚀 gRPC Server running on port ${port}`);
      console.log(`📡 Listening for requests...`);
    }
  );
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Shutting down gRPC server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Shutting down gRPC server...');
  process.exit(0);
});

// Start the server
startServer();

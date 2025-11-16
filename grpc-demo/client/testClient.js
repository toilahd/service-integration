const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { type } = require('os');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Test functions

async function testCreateProduct() {
  console.log('\n--- Test Create Product ---');
  const name = await prompt('Enter product name: ');
  const description = await prompt('Enter product description: ');
  const price = await prompt('Enter product price: ');
  const stock = await prompt('Enter product stock: ');

  return new Promise((resolve, reject) => {
    client.CreateProduct(
      {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock)
      },
      (error, response) => {
        if (error) {
          console.error('❌ Error:', error.message);
          reject(error);
        } else {
          console.log('✅ Success:', response.message);
          console.log('Product:', JSON.stringify(response.product, null, 2));
          resolve(response);
        }
      }
    );
  });
}

async function testGetProduct() {
  console.log('\n--- Test Get Product ---');
  const id = await prompt('Enter product ID: ');

  return new Promise((resolve, reject) => {
    client.GetProduct({ id: parseInt(id) }, (error, response) => {
      if (error) {
        console.error('❌ Error:', error.message);
        reject(error);
      } else {
        console.log('✅ Success:', response.message);
        console.log(typeof response.product)
        console.log('Product:', JSON.stringify(response.product, null, 2));
        resolve(response);
      }
    });
  });
}

async function testUpdateProduct() {
  console.log('\n--- Test Update Product ---');
  const id = await prompt('Enter product ID to update: ');
  const name = await prompt('Enter new name: ');
  const description = await prompt('Enter new description: ');
  const price = await prompt('Enter new price: ');
  const stock = await prompt('Enter new stock: ');

  return new Promise((resolve, reject) => {
    client.UpdateProduct(
      {
        id: parseInt(id),
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock)
      },
      (error, response) => {
        if (error) {
          console.error('❌ Error:', error.message);
          reject(error);
        } else {
          console.log('✅ Success:', response.message);
          console.log('Updated Product:', JSON.stringify(response.product, null, 2));
          resolve(response);
        }
      }
    );
  });
}

async function testDeleteProduct() {
  console.log('\n--- Test Delete Product ---');
  const id = await prompt('Enter product ID to delete: ');

  return new Promise((resolve, reject) => {
    client.DeleteProduct({ id: parseInt(id) }, (error, response) => {
      if (error) {
        console.error('❌ Error:', error.message);
        reject(error);
      } else {
        console.log('✅ Success:', response.message);
        resolve(response);
      }
    });
  });
}

async function testListProducts() {
  console.log('\n--- Test List Products ---');
  const page = await prompt('Enter page number (default 1): ');
  const limit = await prompt('Enter page limit (default 10): ');

  return new Promise((resolve, reject) => {
    client.ListProducts(
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      },
      (error, response) => {
        if (error) {
          console.error('❌ Error:', error.message);
          reject(error);
        } else {
          console.log('✅ Success:', response.message);
          console.log(`Total products: ${response.total}`);
          console.log('Products:');
          response.products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Price: $${product.price}`);
            console.log(`   Stock: ${product.stock}`);
            console.log(`   Description: ${product.description}`);
          });
          resolve(response);
        }
      }
    );
  });
}

// Run automated test suite
async function runAutomatedTests() {
  console.log('\n🧪 Running Automated Test Suite...\n');

  try {
    // Test 1: List existing products
    console.log('Test 1: List all products');
    await new Promise((resolve, reject) => {
      client.ListProducts({ page: 1, limit: 5 }, (error, response) => {
        if (error) {
          console.error('❌ Failed:', error.message);
          reject(error);
        } else {
          console.log(`✅ Passed - Found ${response.total} products`);
          resolve(response);
        }
      });
    });

    // Test 2: Create a new product
    console.log('\nTest 2: Create a new product');
    const newProduct = await new Promise((resolve, reject) => {
      client.CreateProduct(
        {
          name: 'Test Product',
          description: 'This is a test product',
          price: 99.99,
          stock: 50
        },
        (error, response) => {
          if (error) {
            console.error('❌ Failed:', error.message);
            reject(error);
          } else {
            console.log(`✅ Passed - Created product with ID: ${response.product.id}`);
            resolve(response.product);
          }
        }
      );
    });

    // Test 3: Get the created product
    console.log('\nTest 3: Get product by ID');
    await new Promise((resolve, reject) => {
      client.GetProduct({ id: newProduct.id }, (error, response) => {
        if (error) {
          console.error('❌ Failed:', error.message);
          reject(error);
        } else {
          console.log(`✅ Passed - Retrieved product: ${response.product.name}`);
          resolve(response);
        }
      });
    });

    // Test 4: Update the product
    console.log('\nTest 4: Update product');
    await new Promise((resolve, reject) => {
      client.UpdateProduct(
        {
          id: newProduct.id,
          name: 'Updated Test Product',
          description: 'Updated description',
          price: 149.99,
          stock: 75
        },
        (error, response) => {
          if (error) {
            console.error('❌ Failed:', error.message);
            reject(error);
          } else {
            console.log(`✅ Passed - Updated product: ${response.product.name}`);
            resolve(response);
          }
        }
      );
    });

    // Test 5: Delete the product
    console.log('\nTest 5: Delete product');
    await new Promise((resolve, reject) => {
      client.DeleteProduct({ id: newProduct.id }, (error, response) => {
        if (error) {
          console.error('❌ Failed:', error.message);
          reject(error);
        } else {
          console.log(`✅ Passed - Deleted product with ID: ${newProduct.id}`);
          resolve(response);
        }
      });
    });

    // Test 6: Verify deletion (should fail)
    console.log('\nTest 6: Verify deletion');
    await new Promise((resolve) => {
      client.GetProduct({ id: newProduct.id }, (error) => {
        if (error && error.code === grpc.status.NOT_FOUND) {
          console.log('✅ Passed - Product not found (as expected)');
          resolve();
        } else {
          console.log('❌ Failed - Product should not exist');
          resolve();
        }
      });
    });

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Main menu
async function showMenu() {
  console.log('\n=================================');
  console.log('  gRPC Product Service Client');
  console.log('=================================');
  console.log('1. Create Product');
  console.log('2. Get Product');
  console.log('3. Update Product');
  console.log('4. Delete Product');
  console.log('5. List Products');
  console.log('6. Run Automated Tests');
  console.log('0. Exit');
  console.log('=================================');

  const choice = await prompt('Select an option: ');

  try {
    switch (choice) {
      case '1':
        await testCreateProduct();
        break;
      case '2':
        await testGetProduct();
        break;
      case '3':
        await testUpdateProduct();
        break;
      case '4':
        await testDeleteProduct();
        break;
      case '5':
        await testListProducts();
        break;
      case '6':
        await runAutomatedTests();
        break;
      case '0':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        return;
      default:
        console.log('Invalid option. Please try again.');
    }
  } catch (error) {
    // Error already logged
  }

  // Show menu again
  await showMenu();
}

// Start the client
console.log(`\n🔌 Connecting to gRPC server at ${GRPC_HOST}:${GRPC_PORT}...`);
showMenu();

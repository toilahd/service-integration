# gRPC Product Service Demo

A complete gRPC-based Product Service implementation with CRUD operations, REST Gateway for frontend integration, and MySQL database.

## 🏗️ Architecture

```
React Frontend (Vite)
    ↓ HTTP/REST
REST Gateway (Express :3000)
    ↓ gRPC
gRPC Server (:50051)
    ↓ SQL
MySQL Database (:3306)
```

## 📋 Features

- ✅ Full CRUD operations (Create, Read, Update, Delete, List)
- ✅ **Server Streaming RPC** - Real-time product streaming
- ✅ gRPC server with Protocol Buffers
- ✅ REST API Gateway for easy frontend integration
- ✅ Server-Sent Events (SSE) for browser streaming
- ✅ Interactive web demo for streaming
- ✅ MySQL database with connection pooling
- ✅ Interactive test client
- ✅ Automated test suite
- ✅ Docker support for MySQL
- ✅ Error handling with proper gRPC status codes

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **RPC Framework**: gRPC (@grpc/grpc-js)
- **Database**: MySQL 8.0
- **Protocol**: Protocol Buffers (proto3)
- **Frontend Ready**: REST API endpoints for React/Vite

## 📁 Project Structure

```
grpc_demo/
├── package.json
├── .env
├── docker-compose.yaml
├── proto/
│   └── product.proto          # gRPC service definition
├── server/
│   ├── index.js              # gRPC server entry point
│   ├── productService.js     # Service implementation
│   └── db.js                 # Database connection
├── client/
│   └── testClient.js         # Interactive test client
├── gateway/
│   └── restGateway.js        # REST API for frontend
│   └── stream-demo.html      # Interactive streaming demo
├── models/
│   └── Product.js            # Product model & queries
├── config/
│   └── database.js           # Database configuration
└── scripts/
    ├── init.sql              # Database schema
    └── setupDatabase.js      # Setup script
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose (for MySQL)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   cd grpc_demo
   npm install
   ```

2. **Start MySQL database**
   ```bash
   docker-compose up -d
   ```

3. **Wait for MySQL to be ready** (about 10-20 seconds)
   ```bash
   docker-compose logs -f mysql
   # Wait for "ready for connections" message
   ```

4. **Setup database** (optional, auto-created by Docker)
   ```bash
   npm run db:setup
   ```

### Running the Services

**Terminal 1: Start gRPC Server**
```bash
npm run server
```

**Terminal 2: Start REST Gateway** (for frontend)
```bash
npm run gateway
```

**Terminal 3: Test with gRPC Client**
```bash
npm run client
```

**Browser: View Streaming Demo**
```
Open http://localhost:3000/stream-demo
```

## 🧪 Testing

### Interactive Test Client

Run the test client and select from the menu:
```bash
npm run client
```

Options:
1. Create Product
2. Get Product
3. Update Product
4. Delete Product
5. List Products
6. Run Automated Tests
7. **Stream Products (Server Streaming Demo)**
8. **Run Streaming Test**

### Server Streaming Demo

**Option 7** demonstrates gRPC server streaming where products are sent one by one from the server to the client in real-time. You can set a custom delay between each product.

**Option 8** runs an automated test of the streaming functionality with a 300ms delay.

### Web-Based Streaming Demo

Open `http://localhost:3000/stream-demo` in your browser to see an interactive demo of server streaming with:
- Real-time product cards appearing as they're streamed
- Progress bar showing streaming progress
- Statistics (total products, received count, stream time)
- Adjustable delay between products
- Beautiful UI with animations

### Automated Test Suite

The test client includes an automated test suite (option 6) that:
- Lists existing products
- Creates a new product
- Retrieves the product
- Updates the product
- Deletes the product
- Verifies deletion

## 🌐 REST API Endpoints

The REST Gateway provides HTTP endpoints for your React frontend:

### List Products
```bash
GET http://localhost:3000/api/products?page=1&limit=10
```

### Get Product by ID
```bash
GET http://localhost:3000/api/products/1
```

### Create Product
```bash
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 100
}
```

### Update Product
```bash
PUT http://localhost:3000/api/products/1
Content-Type: application/json

{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 149.99,
  "stock": 150
}
```

### Delete Product
```bash
DELETE http://localhost:3000/api/products/1
```

### Stream Products (Server-Sent Events)
```bash
GET http://localhost:3000/api/products/stream?delay=500
```

This endpoint uses Server-Sent Events (SSE) to stream products in real-time to the browser. Each product is sent as a separate event.

**JavaScript Example:**
```javascript
const eventSource = new EventSource('http://localhost:3000/api/products/stream?delay=500');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.done) {
    console.log('Stream completed');
    eventSource.close();
    return;
  }
  
  if (data.product) {
    console.log(`[${data.index}/${data.total}]`, data.product);
  }
};
```

## 📝 gRPC Service Definition

The service is defined in `proto/product.proto`:

```protobuf
service ProductService {
  rpc CreateProduct(CreateProductRequest) returns (ProductResponse);
  rpc GetProduct(GetProductRequest) returns (ProductResponse);
  rpc UpdateProduct(UpdateProductRequest) returns (ProductResponse);
  rpc DeleteProduct(DeleteProductRequest) returns (DeleteResponse);
  rpc ListProducts(ListProductsRequest) returns (ProductListResponse);
  
  // Server Streaming RPC - streams products one by one
  rpc StreamProducts(StreamProductsRequest) returns (stream ProductStreamResponse);
}
```

**Key Features:**
- **Unary RPCs**: Standard request-response pattern (CreateProduct, GetProduct, etc.)
- **Server Streaming RPC**: `StreamProducts` - Server sends multiple responses for a single client request

## 🗄️ Database Schema

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## ⚙️ Configuration

Edit `.env` file to customize:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=product_service

# Servers
GRPC_PORT=50051
REST_PORT=3000
```

## 🔧 Development

### Start All Services
```bash
# Terminal 1
docker-compose up -d
npm run server

# Terminal 2
npm run gateway

# Terminal 3
npm run client
```

### Stop Services
```bash
docker-compose down
```

### View MySQL Data
```bash
docker exec -it grpc_mysql mysql -uroot -prootpassword product_service -e "SELECT * FROM products;"
```

## 🎨 Frontend Integration

For your React/Vite frontend, use the REST API:

```javascript
// Example React API calls
const API_BASE = 'http://localhost:3000/api';

// Fetch products
const response = await fetch(`${API_BASE}/products?page=1&limit=10`);
const data = await response.json();

// Create product
await fetch(`${API_BASE}/products`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Product Name',
    description: 'Description',
    price: 99.99,
    stock: 100
  })
});
```

## 📚 Learning Resources

- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [Node.js gRPC Guide](https://grpc.io/docs/languages/node/)

## 🐛 Troubleshooting

**MySQL Connection Error**
- Ensure Docker is running: `docker ps`
- Check MySQL logs: `docker-compose logs mysql`
- Wait for MySQL to be ready (takes ~20 seconds on first start)

**gRPC Connection Refused**
- Ensure gRPC server is running: `npm run server`
- Check port 50051 is not in use: `lsof -i :50051`

**REST Gateway Error**
- Ensure both gRPC server and gateway are running
- Check port 3000 is not in use: `lsof -i :3000`

## 📄 License

ISC

---

**Happy Coding! 🚀**

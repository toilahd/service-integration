# Kafka Event-Driven Microservices Architecture

A complete event-driven microservices architecture demo using Apache Kafka, Node.js, and Docker. This project demonstrates how to build scalable, loosely-coupled microservices that communicate through Kafka events.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Monitoring & Logs](#monitoring--logs)

## Architecture Overview

```
┌─────────────────┐
│  Order Service  │ ◄── REST API (Port 3000)
│   (Producer)    │
└────────┬────────┘
         │
         │ Publishes to
         ▼
  ┌─────────────┐
  │    Kafka    │
  │  (Broker)   │
  └──────┬──────┘
         │
         │ Consumes from
         ├────────────────────┬────────────────────┐
         ▼                    ▼                    ▼                    
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  
│Payment Service │  │Inventory Svc   │  │Notification Svc│    
│   (Consumer)   │  │  (Consumer)    │  │  (Consumer)    │  
└────────────────┘  └────────────────┘  └────────────────┘  
```

## Project Structure

```
kafka-demo/
├── common/                          # Shared utilities and configuration
│   ├── config/
│   │   └── kafka.js                # Kafka client and topic configuration
│   ├── utils/
│   │   └── logger.js               # Winston logger factory
│   └── package.json
│
├── order-service/                   # Order Service (REST API + Producer)
│   ├── producers/
│   │   └── orderProducer.js        # Kafka producer for order events
│   ├── routes/
│   │   └── orderRoutes.js          # Express routes
│   ├── app.js                      # Express app setup
│   ├── server.js                   # Service entry point
│   ├── package.json
│   └── Dockerfile
│   
│
├── payment-service/                 # Payment Service (Consumer)
│   ├── services/
│   │   └── paymentService.js       # Payment business logic
│   ├── server.js                   # Consumer entry point
│   ├── package.json
│   └── Dockerfile
│   
│
├── inventory-service/               # Inventory Service (Consumer)
│   ├── services/
│   │   └── inventoryService.js     # Inventory business logic
│   ├── server.js                   # Consumer entry point
│   ├── package.json
│   └── Dockerfile
│   
│
├── notification-service/            # Notification Service (Consumer)
│   ├── services/
│   │   └── notificationService.js  # Notification business logic
│   ├── server.js                   # Consumer entry point
│   ├── package.json
│   └── Dockerfile
│   
│
├── docker-compose.yaml              # Orchestrates all services
├── start.sh                         # Quick start script
├── stop.sh                          # Quick stop script
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Running with Docker Compose (Recommended)

#### **Option 1: Using Helper Scripts** 

**Start everything:**
```bash
cd kafka-demo
./start.sh
```

The script will:
- Check if Docker is running
- Start all services using docker compose
- Display service status and available ports
- Show useful commands and test examples

**Stop everything:**
```bash
./stop.sh
```

The script will:
- Stop all services gracefully
- Optionally remove volumes (interactive prompt)

**Note:** If scripts aren't executable: `chmod +x start.sh stop.sh`

---

#### **Option 2: Manual Docker Compose Commands**

1. **Navigate to kafka-demo directory**
   ```bash
   cd kafka-demo
   ```

2. **Start all services**
   ```bash
   docker compose up -d
   ```
   
   This will start:
   - Kafka broker (port 9092)
   - Order Service (port 3000)
   - Payment Service
   - Inventory Service
   - Notification Service

3. **Check service health**
   ```bash
   docker compose ps
   ```

4. **View logs**
   ```bash
   # All services
   docker compose logs -f
   
   # Specific service
   docker compose logs -f order-service
   docker compose logs -f payment-service
   docker compose logs -f inventory-service
   docker compose logs -f notification-service
   ```

5. **Test the system**
   ```bash
   # Create an order
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "customerId": "customer-123",
       "items": [
         {"productId": "item-001", "quantity": 2, "price": 29.99},
         {"productId": "item-002", "quantity": 1, "price": 49.99}
       ],
       "totalAmount": 109.97
     }'
   ```

6. **Stop all services**
   ```bash
   docker compose down
   
   # Remove volumes as well
   docker compose down -v
   ```

### Running Locally (Development)

1. **Install dependencies for each service**
   ```bash
   # Common module
   cd common && npm install && cd ..
   
   # Order service
   cd order-service && npm install && cd ..
   
   # Payment service
   cd payment-service && npm install && cd ..
   
   # Inventory service
   cd inventory-service && npm install && cd ..
   
   # Notification service
   cd notification-service && npm install && cd ..
   ```

2. **Start Kafka**
   ```bash
   docker compose up -d kafka
   ```

3. **Start services in separate terminals**
   ```bash
   # Terminal 1 - Order Service
   cd order-service && npm start
   
   # Terminal 2 - Payment Service
   cd payment-service && npm start
   
   # Terminal 3 - Inventory Service
   cd inventory-service && npm start
   
   # Terminal 4 - Notification Service
   cd notification-service && npm start
   ```



## Monitoring & Logs

### Log Files Location

All services write logs to **local filesystem**:

```
kafka-demo/
├── order-service/logs/
│   ├── combined.log    # All logs (info, warn, error)
│   └── error.log       # Error logs only
├── payment-service/logs/
│   ├── combined.log
│   └── error.log
├── inventory-service/logs/
│   ├── combined.log
│   └── error.log
└── notification-service/logs/
    ├── combined.log
    └── error.log
```

### View Logs

**Option 1: Docker Logs (Real-time)**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f order-service
docker compose logs -f payment-service
docker compose logs -f inventory-service
docker compose logs -f notification-service

# Last 50 lines
docker compose logs --tail 50 order-service
```

**Option 2: Local Log Files**
```bash
# Tail logs in real-time
tail -f order-service/logs/combined.log
tail -f payment-service/logs/combined.log

# View all error logs
cat */logs/error.log

# Search for specific order
grep "orderId-123" */logs/combined.log

# Count order creations
grep "Order created" order-service/logs/combined.log | wc -l
```

### Log Format

**JSON Structure:**
```json
{
  "level": "info",
  "label": "OrderService",
  "service": "OrderService",
  "timestamp": "2025-11-16 12:00:00",
  "message": "Order created",
  "orderId": "uuid-here",
  "customerId": "customer-123",
  "totalAmount": 99.99
}
```

### Log Rotation

- **Max File Size:** 5MB per file
- **Max Files:** 5 files kept
- **Total Storage:** ~25MB per service (5 files × 5MB)
- **Automatic Cleanup:** Old files deleted when limit reached



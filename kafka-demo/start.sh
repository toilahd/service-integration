#!/bin/bash

echo "================================================"
echo "  Kafka Microservices - Quick Start"
echo "================================================"
echo ""

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "ERROR: Docker is not running. Please start Docker first."
        exit 1
    fi
    echo "Docker is running"
}

# Function to start services
start_services() {
    echo ""
    echo "Starting all services with Docker Compose..."
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        echo "All services started successfully!"
        echo ""
        echo "Services:"
        echo "  - Kafka Broker: localhost:9092"
        echo "  - Order Service: http://localhost:3000"
        echo "  - Payment Service: Running"
        echo "  - Inventory Service: Running"
        echo "  - Notification Service: Running"
        echo ""
        echo "Useful commands:"
        echo "  - View logs: docker compose logs -f"
        echo "  - Check status: docker compose ps"
        echo "  - Stop services: docker compose down"
        echo ""
        echo "Test the system:"
        echo "  curl -X POST http://localhost:3000/api/orders \\"
        echo "    -H \"Content-Type: application/json\" \\"
        echo "    -d '{\"customerId\":\"test\",\"items\":[{\"productId\":\"item-001\",\"quantity\":1,\"price\":99.99}],\"totalAmount\":99.99}'"
    else
        echo "ERROR: Failed to start services"
        exit 1
    fi
}

# Main execution
check_docker
start_services

#!/bin/bash

echo "================================================"
echo "  Stopping Kafka Microservices"
echo "================================================"
echo ""

echo "Stopping all services..."
docker compose down

if [ $? -eq 0 ]; then
    echo "All services stopped successfully!"
    
    read -p "Do you want to remove volumes as well? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing volumes..."
        docker compose down -v
        echo "Volumes removed"
    fi
else
    echo "ERROR: Failed to stop services"
    exit 1
fi

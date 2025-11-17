#!/bin/bash

# Simple test script to verify SSE endpoint is working

echo "🧪 Testing SSE Stream Endpoint..."
echo "================================"
echo ""
echo "Make sure the gateway is running (npm run gateway)"
echo ""
echo "Testing: http://localhost:3000/api/products/stream?delay=100"
echo ""

# Test with curl
curl -N -H "Accept: text/event-stream" 'http://localhost:3000/api/products/stream?delay=100' 2>&1 | head -n 50

echo ""
echo "================================"
echo "✅ If you see 'data: {\"product\":{...' above, the stream is working!"
echo "❌ If you see errors, make sure:"
echo "   1. MySQL is running (docker-compose up -d)"
echo "   2. gRPC server is running (npm run server)"
echo "   3. REST gateway is running (npm run gateway)"

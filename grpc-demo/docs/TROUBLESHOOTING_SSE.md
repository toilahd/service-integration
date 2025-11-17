# Troubleshooting EventSource/SSE Issues

## 🔍 Common Issues and Solutions

### Issue 1: EventSource Connection Fails Immediately

**Symptoms:**
- Browser console shows "EventSource failed"
- Network tab shows 404 or route error
- Stream never starts

**Root Cause:**
Express route order was incorrect. The route `/api/products/:id` was matching before `/api/products/stream`, treating "stream" as an ID parameter.

**Solution:** ✅ FIXED
Routes are now ordered correctly:
```javascript
// 1. Specific route first (stream)
app.get('/api/products/stream', ...)

// 2. General list route second
app.get('/api/products', ...)

// 3. Dynamic route last (:id)
app.get('/api/products/:id', ...)
```

### Issue 2: No Data Received in EventSource

**Check:**
1. Is the gRPC server running?
   ```bash
   npm run server
   ```

2. Is the REST gateway running?
   ```bash
   npm run gateway
   ```

3. Is MySQL running with data?
   ```bash
   docker-compose ps
   docker exec -it grpc_mysql mysql -uroot -prootpassword product_service -e "SELECT COUNT(*) FROM products;"
   ```

### Issue 3: CORS Errors

**Symptoms:**
```
Access to resource blocked by CORS policy
```

**Solution:**
The gateway already has CORS enabled:
```javascript
app.use(cors());
res.setHeader('Access-Control-Allow-Origin', '*');
```

If still seeing issues, check browser console for specific CORS error messages.

### Issue 4: Stream Starts But Hangs

**Check:**
1. gRPC server logs for errors
2. Gateway logs for streaming messages
3. Network tab - should show "pending" with partial data

**Debug in Browser:**
```javascript
// Open browser console on stream-demo.html
const es = new EventSource('http://localhost:3000/api/products/stream?delay=500');
es.onopen = () => console.log('Connected');
es.onmessage = (e) => console.log('Data:', e.data);
es.onerror = (e) => console.error('Error:', e, 'State:', es.readyState);
```

### Issue 5: "Stream closed" Error

**Possible Causes:**
1. **Server crashed** - Check terminal for errors
2. **Client timeout** - Browser may close idle connections
3. **Network issue** - Check network connectivity

**Solution:**
EventSource automatically reconnects unless explicitly closed. Check logs for the actual error.

## 🧪 Testing Steps

### Step 1: Test Direct Endpoint
```bash
cd grpc-demo
./test-stream.sh
```

Expected output:
```
data: {"product":{"id":1,"name":"Laptop",...},"index":1,"total":5}

data: {"product":{"id":2,"name":"Mouse",...},"index":2,"total":5}
...
```

### Step 2: Test in Browser Console
```javascript
// Open: http://localhost:3000/stream-demo
// Press F12 for DevTools Console

// Manual test
const es = new EventSource('http://localhost:3000/api/products/stream?delay=300');
let count = 0;
es.onmessage = (e) => {
    count++;
    const data = JSON.parse(e.data);
    console.log(`${count}:`, data);
    if (data.done) {
        console.log('✅ Stream complete!');
        es.close();
    }
};
```

### Step 3: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Start streaming
4. Look for request to `/api/products/stream`
5. Should show "pending" with Type: "eventsource"
6. Click on it to see the streaming data

### Step 4: Check Server Logs

**gRPC Server Terminal:**
```
✓ Streamed product 1/5: Laptop
✓ Streamed product 2/5: Mouse
...
✅ Finished streaming 5 products
```

**Gateway Terminal:**
```
📡 Starting product stream with 500ms delay...
✅ Product stream completed
```

## 🔧 Debugging Checklist

- [ ] MySQL container is running: `docker-compose ps`
- [ ] Database has products: `docker exec -it grpc_mysql mysql -uroot -prootpassword product_service -e "SELECT * FROM products;"`
- [ ] gRPC server is running on port 50051
- [ ] Gateway is running on port 3000
- [ ] No errors in gRPC server logs
- [ ] No errors in gateway logs
- [ ] Browser can access http://localhost:3000/health
- [ ] Network tab shows SSE request as "pending"
- [ ] Console shows EventSource connection opened

## 🚨 Emergency Reset

If everything fails:

```bash
# Stop everything
docker-compose down
pkill -f "node.*server/index.js"
pkill -f "node.*gateway/restGateway.js"

# Clean start
docker-compose up -d
sleep 10

# Terminal 1
npm run server

# Terminal 2
npm run gateway

# Wait 5 seconds, then test
./test-stream.sh
```

## 📊 Expected Behavior

### Correct Flow:
```
Browser → http://localhost:3000/api/products/stream?delay=500
    ↓
Gateway → Receives request, sets SSE headers
    ↓
Gateway → Creates gRPC call to server: StreamProducts({delay_ms: 500})
    ↓
gRPC Server → Fetches products from MySQL
    ↓
gRPC Server → Streams products one by one (call.write)
    ↓
Gateway → Receives each product, writes to HTTP response
    ↓
Browser → EventSource.onmessage fires for each product
    ↓
UI → Product cards appear progressively
    ↓
Server → Calls call.end()
    ↓
Gateway → Writes {"done": true}, ends response
    ↓
Browser → Stream completes, shows success message
```

## 🎯 Key Points

1. **Route Order Matters**: `/api/products/stream` MUST come before `/api/products/:id`
2. **SSE Headers**: Must set `Content-Type: text/event-stream`
3. **Flushing**: Use `res.flush()` if available for immediate sending
4. **Error Handling**: Always handle `call.on('error')` and `req.on('close')`
5. **Client Cleanup**: Always close EventSource when done

## 📞 Still Having Issues?

Check:
1. Gateway logs for route conflicts
2. Browser DevTools Console for errors
3. Network tab for failed requests
4. gRPC server logs for connection issues

Most issues are resolved by:
- Restarting services in order (MySQL → gRPC → Gateway)
- Checking route order in restGateway.js
- Verifying all ports are correct (3306, 50051, 3000)

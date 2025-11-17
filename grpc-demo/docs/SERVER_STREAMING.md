# Server Streaming in gRPC

## 📚 Overview

Server streaming is a gRPC pattern where the client sends a single request to the server and receives a stream of multiple responses. This is useful for scenarios where:

- The server has a large dataset to return
- You want to show progressive results to users
- Real-time updates are needed
- Memory efficiency is important (don't load everything at once)

## 🔄 Communication Pattern

```
Client                          Server
  |                               |
  |------- Single Request ------->|
  |                               |
  |<------ Response 1 ------------|
  |<------ Response 2 ------------|
  |<------ Response 3 ------------|
  |<------ Response 4 ------------|
  |         ...                   |
  |<------ Response N ------------|
  |<------ Stream End ------------|
```

## 🛠️ Implementation Details

### 1. Protocol Buffers Definition

```protobuf
service ProductService {
  // Server Streaming RPC - note the 'stream' keyword before the return type
  rpc StreamProducts(StreamProductsRequest) returns (stream ProductStreamResponse);
}

message StreamProductsRequest {
  int32 delay_ms = 1; // Optional delay between each product
}

message ProductStreamResponse {
  Product product = 1;
  int32 index = 2;      // Current position in stream
  int32 total = 3;      // Total items to stream
}
```

**Key Points:**
- `stream` keyword before the response type indicates server streaming
- The server can send multiple `ProductStreamResponse` messages
- The client receives them one by one as they're sent

### 2. Server Implementation

```javascript
async function streamProducts(call) {
  try {
    const { delay_ms } = call.request;
    const delayMs = delay_ms || 500;

    // Fetch data
    const { products, total } = await Product.findAll(1, 1000);

    // Stream each product one by one
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Write to stream
      call.write({
        product: { /* product data */ },
        index: i + 1,
        total: total
      });

      // Optional delay between items
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // End the stream
    call.end();
  } catch (error) {
    call.emit('error', {
      code: grpc.status.INTERNAL,
      message: 'Internal server error while streaming'
    });
  }
}
```

**Important Methods:**
- `call.write(data)` - Send a single message to the client
- `call.end()` - Close the stream (no more messages)
- `call.emit('error', error)` - Send an error and close stream

### 3. Client Implementation (gRPC)

```javascript
const call = client.StreamProducts({ delay_ms: 500 });

// Handle each streamed message
call.on('data', (response) => {
  console.log(`[${response.index}/${response.total}]`, response.product.name);
});

// Handle stream completion
call.on('end', () => {
  console.log('Stream completed!');
});

// Handle errors
call.on('error', (error) => {
  console.error('Stream error:', error.message);
});
```

**Event Handlers:**
- `'data'` - Fired for each message received
- `'end'` - Fired when stream completes successfully
- `'error'` - Fired when an error occurs

### 4. REST Gateway (Server-Sent Events)

Since browsers don't support gRPC directly, we convert gRPC streaming to Server-Sent Events (SSE):

```javascript
app.get('/api/products/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Create gRPC stream
  const call = client.StreamProducts({ delay_ms: req.query.delay });

  call.on('data', (response) => {
    // Send as SSE event
    res.write(`data: ${JSON.stringify(response)}\n\n`);
  });

  call.on('end', () => {
    res.write('data: {"done": true}\n\n');
    res.end();
  });

  call.on('error', (error) => {
    res.write(`data: {"error": "${error.message}"}\n\n`);
    res.end();
  });
});
```

### 5. Browser Client (EventSource)

```javascript
const eventSource = new EventSource('http://localhost:3000/api/products/stream?delay=500');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.done) {
    eventSource.close();
    return;
  }
  
  if (data.product) {
    // Handle product data
    console.log(data.product);
  }
};

eventSource.onerror = (error) => {
  console.error('Stream error');
  eventSource.close();
};
```

## 🎯 Use Cases

### 1. **Large Dataset Pagination**
Instead of loading all data at once, stream it progressively:
- Better memory usage
- Faster initial response
- Better user experience (progressive loading)

### 2. **Real-Time Updates**
Stream live data to clients:
- Stock prices
- Log files
- Monitoring data
- Chat messages

### 3. **File Transfers**
Stream large files in chunks:
- Download progress
- Memory efficient
- Can resume on error

### 4. **Search Results**
Stream search results as they're found:
- Show results immediately
- Better perceived performance
- Can cancel early if user finds what they need

## ⚡ Performance Benefits

### Traditional Unary RPC (ListProducts)
```
Server: Fetch 1000 products -> Wait -> Send all at once -> Client receives
Timeline: |--------- 2 seconds ---------|
User sees: Nothing -> Everything at 2s
```

### Server Streaming (StreamProducts)
```
Server: Fetch product 1 -> Send -> Fetch product 2 -> Send -> ...
Timeline: |--0.5s--|--0.5s--|--0.5s--|...
User sees: Product 1 at 0.5s, Product 2 at 1s, Product 3 at 1.5s, ...
```

**Advantages:**
- ✅ Progressive rendering (better UX)
- ✅ Lower memory usage on both sides
- ✅ Can cancel mid-stream if needed
- ✅ Perceived performance improvement

## 🆚 Comparison with Other Patterns

| Pattern | Request | Response | Use Case |
|---------|---------|----------|----------|
| **Unary** | Single | Single | Standard CRUD operations |
| **Server Streaming** | Single | Multiple | Large datasets, real-time updates |
| **Client Streaming** | Multiple | Single | File upload, data aggregation |
| **Bidirectional Streaming** | Multiple | Multiple | Chat, real-time collaboration |

## 🧪 Testing

### Test the gRPC Client
```bash
npm run client
# Select option 7: Stream Products
# Enter delay (e.g., 500ms)
```

### Test via Browser
```
Open http://localhost:3000/stream-demo
Click "Start Streaming"
```

### Test Automated
```bash
npm run client
# Select option 8: Run Streaming Test
```

## 🐛 Common Issues & Solutions

### Issue: Stream doesn't close properly
**Solution:** Always call `call.end()` on the server

### Issue: Client doesn't receive all messages
**Solution:** Check for errors, ensure proper event handlers

### Issue: Memory leaks with EventSource
**Solution:** Always close EventSource when done:
```javascript
eventSource.close();
```

### Issue: CORS errors in browser
**Solution:** Enable CORS in REST gateway:
```javascript
app.use(cors());
```

## 📚 Further Reading

- [gRPC Streaming Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

## 🎓 Key Takeaways

1. **Server streaming** = One request, multiple responses
2. Use `stream` keyword in proto definition
3. Server uses `call.write()` to send, `call.end()` to finish
4. Client listens to `'data'`, `'end'`, and `'error'` events
5. For browsers, bridge gRPC streaming to SSE
6. Great for large datasets and real-time updates
7. Better UX with progressive loading

---

Happy Streaming! 🚀

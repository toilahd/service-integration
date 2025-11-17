// Example React component using Server Streaming
// Save this as src/components/ProductStream.jsx in your React app

import React, { useState, useEffect } from 'react';

const ProductStream = () => {
  const [products, setProducts] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [delay, setDelay] = useState(500);

  const startStreaming = () => {
    setProducts([]);
    setStreaming(true);
    setProgress({ current: 0, total: 0 });

    // Connect to Server-Sent Events endpoint
    const eventSource = new EventSource(
      `http://localhost:3000/api/products/stream?delay=${delay}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.done) {
        console.log('Stream completed');
        eventSource.close();
        setStreaming(false);
        return;
      }

      if (data.error) {
        console.error('Stream error:', data.error);
        eventSource.close();
        setStreaming(false);
        return;
      }

      if (data.product) {
        setProducts((prev) => [...prev, data.product]);
        setProgress({ current: data.index, total: data.total });
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      setStreaming(false);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  };

  const stopStreaming = () => {
    setStreaming(false);
  };

  return (
    <div className="product-stream">
      <h2>Product Streaming Demo</h2>

      <div className="controls">
        <label>
          Delay (ms):
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            disabled={streaming}
            min="0"
            max="5000"
            step="100"
          />
        </label>

        <button onClick={startStreaming} disabled={streaming}>
          {streaming ? 'Streaming...' : 'Start Stream'}
        </button>

        <button onClick={stopStreaming} disabled={!streaming}>
          Stop
        </button>
      </div>

      {progress.total > 0 && (
        <div className="progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            >
              {progress.current} / {progress.total}
            </div>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="description">{product.description}</p>
            <div className="product-info">
              <span className="price">${product.price}</span>
              <span className="stock">{product.stock} in stock</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductStream;

/* Add this CSS to your stylesheet */
/*
.product-stream {
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.controls input {
  margin-left: 10px;
  padding: 5px;
  width: 100px;
}

.controls button {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: width 0.3s;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  animation: slideIn 0.5s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card h3 {
  margin-top: 0;
  color: #333;
}

.product-card .description {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.stock {
  color: #4caf50;
  font-size: 14px;
}
*/

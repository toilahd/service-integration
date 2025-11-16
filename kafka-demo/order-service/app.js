import express from 'express';
import orderRoutes from './routes/orderRoutes.js';
import createLogger from '../common/utils/logger.js';

const logger = createLogger('OrderServiceAPI');
const app = express();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

export default app;

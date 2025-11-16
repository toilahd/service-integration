import express from 'express';
import * as orderProducer from '../producers/orderProducer.js';
import createLogger from '../../common/utils/logger.js';

const router = express.Router();
const logger = createLogger('OrderRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    producer: orderProducer.isConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const { customerId, items, totalAmount } = req.body;

    // Validation
    if (!customerId || !items || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required fields: customerId, items, totalAmount'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Items must be a non-empty array'
      });
    }

    const order = await orderProducer.createOrder({ 
      customerId, 
      items, 
      totalAmount 
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    logger.error('Failed to create order', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
});

// Replay events
router.post('/replay', async (req, res) => {
  try {
    const { orderId, fromTimestamp } = req.body;

    if (!fromTimestamp) {
      return res.status(400).json({
        error: 'fromTimestamp is required'
      });
    }

    const replayEvent = await orderProducer.replayEvents(orderId, fromTimestamp);

    res.json({
      message: 'Event replay initiated',
      replayEvent
    });
  } catch (error) {
    logger.error('Failed to replay events', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to replay events',
      message: error.message 
    });
  }
});

export default router;

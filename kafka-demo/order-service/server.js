import app from './app.js';
import { connectProducer, disconnectProducer } from './producers/orderProducer.js';
import createLogger from '../common/utils/logger.js';

const logger = createLogger('OrderService');
const PORT = process.env.PORT || 3000;

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  try {
    await disconnectProducer();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
}

// Start server
async function start() {
  try {
    // Connect Kafka producer
    await connectProducer();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Order Service running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API endpoints: http://localhost:${PORT}/api`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    logger.error('Failed to start server', { 
      error: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  }
}

start();

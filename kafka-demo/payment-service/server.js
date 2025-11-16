import { kafka, TOPICS, CONSUMER_GROUPS } from '../common/config/kafka.js';
import createLogger from '../common/utils/logger.js';
import paymentService from './services/paymentService.js';

const logger = createLogger('PaymentService');

const consumer = kafka.consumer({
  groupId: CONSUMER_GROUPS.PAYMENT_SERVICE,
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

async function run() {
  try {
    await consumer.connect();
    logger.info('Consumer connected');

    await consumer.subscribe({
      topic: TOPICS.ORDER_CREATED,
      fromBeginning: false
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const order = JSON.parse(message.value.toString());
          const headers = message.headers || {};

          logger.info('Received order event', {
            orderId: order.orderId,
            partition,
            offset: message.offset
          });

          // Check if it's a replay event
          if (headers['event-type']?.toString() === 'order.replay') {
            logger.info('Processing replay event', { orderId: order.orderId });
          }

          // Process payment using the service
          const result = await paymentService.processPayment(order);
          
          if (result.success) {
            logger.info('Payment processing completed', {
              orderId: order.orderId,
              transactionId: result.transactionId
            });
          } else {
            logger.warn('Payment failed', {
              orderId: order.orderId,
              message: result.message
            });
          }
        } catch (error) {
          logger.error('Error processing message', { 
            error: error.message, 
            stack: error.stack 
          });
        }
      }
    });
  } catch (error) {
    logger.error('Fatal error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down...');
  await consumer.disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run().catch(error => {
  logger.error('Failed to start consumer', { 
    error: error.message, 
    stack: error.stack 
  });
  process.exit(1);
});

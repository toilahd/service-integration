import { kafka, TOPICS, CONSUMER_GROUPS } from '../common/config/kafka.js';
import createLogger from '../common/utils/logger.js';
import notificationService from './services/notificationService.js';

const logger = createLogger('NotificationService');

const consumer = kafka.consumer({
  groupId: CONSUMER_GROUPS.NOTIFICATION_SERVICE,
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

          logger.info('Received order event', {
            orderId: order.orderId,
            partition,
            offset: message.offset
          });

          // Send notifications using the service
          const result = await notificationService.sendOrderNotifications(order);
          
          if (result.success) {
            logger.info('Notifications sent successfully', {
              orderId: order.orderId
            });
          } else {
            logger.error('Failed to send notifications', {
              orderId: order.orderId,
              error: result.message
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

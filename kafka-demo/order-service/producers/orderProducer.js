import { v4 as uuidv4 } from 'uuid';
import { kafka, TOPICS, initializeTopics } from '../../common/config/kafka.js';
import createLogger from '../../common/utils/logger.js';

const logger = createLogger('OrderProducer');

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});

let isProducerConnected = false;

// Connect producer on startup
export async function connectProducer() {
  try {
    await initializeTopics();
    await producer.connect();
    isProducerConnected = true;
    logger.info('Producer connected successfully');
  } catch (error) {
    logger.error('Failed to connect producer', { 
      error: error.message, 
      stack: error.stack 
    });
    throw error;
  }
}

// Disconnect producer
export async function disconnectProducer() {
  if (isProducerConnected) {
    await producer.disconnect();
    isProducerConnected = false;
    logger.info('Producer disconnected');
  }
}

// Check producer status
export function isConnected() {
  return isProducerConnected;
}

// Create order and publish to Kafka
export async function createOrder(orderData) {
  const { customerId, items, totalAmount } = orderData;

  const order = {
    orderId: uuidv4(),
    customerId,
    items,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  try {
    await producer.send({
      topic: TOPICS.ORDER_CREATED,
      messages: [
        {
          key: order.orderId,
          value: JSON.stringify(order),
          headers: {
            'event-type': 'order.created',
            'event-version': '1.0'
          }
        }
      ]
    });

    logger.info('Order created', { 
      orderId: order.orderId, 
      customerId, 
      totalAmount 
    });

    return order;
  } catch (error) {
    logger.error('Failed to create order', { error: error.message });
    throw error;
  }
}

// Replay events
export async function replayEvents(orderId, fromTimestamp) {
  const replayEvent = {
    type: 'REPLAY',
    orderId,
    fromTimestamp,
    replayedAt: new Date().toISOString()
  };

  try {
    await producer.send({
      topic: TOPICS.ORDER_CREATED,
      messages: [
        {
          key: orderId || 'replay',
          value: JSON.stringify(replayEvent),
          headers: {
            'event-type': 'order.replay',
            'event-version': '1.0'
          }
        }
      ]
    });

    logger.info('Replay event published', { orderId, fromTimestamp });
    return replayEvent;
  } catch (error) {
    logger.error('Failed to replay events', { error: error.message });
    throw error;
  }
}

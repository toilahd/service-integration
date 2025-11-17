// common/config/kafka.js
import { Kafka, logLevel, Partitioners } from 'kafkajs';

// Kafka client configuration
export const kafka = new Kafka({
  clientId: 'service-integration',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

// Topics definitions
export const TOPICS = {
  ORDER_CREATED: 'order.created',
  PAYMENT_PROCESSED: 'payment.processed',
  INVENTORY_UPDATED: 'inventory.updated',
  NOTIFICATION_SENT: 'notification.sent',
};

// Consumer groups
export const CONSUMER_GROUPS = {
  PAYMENT_SERVICE: 'payment-service-group',
  INVENTORY_SERVICE: 'inventory-service-group',
  NOTIFICATION_SERVICE: 'notification-service-group',
};

// Initialize topics
export async function initializeTopics() {
  const admin = kafka.admin();
  await admin.connect();

  try {
    const existingTopics = await admin.listTopics();

    const topicsToCreate = Object.values(TOPICS)
      .filter(topic => !existingTopics.includes(topic))
      .map(topic => ({
        topic,
        numPartitions: 3,
        replicationFactor: 1,
      }));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({ topics: topicsToCreate });
      console.log('Topics created:', topicsToCreate.map(t => t.topic));
    } else {
      console.log('All topics already exist');
    }
  } catch (error) {
    console.error('Error initializing topics:', error);
    throw error;
  } finally {
    await admin.disconnect();
  }
}

// Export a helper to create producers 
export function createProducer() {
  return kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
    createPartitioner: Partitioners.LegacyPartitioner, // silences v2 warning
  });
}

// Export a helper to create consumers
export function createConsumer(groupId) {
  return kafka.consumer({ groupId });
}

import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
    clientId: "service-integration",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    logLevel: logLevel.INFO,
    retry: {
        initialRetryTime: 300,
        retries: 10
    }
})

export const TOPICS = {
    ORDER_CREATED: "order.created",
    PAYMENT_PROCESSED: "payment.processed",
    INVENTORY_UPDATED: "inventory.updated",
    NOTIFICATION_SENT: "notification.sent"
}
export const CONSUMER_GROUPS = {
    PAYMENT_SERVICE: "payment-service-group",
    INVENTORY_SERVICE: "inventory-service-group",
    NOTIFICATION_SERVICE: "notification-service-group"
}
// Initialize topics

export async function initializeTopics() {
    const admin = kafka.admin();
    await admin.connect();

    try {
        const existingTopics = await admin.listTopics();
        const topicsToCreate = Object.values(TOPICS).filter(
            topic => !existingTopics.includes(topic)).map(topic => ({ topic }));
        if (topicsToCreate.length > 0) {
            await admin.createTopics({
                topics: topicsToCreate.map(topic => ({
                    topic,
                    numPartitions: 3,
                    replicationFactor: 1
                }))
            });
            console.log('Topics created:', topicsToCreate);
        } else {
            console.log('All topics already exist');
        }
    } catch (error) {
        console.error('Error initializing topics:', error);
    } finally {
        await admin.disconnect();
    }
}

export { kafka };
import createLogger from '../../common/utils/logger.js';

const logger = createLogger('PaymentService');

class PaymentService {
  async processPayment(order) {
    logger.info('Processing payment', {
      orderId: order.orderId,
      amount: order.totalAmount
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Payment successful', {
        orderId: order.orderId,
        transactionId,
        amount: order.totalAmount
      });

      return {
        success: true,
        orderId: order.orderId,
        transactionId,
        amount: order.totalAmount
      };
    } else {
      logger.warn('Payment failed', {
        orderId: order.orderId,
        amount: order.totalAmount
      });

      return {
        success: false,
        orderId: order.orderId,
        message: 'Payment declined'
      };
    }
  }
}

export default new PaymentService();

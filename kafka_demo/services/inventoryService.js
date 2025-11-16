import createLogger from '../utils/logger.js';

const logger = createLogger('InventoryService');

class InventoryService {
  constructor() {
    // Simple in-memory inventory
    this.inventory = new Map([
      ['item-001', { name: 'Laptop', stock: 100 }],
      ['item-002', { name: 'Mouse', stock: 50 }],
      ['item-003', { name: 'Keyboard', stock: 75 }],
      ['item-004', { name: 'Monitor', stock: 30 }],
      ['item-005', { name: 'Webcam', stock: 20 }]
    ]);
  }

  async reserveItems(order) {
    logger.info('Checking inventory', { orderId: order.orderId });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if all items are available
    for (const item of order.items) {
      const product = this.inventory.get(item.productId);
      
      if (!product) {
        logger.warn('Product not found', { productId: item.productId });
        return {
          success: false,
          orderId: order.orderId,
          message: `Product ${item.productId} not found`
        };
      }

      if (product.stock < item.quantity) {
        logger.warn('Insufficient stock', {
          productId: item.productId,
          requested: item.quantity,
          available: product.stock
        });
        return {
          success: false,
          orderId: order.orderId,
          message: `Insufficient stock for ${product.name}`
        };
      }
    }

    // Deduct stock
    for (const item of order.items) {
      const product = this.inventory.get(item.productId);
      product.stock -= item.quantity;
      
      logger.info('Stock updated', {
        productId: item.productId,
        deducted: item.quantity,
        remaining: product.stock
      });
    }

    logger.info('Inventory reserved successfully', { orderId: order.orderId });
    
    return {
      success: true,
      orderId: order.orderId,
      message: 'Inventory reserved successfully'
    };
  }
}

export default new InventoryService();

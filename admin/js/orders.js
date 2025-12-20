/**
 * Order Management
 * Handles order creation and management after Stripe checkout
 */

/**
 * Create order in Firestore after successful payment
 * @param {Object} orderData - Order data from Stripe checkout
 * @returns {Promise<string>} Order ID
 */
async function createOrder(orderData) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized');
    }

    const ordersCollection = window.firebaseDb.collection('orders');

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Prepare order document
    const orderDoc = {
      orderNumber,
      customerId: orderData.customerId || null,
      products: orderData.products || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total || 0,
      status: 'pending', // pending, processing, shipped, delivered, cancelled
      paymentStatus: 'paid', // paid, pending, failed, refunded
      stripeSessionId: orderData.stripeSessionId || null,
      stripePaymentIntentId: orderData.stripePaymentIntentId || null,
      shippingAddress: orderData.shippingAddress || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Create order in Firestore
    const docRef = await ordersCollection.add(orderDoc);
    const orderId = docRef.id;

    // Track order creation event
    if (window.analytics) {
      window.analytics.trackEcommerceEvent('order_create', orderData.total, 'AUD', {
        order_id: orderId,
        order_number: orderNumber,
        customer_id: orderData.customerId || null,
        item_count: orderData.products.length,
        total: orderData.total
      });
    }

    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXXX
 * @returns {string}
 */
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

/**
 * Update order status
 * @param {string} orderId - Order document ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 */
async function updateOrderStatus(orderId, status, additionalData = {}) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized');
    }

    const updateData = {
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };

    await window.firebaseDb.collection('orders').doc(orderId).update(updateData);

    // Track order status change
    if (window.analytics) {
      window.analytics.trackEvent('order_status_change', {
        order_id: orderId,
        new_status: status
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get order by ID
 * @param {string} orderId - Order document ID
 * @returns {Promise<Object>}
 */
async function getOrder(orderId) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized');
    }

    const doc = await window.firebaseDb.collection('orders').doc(orderId).get();
    
    if (!doc.exists) {
      throw new Error('Order not found');
    }

    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

/**
 * Get orders for a customer
 * @param {string} customerId - Customer user ID
 * @returns {Promise<Array>}
 */
async function getCustomerOrders(customerId) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized');
    }

    const snapshot = await window.firebaseDb
      .collection('orders')
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting customer orders:', error);
    throw error;
  }
}

// Export functions to global scope
window.orderManagement = {
  createOrder,
  updateOrderStatus,
  getOrder,
  getCustomerOrders,
  generateOrderNumber
};


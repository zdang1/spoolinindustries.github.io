/**
 * Stripe Webhook Handler (Cloud Function)
 * 
 * This file provides the structure for a Firebase Cloud Function
 * that handles Stripe webhook events for payment confirmations.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Firebase Functions SDK: npm install -g firebase-tools
 * 2. Initialize Functions: firebase init functions
 * 3. Install Stripe SDK: cd functions && npm install stripe
 * 4. Deploy: firebase deploy --only functions
 * 
 * WEBHOOK CONFIGURATION:
 * 1. Go to Stripe Dashboard > Developers > Webhooks
 * 2. Add endpoint: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook
 * 3. Select events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
 * 4. Copy webhook signing secret to Firestore integrations/stripe/webhookSecret
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

/**
 * Stripe Webhook Handler
 * Handles payment events from Stripe
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Get webhook secret from Firestore
    const configDoc = await admin.firestore()
      .collection('integrations')
      .doc('stripe')
      .get();

    if (!configDoc.exists || !configDoc.data().webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    const webhookSecret = configDoc.data().webhookSecret;

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).send('Error processing webhook');
  }
});

/**
 * Handle checkout session completed
 * Create order in Firestore when payment is successful
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    const db = admin.firestore();
    const ordersCollection = db.collection('orders');

    // Check if order already exists
    const existingOrder = await ordersCollection
      .where('stripeSessionId', '==', session.id)
      .limit(1)
      .get();

    if (!existingOrder.empty) {
      console.log('Order already exists for session:', session.id);
      return;
    }

    // Retrieve line items from Stripe
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // Prepare products array
    const products = lineItems.data.map(item => ({
      productId: item.price.product,
      name: item.description,
      price: item.price.unit_amount / 100, // Convert from cents
      quantity: item.quantity,
      total: (item.price.unit_amount / 100) * item.quantity
    }));

    // Calculate totals
    const subtotal = products.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // Calculate tax if needed
    const shipping = 0; // Get from session if available
    const total = session.amount_total / 100; // Convert from cents

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Create order document
    const orderData = {
      orderNumber,
      customerId: session.customer || session.client_reference_id || null,
      products,
      subtotal,
      tax,
      shipping,
      total,
      status: 'processing',
      paymentStatus: 'paid',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent || null,
      shippingAddress: session.shipping_details || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ordersCollection.add(orderData);

    console.log('Order created for session:', session.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * Handle payment intent succeeded
 * Update order payment status
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const db = admin.firestore();
    const ordersCollection = db.collection('orders');

    // Find order by payment intent ID
    const orderQuery = await ordersCollection
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!orderQuery.empty) {
      const orderDoc = orderQuery.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'paid',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Order payment status updated:', orderDoc.id);
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

/**
 * Handle payment intent failed
 * Update order payment status
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const db = admin.firestore();
    const ordersCollection = db.collection('orders');

    // Find order by payment intent ID
    const orderQuery = await ordersCollection
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!orderQuery.empty) {
      const orderDoc = orderQuery.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'failed',
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Order payment failed:', orderDoc.id);
    }
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}


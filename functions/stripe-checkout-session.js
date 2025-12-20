/**
 * Stripe Checkout Session Creation (Cloud Function)
 * 
 * This Cloud Function creates a Stripe Checkout Session for payment processing.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Firebase Functions SDK: npm install -g firebase-tools
 * 2. Initialize Functions: firebase init functions
 * 3. Install Stripe SDK: cd functions && npm install stripe
 * 4. Set Stripe secret key: firebase functions:config:set stripe.secret_key="sk_test_..."
 * 5. Deploy: firebase deploy --only functions
 * 
 * ENDPOINT:
 * POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/createCheckoutSession
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

/**
 * Create Stripe Checkout Session
 * 
 * Request body:
 * {
 *   "lineItems": [
 *     {
 *       "price_data": {
 *         "currency": "aud",
 *         "product_data": {
 *           "name": "Product Name",
 *           "description": "Product Description",
 *           "images": ["https://..."]
 *         },
 *         "unit_amount": 29999
 *       },
 *       "quantity": 1
 *     }
 *   ],
 *   "successUrl": "https://example.com/shop.html?checkout=success&session_id={CHECKOUT_SESSION_ID}",
 *   "cancelUrl": "https://example.com/shop.html?checkout=cancelled",
 *   "mode": "test" // or "live"
 * }
 */
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { lineItems, successUrl, cancelUrl, mode } = req.body;

    // Validate input
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      res.status(400).json({ error: 'lineItems is required and must be a non-empty array' });
      return;
    }

    if (!successUrl || !cancelUrl) {
      res.status(400).json({ error: 'successUrl and cancelUrl are required' });
      return;
    }

    // Get customer ID from request if authenticated
    let customerId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        customerId = decodedToken.uid;
      }
    } catch (authError) {
      // Not authenticated - continue without customer ID
      console.log('User not authenticated, proceeding without customer ID');
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerId ? null : undefined, // Will be collected in checkout if not provided
      client_reference_id: customerId || undefined,
      metadata: {
        mode: mode || 'test',
        created_at: new Date().toISOString()
      },
      shipping_address_collection: {
        allowed_countries: ['AU', 'NZ', 'US', 'GB'], // Add more countries as needed
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // $10.00 in cents
              currency: 'aud',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping
              currency: 'aud',
            },
            display_name: 'Free Shipping (Orders over $100)',
          },
        },
      ],
    });

    // Return session URL
    res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});


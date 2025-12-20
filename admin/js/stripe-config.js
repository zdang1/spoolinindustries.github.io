/**
 * Stripe Configuration and Integration
 * Handles Stripe Checkout session creation and configuration management
 */

// Stripe configuration loaded from Firestore
let stripeConfig = {
  publishableKey: null,
  mode: 'test', // 'test' or 'live'
  enabled: false
};

// Stripe instance (will be initialized when publishable key is loaded)
let stripe = null;

/**
 * Initialize Stripe configuration
 * Loads configuration from Firestore integrations/stripe document
 */
async function initStripeConfig() {
  try {
    if (!window.firebaseDb) {
      console.warn('Firestore not initialized. Stripe configuration cannot be loaded.');
      return false;
    }

    const configDoc = await window.firebaseDb
      .collection('integrations')
      .doc('stripe')
      .get();

    if (configDoc.exists) {
      const data = configDoc.data();
      stripeConfig = {
        publishableKey: data.publishableKey || null,
        mode: data.mode || 'test',
        enabled: data.enabled !== false // Default to enabled if not specified
      };

      // Initialize Stripe.js if publishable key is available
      if (stripeConfig.publishableKey && stripeConfig.enabled) {
        await loadStripeJS();
      }
    } else {
      console.info('Stripe configuration not found. Stripe checkout is disabled.');
      stripeConfig.enabled = false;
    }

    return stripeConfig.enabled;
  } catch (error) {
    console.error('Error loading Stripe configuration:', error);
    return false;
  }
}

/**
 * Load Stripe.js library dynamically
 */
async function loadStripeJS() {
  return new Promise((resolve, reject) => {
    // Check if Stripe.js is already loaded
    if (window.Stripe && stripeConfig.publishableKey) {
      stripe = window.Stripe(stripeConfig.publishableKey);
      resolve(stripe);
      return;
    }

    // Load Stripe.js from CDN
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if (window.Stripe && stripeConfig.publishableKey) {
        stripe = window.Stripe(stripeConfig.publishableKey);
        resolve(stripe);
      } else {
        reject(new Error('Stripe.js loaded but Stripe object not available'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Stripe.js'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Get Firebase region (defaults to us-central1)
 * @returns {string}
 */
function getRegion() {
  // Default region - update if your functions are in a different region
  return 'us-central1';
}

/**
 * Get Stripe configuration
 * @returns {Object} Stripe configuration object
 */
function getStripeConfig() {
  return { ...stripeConfig };
}

/**
 * Check if Stripe is enabled and configured
 * @returns {boolean}
 */
function isStripeEnabled() {
  return stripeConfig.enabled && !!stripeConfig.publishableKey && !!stripe;
}

/**
 * Create Stripe Checkout Session
 * This function should be called from a server-side endpoint (Cloud Function)
 * For now, this is a placeholder structure
 * 
 * @param {Object} cartItems - Array of cart items
 * @param {string} successUrl - URL to redirect to on success
 * @param {string} cancelUrl - URL to redirect to on cancel
 * @returns {Promise<string>} Checkout session URL
 */
async function createCheckoutSession(cartItems, successUrl, cancelUrl) {
  if (!isStripeEnabled()) {
    throw new Error('Stripe is not enabled or not properly configured');
  }

  try {
    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price || 0) * item.quantity);
    }, 0);

    // Prepare line items for Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.product.name,
          description: item.product.description || '',
          images: item.product.images && item.product.images.length > 0
            ? [item.product.images.find(img => img.isPrimary)?.url || item.product.images[0].url]
            : []
        },
        unit_amount: Math.round(parseFloat(item.product.price || 0) * 100) // Convert to cents
      },
      quantity: item.quantity
    }));

    // Call Cloud Function to create checkout session
    // The Cloud Function endpoint should be deployed and accessible
    // Get project ID from Firebase config
    let projectId = 'spoolin-industries'; // Default
    try {
      if (window.firebaseApp && window.firebaseApp.options) {
        projectId = window.firebaseApp.options.projectId;
      } else if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
        projectId = window.firebase.apps[0].options.projectId;
      }
    } catch (e) {
      console.warn('Could not get project ID, using default:', e);
    }
    
    const functionsUrl = `https://${getRegion()}-${projectId}.cloudfunctions.net/createCheckoutSession`;
    
    // Get auth token if user is authenticated
    let authToken = null;
    try {
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        authToken = await window.firebaseAuth.currentUser.getIdToken();
      }
    } catch (authError) {
      console.warn('Could not get auth token:', authError);
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(functionsUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        lineItems,
        successUrl,
        cancelUrl,
        mode: stripeConfig.mode
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Handle checkout success redirect
 * Extracts session ID from URL and creates order in Firestore
 * @param {string} sessionId - Stripe Checkout Session ID
 */
async function handleCheckoutSuccess(sessionId) {
  try {
    // This will be handled by orders.js
    // For now, just track the event
    if (window.analytics) {
      window.analytics.trackEvent('checkout_complete', {
        stripe_session_id: sessionId
      });
    }

    // Redirect to success page or show success message
    // The actual order creation should happen via webhook or in orders.js
  } catch (error) {
    console.error('Error handling checkout success:', error);
    throw error;
  }
}

/**
 * Handle checkout cancel redirect
 */
function handleCheckoutCancel() {
  // Track cancellation
  if (window.analytics) {
    window.analytics.trackEvent('checkout_cancelled', {});
  }

  // Redirect back to cart or shop
  window.location.href = 'shop.html';
}

// Export functions to global scope
window.stripeConfig = {
  init: initStripeConfig,
  getConfig: getStripeConfig,
  isEnabled: isStripeEnabled,
  createCheckoutSession,
  handleCheckoutSuccess,
  handleCheckoutCancel,
  getStripe: () => stripe
};


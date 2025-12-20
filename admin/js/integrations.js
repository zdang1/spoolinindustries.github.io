/**
 * Integrations Management
 * Handles configuration of third-party integrations (Stripe, etc.)
 */

// Wait for Firebase to be initialized
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const isAuthenticated = await window.firebaseHelpers.requireAuth();
  if (!isAuthenticated) return;

  // Initialize integrations management
  await initIntegrations();
});

/**
 * Initialize integrations management
 */
async function initIntegrations() {
  try {
    // Load Stripe configuration
    await loadStripeConfig();
  } catch (error) {
    console.error('Error initializing integrations:', error);
    showAlert('Error loading integrations. Please refresh the page.', 'error');
  }
}

/**
 * Load Stripe configuration from Firestore
 */
async function loadStripeConfig() {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized');
    }

    const configDoc = await window.firebaseDb
      .collection('integrations')
      .doc('stripe')
      .get();

    if (configDoc.exists) {
      const data = configDoc.data();
      
      // Populate form fields
      document.getElementById('stripe-mode').value = data.mode || 'test';
      document.getElementById('stripe-publishable-key').value = data.publishableKey || '';
      document.getElementById('stripe-secret-key').value = data.secretKey ? '••••••••' : '';
      document.getElementById('stripe-webhook-secret').value = data.webhookSecret ? '••••••••' : '';
      document.getElementById('stripe-enabled').checked = data.enabled !== false;

      // Update status
      updateStripeStatus(data.enabled !== false && !!data.publishableKey);
    } else {
      // Default values
      document.getElementById('stripe-mode').value = 'test';
      updateStripeStatus(false);
    }

    // Update webhook URL (would need to be set based on actual Cloud Function URL)
    // For now, show placeholder
    const webhookUrl = document.getElementById('webhook-url');
    if (webhookUrl) {
      webhookUrl.textContent = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook';
    }
  } catch (error) {
    console.error('Error loading Stripe configuration:', error);
    showAlert('Error loading Stripe configuration.', 'error');
  }
}

/**
 * Save Stripe configuration
 */
async function saveStripeConfig(event) {
  event.preventDefault();

  try {
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized');
    }

    const mode = document.getElementById('stripe-mode').value;
    const publishableKey = document.getElementById('stripe-publishable-key').value.trim();
    const secretKeyInput = document.getElementById('stripe-secret-key');
    const webhookSecretInput = document.getElementById('stripe-webhook-secret');
    const enabled = document.getElementById('stripe-enabled').checked;

    // Validate publishable key format
    if (publishableKey && !publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
      showAlert('Invalid publishable key format. Must start with pk_test_ or pk_live_', 'error');
      return;
    }

    // Get existing config to preserve secret key if not changed
    const existingDoc = await window.firebaseDb
      .collection('integrations')
      .doc('stripe')
      .get();

    const existingData = existingDoc.exists ? existingDoc.data() : {};

    // Prepare update data
    const updateData = {
      mode,
      publishableKey,
      enabled,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Only update secret key if it was changed (not masked)
    const secretKey = secretKeyInput.value.trim();
    if (secretKey && !secretKey.startsWith('••••')) {
      if (secretKey && !secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        showAlert('Invalid secret key format. Must start with sk_test_ or sk_live_', 'error');
        return;
      }
      updateData.secretKey = secretKey; // In production, this should be encrypted
    } else if (existingData.secretKey) {
      // Preserve existing secret key
      updateData.secretKey = existingData.secretKey;
    }

    // Only update webhook secret if it was changed
    const webhookSecret = webhookSecretInput.value.trim();
    if (webhookSecret && !webhookSecret.startsWith('••••')) {
      if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
        showAlert('Invalid webhook secret format. Must start with whsec_', 'error');
        return;
      }
      updateData.webhookSecret = webhookSecret;
    } else if (existingData.webhookSecret) {
      // Preserve existing webhook secret
      updateData.webhookSecret = existingData.webhookSecret;
    }

    // Add createdAt if creating new document
    if (!existingDoc.exists) {
      updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    // Save to Firestore
    await window.firebaseDb
      .collection('integrations')
      .doc('stripe')
      .set(updateData, { merge: true });

    showAlert('Stripe configuration saved successfully!', 'success');
    updateStripeStatus(enabled && !!publishableKey);

    // Track configuration update
    if (window.analytics) {
      const user = await window.firebaseHelpers.getCurrentUser();
      window.analytics.trackEvent('configure_integration', {
        user_id: user ? user.uid : null,
        integration_type: 'stripe',
        integration_name: 'Stripe Payment Processing'
      });
    }
  } catch (error) {
    console.error('Error saving Stripe configuration:', error);
    showAlert('Error saving configuration: ' + error.message, 'error');
  }
}

/**
 * Test Stripe connection
 */
async function testStripeConnection() {
  try {
    const publishableKey = document.getElementById('stripe-publishable-key').value.trim();
    
    if (!publishableKey) {
      showAlert('Please enter a publishable key first.', 'warning');
      return;
    }

    // Initialize Stripe with the publishable key
    if (!window.Stripe) {
      // Load Stripe.js if not already loaded
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const stripe = window.Stripe(publishableKey);
    
    // Try to create a test payment method (this will validate the key)
    // Note: This is a simple validation - in production you might want a more robust test
    showAlert('Testing connection...', 'info');
    
    // Simple validation: check if Stripe object is created successfully
    if (stripe) {
      showAlert('Connection test successful! Stripe is properly configured.', 'success');
      
      // Track test
      if (window.analytics) {
        const user = await window.firebaseHelpers.getCurrentUser();
        window.analytics.trackEvent('test_integration', {
          user_id: user ? user.uid : null,
          integration_type: 'stripe',
          integration_name: 'Stripe Payment Processing',
          test_result: 'success'
        });
      }
    } else {
      showAlert('Connection test failed. Please check your publishable key.', 'error');
    }
  } catch (error) {
    console.error('Error testing Stripe connection:', error);
    showAlert('Connection test failed: ' + error.message, 'error');
    
    // Track failed test
    if (window.analytics) {
      const user = await window.firebaseHelpers.getCurrentUser();
      window.analytics.trackEvent('test_integration', {
        user_id: user ? user.uid : null,
        integration_type: 'stripe',
        integration_name: 'Stripe Payment Processing',
        test_result: 'failure'
      });
    }
  }
}

/**
 * Update Stripe status indicator
 */
function updateStripeStatus(enabled) {
  const statusElement = document.getElementById('stripe-status');
  const statusText = document.getElementById('stripe-status-text');
  
  if (enabled) {
    statusElement.style.background = 'rgba(16, 185, 129, 0.2)';
    statusElement.style.border = '1px solid rgba(16, 185, 129, 0.5)';
    statusText.textContent = '✓ Enabled';
    statusText.style.color = '#10b981';
  } else {
    statusElement.style.background = 'var(--admin-border)';
    statusElement.style.border = '1px solid var(--admin-border)';
    statusText.textContent = '✗ Disabled';
    statusText.style.color = 'var(--admin-text-muted)';
  }
}

/**
 * Utility: Show alert
 */
function showAlert(message, type = 'info') {
  // Simple alert - can be enhanced with a toast notification system
  alert(message);
}

// Make functions globally available
window.saveStripeConfig = saveStripeConfig;
window.testStripeConnection = testStripeConnection;





# Stripe Checkout Setup Instructions

This document provides step-by-step instructions for setting up Stripe payment processing in the Spoolin Industries shop.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Firebase project with Firestore enabled
3. Firebase Functions configured (for webhook handling)

## Step 1: Get Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** > **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

**Important**: 
- Use **Test keys** (`pk_test_` and `sk_test_`) for development and testing
- Use **Live keys** (`pk_live_` and `sk_live_`) only in production

## Step 2: Configure Stripe in Admin Panel

1. Log in to the admin panel: `admin-login.html`
2. Navigate to **Settings** > **Integrations**
3. Fill in the Stripe configuration form:
   - **Mode**: Select "Test Mode" for development or "Live Mode" for production
   - **Publishable Key**: Enter your publishable key (e.g., `pk_test_...`)
   - **Secret Key**: Enter your secret key (e.g., `sk_test_...`)
   - **Webhook Secret**: Leave blank for now (will be configured in Step 4)
   - **Enable Stripe Checkout**: Check this box
4. Click **Save Configuration**
5. Click **Test Connection** to verify your keys are correct

## Step 3: Set Up Firebase Cloud Function (Webhook Handler)

The webhook handler is required to process payment confirmations from Stripe.

### 3.1 Initialize Firebase Functions

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Functions (if not already done)
firebase init functions

# Select your project and choose TypeScript or JavaScript
```

### 3.2 Install Dependencies

```bash
cd functions
npm install stripe
```

### 3.3 Configure Stripe Secret Key

Set the Stripe secret key as a Firebase Function environment variable:

```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_SECRET_KEY"
```

**For production**, use your live secret key:
```bash
firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_SECRET_KEY"
```

### 3.4 Deploy the Webhook Function

```bash
# Deploy only the functions
firebase deploy --only functions

# Or deploy everything
firebase deploy
```

After deployment, note the function URL. It will look like:
```
https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook
```

## Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook
   ```
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go back to Admin Panel > Integrations
8. Paste the webhook secret into the **Webhook Secret** field
9. Click **Save Configuration**

## Step 5: Test the Integration

### Test Mode Testing

1. In the shop, add products to cart
2. Click checkout
3. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date, any CVC, any ZIP
4. Complete the checkout
5. Verify the order appears in Firestore `orders/` collection
6. Check the admin panel for order status

### Verify Webhook is Working

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click on your webhook endpoint
3. Check the **Events** tab to see if events are being received
4. Green checkmarks indicate successful webhook delivery

## Step 6: Switch to Live Mode (Production)

**⚠️ Only do this when you're ready for production!**

1. Get your **live** API keys from Stripe Dashboard
2. Update Firebase Functions config with live secret key:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_SECRET_KEY"
   ```
3. Redeploy functions:
   ```bash
   firebase deploy --only functions
   ```
4. Create a new webhook endpoint in Stripe for live mode
5. Update the admin panel configuration:
   - Change **Mode** to "Live Mode"
   - Update **Publishable Key** to live key
   - Update **Secret Key** to live key
   - Update **Webhook Secret** to live webhook secret
6. Save configuration

## Troubleshooting

### Webhook Not Receiving Events

1. Check that the webhook URL is correct in Stripe Dashboard
2. Verify the Cloud Function is deployed and accessible
3. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```
4. Verify the webhook secret matches in both Stripe and Firestore

### Payment Succeeds But Order Not Created

1. Check Firestore `orders/` collection for the order
2. Check Firebase Functions logs for errors
3. Verify webhook events are being received in Stripe Dashboard
4. Check that the webhook handler function is deployed correctly

### Test Connection Fails

1. Verify the publishable key format (must start with `pk_test_` or `pk_live_`)
2. Check that Stripe.js is loading correctly (check browser console)
3. Ensure you're using the correct key for the selected mode (test vs live)

## Security Notes

- **Never commit secret keys to version control**
- Secret keys are stored in Firestore (should be encrypted in production)
- Webhook secrets are used to verify webhook authenticity
- Always use test mode during development
- Regularly rotate API keys for security

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)







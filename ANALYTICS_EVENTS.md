# Analytics Events Tracking Guide

This document explains how analytics event tracking works in the Spoolin Industries website and admin panel.

## Overview

Analytics events are tracked using a dual-storage approach:
1. **Firebase Analytics (GA4)**: Standard analytics platform for standard reports
2. **Firestore**: Custom event storage for advanced queries and analysis

All events are stored in both systems automatically via the `analytics.js` helper utility.

## Event Naming Convention

All event names use `snake_case` format:
- ✅ `product_view`
- ✅ `add_to_cart`
- ✅ `admin_login`
- ❌ `productView` (camelCase)
- ❌ `add-to-cart` (kebab-case)

## Using the Analytics Helper

### Basic Event Tracking

```javascript
// Track a simple event
window.analytics.trackEvent('product_view', {
  product_id: 'prod_123',
  product_name: 'Custom Exhaust System',
  product_price: 299.99
});
```

### E-commerce Events (with Value)

```javascript
// Track purchase with monetary value
window.analytics.trackEcommerceEvent('purchase', 299.99, 'AUD', {
  transaction_id: 'txn_123',
  items: [
    { product_id: 'prod_123', quantity: 1 }
  ]
});
```

### Page Views

```javascript
// Track page view
window.analytics.trackPageView('shop_page', {
  category: 'products'
});
```

### Error Tracking

```javascript
// Track errors
window.analytics.trackError('firestore_error', 'Failed to load products', {
  collection: 'products',
  error_code: 'permission-denied'
});
```

## Implemented Events

### Public Website Events

#### Quote Request Form (`index.html`)
- `quote_request_start` - User starts the quote form
- `quote_request_service_select` - User selects a service type
- `quote_request_budget_change` - User adjusts budget slider
- `quote_request_step_view` - User views a form step
- `quote_request_submit` - User submits the quote form

#### Shop Page (`shop.html`)
- `product_view` - User views a product detail modal
- `add_to_cart` - User adds product to cart
- `cart_item_remove` - User removes item from cart
- `add_to_wishlist` - User adds product to wishlist
- `share_product` - User shares a product

#### Navigation
- `call_click` - User clicks phone number
- `email_click` - User clicks email address
- `map_click` - User clicks map link

### Admin Panel Events

#### Authentication
- `admin_login` - Admin logs in
- `admin_logout` - Admin logs out
- `admin_login_failed` - Login attempt failed

#### Products Management
- `create_product` - Admin creates a product
- `update_product` - Admin updates a product
- `delete_product` - Admin deletes a product
- `product_image_upload` - Images uploaded for a product

#### Dashboard
- `admin_dashboard_view` - Admin views dashboard

## Viewing Events

### Admin Event Explorer

1. Log in to admin panel
2. Navigate to **Analytics** > **Event Explorer**
3. Use filters to find specific events:
   - Event name
   - Date range
   - User ID
4. View event details by clicking "View" on any event
5. Export events as CSV or JSON

### Funnel Analysis

1. Go to **Event Explorer** > **Funnel Analysis** tab
2. Select a funnel:
   - **Lead to Quote**: `quote_request_start` → `quote_request_submit`
   - **Quote to Job**: `quote_accepted` → `create_job` (when implemented)
   - **Job to Invoice**: `job_complete` → `create_invoice` (when implemented)
3. Select date range
4. View conversion rates and drop-off points

## Adding New Events

### Step 1: Define the Event

Choose a descriptive `snake_case` name and document it in `analytics-events-reference.md`.

### Step 2: Add Tracking Code

```javascript
// Example: Track when user filters products
if (window.analytics) {
  window.analytics.trackEvent('product_filter_applied', {
    filter_type: 'category',
    filter_value: 'engine'
  });
}
```

### Step 3: Include Relevant Parameters

Always include:
- Entity IDs (product_id, order_id, etc.)
- Action context (category, status, etc.)
- Monetary values (for e-commerce events)

**Never include PII** (names, emails, phone numbers, addresses)

### Step 4: Test the Event

1. Trigger the event in the application
2. Check Admin Panel > Event Explorer
3. Verify the event appears with correct parameters

## Event Parameters Best Practices

### ✅ Good Parameters

```javascript
{
  product_id: 'prod_123',
  product_category: 'engine',
  product_price: 299.99,
  quantity: 2,
  user_id: 'user_abc123' // Anonymized user ID
}
```

### ❌ Bad Parameters (PII)

```javascript
{
  customer_name: 'John Doe', // ❌ Don't include names
  customer_email: 'john@example.com', // ❌ Don't include emails
  customer_phone: '0417123456', // ❌ Don't include phone numbers
  shipping_address: '123 Main St' // ❌ Don't include addresses
}
```

## Firestore Collection Structure

Events are stored in `analyticsEvents/` collection with the following structure:

```javascript
{
  eventName: 'product_view',
  params: {
    product_id: 'prod_123',
    product_name: 'Custom Exhaust',
    product_price: 299.99
  },
  userId: 'user_abc123', // or null for anonymous
  sessionId: 'session_xyz789',
  timestamp: Timestamp,
  pageUrl: 'https://example.com/shop.html',
  userAgent: 'Mozilla/5.0...',
  createdAt: Timestamp
}
```

## Querying Events in Code

```javascript
// Get all product views in the last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const snapshot = await window.firebaseDb
  .collection('analyticsEvents')
  .where('eventName', '==', 'product_view')
  .where('timestamp', '>=', sevenDaysAgo)
  .orderBy('timestamp', 'desc')
  .get();

snapshot.forEach(doc => {
  const event = doc.data();
  console.log('Product viewed:', event.params.product_name);
});
```

## Security Rules

Events can be written by authenticated users and read by admins only. See `firestore.rules` for details.

## Performance Considerations

- Events are written asynchronously and won't block the UI
- Firestore write limits apply (20,000 writes/day on free tier)
- Consider batching events for high-volume scenarios

## Troubleshooting

### Events Not Appearing

1. Check browser console for errors
2. Verify `analytics.js` is loaded before tracking code
3. Check Firestore security rules allow writes
4. Verify user is authenticated (for admin events)

### Events Missing Parameters

1. Check that parameters object is properly formatted
2. Verify parameters don't contain invalid types (functions, undefined)
3. Check Firestore rules allow the data structure

### High Firestore Costs

1. Consider implementing event sampling for high-volume events
2. Archive old events to reduce collection size
3. Use Firebase Analytics (GA4) for standard reports instead of Firestore queries





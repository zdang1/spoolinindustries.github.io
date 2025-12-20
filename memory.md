# Spoolin Industries - Project Memory

## 2025-01-XX - Collapsible Admin Navigation Sections

### What Changed
- **Implemented**: Collapsible navigation sections in admin panel
- **Feature**: All navigation sections (Sales Pipeline, Production, Customers, etc.) are collapsed by default
- **Interaction**: Click section headers to expand/collapse subcategories
- **Visual**: Chevron icons indicate collapsed/expanded state

### Files Created
- `admin/js/navigation.js` - Navigation collapse/expand functionality

### Files Modified
- `admin/css/admin.css`:
  - Added styles for `.admin-nav-section` (hover effects, cursor pointer)
  - Added styles for `.admin-nav-submenu` (collapsible container)
- All admin pages (`admin-*.html`):
  - Added `<script src="admin/js/navigation.js"></script>` after firebase-config.js
  - Pages updated: admin-dashboard.html, admin-products.html, admin-events.html, admin-integrations.html, admin-leads.html, admin-jobs.html, admin-customers.html, admin-inventory.html, admin-reports.html, admin-users.html, admin-quotes.html, admin-invoices.html, admin-schedule.html, admin-time.html, admin-qa.html, admin-warranty.html, admin-vehicles.html, admin-categories.html, admin-suppliers.html, admin-purchase-orders.html, admin-health.html, admin-templates.html, admin-audit.html, admin-orders.html, admin-services.html

### Key Features
- **Default State**: All sections collapsed on page load
- **Chevron Icons**: Rotate from -90deg (collapsed, pointing right) to 0deg (expanded, pointing down)
- **Smooth Transitions**: CSS transitions for expand/collapse animations
- **Click to Toggle**: Section headers are clickable and toggle their submenu
- **Automatic Wrapping**: JavaScript automatically wraps nav items under each section in a submenu container

### Technical Details
- Uses `data-collapsed` attribute to track state
- Dynamically creates `.admin-nav-submenu` containers for each section
- Finds all `.admin-nav-item` elements between section headers and dividers
- Preserves existing navigation structure and styling

---

## 2025-01-XX - Stripe Checkout Integration Complete

### What Changed
- **Implemented**: Complete Stripe Checkout integration in shop.html
- **Created**: Cart modal UI with full shopping cart functionality
- **Implemented**: Checkout flow with Stripe session creation
- **Implemented**: Checkout success and cancel redirect handling
- **Created**: Cloud Function for checkout session creation
- **Status**: All components ready - waiting for Stripe keys to be added

### Files Created
- `functions/stripe-checkout-session.js` - Cloud Function for creating Stripe Checkout sessions

### Files Modified
- `shop.html`:
  - Added cart modal HTML structure (items list, totals, checkout button)
  - Added cart modal JavaScript functions (open, close, render, update quantities, calculate totals)
  - Added Stripe initialization on page load
  - Added checkout flow with session creation and redirect
  - Added checkout success/cancel redirect handlers
  - Updated `handlePurchase()` to add to cart and open cart modal
  - Updated cart icon to open modal instead of navigating to cart.html
  - Added cart modal CSS styles
  - Added cart modal event listeners
- `admin/js/stripe-config.js`:
  - Updated `createCheckoutSession()` to call Cloud Function endpoint
  - Added `getRegion()` helper function
  - Added proper error handling and auth token support

### Key Features Implemented

#### 1. Cart Modal
- **UI**: Full cart modal with product images, names, prices, quantity controls
- **Functionality**: Add/remove items, update quantities, view totals
- **Empty State**: Shows message when cart is empty
- **Totals Calculation**: Subtotal, tax (10% GST), shipping (free over $100), total

#### 2. Checkout Flow
- **Initiation**: `initiateCheckout()` function validates cart and creates Stripe session
- **Loading States**: Button shows spinner during processing
- **Error Handling**: Graceful error messages if Stripe not configured or checkout fails
- **Event Tracking**: Tracks `checkout_start`, `checkout_complete`, `purchase` events

#### 3. Redirect Handling
- **Success**: `handleCheckoutSuccess()` - Clears cart, creates order, shows success message
- **Cancel**: `handleCheckoutCancel()` - Keeps cart, shows cancellation message
- **URL Cleanup**: Removes query parameters after processing

#### 4. Cloud Function
- **Endpoint**: `/createCheckoutSession` - Creates Stripe Checkout Session
- **Features**: CORS enabled, auth token support, shipping options, metadata
- **Error Handling**: Proper error responses and validation

### Technical Details

#### Cart Modal Structure
- Overlay and container matching product modal pattern
- Responsive design for mobile devices
- Keyboard support (Escape to close)
- Click outside to close

#### Checkout Flow
1. User clicks "Checkout" in cart modal
2. Validates cart is not empty
3. Checks if Stripe is enabled
4. Calculates totals (subtotal, tax, shipping)
5. Calls Cloud Function to create Stripe session
6. Redirects to Stripe Checkout
7. Handles success/cancel redirects
8. Clears cart and shows confirmation

#### URL Parameters
- Success: `shop.html?checkout=success&session_id=cs_test_...`
- Cancel: `shop.html?checkout=cancelled`

### Dependencies
- **Stripe.js**: Loaded dynamically when Stripe is configured
- **Cloud Function**: Must be deployed separately (see `functions/stripe-checkout-session.js`)
- **Stripe Keys**: Must be configured in admin panel (Settings > Integrations)

### Configuration Required
1. **Stripe Keys**: Add publishable key, secret key, and webhook secret in admin panel
2. **Cloud Function Deployment**: Deploy `functions/stripe-checkout-session.js`
3. **Webhook Setup**: Configure Stripe webhook endpoint (already documented)

### Known Issues / Follow-ups
- **Cloud Function URL**: Currently uses default region `us-central1` - update `getRegion()` in `stripe-config.js` if functions are in different region
- **Shipping Options**: Hardcoded in Cloud Function - may want to make configurable
- **Order Creation**: Both client-side (backup) and webhook create orders - webhook is primary, client-side is fallback
- **Tax Calculation**: Currently 10% GST hardcoded - may want to make configurable
- **Shipping Threshold**: Free shipping over $100 is hardcoded - may want to make configurable

### Related Files
- `STRIPE_SETUP.md` - Complete Stripe setup instructions
- `functions/stripe-webhook.js` - Webhook handler for payment confirmations
- `admin/js/orders.js` - Order management functions
- `admin/js/stripe-config.js` - Stripe configuration management

## 2025-01-XX - Analytics Events & Stripe Checkout Implementation

### What Changed
- **Implemented**: Complete analytics event tracking infrastructure with dual storage (GA4 + Firestore)
- **Implemented**: Admin Event Explorer page with filtering, funnel analysis, and export
- **Implemented**: Stripe Checkout integration for shop with order management
- **Implemented**: Stripe configuration UI in admin integrations page
- **Status**: All planned features from implementation plan completed

### Files Created
- `admin/js/analytics.js` - Centralized analytics helper with dual storage (GA4 + Firestore)
- `admin/js/events.js` - Event Explorer page logic with Firestore queries, funnel calculations, export
- `admin/js/stripe-config.js` - Stripe configuration and Checkout session management
- `admin/js/orders.js` - Order creation and management after Stripe payment
- `admin/js/integrations.js` - Integrations management (Stripe configuration UI)
- `functions/stripe-webhook.js` - Cloud Function structure for Stripe webhook handling
- `STRIPE_SETUP.md` - Comprehensive Stripe setup instructions
- `ANALYTICS_EVENTS.md` - Analytics event tracking usage guide

### Files Modified
- `index.html` - Added analytics tracking for quote form (start, step views, service selection, budget change, submit, email/phone clicks)
- `shop.html` - Added analytics tracking (product views, cart actions, wishlist, share, page view)
- `admin-events.html` - Replaced placeholder with full UI (event table, filters, funnel charts, export buttons, event detail modal)
- `admin/js/firebase-config.js` - Added `admin_login`, `admin_logout`, `admin_login_failed` event tracking
- `admin/js/products.js` - Added `create_product`, `update_product`, `delete_product`, `product_image_upload` event tracking
- `admin-dashboard.html` - Added `admin_dashboard_view` page view tracking
- `admin-integrations.html` - Replaced placeholder with Stripe configuration UI
- `admin/css/admin.css` - Added tab styles for admin-events.html
- `firestore.rules` - Added rules for `analyticsEvents/`, `orders/`, and `integrations/` collections

### Key Features Implemented

#### 1. Analytics Infrastructure
- **Dual Storage**: Events tracked to both GA4 (for standard analytics) and Firestore (for custom queries)
- **Helper Functions**: `trackEvent()`, `trackEcommerceEvent()`, `trackPageView()`, `trackError()`
- **Session Tracking**: Automatic session ID generation and tracking
- **User Tracking**: Automatic user ID capture (when authenticated)

#### 2. Public Website Event Tracking
- **Quote Request Form**: `quote_request_start`, `quote_request_service_select`, `quote_request_budget_change`, `quote_request_step_view`, `quote_request_submit`
- **Shop Interactions**: `product_view`, `add_to_cart`, `cart_item_remove`, `add_to_wishlist`, `share_product`
- **Navigation**: `call_click`, `email_click`, `page_view`

#### 3. Admin Panel Event Tracking
- **Authentication**: `admin_login`, `admin_logout`, `admin_login_failed`
- **Products**: `create_product`, `update_product`, `delete_product`, `product_image_upload`
- **Dashboard**: `admin_dashboard_view`

#### 4. Admin Event Explorer
- **Event Table**: Displays all events with filtering (event name, date range, user ID)
- **Funnel Analysis**: Visual charts for Lead to Quote, Quote to Job, Job to Invoice funnels
- **Export**: CSV and JSON export functionality
- **Event Details**: Modal view for full event data including parameters

#### 5. Stripe Integration
- **Configuration UI**: Admin panel interface for Stripe keys (publishable, secret, webhook secret)
- **Checkout Flow**: Structure for Stripe Checkout session creation (requires Cloud Function)
- **Order Management**: Order creation in Firestore after successful payment
- **Webhook Handler**: Cloud Function structure for payment confirmations

### Backend Changes

#### Firestore Collections
- **`analyticsEvents/`**: Stores all analytics events
  - Fields: `eventName`, `params`, `userId`, `sessionId`, `timestamp`, `pageUrl`, `userAgent`, `createdAt`
  - Index: `timestamp` (descending), `eventName`, `userId`
- **`orders/`**: Customer orders from shop
  - Fields: `orderNumber`, `customerId`, `products[]`, `subtotal`, `tax`, `shipping`, `total`, `status`, `paymentStatus`, `stripeSessionId`, `stripePaymentIntentId`, `shippingAddress`, `createdAt`, `updatedAt`
- **`integrations/stripe`**: Stripe configuration
  - Fields: `publishableKey`, `secretKey` (should be encrypted), `webhookSecret`, `mode` (test/live), `enabled`

#### Firestore Security Rules
- **`analyticsEvents/`**: Authenticated users can write, admins can read
- **`orders/`**: Admins can read/write, customers can read their own orders
- **`integrations/`**: Only admins can read/write

### Analytics Events Status
- **✅ Implemented**: 20+ events (quote form, shop interactions, admin actions)
- **🚧 Planned**: ~170 events (from workflow diagrams, to be added incrementally)
- **Total Tracked**: Events stored in both GA4 and Firestore for comprehensive analysis

### Dependencies
- **Chart.js**: Used for funnel visualization in Event Explorer (loaded via CDN)
- **Stripe.js**: Loaded dynamically when Stripe is configured (via CDN)
- **Firebase Analytics**: Already configured via GA4 script in index.html

### Commands
- **Stripe Setup**: See `STRIPE_SETUP.md` for complete setup instructions
- **Event Tracking**: See `ANALYTICS_EVENTS.md` for usage guide
- **Cloud Function Deployment**: `firebase deploy --only functions` (for Stripe webhook)

### Known Issues / Follow-ups
- **Stripe Checkout**: Requires Cloud Function endpoint (`/api/create-checkout-session`) - structure provided, needs implementation
- **Stripe Secret Key**: Currently stored in plain text in Firestore - should be encrypted in production
- **Event Volume**: Firestore write limits apply (20,000/day on free tier) - consider sampling for high-volume events
- **Webhook URL**: Needs to be updated in admin-integrations.html with actual Cloud Function URL after deployment
- **Cart Checkout**: Checkout button and flow in shop.html needs to be connected to Stripe Checkout (structure provided)

### Related Files
- `analytics-events-reference.md` - Complete catalog of all possible events
- `.cursor/rules/00-global-memory-and-rules.mdc` - Analytics requirements
- `workflows/workflow-admin-events.md` - Event Explorer workflow diagram
- `workflows/workflow-admin-integrations.md` - Integrations workflow diagram

## 2025-01-XX - Analytics Events Reference Document Created

### What Changed
- **Created**: Comprehensive analytics events reference document `analytics-events-reference.md`
- **Purpose**: Complete catalog of all possible analytics events for tracking user behavior, admin actions, and system interactions
- **Scope**: Covers public website, admin panel (all 27 pages), system events, and e-commerce funnel

### Files Created
- `analytics-events-reference.md`:
  - ~190+ possible analytics events documented
  - Organized by category (Public Website, Admin Panel, System Events)
  - Status indicators: ✅ Implemented, 🚧 Planned, 📋 Recommended
  - Event parameters and best practices
  - PII guidelines (what to never include)
  - E-commerce funnel tracking

### Key Features
1. **Public Website Events**: Quote requests, shop interactions, navigation, authentication
2. **Admin Panel Events**: All 27 admin pages with CRUD operations, status changes, workflows
3. **System Events**: Performance, errors, security events
4. **E-commerce Funnel**: Purchase and lead conversion funnels
5. **Event Parameters**: Detailed parameter lists for each event
6. **Privacy Guidelines**: Clear PII exclusion rules

### Event Statistics
- **Total Events**: ~190+ possible events
- **✅ Implemented**: 13 events (admin_login, product CRUD, shop interactions)
- **🚧 Planned**: ~150 events (from workflow diagrams)
- **📋 Recommended**: ~30 events (additional tracking opportunities)

### Event Categories
1. **Public Website** (30+ events): Homepage, quote form, shop, authentication
2. **Admin Panel** (140+ events): All admin modules with full CRUD tracking
3. **System & Errors** (10+ events): Performance, errors, security
4. **E-commerce Funnel** (5+ events): Purchase and lead conversion tracking

### Related Files
- `.cursor/rules/00-global-memory-and-rules.mdc` - Analytics requirements
- `workflows/workflow-admin-events.md` - Event explorer workflow
- `workflows/workflow-admin-integrations.md` - GA4/Analytics setup

### Known Issues / Follow-ups
- Most events are planned (🚧) and need implementation
- Event tracking should be added incrementally as features are built
- Consider implementing event tracking helper functions for consistency

## 2025-01-XX - Workflow Diagrams Reference Rule Created

### What Changed
- **Created**: New rule file `.cursor/rules/02-workflow-diagrams-reference.mdc`
- **Purpose**: Establishes workflow diagrams in `workflows/` as authoritative source for admin page implementations
- **Scope**: Applies to all admin page implementations, feature additions, and module integrations

### Files Created
- `.cursor/rules/02-workflow-diagrams-reference.mdc`:
  - Mandatory workflow consultation before implementing features
  - Workflow diagram maintenance requirements
  - Reference guide for all 27 admin pages (3 implemented, 24 planned)
  - Integration patterns and common collections documentation
  - Status update requirements (🚧 Planned → ✅ Implemented)

### Key Features
1. **Mandatory Consultation**: Requires reading workflow diagrams before implementing any admin feature
2. **Status Tracking**: Documents which pages are ✅ Implemented vs 🚧 Planned
3. **Integration Points**: References Firestore collections, Storage paths, and cross-module relationships
4. **Maintenance Requirements**: Specifies when and how to update workflow diagrams
5. **Reference Guide**: Complete mapping of admin pages to their workflow diagram files

### Workflow Diagram Status
- **✅ Fully Implemented**: 3 pages (login, dashboard, products)
- **🚧 Planned**: 24 pages (all others)
- **Total**: 27 admin pages documented

### Related Files
- `workflows/README.md` - Workflow diagrams index and overview
- `workflows/workflow-admin-*.md` - Individual workflow diagrams (26 files)

### Known Issues / Follow-ups
- None

## 2025-12-18 - Head Section Fix: My Account Page Now Uses Same CSS and Meta Tags as Index Page

### What Changed
- **Fixed**: Added missing `mbr-additional.css` file that controls text sizing
- **Fixed**: Added font preloads for Bebas Neue and Exo 2 fonts
- **Fixed**: Updated meta tags to match index.html format (http-equiv, minimum-scale)
- **Fixed**: Updated HTML tag format to match index.html (removed lang attribute)
- **Fixed**: Added favicon link
- **Result**: Text sizing now matches index.html (no more massive text)

### Files Modified
- `my-account.html`:
  - Replaced head section with exact structure from index.html
  - Added `mbr-additional.css` link (critical for text sizing)
  - Added font preloads for proper font loading
  - Updated meta tags to match index.html format
  - Kept custom account page styles and title

### Key Changes
1. **mbr-additional.css**: This was the missing critical CSS file that controls text sizing
2. **Font Preloads**: Ensures fonts load properly for consistent typography
3. **Meta Tags**: Updated to match index.html format for consistency

### Known Issues / Follow-ups
- None

## 2025-12-18 - Navbar Exact Copy: My Account Page Uses Identical Navbar from Index Page

### What Changed
- **Replaced**: Entire navbar section in `my-account.html` with exact copy from `index.html`
- **Removed**: `opacityScroll` class from navbar-collapse div (not present in index.html)
- **Matched**: Exact formatting, spacing, and structure from index.html navbar

### Files Modified
- `my-account.html`:
  - Replaced entire navbar section (lines 285-348) with exact copy from index.html (lines 128-191)
  - Navbar now has identical structure, classes, and formatting
  - Removed any differences in whitespace, line breaks, or formatting

### Key Changes
1. **Exact Structure Match**: Navbar is now byte-for-byte identical to index.html navbar
2. **No opacityScroll**: Removed `opacityScroll` class that was causing visual differences
3. **Consistent Formatting**: Nav items formatting matches exactly (all on one line in ul tag)

### Known Issues / Follow-ups
- None

## 2025-12-18 - Navbar Consistency Fix: My Account Page Navbar Matches Index Page

### What Changed
- **Fixed**: Navbar structure on `my-account.html` now matches `index.html`
- **Updated**: Container div now uses `content-wrap container-fluid` class (was just `container-fluid`)
- **Updated**: Navigation menu now includes all navigation items (HOME, SERVICES, SHOP, TEAM, FAQ, CONTACT US, OUR WORK)
- **Updated**: Section class now matches index.html (`menu menu01 neuralm5 cid-uGKLfvQrfz`)
- **Updated**: Logo link now points to `index.html#aheader1-6` with proper styling

### Files Modified
- `my-account.html`:
  - Changed container from `<div class="container-fluid">` to `<div class="content-wrap container-fluid">`
  - Updated section class from `menu cid-uLrKO3nRmz` to `menu menu01 neuralm5 cid-uGKLfvQrfz`
  - Replaced minimal navigation menu (Home, Shop) with full navigation menu matching index.html
  - Updated logo link and styling to match index.html
  - Removed `opacityScroll` class from navbar (not present in index.html)
  - Updated navbar-toggler attributes to match index.html

### Key Changes
1. **Container Structure**: Added `content-wrap` class for proper styling consistency
2. **Full Navigation Menu**: Now includes all 7 navigation items instead of just 2
3. **Visual Consistency**: Navbar now looks identical to index.html navbar

### Known Issues / Follow-ups
- None

## 2025-12-18 - Admin Button Role-Based Access: Only Admins Can See Admin Button

### What Changed
- **Implemented**: Admin role checking before showing the floating admin button
- **Created**: `checkIsAdmin()` function that checks both custom claims and Firestore users collection
- **Updated**: `initAuthStateListener()` now only shows admin button if user has admin role
- **Security**: Admin button is now hidden from regular users, only visible to admins

### Files Modified
- `shop.html`:
  - Added `checkIsAdmin()` async function that:
    - Checks Firebase Auth custom claims for `role === 'admin'`
    - Falls back to Firestore `users/{uid}` document for `role === 'admin'`
    - Returns `false` if user is not authenticated or not an admin
  - Updated `initAuthStateListener()` to call `checkIsAdmin()` and only show button if user is admin
- `index.html`:
  - Same changes as shop.html

### Key Features
1. **Dual Check System**: 
   - First checks Firebase Auth custom claims (if implemented)
   - Falls back to Firestore `users/{uid}` document `role` field
2. **Security**: Only users with `role === 'admin'` can see the admin button
3. **Error Handling**: Gracefully handles errors and returns `false` if check fails

### Technical Details
- **Custom Claims**: Checks `idTokenResult.claims.role === 'admin'`
- **Firestore Fallback**: Checks `users/{uid}.role === 'admin'`
- **Async Function**: `checkIsAdmin()` is async to handle Firestore queries
- **Auth State Listener**: Updated to be async to await admin check

### Backend Changes
- **No backend changes required**: Uses existing Firebase Auth and Firestore structure
- **Future**: When role management is implemented, this will automatically work with custom claims or Firestore roles

### Known Issues / Follow-ups
- Currently, if no `users/{uid}` document exists and no custom claims are set, the button will be hidden (defaults to non-admin)
- To make a user an admin, create a `users/{uid}` document in Firestore with `{ role: 'admin' }` or set custom claims via Cloud Functions

## 2025-12-18 - Sign Out Modal Fix: Auth Modal No Longer Opens on Sign Out

### What Changed
- **Fixed**: Sign out function now closes auth modal if it's open
- **Fixed**: `handleUserIconClick` now uses synchronous `auth.currentUser` check instead of `onAuthStateChanged` listener
- **Updated**: Sign out now properly closes both dropdown and auth modal before signing out

### Files Modified
- `shop.html`:
  - Updated `handleSignOut()` to call `closeAuthModal()` before signing out
  - Updated `handleUserIconClick()` to use `auth.currentUser` instead of `onAuthStateChanged` (prevents modal from opening on sign out)
- `index.html`:
  - Same fixes as shop.html

### Key Fixes
1. **Synchronous Auth Check**: Changed from `auth.onAuthStateChanged()` (which creates a listener that fires on every state change) to `auth.currentUser` (synchronous check)
2. **Modal Closure**: `handleSignOut()` now explicitly closes the auth modal before signing out
3. **Prevents Modal Opening**: The auth state listener no longer triggers modal opening when user signs out

### Technical Details
- **Root Cause**: `onAuthStateChanged` in `handleUserIconClick` was creating a listener that fired when user signed out, causing the modal to open
- **Solution**: Use `auth.currentUser` for immediate synchronous check instead of async listener
- **Additional Safety**: Explicitly close modal in `handleSignOut()` before signing out

### Known Issues / Follow-ups
- None

## 2025-12-18 - User Dropdown Menu and My Account Page Created

### What Changed
- **Updated**: User icon click behavior to show dropdown menu when logged in (instead of always opening login modal)
- **Created**: User dropdown menu with "My Account" and "Sign Out" options
- **Created**: New `my-account.html` page for customer account management
- **Implemented**: Sign out functionality
- **Added**: Profile management (display name, email, phone)
- **Added**: Password change functionality
- **Added**: Wishlist display on account page
- **Added**: Orders section (placeholder for future implementation)

### Files Modified
- `shop.html`:
  - Updated user icon to use `handleUserIconClick()` function
  - Added user dropdown menu HTML structure
  - Added dropdown CSS styling (glass morphism design)
  - Added `handleUserIconClick()` function to check auth state and toggle dropdown
  - Added `handleSignOut()` function for sign out functionality
  - Updated `initAuthStateListener()` to manage dropdown visibility and user icon title
  - Added click-outside listener to close dropdown
- `index.html`:
  - Updated user icon to use dropdown menu (same as shop.html)
  - Added user dropdown HTML structure
  - Added dropdown CSS styling
  - Added `handleUserIconClick()` and `handleSignOut()` functions
  - Updated `initAuthStateListener()` to manage dropdown state
  - Added click-outside listener
- `my-account.html` (NEW):
  - Created new account management page
  - Tabbed interface: Profile, Orders, Wishlist
  - Profile tab: Display name, email, phone number editing
  - Password change form with re-authentication
  - Wishlist display (reads from localStorage, loads product data from Firestore)
  - Orders section (placeholder for future implementation)
  - User info header with avatar (first letter of name)
  - Authentication check (redirects to home if not logged in)
  - Responsive design matching site theme

### Key Features
1. **User Dropdown Menu**:
   - Appears when clicking user icon while logged in
   - Options: "My Account" (links to my-account.html) and "Sign Out"
   - Closes when clicking outside
   - If not logged in, opens login modal instead

2. **My Account Page**:
   - **Profile Tab**: Edit display name, view email (read-only), edit phone number
   - **Password Tab**: Change password with current password verification
   - **Orders Tab**: Placeholder for future order history
   - **Wishlist Tab**: Displays wishlist items from localStorage with product details from Firestore
   - User avatar with first letter of name
   - Authentication required (redirects if not logged in)

3. **Sign Out Functionality**:
   - Signs out user from Firebase Auth
   - Shows success notification
   - Closes dropdown menu
   - Updates UI state (hides admin button, resets user icon)

### Technical Details
- **Authentication**: Uses Firebase Auth `onAuthStateChanged` to detect login state
- **Profile Updates**: Uses Firebase `updateProfile()` for display name
- **Password Change**: Requires re-authentication before updating password
- **Wishlist Integration**: Reads from localStorage, loads product data from Firestore
- **Icons**: Uses Mobirise icons (`mobi-mbri-user`, `mobi-mbri-logout`, `mobi-mbri-shopping-cart`, `mobi-mbri-hearth`)

### Known Issues / Follow-ups
- Orders section is placeholder (no order data yet)
- Phone number is stored in form but not persisted to Firestore (could be added to user profile document)
- Wishlist items are client-side only (could be synced to Firestore for cross-device access)

### Assumptions
- All authenticated users can access My Account page
- Display name is optional (defaults to email username if not set)
- Password change requires current password for security

## 2025-12-18 - Authentication Modal and Admin Button Implemented

### What Changed
- **Replaced**: User icon link to admin-login.html with a modal trigger
- **Created**: Login/Register modal with Firebase Authentication integration
- **Added**: Floating admin button in bottom right corner (appears when logged in)
- **Implemented**: Auth state listener to show/hide admin button based on login status
- **Updated**: Both `index.html` and `shop.html` with authentication functionality

### Files Modified
- `shop.html`:
  - Added Firebase Auth SDK (`firebase-auth-compat.js`)
  - Updated user icon to trigger `openAuthModal()` instead of navigating to admin-login.html
  - Added auth modal HTML structure (login/register forms with tabs)
  - Added floating admin button HTML
  - Added auth modal CSS styling (glass morphism design matching site theme)
  - Added admin float button CSS (red button, bottom right, responsive)
  - Added authentication JavaScript functions:
    - `openAuthModal()` - Opens the modal
    - `closeAuthModal()` - Closes and resets the modal
    - `switchAuthTab()` - Switches between login and register tabs
    - `handleLogin()` - Handles Firebase email/password login
    - `handleRegister()` - Handles Firebase email/password registration
    - `initAuthStateListener()` - Monitors auth state and shows/hides admin button
    - `setupAuthModalListeners()` - Sets up event listeners for modal interactions
  - Initialized Firebase Auth in Firebase config section
- `index.html`:
  - Added Firebase Auth SDK
  - Updated user icon to trigger `openAuthModal()`
  - Added auth modal HTML structure
  - Added floating admin button HTML
  - Added auth modal and admin button CSS
  - Added authentication JavaScript functions (same as shop.html)
  - Added `showNotification()` helper function for user feedback
  - Initialized Firebase Auth

### Key Features
1. **Login/Register Modal**:
   - Tabbed interface (Login/Register)
   - Email/password authentication via Firebase
   - Form validation (password match, minimum length)
   - Error handling with user-friendly messages
   - Keyboard navigation (Escape to close, focus management)
   - Responsive design matching site theme

2. **Admin Float Button**:
   - Appears in bottom right corner when user is logged in
   - Links to `admin-dashboard.html`
   - Red color matching site primary color (#ee2524)
   - Responsive: icon-only on mobile, text + icon on desktop
   - Smooth animations and hover effects

3. **Auth State Management**:
   - Real-time auth state monitoring via `onAuthStateChanged`
   - Admin button visibility automatically updates on login/logout
   - Works across page navigation (Firebase maintains session)

### Technical Details
- **Firebase Services**: Authentication (Email/Password)
- **Icon Library**: Mobirise icons (`mobi-mbri-login`, `mobi-mbri-setting`, `mobi-mbri-user`)
- **CSS Variables**: Uses existing site CSS variables for consistency
- **Error Handling**: Comprehensive error messages for common Firebase auth errors
- **Accessibility**: ARIA labels, keyboard navigation, focus management

### Known Issues / Follow-ups
- None identified

### Assumptions
- All authenticated users should have access to admin dashboard (role-based access control not yet implemented)
- Modal design matches existing site aesthetic (glass morphism, red accent color)

## 2025-12-18 - Product Card Layout Restructured: Text Moved from Images to Body Section

### What Changed
- **Moved**: Product name and category from product header (image area) to product body section
- **Removed**: All text overlays from product card images - images now display cleanly without any text
- **Updated**: Product category styling to be inline-block instead of absolute positioned
- **Kept**: Featured badge remains on header (only overlay on images)

### Files Modified
- `shop.html`:
  - Restructured product card HTML to move name and category to body section
  - Removed product name and category from header div
  - Updated `.product-category` CSS from absolute positioning to inline-block with margin
  - Removed text-shadow from `.product-name` (no longer needed since it's not on image)
  - Updated product name margin for better spacing in body section
  - Header now only shows image (or icon if no image) and featured badge if applicable

### Key Updates
1. **Clean Images**: Product card images display without any text overlays
2. **Better Organization**: Product name and category are now in the body section with description
3. **Improved Readability**: Text is easier to read on solid background instead of over images
4. **Consistent Layout**: All product information (name, category, description, price, actions) is grouped in the body section

### Backend Changes
- **No backend changes**: Only frontend layout restructuring

---

## 2025-12-18 - Product Card Styling Updated: Removed Red Overlay, Full Image Display

### What Changed
- **Removed**: Red gradient overlay from product card headers
- **Updated**: Product header to display full images without red tint
- **Fixed**: Product card heights to be consistent across all cards
- **Added**: Text shadow to product names for better readability over images
- **Improved**: Image display to cover entire header area (250px fixed height)

### Files Modified
- `shop.html`:
  - Removed red overlay div from product card HTML structure
  - Updated `.product-header` CSS to remove red gradient background
  - Changed header height from `min-height: 200px` to fixed `height: 250px` for consistency
  - Added `background-size: cover` and `background-position: center` to ensure images fill header
  - Added text shadow to `.product-name` for readability
  - Updated `.product-card` to use flexbox for consistent heights
  - Updated `.product-body` to flex-grow and fill remaining space
  - Updated `.product-footer` to use `margin-top: auto` for proper spacing

### Key Updates
1. **No Red Overlay**: Product images now display without the red gradient overlay
2. **Full Image Display**: Images cover the entire header area (250px height)
3. **Consistent Card Heights**: All product cards have the same height for proper grid alignment
4. **Better Readability**: Product names have text shadow for visibility over images

### Backend Changes
- **No backend changes**: Only frontend styling updates

---

## 2025-12-18 - Navbar Icons Reorganized: User and Cart Icons Moved to Social Icons Section

### What Changed
- **Moved**: User icon from `navbar-buttons` to `icons-menu` section (with social icons) in both `index.html` and `shop.html`
- **Added**: Cart icon widget to `icons-menu` section in both pages
- **Fixed**: Replaced Font Awesome cart icon (`fas fa-shopping-cart`) with Mobirise icon (`mobi-mbri-shopping-cart`) since Font Awesome CSS is not loaded
- **Updated**: CSS styling for cart badge to work properly in icons-menu
- **Added**: Cart count functionality to `index.html` (reads from localStorage, same storage key as shop.html)

### Files Modified
- `index.html`:
  - Moved user icon from navbar-buttons to icons-menu
  - Added cart icon with badge to icons-menu (using Mobirise icon `mobi-mbri-shopping-cart`)
  - Added cart count JavaScript function (`getCartCount()`, `updateCartBadge()`)
  - Added CSS for cart badge styling in icons-menu
  - Cart icon links to `shop.html`
- `shop.html`:
  - Moved user icon from navbar-buttons to icons-menu
  - Moved cart icon with badge from navbar-buttons to icons-menu
  - Fixed cart icon to use Mobirise icon (`mobi-mbri-shopping-cart`) instead of Font Awesome
  - Updated CSS for cart badge to work in icons-menu context

### Key Updates
1. **Icon Organization**: All icons (social, cart, user) are now grouped together in the `icons-menu` section
2. **Cart Badge**: Cart badge displays item count from localStorage (shared between pages)
3. **Consistency**: Both pages now have the same icon layout and functionality
4. **Styling**: Cart badge positioned absolutely with proper z-index for visibility

### Backend Changes
- **No backend changes**: Cart functionality remains localStorage-based (client-side only)

---

## 2025-12-18 - Memory and Rules Maintenance Rule Created

### What Changed
- **Created**: New rule file `.cursor/rules/01-memory-and-rules-maintenance.mdc`
- **Purpose**: Enforces mandatory updates to `memory.md` and rule refinement after every prompt
- **Scope**: Applies to all prompts (code changes, questions, documentation, bug fixes, etc.)

### Files Created
- `.cursor/rules/01-memory-and-rules-maintenance.mdc` - Rule file with `alwaysApply: true`

### Key Requirements
1. **Memory.md Updates**: Must update after every prompt with what changed, files touched, decisions, conventions, dependencies, backend changes, known issues, and assumptions
2. **Rules Refinement**: Must review and update rules in `.cursor/rules/` after every prompt to ensure they reflect current project state
3. **Enforcement**: Non-negotiable workflow step that cannot be skipped

### Backend Changes
- **Documentation Only**: No code changes, only rule file creation

---

## 2025-12-18 - Rules File Updated & Refined

### What Changed
- **Updated**: `.cursor/rules/00-global-memory-and-rules.mdc` with comprehensive project information
- **Added**: Current implementation status (3 implemented, 24 planned pages)
- **Added**: Actual Firestore collections in use (only `products/` currently)
- **Added**: Storage paths actually implemented vs planned
- **Added**: Frontend features documentation (shop.html cart/wishlist)
- **Added**: Product data model details
- **Added**: Coding conventions and patterns
- **Added**: Current Firebase project details
- **Added**: Workflow diagrams reference

### Files Modified
- `.cursor/rules/00-global-memory-and-rules.mdc` - Comprehensive update with:
  - Current vs planned implementation status
  - Actual Firestore collections (products only)
  - Actual Storage paths (products only)
  - Planned collections from workflow diagrams
  - Frontend shop features (cart, wishlist, share)
  - Product data model with all fields
  - Coding conventions and patterns
  - File structure conventions
  - Known limitations and issues

### Key Updates
1. **Implementation Status**: Clear distinction between ✅ implemented and 🚧 planned
2. **Data Model**: Documented actual product schema vs planned schemas
3. **Storage Paths**: Documented actual paths vs planned paths
4. **Frontend Features**: Documented shop.html features (cart, wishlist, share)
5. **Conventions**: Added coding patterns, CSS variables, Firestore patterns
6. **References**: Added links to workflow diagrams and key files

### Backend Changes
- **Documentation Only**: No code changes, only rules documentation update
- **Accuracy**: Rules now reflect actual current state of project

---

## 2025-12-18 - Admin Workflow Diagrams Created

### What Changed
- **Created**: Comprehensive workflow diagrams for all 27 admin pages
- **Location**: `workflows/` folder with individual `.md` files for each page
- **Format**: Mermaid flowcharts showing data flow, user interactions, and integration points
- **Documentation**: README index file with overview and navigation

### Files Created
- `workflows/README.md` - Index and overview of all workflows
- `workflows/workflow-admin-login.md` - Authentication workflow (✅ Implemented)
- `workflows/workflow-admin-dashboard.md` - Dashboard navigation (✅ Implemented)
- `workflows/workflow-admin-products.md` - Product CRUD workflow (✅ Implemented)
- `workflows/workflow-admin-leads.md` - Lead management (🚧 Planned)
- `workflows/workflow-admin-quotes.md` - Quote builder (🚧 Planned)
- `workflows/workflow-admin-invoices.md` - Invoice & payments (🚧 Planned)
- `workflows/workflow-admin-jobs.md` - Job board by stage (🚧 Planned)
- `workflows/workflow-admin-schedule.md` - Calendar system (🚧 Planned)
- `workflows/workflow-admin-time.md` - Time tracking (🚧 Planned)
- `workflows/workflow-admin-qa.md` - QA checklists (🚧 Planned)
- `workflows/workflow-admin-warranty.md` - Warranty claims (🚧 Planned)
- `workflows/workflow-admin-customers.md` - Customer management (🚧 Planned)
- `workflows/workflow-admin-vehicles.md` - Vehicle profiles (🚧 Planned)
- `workflows/workflow-admin-inventory.md` - Stock tracking (🚧 Planned)
- `workflows/workflow-admin-categories.md` - Category management (🚧 Planned)
- `workflows/workflow-admin-suppliers.md` - Supplier directory (🚧 Planned)
- `workflows/workflow-admin-purchase-orders.md` - PO management (🚧 Planned)
- `workflows/workflow-admin-reports.md` - Report generation (🚧 Planned)
- `workflows/workflow-admin-events.md` - Event explorer (🚧 Planned)
- `workflows/workflow-admin-health.md` - System health (🚧 Planned)
- `workflows/workflow-admin-users.md` - User & role management (🚧 Planned)
- `workflows/workflow-admin-templates.md` - Template management (🚧 Planned)
- `workflows/workflow-admin-integrations.md` - Integration management (🚧 Planned)
- `workflows/workflow-admin-audit.md` - Audit log (🚧 Planned)
- `workflows/workflow-admin-orders.md` - Order management (🚧 Planned)
- `workflows/workflow-admin-services.md` - Service management (🚧 Planned)

### Key Features
1. **Implemented Pages (3)**: Detailed workflows based on actual code
   - Admin Login: Authentication flow with error handling
   - Admin Dashboard: Navigation hub with quick links
   - Admin Products: Full CRUD with image uploads, search, filtering

2. **Planned Pages (24)**: Workflows based on "Coming Soon" page feature lists
   - Complete data flow diagrams
   - Firestore collection structures
   - Storage paths
   - Cross-module integration points
   - Implementation notes

3. **Diagram Structure**: Each diagram includes
   - Mermaid flowchart visualization
   - Status (✅ Implemented / 🚧 Planned)
   - Overview description
   - Planned features list (for planned pages)
   - Integration points (Firestore collections, Storage paths)
   - Related pages
   - Implementation notes

### Integration Points Documented
- **Firestore Collections**: All collections used by each module
- **Storage Paths**: File storage locations for each module
- **Cross-Module Relationships**: How modules connect (e.g., Leads → Quotes → Jobs)
- **Firebase Services**: Auth, Firestore, Storage, Analytics, Performance, Crash Reporting

### Key Decisions
1. **Mermaid Format**: Chosen for compatibility with GitHub, VS Code, and online viewers
2. **Comprehensive Coverage**: All 27 admin pages documented
3. **Status Tracking**: Clear distinction between implemented and planned
4. **Future Reference**: Diagrams serve as implementation guides for planned features

### Files Touched
- Created `workflows/` directory
- Created 27 workflow diagram files (`.md` format)
- Created `workflows/README.md` index file

### Backend Changes
- **Documentation Only**: No code changes, only workflow documentation
- **Firestore Collections**: Documented planned collections for each module
- **Storage Paths**: Documented planned storage paths for each module

### Known Issues / Follow-ups
- Workflow diagrams for planned pages are based on feature lists and may need adjustment during implementation
- Some integration points may require Cloud Functions (noted in implementation notes)

### Assumptions
- Planned workflows are based on feature lists in "Coming Soon" pages
- Actual implementation may differ slightly from planned workflows
- Diagrams will be updated as pages are implemented

---

## 2025-01-XX - Product Detail Modal with Cart, Wishlist & Share - Deployed

### What Changed
- **Deployed**: Product detail modal, cart, wishlist, and share functionality deployed to Firebase Hosting
- **New Features**: 
  - Product detail modal (PDP) with image gallery
  - Add to Cart functionality (localStorage-based)
  - Wishlist functionality (localStorage-based)
  - Share product functionality (Web Share API with fallback)
  - Quick action buttons on product cards
  - Cart badge in navigation
- **Bug Fix**: Fixed `escapeHtml` scope issue by moving utility functions to global scope

### Files Modified
- `shop.html` - Added modal HTML, cart/wishlist functions, share functionality, updated product cards
- `firebase.json` - Updated ignore list to exclude debug.log

### Deployment Details
- **Deployment Date**: Just completed
- **Files Deployed**: 105 files
- **Public URL**: https://spoolin-industries.web.app
- **Hosting URL**: https://spoolin-industries.web.app

### Key Features Implemented
1. **Product Detail Modal**: Click product cards to view full details with image gallery
2. **Cart System**: localStorage-based cart with add/remove functionality
3. **Wishlist**: Save products to wishlist with visual feedback
4. **Share**: Share products via Web Share API or fallback options
5. **Quick Actions**: Add to cart and wishlist buttons on product cards

### Technical Notes
- Cart and wishlist stored in localStorage (client-side only)
- All admin product fields used correctly (id, name, description, category, price, images, featured, status, sku, stock)
- No backend changes required
- Utility functions (escapeHtml, escapeUrl) moved to global scope for accessibility

---

## 2025-12-16 - Admin Panel Standardization & Full Structure

### What Changed
- **Complete Admin Structure**: Added full sidebar navigation with all sections organized into logical groups
- **File Naming Standardization**: All admin pages now use `admin-` prefix for consistency
- **Dashboard Page**: Created `admin-dashboard.html` as main entry point with welcome message and quick links
- **22 New "Coming Soon" Pages**: Created all planned admin pages with consistent "Coming Soon" layout
- **Products Enhancement**: Added search and category filter functionality to products page
- **Navigation Updates**: Updated all existing admin pages with complete sidebar structure and standardized links

### Files Created

#### New Pages (22 total, all with admin- prefix)
**Sales Pipeline:**
- `admin-leads.html` - Leads & Enquiries
- `admin-quotes.html` - Quotes
- `admin-invoices.html` - Invoices & Payments

**Production:**
- `admin-jobs.html` - Jobs
- `admin-schedule.html` - Schedule
- `admin-time.html` - Time Tracking
- `admin-qa.html` - QA / Checklists
- `admin-warranty.html` - Warranty / Aftercare

**Customers:**
- `admin-customers.html` - Customers
- `admin-vehicles.html` - Vehicles

**Inventory & Purchasing:**
- `admin-inventory.html` - Inventory
- `admin-categories.html` - Categories
- `admin-suppliers.html` - Suppliers
- `admin-purchase-orders.html` - Purchase Orders

**Analytics:**
- `admin-reports.html` - Reports
- `admin-events.html` - Event Explorer
- `admin-health.html` - System Health

**Settings:**
- `admin-users.html` - Users & Roles (replaced old placeholder)
- `admin-templates.html` - Templates
- `admin-integrations.html` - Integrations
- `admin-audit.html` - Audit Log

**Dashboard:**
- `admin-dashboard.html` - Main dashboard with welcome message and quick links

### Files Modified

1. **admin/css/admin.css**
   - Added `.coming-soon-container` styles for consistent "Coming Soon" layout
   - Added `.coming-soon-icon`, `.coming-soon-features`, `.coming-soon-actions` styles
   - Added `.admin-nav-section` and `.admin-nav-divider` for sidebar organization
   - Added `.search-filter-container` styles for search and filter controls

2. **admin/js/products.js**
   - Added `allProducts` global variable to store all products for filtering
   - Added `filterProducts()` function for search and category filtering
   - Updated `loadProducts()` to store all products
   - Updated save/delete operations to reapply filters after changes

3. **admin-products.html**
   - Updated sidebar with complete navigation structure
   - Added search input field (filters by name/description)
   - Added category filter dropdown
   - Changed "Products" to "Products (Shop)" in sidebar

4. **admin-orders.html, admin-services.html, admin-users.html**
   - Updated all with complete sidebar navigation structure

5. **admin-login.html**
   - Changed redirect from `admin-products.html` to `admin-dashboard.html` after login

6. **All Admin Pages**
   - Renamed all pages to use `admin-` prefix for standardization
   - Updated all internal links to use `admin-` prefixed filenames
   - Updated "Back to Dashboard" buttons to link to `admin-dashboard.html`

7. **Error Handling Improvements**
   - Enhanced error handling in `admin/js/products.js` to detect Firestore API not enabled errors
   - Added user-friendly error messages with direct links to enable Firestore API
   - Updated `showAlert()` function to support HTML content for detailed error messages
   - Added troubleshooting instructions to `admin/js/firebase-config.js`

### Key Decisions

1. **File Naming Convention**: 
   - All admin pages use `admin-` prefix for standardization (e.g., `admin-dashboard.html`, `admin-leads.html`)
   - Makes it easy to identify admin files and maintain consistency
   - All internal links updated to match new naming convention

2. **Sidebar Organization**: 
   - Used flat list with section headers (`.admin-nav-section`) and dividers (`.admin-nav-divider`)
   - Organized into 6 main sections: Sales Pipeline, Production, Customers, Inventory & Purchasing, Analytics, Settings
   - All pages share the same sidebar structure for consistency

3. **"Coming Soon" Pages**:
   - Consistent layout across all pages using `.coming-soon-container`
   - Each page includes: icon, title, description, planned features list, "Back to Dashboard" button
   - Planned features tailored to each specific module

4. **Products Search & Filter**:
   - Client-side filtering (no Firestore queries needed for simple search)
   - Search filters by product name or description
   - Category filter uses dropdown matching existing categories
   - Filters persist after add/edit/delete operations

5. **Navigation**:
   - Dashboard (`admin-dashboard.html`) is the main entry point after login
   - All pages link back to dashboard using `admin-dashboard.html`
   - Active page highlighting works correctly
   - Sidebar structure is consistent across all pages
   - All links use standardized `admin-` prefixed filenames

### Sidebar Structure

```
Dashboard
Sales Pipeline
  - Leads & Enquiries
  - Quotes
  - Invoices & Payments
Production
  - Jobs
  - Schedule
  - Time Tracking
  - QA / Checklists
  - Warranty / Aftercare
Customers
  - Customers
  - Vehicles
Inventory & Purchasing
  - Inventory
  - Products (Shop) ✅ (fully functional)
  - Categories
  - Suppliers
  - Purchase Orders
Analytics
  - Reports
  - Event Explorer
  - System Health
Settings
  - Users & Roles
  - Templates
  - Integrations
  - Audit Log
```

### Features Implemented

1. **Products Module (Fully Functional)**:
   - ✅ Full CRUD operations (Create, Read, Update, Delete)
   - ✅ Multiple image upload with drag-and-drop sorting
   - ✅ Search by name/description
   - ✅ Category filter
   - ✅ Image management (set primary, remove, reorder)
   - ✅ Validation (name required, price ≥ 0, stock ≥ 0)
   - ✅ Toast notifications for success/error

2. **All Other Modules**:
   - ✅ "Coming Soon" pages with planned features
   - ✅ Consistent layout and styling
   - ✅ Navigation working correctly
   - ✅ Authentication required on all pages

### Known Issues / Follow-ups

- All modules except Products show "Coming Soon" (as planned)
- Products search/filter is client-side only (works well for small-medium datasets)
- Category filter uses hardcoded categories (can be made dynamic when Categories module is built)

### Assumptions

- Dashboard is the preferred entry point after login (changed from products page)
- All "Coming Soon" pages will be implemented in future iterations
- Products module is complete and ready for use

---

## 2025-12-14 - Admin Panel Implementation

### What Changed
- **New Feature**: Complete admin panel system for managing products, orders, services, and users
- **Architecture**: Modular template-based structure for easy expansion
- **Backend**: Firebase integration (Firestore, Storage, Authentication)
- **Styling**: Custom admin theme matching main site (black #121212 background, red #9f130f/#cb2723 accents)

### Files Created

#### Admin Structure
- `admin/css/admin.css` - Complete admin panel styling with black/red theme
- `admin/js/firebase-config.js` - Firebase initialization and auth helpers (placeholder config)
- `admin/js/products.js` - Product CRUD operations with image upload

#### Admin Pages
- `admin-login.html` - Firebase Authentication login page
- `admin-products.html` - Full product management interface (table, add/edit/delete)
- `admin-orders.html` - Orders placeholder page
- `admin-services.html` - Services placeholder page
- `admin-users.html` - Users placeholder page
- `admin-template.html` - Documented template for creating new admin sections

### Key Decisions

1. **File Organization**: 
   - Admin files in root with `admin-` prefix (per user preference)
   - Shared assets in `/admin/` folder (css, js)
   - Template-based approach for easy expansion

2. **Color Scheme**:
   - Background: `#121212` (black)
   - Primary Red: `#9f130f`
   - Secondary Red: `#cb2723`
   - Hover Red: `#df4642`
   - Text: `#ffffff`
   - Muted Text: `#c7c7c7`
   - Borders: `#2c2c2c`

3. **Firebase Configuration**:
   - Placeholder values provided in `firebase-config.js`
   - User must configure Firebase project and replace placeholders
   - Security rules documented in comments

4. **Authentication**:
   - Email/password authentication via Firebase Auth
   - All admin pages require authentication
   - Automatic redirect to login if not authenticated

5. **Product Management**:
   - Firestore collection: `products`
   - Fields: name, description, category, price, stock, imageUrl, createdAt, updatedAt
   - Image upload to Firebase Storage
   - Real-time data sync

### Firebase Setup Instructions

#### 1. Create Firebase Project
- Go to https://console.firebase.google.com/
- Create new project or select existing
- Enable Authentication (Email/Password provider)
- Enable Firestore Database
- Enable Firebase Storage

#### 2. Configure Firebase Config
- Go to Project Settings > General > Your apps > Web app
- Copy Firebase config object
- Replace placeholder values in `admin/js/firebase-config.js`:
  ```javascript
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  ```

#### 3. Set Up Firestore Security Rules
Go to Firestore Database > Rules and add:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    match /services/{serviceId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 4. Set Up Storage Security Rules
Go to Storage > Rules and add:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /admin/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### 5. Create Admin User
- Go to Authentication > Users
- Click "Add user"
- Enter email and password
- Use these credentials to log into admin panel

### Dependencies

#### External Libraries (CDN)
- Firebase SDK v9.22.0 compat (app, auth, firestore, storage)
  - Using compat libraries for easier namespace-based API
- Font Awesome 6.4.0 (icons)
- Google Fonts (Bebas Neue, Exo 2, Sora)

#### No Build Process Required
- Plain HTML, CSS, and vanilla JavaScript
- No npm/node_modules needed
- All dependencies loaded via CDN

### Conventions

1. **Naming**:
   - Admin pages: `admin-[section].html`
   - JavaScript files: `admin/js/[section].js`
   - CSS: `admin/css/admin.css`

2. **Firestore Collections**:
   - Use lowercase, plural names: `products`, `orders`, `services`, `users`
   - Include `createdAt` and `updatedAt` timestamps

3. **Styling**:
   - Use CSS variables defined in `admin.css`
   - Follow existing component patterns
   - Maintain black/red theme consistency

4. **JavaScript**:
   - Use async/await for Firebase operations
   - Always check authentication before operations
   - Provide user feedback via alerts/loading states

### Future Expansion

To add a new admin section:

1. Copy `admin-template.html` to `admin-[section].html`
2. Update navigation links and page titles
3. Create `admin/js/[section].js` following `products.js` pattern
4. Update Firestore security rules for new collection
5. Test authentication and CRUD operations

### Known Issues / Follow-ups

- Admin user account needs to be created in Firebase Console
- Security rules need to be deployed
- Product categories are hardcoded (can be made dynamic later)
- Consider adding product variants (size, color) in future update

### Assumptions

- Admin users will be created via Firebase Console (not self-registration)
- All admin pages require authentication (no public access)
- Images uploaded to Firebase Storage will be publicly readable

---

## 2025-12-14 - Added Admin Sign-In Icon to Navbar

### What Changed
- **Added**: User icon for admin login in navbar on both pages
- **Location**: Next to "Book a Build" button in top navigation
- **Styling**: Simple icon matching social media icons style
- **Link**: Directs to admin-login.html
- **Tooltip**: Shows "Admin Login" on hover

### Files Modified
- `index.html` - Added admin icon to navbar
- `shop.html` - Added admin icon to navbar

### Design
- Clean icon-only design (no text)
- Matches existing social media icon styling
- Positioned after "Book a Build" button
- Subtle and professional appearance

---

## 2025-12-14 - Deployed to Firebase Hosting

### What Changed
- **Deployed**: Site successfully deployed to Firebase Hosting
- **Hosting URL**: https://spoolin-industries.web.app
- **Configuration**: Added firebase.json, .firebaserc, .gitignore
- **Security**: Removed admin-setup.html before deployment

### Files Created
- `firebase.json` - Firebase Hosting configuration with rewrites and caching
- `.firebaserc` - Project configuration (spoolin-industries)
- `.gitignore` - Ignore Firebase and sensitive files

### Files Removed
- `admin-setup.html` - Deleted for security (admin already created)

### Deployment Details
- **Files Deployed**: 82 files
- **Public URL**: https://spoolin-industries.web.app
- **Admin Panel**: Accessible at /admin-products.html (requires login)
- **Console**: https://console.firebase.google.com/project/spoolin-industries/overview

### Configuration Notes
- Clean URLs enabled (no .html extensions needed)
- Admin routes rewrite to login page
- Static assets cached for 1 year
- admin-setup.html, memory.md excluded from deployment

---

## 2025-12-14 - Removed Tuned by Chop Section

### What Changed
- **Removed**: "Tuned by Chop" promotional section from index.html
- **Location**: Was located in custom-html-26 div (lines 2407-2746)
- **Reason**: User requested removal of auto-display content

### Files Modified
- `index.html` - Removed entire Tuned by Chop section with styling and scripts

---

## 2025-12-14 - Enhanced Products with Multiple Images

### What Changed
- **Firebase Configuration**: Updated with real project credentials
- **Multiple Image Support**: Products can now have multiple images instead of just one
- **Image Management**: Drag-and-drop sorting, set primary image, delete individual images
- **Enhanced Product Fields**: Added SKU, status (active/inactive/draft), featured flag
- **Improved UI**: Better product table with status badges, image count display

### Files Updated

1. **admin/js/firebase-config.js**
   - Added real Firebase credentials for spoolin-industries project
   - Project ID: spoolin-industries

2. **admin/js/products.js** (Complete Rewrite)
   - Changed from single image to multiple images array
   - Added drag-and-drop image sorting functionality
   - Image management: add, remove, reorder, set primary
   - Enhanced product data model with SKU, status, featured fields
   - Improved error handling and user feedback

3. **admin-products.html**
   - Updated table to include Status column
   - Enhanced form with new fields: SKU, Status, Featured checkbox
   - Changed from single file input to multiple file input
   - Added images preview container with drag-and-drop interface

4. **admin/css/admin.css**
   - Added styles for multiple image preview grid
   - Drag-and-drop visual feedback
   - Primary image badge styling
   - Image control buttons (star for primary, trash for delete)
   - Hover effects for better UX

### New Firestore Data Model

```javascript
{
  name: string,
  sku: string,                    // NEW
  description: string,
  category: string,
  price: number,
  stock: number,
  status: string,                  // NEW: "active", "inactive", "draft"
  featured: boolean,               // NEW: for homepage highlighting
  images: [                        // CHANGED: from single imageUrl to array
    {
      url: string,
      order: number,
      isPrimary: boolean
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### New Features

1. **Multiple Images per Product**
   - Upload multiple images at once
   - Each product can have unlimited images
   - First uploaded image becomes primary by default

2. **Image Management**
   - Drag images to reorder
   - Click star icon to set primary image
   - Click trash icon to remove image
   - Visual feedback during drag operations
   - Primary image highlighted with gold badge

3. **Enhanced Product Information**
   - SKU/Product Code field for inventory tracking
   - Status: Active (visible), Inactive (hidden), Draft (not published)
   - Featured flag for homepage/special promotions
   - Status badges in table view

4. **Improved UX**
   - Image count display in table
   - Status color coding (green=active, gray=inactive, red=draft)
   - Better form organization with grouped fields
   - Helpful tooltips and instructions

### Firebase Project Setup Complete

✅ Firebase credentials configured
✅ Project: spoolin-industries
⚠️ Still needed:
  - Create admin user in Firebase Console (Authentication > Users)
  - Deploy Firestore security rules (see firebase-config.js)
  - Deploy Storage security rules (see firebase-config.js)

### Admin User Setup

**Option 1: Using Setup Page (Easiest)**
1. Open `admin-setup.html` in browser
2. Default credentials pre-filled:
   - Email: test@test.test
   - Password: testtest
3. Click "Create Admin Account"
4. **DELETE admin-setup.html immediately after setup** (security)

**Option 2: Using Firebase Console**
1. Go to Firebase Console > Authentication > Users > Add user
2. Email: test@test.test (or your preferred email)
3. Password: testtest (or your preferred password)

### Testing Steps

1. ~~Create admin user~~ (Done via admin-setup.html)

2. Test login:
   ```
   Open admin-login.html
   Sign in with admin credentials
   ```

3. Test product creation:
   ```
   Click "Add Product"
   Fill in product details
   Upload multiple images
   Drag to reorder images
   Set primary image
   Save product
   ```

4. Test image management:
   ```
   Edit existing product
   Add more images
   Remove images
   Change primary image
   Update product
   ```


/**
 * Analytics Event Tracking Utility
 * Tracks events to both Firebase Analytics (GA4) and Firestore for custom querying
 */

// Session ID for tracking user sessions
let sessionId = sessionStorage.getItem('analytics_session_id') || generateSessionId();
if (!sessionStorage.getItem('analytics_session_id')) {
  sessionStorage.setItem('analytics_session_id', sessionId);
}

/**
 * Generate a unique session ID
 * @returns {string}
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current user ID (if authenticated)
 * @returns {Promise<string|null>}
 */
async function getUserId() {
  try {
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
      return window.firebaseAuth.currentUser.uid;
    }
    // Check auth state
    return new Promise((resolve) => {
      if (!window.firebaseAuth) {
        resolve(null);
        return;
      }
      window.firebaseAuth.onAuthStateChanged((user) => {
        resolve(user ? user.uid : null);
      });
    });
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Track event to Firebase Analytics (GA4)
 * @param {string} eventName - Event name in snake_case
 * @param {Object} params - Event parameters
 */
function trackGA4Event(eventName, params = {}) {
  try {
    // Check if gtag is available (GA4)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    } else if (typeof window.dataLayer !== 'undefined') {
      // Fallback to dataLayer
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    } else {
      console.warn('GA4 (gtag) not loaded. Event not tracked:', eventName);
    }
  } catch (error) {
    console.error('Error tracking GA4 event:', error);
  }
}

/**
 * Track event to Firestore
 * @param {string} eventName - Event name in snake_case
 * @param {Object} params - Event parameters
 * @returns {Promise<void>}
 */
async function trackFirestoreEvent(eventName, params = {}) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:75',message:'trackFirestoreEvent called',data:{eventName,hasFirebaseDb:!!window.firebaseDb,hasFirebase:typeof firebase !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  try {
    if (!window.firebaseDb) {
      console.warn('Firestore not initialized. Event not stored:', eventName);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.js:78',message:'Firestore not initialized - event not stored',data:{eventName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      return;
    }

    const userId = await getUserId();
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const pageUrl = window.location.href;
    const userAgent = navigator.userAgent;

    const eventData = {
      eventName,
      params,
      userId: userId || null,
      sessionId,
      timestamp,
      pageUrl,
      userAgent,
      createdAt: timestamp
    };

    // Store in Firestore
    await window.firebaseDb.collection('analyticsEvents').add(eventData);
  } catch (error) {
    console.error('Error tracking Firestore event:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Track event to both GA4 and Firestore
 * @param {string} eventName - Event name in snake_case
 * @param {Object} params - Event parameters
 * @returns {Promise<void>}
 */
async function trackEvent(eventName, params = {}) {
  // Validate event name format (snake_case)
  if (!/^[a-z][a-z0-9_]*$/.test(eventName)) {
    console.warn(`Invalid event name format: ${eventName}. Should be snake_case.`);
  }

  // Track to GA4 (synchronous)
  trackGA4Event(eventName, params);

  // Track to Firestore (asynchronous, don't await to avoid blocking)
  trackFirestoreEvent(eventName, params).catch(error => {
    console.error('Firestore event tracking failed:', error);
  });
}

/**
 * Track page view
 * @param {string} pageName - Page name/title
 * @param {Object} additionalParams - Additional parameters
 */
async function trackPageView(pageName, additionalParams = {}) {
  await trackEvent('page_view', {
    page_name: pageName,
    page_url: window.location.href,
    ...additionalParams
  });
}

/**
 * Track e-commerce event with value
 * @param {string} eventName - Event name
 * @param {number} value - Monetary value
 * @param {string} currency - Currency code (default: AUD)
 * @param {Object} additionalParams - Additional parameters
 */
async function trackEcommerceEvent(eventName, value, currency = 'AUD', additionalParams = {}) {
  await trackEvent(eventName, {
    value,
    currency,
    ...additionalParams
  });
}

/**
 * Track error event
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {Object} additionalParams - Additional parameters
 */
async function trackError(errorType, errorMessage, additionalParams = {}) {
  await trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    page_url: window.location.href,
    ...additionalParams
  });
}

// Export functions to global scope
window.analytics = {
  trackEvent,
  trackGA4Event,
  trackFirestoreEvent,
  trackPageView,
  trackEcommerceEvent,
  trackError,
  sessionId
};


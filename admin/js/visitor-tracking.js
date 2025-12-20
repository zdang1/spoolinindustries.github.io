/**
 * Real-Time Visitor Tracking
 * Tracks active visitors on public pages using heartbeat system
 * Updates Firestore activeVisitors collection every 20 seconds
 */

// Configuration
const HEARTBEAT_INTERVAL = 20000; // 20 seconds
const VISITOR_TIMEOUT = 120000; // 2 minutes (active visitor definition)
const ACTIVE_VISITORS_COLLECTION = 'activeVisitors';

// State
let heartbeatTimer = null;
let isTracking = false;
// Use window.analytics.sessionId instead of declaring our own to avoid conflict with analytics.js
// let sessionId = null; // REMOVED: conflict with analytics.js
let visitorDocRef = null;
let isPageVisible = true;

/**
 * Get or generate session ID
 * Reuses sessionId from analytics.js if available
 */
function getSessionId() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitor-tracking.js:23',message:'getSessionId called',data:{hasAnalytics:!!window.analytics,hasSessionId:!!(window.analytics?.sessionId)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  // Try to get from analytics.js if available (preferred source)
  if (window.analytics && window.analytics.sessionId) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitor-tracking.js:29',message:'Using sessionId from analytics.js',data:{sessionId:window.analytics.sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return window.analytics.sessionId;
  }

  // Try to get from sessionStorage
  const storedSessionId = sessionStorage.getItem('analytics_session_id');
  if (storedSessionId) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitor-tracking.js:36',message:'Using sessionId from sessionStorage',data:{sessionId:storedSessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return storedSessionId;
  }

  // Generate new session ID (should not normally happen if analytics.js loaded first)
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('analytics_session_id', newSessionId);
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'visitor-tracking.js:43',message:'Generated new sessionId',data:{sessionId:newSessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  return newSessionId;
}

/**
 * Get Firestore database instance
 * Works with either firebase-config.js or inline Firebase initialization
 */
function getFirestoreDb() {
  // Try firebase-config.js global (admin/js/firebase-config.js)
  if (window.firebaseDb) {
    return window.firebaseDb;
  }

  // Try inline Firebase initialization (public pages)
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    return firebase.firestore();
  }

  // Fallback: check if db variable exists (from inline scripts)
  if (typeof db !== 'undefined' && db) {
    return db;
  }

  return null;
}

/**
 * Send heartbeat to Firestore
 * Creates or updates visitor document with current timestamp
 */
async function sendHeartbeat() {
  try {
    const db = getFirestoreDb();
    if (!db) {
      console.warn('Firestore not available. Visitor tracking paused.');
      return;
    }

    const currentSessionId = getSessionId();
    const pageUrl = window.location.href;
    const userAgent = navigator.userAgent;

    // Get or create document reference
    if (!visitorDocRef) {
      visitorDocRef = db.collection(ACTIVE_VISITORS_COLLECTION).doc(currentSessionId);
    }

    // Check if document exists to determine if this is first heartbeat
    const docSnapshot = await visitorDocRef.get();
    const isNewVisitor = !docSnapshot.exists;

    // Get Firestore FieldValue for server timestamps
    // Works with both firebase global and firebase-config.js pattern
    let FieldValue;
    if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
      FieldValue = firebase.firestore.FieldValue;
    } else {
      // Fallback to client timestamp if FieldValue not available
      const now = Date.now();
      const updateData = {
        lastHeartbeat: now,
        pageUrl: pageUrl,
        userAgent: userAgent,
        updatedAt: now
      };
      if (isNewVisitor) {
        updateData.entryTime = now;
        updateData.sessionId = currentSessionId;
      }
      await visitorDocRef.set(updateData, { merge: true });
      return;
    }

    const updateData = {
      lastHeartbeat: FieldValue.serverTimestamp(),
      pageUrl: pageUrl,
      userAgent: userAgent,
      updatedAt: FieldValue.serverTimestamp()
    };

    // Set entryTime only on first heartbeat (new visitor)
    if (isNewVisitor) {
      updateData.entryTime = FieldValue.serverTimestamp();
      updateData.sessionId = currentSessionId;
    }

    // Update or create document
    await visitorDocRef.set(updateData, { merge: true });

  } catch (error) {
    console.error('Error sending visitor heartbeat:', error);
    // Don't throw - visitor tracking failures shouldn't break the page
  }
}

/**
 * Cleanup visitor document on page unload
 */
async function cleanupVisitor() {
  try {
    if (visitorDocRef) {
      await visitorDocRef.delete();
      visitorDocRef = null;
    }
  } catch (error) {
    // Ignore errors during cleanup (page is unloading anyway)
    console.warn('Error cleaning up visitor document:', error);
  }
}

/**
 * Start heartbeat interval
 */
function startHeartbeat() {
  if (heartbeatTimer) {
    return; // Already running
  }

  // Send initial heartbeat immediately
  sendHeartbeat();

  // Set up interval for periodic heartbeats
  heartbeatTimer = setInterval(() => {
    if (isPageVisible) {
      sendHeartbeat();
    }
  }, HEARTBEAT_INTERVAL);

  isTracking = true;
}

/**
 * Stop heartbeat interval
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  isTracking = false;
}

/**
 * Handle page visibility changes
 * Pause heartbeat when page is hidden to save resources
 */
function handleVisibilityChange() {
  if (document.hidden) {
    isPageVisible = false;
  } else {
    isPageVisible = true;
    // Send heartbeat immediately when page becomes visible again
    if (isTracking) {
      sendHeartbeat();
    }
  }
}

/**
 * Initialize visitor tracking
 * Should be called on page load
 */
function initVisitorTracking() {
  // Don't track on admin pages
  if (window.location.pathname.includes('/admin-') || window.location.pathname.includes('admin-')) {
    return;
  }

  // Check if Firestore is available
  const db = getFirestoreDb();
  if (!db) {
    console.warn('Visitor tracking: Firestore not initialized. Skipping visitor tracking.');
    return;
  }

  // Set up page visibility listener
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Set up beforeunload cleanup
  window.addEventListener('beforeunload', () => {
    // Use sendBeacon for more reliable cleanup (but Firestore doesn't support it, so we'll try regular delete)
    cleanupVisitor();
  });

  // Also try cleanup on pagehide (more reliable than beforeunload)
  window.addEventListener('pagehide', () => {
    cleanupVisitor();
  });

  // Start heartbeat
  startHeartbeat();
}

/**
 * Stop visitor tracking (for cleanup/testing)
 */
function stopVisitorTracking() {
  stopHeartbeat();
  cleanupVisitor();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}

// Export to global scope for manual initialization if needed
window.visitorTracking = {
  init: initVisitorTracking,
  stop: stopVisitorTracking,
  sendHeartbeat: sendHeartbeat,
  getSessionId: getSessionId
};

// Auto-initialize on DOMContentLoaded if not disabled
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorTracking);
} else {
  // DOM already loaded
  initVisitorTracking();
}


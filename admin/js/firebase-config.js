/**
 * Firebase Configuration for Spoolin Industries Admin Panel
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create a new project or select existing project
 * 3. Enable Authentication (Email/Password)
 * 4. Enable Firestore Database:
 *    - Go to Firestore Database in Firebase Console
 *    - Click "Create database"
 *    - Choose production or test mode
 *    - IMPORTANT: Also enable the Firestore API in Google Cloud Console:
 *      https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=YOUR_PROJECT_ID
 * 5. Enable Firebase Storage:
 *    - Go to Storage in Firebase Console
 *    - Click "Get started"
 *    - Choose production or test mode
 * 6. Go to Project Settings > General > Your apps > Web app
 * 7. Copy the Firebase config object and replace the placeholder values below
 * 8. Set up Firestore Security Rules (see comments below)
 * 9. Set up Storage Security Rules (see comments below)
 * 
 * TROUBLESHOOTING:
 * If you see "Cloud Firestore API has not been used" error:
 * - Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=spoolin-industries
 * - Click "Enable" button
 * - Wait 2-5 minutes for changes to propagate
 * - Refresh your admin panel page
 */

// Firebase SDK imports (loaded via CDN in HTML)
// Make sure to include these scripts in your HTML BEFORE this config file:
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyD4gAhmIfoP1qXSupDTxNDwXFSb6QfyzDA",
  authDomain: "spoolin-industries.firebaseapp.com",
  projectId: "spoolin-industries",
  storageBucket: "spoolin-industries.firebasestorage.app",
  messagingSenderId: "21817997808",
  appId: "1:21817997808:web:e758b7c7750536e8f10535",
  measurementId: "G-6SVL3HH0FH"
};

// Initialize Firebase
let app, auth, db, storage;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
} catch (error) {
  console.error('Firebase initialization error:', error);
  // If Firebase is not properly configured, show error
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-error';
      errorDiv.innerHTML = '<strong>Firebase Configuration Error:</strong> Please configure Firebase in admin/js/firebase-config.js';
      document.body.insertBefore(errorDiv, document.body.firstChild);
    });
  }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
async function checkAuth() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      resolve(!!user);
    });
  });
}

/**
 * Get current user
 * @returns {Promise<firebase.User|null>}
 */
async function getCurrentUser() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      resolve(user);
    });
  });
}

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<firebase.auth.UserCredential>}
 */
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Track admin login
    if (window.analytics) {
      window.analytics.trackEvent('admin_login', {
        user_id: userCredential.user.uid
      });
    }
    
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    
    // Track failed login
    if (window.analytics) {
      window.analytics.trackEvent('admin_login_failed', {
        error_code: error.code || 'unknown'
      });
    }
    
    throw error;
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
async function signOut() {
  try {
    // Track admin logout before signing out
    if (window.analytics && auth.currentUser) {
      window.analytics.trackEvent('admin_logout', {
        user_id: auth.currentUser.uid
      });
    }
    
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

/**
 * Initialize auth state listener
 * @param {Function} callback - Called when auth state changes
 */
function onAuthStateChanged(callback) {
  auth.onAuthStateChanged(callback);
}

// ============================================
// EXPORTS (for use in other scripts)
// ============================================
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
window.firebaseHelpers = {
  checkAuth,
  getCurrentUser,
  signIn,
  signOut,
  requireAuth,
  onAuthStateChanged
};

// ============================================
// FIRESTORE SECURITY RULES (for reference)
// ============================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - only authenticated admins can read/write
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    
    // Orders collection - only authenticated admins can read/write
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Services collection - only authenticated admins can read/write
    match /services/{serviceId} {
      allow read, write: if request.auth != null;
    }
    
    // Users collection - only authenticated admins can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
*/

// ============================================
// STORAGE SECURITY RULES (for reference)
// ============================================
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Products images - authenticated admins can upload, public can read
    match /products/{allPaths=**} {
      allow read: if true; // Public read for product images
      allow write: if request.auth != null; // Only authenticated admins can upload
    }
    
    // Admin uploads - only authenticated admins can upload
    match /admin/{allPaths=**} {
      allow read: if true; // Public read for images
      allow write: if request.auth != null; // Only authenticated admins can upload
    }
  }
}
*/


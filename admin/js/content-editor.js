/**
 * Content Editor Module for Admin Content Editing
 * Allows authenticated admins to edit page content inline with auto-save to Firestore
 */

// Content mapping configuration
const CONTENT_MAP = {
  // Header section (#aheader1-6)
  headerTitle: {
    selector: '#aheader1-6 h1.mbr-section-title',
    description: 'Header Title'
  },
  headerSubtitle: {
    selector: '#aheader1-6 p.mbr-text strong',
    description: 'Header Subtitle'
  },
  
  // Features loop section (#features03-w)
  featuresLoop1: {
    selector: '#features03-w .item.item_1[data-direction="1"]',
    description: 'Features Loop 1',
    attribute: 'data-linewords'
  },
  featuresLoop2: {
    selector: '#features03-w .item.item_2[data-direction="-1"]',
    description: 'Features Loop 2',
    attribute: 'data-linewords'
  },
  
  // Featured Products section
  featuredProductsTitle: {
    selector: '#featured-products .title-wrapper',
    description: 'Featured Products Title'
  },
  
  // Team section (#features07-1c)
  teamTitle: {
    selector: '#features07-1c .title-wrapper h2',
    description: 'Team Title'
  },
  teamDescription: {
    selector: '#features07-1c .text-wrapper p',
    description: 'Team Description'
  },
  
  // Gallery section (#gallery1-s)
  galleryTitle: {
    selector: '#gallery1-s .gallery-title',
    description: 'Gallery Title'
  },
  gallerySubtitle: {
    selector: '#gallery1-s .gallery-subtitle',
    description: 'Gallery Subtitle'
  },
  
  // Reasons section (#slider02-1h)
  reasonsTitle: {
    selector: '#slider02-1h h2.mbr-section-title strong',
    description: 'Reasons Title'
  },
  reasonCard1: {
    selector: '#slider02-1h .embla__container .embla__slide:first-of-type .card-box',
    description: 'Reason Card 1'
  },
  reasonCard2: {
    selector: '#slider02-1h .embla__container .embla__slide:nth-of-type(2) .card-box',
    description: 'Reason Card 2'
  },
  reasonCard3: {
    selector: '#slider02-1h .embla__container .embla__slide:nth-of-type(3) .card-box',
    description: 'Reason Card 3'
  },
  reasonCard4: {
    selector: '#slider02-1h .embla__container .embla__slide:nth-of-type(4) .card-box',
    description: 'Reason Card 4'
  },
  reasonCard5: {
    selector: '#slider02-1h .embla__container .embla__slide:nth-of-type(5) .card-box',
    description: 'Reason Card 5'
  },
  
  // FAQ section (#list01-15)
  faqTitle: {
    selector: '#list01-15 .title-wrapper h2',
    description: 'FAQ Title'
  },
  faqQuestion1: {
    selector: '#list01-15 .card:nth-child(1) .panel-title-edit strong',
    description: 'FAQ Question 1'
  },
  faqAnswer1: {
    selector: '#list01-15 .card:nth-child(1) .panel-text',
    description: 'FAQ Answer 1'
  },
  faqQuestion2: {
    selector: '#list01-15 .card:nth-child(2) .panel-title-edit strong',
    description: 'FAQ Question 2'
  },
  faqAnswer2: {
    selector: '#list01-15 .card:nth-child(2) .panel-text',
    description: 'FAQ Answer 2'
  },
  faqQuestion3: {
    selector: '#list01-15 .card:nth-child(3) .panel-title-edit strong',
    description: 'FAQ Question 3'
  },
  faqAnswer3: {
    selector: '#list01-15 .card:nth-child(3) .panel-text',
    description: 'FAQ Answer 3'
  },
  faqQuestion4: {
    selector: '#list01-15 .card:nth-child(4) .panel-title-edit strong',
    description: 'FAQ Question 4'
  },
  faqAnswer4: {
    selector: '#list01-15 .card:nth-child(4) .panel-text',
    description: 'FAQ Answer 4'
  },
  faqQuestion5: {
    selector: '#list01-15 .card:nth-child(5) .panel-title-edit strong',
    description: 'FAQ Question 5'
  },
  faqAnswer5: {
    selector: '#list01-15 .card:nth-child(5) .panel-text',
    description: 'FAQ Answer 5'
  },
  faqQuestion6: {
    selector: '#list01-15 .card:nth-child(6) .panel-title-edit strong',
    description: 'FAQ Question 6'
  },
  faqAnswer6: {
    selector: '#list01-15 .card:nth-child(6) .panel-text',
    description: 'FAQ Answer 6'
  }
};

// Global state
let isEditMode = false;
let isAdmin = false;
let saveTimeouts = {};
let contentEditor = null;

// Initialize content editor
async function initContentEditor() {
  // Check if Firebase is available
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.warn('Content Editor: Firebase not loaded');
    return;
  }

  // Wait a bit for page scripts to initialize
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Check if user is admin
  try {
    const auth = firebase.auth();
    
    // Check auth state
    const checkAdminAndShowToggle = async () => {
      // Always hide first, then show only if admin
      hideEditModeToggle();
      
      const user = auth.currentUser;
      console.log('Content Editor: Checking admin status, user:', user ? user.email : 'none');
      
      if (user) {
        // Use window.checkIsAdmin if available, otherwise use fallback
        let adminCheckResult = false;
        if (typeof window.checkIsAdmin === 'function') {
          adminCheckResult = await window.checkIsAdmin();
          console.log('Content Editor: Using window.checkIsAdmin, result:', adminCheckResult, 'for user:', user.email);
        } else {
          adminCheckResult = await checkIsAdminForContentEditor(user);
          console.log('Content Editor: Using fallback checkIsAdmin, result:', adminCheckResult, 'for user:', user.email);
        }
        
        isAdmin = adminCheckResult;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:166',message:'Admin check result for content editor',data:{isAdmin:adminCheckResult,userEmail:user.email,uid:user.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H8'})}).catch(()=>{});
        // #endregion
        
        if (isAdmin) {
          console.log('Content Editor: User is admin, showing edit toggle');
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:177',message:'Admin check passed, showing toggle',data:{isAdmin,userEmail:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H8'})}).catch(()=>{});
          // #endregion
          showEditModeToggle();
          await loadSavedContent();
        } else {
          console.log('Content Editor: User is not admin, hiding edit toggle for:', user.email);
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:182',message:'Admin check failed, hiding toggle',data:{isAdmin,userEmail:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H8'})}).catch(()=>{});
          // #endregion
          hideEditModeToggle();
          
          // Double-check: ensure button is actually hidden
          const toggleBtn = document.getElementById('content-editor-toggle');
          if (toggleBtn && toggleBtn.style.display !== 'none') {
            console.warn('Content Editor: WARNING - Non-admin user, forcing toggle button to hidden');
            toggleBtn.style.display = 'none';
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:192',message:'Forced toggle button hidden for non-admin',data:{isAdmin,userEmail:user.email,uid:user.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H8'})}).catch(()=>{});
            // #endregion
          }
        }
      } else {
        console.log('Content Editor: No user logged in');
        isAdmin = false;
        hideEditModeToggle();
        exitEditMode();
      }
    };
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      console.log('Content Editor: Auth state changed, user:', user ? user.email : 'none');
      await checkAdminAndShowToggle();
    });
    
    // Also check immediately if user is already logged in
    await checkAdminAndShowToggle();
  } catch (error) {
    console.error('Content Editor: Error checking auth:', error);
  }
}

// Check if user is admin (fallback function if window.checkIsAdmin doesn't exist)
async function checkIsAdminForContentEditor(user) {
  try {
    if (!user) return false;
    
    // Check custom claims first
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims && idTokenResult.claims.role === 'admin') {
      return true;
    }

    // Fallback: Check Firestore users collection
    const db = firebase.firestore();
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists && userDoc.data().role === 'admin') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Content Editor: Error checking admin status:', error);
    return false;
  }
}

// Show edit mode toggle button
function showEditModeToggle() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:200',message:'showEditModeToggle called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  let toggleBtn = document.getElementById('content-editor-toggle');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.id = 'content-editor-toggle';
    toggleBtn.className = 'content-editor-toggle';
    toggleBtn.innerHTML = '<span class="mobi-mbri mobi-mbri-edit mbr-iconfont"></span> <span>Edit Mode</span>';
    toggleBtn.addEventListener('click', toggleEditMode);
    document.body.appendChild(toggleBtn);
    console.log('Content Editor: Created edit toggle button');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:208',message:'Edit toggle button created',data:{buttonId:toggleBtn.id,parentExists:!!document.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
  }
  toggleBtn.style.display = 'flex';
  // Force inline style to ensure it's shown
  toggleBtn.setAttribute('style', 'display: flex !important;');
  const computedStyle = window.getComputedStyle(toggleBtn);
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:212',message:'Edit toggle button display set',data:{buttonId:toggleBtn.id,inlineStyle:toggleBtn.style.display,computedDisplay:computedStyle.display,computedVisibility:computedStyle.visibility,buttonExists:!!toggleBtn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
  // #endregion
  console.log('Content Editor: Showing edit toggle button');
}

// Hide edit mode toggle button
function hideEditModeToggle() {
  const toggleBtn = document.getElementById('content-editor-toggle');
  if (toggleBtn) {
    toggleBtn.style.display = 'none';
    // Force inline style to override any CSS that might show it
    toggleBtn.setAttribute('style', 'display: none !important;');
    console.log('Content Editor: Hiding edit toggle button');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:225',message:'hideEditModeToggle called',data:{buttonExists:!!toggleBtn},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H8'})}).catch(()=>{});
    // #endregion
  }
}

// Toggle edit mode
function toggleEditMode() {
  isEditMode = !isEditMode;
  if (isEditMode) {
    enterEditMode();
  } else {
    exitEditMode();
  }
  updateToggleButton();
}

// Enter edit mode
function enterEditMode() {
  isEditMode = true;
  
  // Show banner
  showEditModeBanner();
  
  // Make all mapped elements editable
  Object.keys(CONTENT_MAP).forEach(key => {
    const config = CONTENT_MAP[key];
    const element = document.querySelector(config.selector);
    if (element) {
      element.classList.add('content-editable-element');
      if (config.attribute) {
        // For data attributes, we'll handle separately
        element.setAttribute('data-content-key', key);
      } else {
        element.setAttribute('contenteditable', 'true');
        element.setAttribute('data-content-key', key);
        
        // Add blur handler for auto-save
        element.addEventListener('blur', handleContentBlur);
        
        // Prevent Enter key from creating new lines (optional, can be removed)
        element.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            element.blur();
          }
        });
      }
    }
  });
  
  // Special handling for data attributes (features loop)
  const loop1 = document.querySelector('#features03-w .item.item_1[data-direction="1"]');
  const loop2 = document.querySelector('#features03-w .item.item_2[data-direction="-1"]');
  
  if (loop1) {
    loop1.classList.add('content-editable-element');
    loop1.addEventListener('click', () => editDataAttribute(loop1, 'featuresLoop1', 'data-linewords'));
  }
  if (loop2) {
    loop2.classList.add('content-editable-element');
    loop2.addEventListener('click', () => editDataAttribute(loop2, 'featuresLoop2', 'data-linewords'));
  }
}

// Exit edit mode
function exitEditMode() {
  isEditMode = false;
  
  // Hide banner
  hideEditModeBanner();
  
  // Remove editable attributes and classes
  Object.keys(CONTENT_MAP).forEach(key => {
    const config = CONTENT_MAP[key];
    const element = document.querySelector(config.selector);
    if (element) {
      element.classList.remove('content-editable-element');
      element.removeAttribute('contenteditable');
      element.removeAttribute('data-content-key');
      element.removeEventListener('blur', handleContentBlur);
    }
  });
  
  // Remove data attribute handlers
  const loop1 = document.querySelector('#features03-w .item.item_1[data-direction="1"]');
  const loop2 = document.querySelector('#features03-w .item.item_2[data-direction="-1"]');
  if (loop1) {
    loop1.classList.remove('content-editable-element');
    loop1.replaceWith(loop1.cloneNode(true)); // Remove event listeners
  }
  if (loop2) {
    loop2.classList.remove('content-editable-element');
    loop2.replaceWith(loop2.cloneNode(true)); // Remove event listeners
  }
}

// Show edit mode banner
function showEditModeBanner() {
  let banner = document.getElementById('content-editor-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'content-editor-banner';
    banner.className = 'content-editor-banner';
    banner.innerHTML = '<span>✏️ Edit Mode Active</span><span>Click any highlighted text to edit</span>';
    document.body.insertBefore(banner, document.body.firstChild);
  }
  banner.style.display = 'flex';
}

// Hide edit mode banner
function hideEditModeBanner() {
  const banner = document.getElementById('content-editor-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Update toggle button text
function updateToggleButton() {
  const toggleBtn = document.getElementById('content-editor-toggle');
  if (toggleBtn) {
    if (isEditMode) {
      toggleBtn.innerHTML = '<span class="mobi-mbri mobi-mbri-close mbr-iconfont"></span> Exit Edit Mode';
      toggleBtn.classList.add('active');
    } else {
      toggleBtn.innerHTML = '<span class="mobi-mbri mobi-mbri-edit mbr-iconfont"></span> Edit Mode';
      toggleBtn.classList.remove('active');
    }
  }
}

// Handle content blur (auto-save)
function handleContentBlur(e) {
  const element = e.target;
  const contentKey = element.getAttribute('data-content-key');
  
  if (!contentKey) return;
  
  // Clear any existing timeout for this key
  if (saveTimeouts[contentKey]) {
    clearTimeout(saveTimeouts[contentKey]);
  }
  
  // Debounce save (save 500ms after user stops typing)
  saveTimeouts[contentKey] = setTimeout(() => {
    saveContent(contentKey, element);
  }, 500);
}

// Edit data attribute (for features loop)
function editDataAttribute(element, contentKey, attributeName) {
  const currentValue = element.getAttribute(attributeName) || '';
  const newValue = prompt(`Edit ${CONTENT_MAP[contentKey].description}:`, currentValue);
  
  if (newValue !== null && newValue !== currentValue) {
    element.setAttribute(attributeName, newValue);
    // Update all duplicate elements with same class
    const allElements = document.querySelectorAll(`${element.tagName}.${element.className.split(' ').join('.')}`);
    allElements.forEach(el => {
      if (el.getAttribute('data-direction') === element.getAttribute('data-direction')) {
        el.setAttribute(attributeName, newValue);
      }
    });
    saveContent(contentKey, element, attributeName);
  }
}

// Save content to Firestore
async function saveContent(contentKey, element, attributeName = null) {
  try {
    const db = firebase.firestore();
    const contentDoc = db.collection('siteContent').doc('indexPage');
    
    let contentValue;
    if (attributeName) {
      contentValue = element.getAttribute(attributeName);
    } else {
      contentValue = element.innerHTML;
    }
    
    // Get current document
    const doc = await contentDoc.get();
    const currentData = doc.exists ? doc.data() : {};
    
    // Update with new content
    await contentDoc.set({
      ...currentData,
      [contentKey]: contentValue,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: firebase.auth().currentUser.uid
    }, { merge: true });
    
    // Show success indicator (brief flash)
    showSaveIndicator(element);
    
  } catch (error) {
    console.error('Content Editor: Error saving content:', error);
    showError('Failed to save changes. Please try again.');
  }
}

// Load saved content from Firestore
async function loadSavedContent() {
  try {
    // Wait a moment to ensure auth is ready
    const auth = firebase.auth();
    if (!auth.currentUser) {
      console.log('Content Editor: No user authenticated, skipping content load');
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:471',message:'Skipping load - no authenticated user',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H7'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    const db = firebase.firestore();
    const contentDoc = db.collection('siteContent').doc('indexPage');
    const docPath = 'siteContent/indexPage';
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:480',message:'Attempting to load saved content',data:{docPath,userId:auth.currentUser.uid,isAuthenticated:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion
    const doc = await contentDoc.get();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:475',message:'Document read result',data:{docPath,exists:doc.exists,hasPermission:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion
    
    if (!doc.exists) {
      // No saved content, use defaults from HTML
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:479',message:'No saved content found, using defaults',data:{docPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H7'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    const savedData = doc.data();
    
    // Apply saved content to elements
    Object.keys(CONTENT_MAP).forEach(key => {
      if (savedData[key] !== undefined) {
        const config = CONTENT_MAP[key];
        const element = document.querySelector(config.selector);
        
        if (element) {
          if (config.attribute) {
            // Set data attribute
            element.setAttribute(config.attribute, savedData[key]);
            // Update all duplicate elements
            const allElements = document.querySelectorAll(`${element.tagName}.${element.className.split(' ').join('.')}`);
            allElements.forEach(el => {
              if (el.getAttribute('data-direction') === element.getAttribute('data-direction')) {
                el.setAttribute(config.attribute, savedData[key]);
              }
            });
          } else {
            // Set innerHTML
            element.innerHTML = savedData[key];
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Content Editor: Error loading saved content:', error);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:507',message:'Error loading saved content',data:{error:error.message,errorCode:error.code,docPath:'siteContent/indexPage',userId:firebase.auth().currentUser?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion
    
    // If it's a permissions error, log more details
    if (error.code === 'permission-denied' || error.message.includes('permission')) {
      console.warn('Content Editor: Permission denied - Firestore rules may need updating');
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'content-editor.js:511',message:'Permission denied error details',data:{errorCode:error.code,isAuthenticated:!!firebase.auth().currentUser,uid:firebase.auth().currentUser?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H7'})}).catch(()=>{});
      // #endregion
    }
  }
}

// Show save indicator (brief visual feedback)
function showSaveIndicator(element) {
  element.style.transition = 'background-color 0.3s ease';
  element.style.backgroundColor = 'rgba(238, 37, 36, 0.2)';
  
  setTimeout(() => {
    element.style.backgroundColor = '';
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
  }, 500);
}

// Show error message
function showError(message) {
  // Create or update error toast
  let errorToast = document.getElementById('content-editor-error');
  if (!errorToast) {
    errorToast = document.createElement('div');
    errorToast.id = 'content-editor-error';
    errorToast.className = 'content-editor-error';
    document.body.appendChild(errorToast);
  }
  
  errorToast.textContent = message;
  errorToast.style.display = 'block';
  
  setTimeout(() => {
    errorToast.style.display = 'none';
  }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentEditor);
} else {
  initContentEditor();
}

// Export for global access
window.contentEditor = {
  init: initContentEditor,
  toggle: toggleEditMode,
  enter: enterEditMode,
  exit: exitEditMode
};


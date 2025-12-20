/**
 * Products Management - CRUD Operations with Multiple Images
 * Handles Firestore operations and Firebase Storage image uploads
 */

// Debug logging helper - only logs on localhost to avoid CORS errors on deployed sites
function debugLog(location, message, data, hypothesisId) {
  // Only send debug logs when running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    fetch('http://127.0.0.1:7243/ingest/5f4ec72d-ca00-4592-8679-29f4832c95bd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: location,
        message: message,
        data: data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: hypothesisId
      })
    }).catch(() => {});
  }
}

// Wait for Firebase to be initialized
document.addEventListener('DOMContentLoaded', async () => {
  // Check if page is opened via file:// protocol (CORS will block uploads)
  if (window.location.protocol === 'file:') {
    const errorMessage = `
      <div style="padding: 20px;">
        <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
          <i class="fas fa-exclamation-triangle"></i> File Protocol Detected
        </h3>
        <p style="margin-bottom: 15px; color: var(--admin-text);">
          You're opening this page directly from your file system (file:// protocol). Firebase Storage uploads require a web server due to CORS security restrictions.
        </p>
        <p style="margin-bottom: 15px; color: var(--admin-text);">
          <strong>Solution:</strong> Run a local web server and access the page via http://localhost
        </p>
        <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
          <li><strong>Python 3:</strong> Open terminal in this folder and run:<br>
            <code style="background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">python -m http.server 8000</code><br>
            Then visit: <a href="http://localhost:8000/admin-products.html" style="color: var(--admin-red-secondary);">http://localhost:8000/admin-products.html</a>
          </li>
          <li><strong>Node.js:</strong> Install http-server: <code style="background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 4px;">npm install -g http-server</code><br>
            Then run: <code style="background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 4px;">http-server -p 8000</code>
          </li>
          <li><strong>VS Code:</strong> Install "Live Server" extension, then right-click the HTML file and select "Open with Live Server"</li>
        </ol>
        <p style="color: var(--admin-text-muted); font-size: 0.9rem; margin-top: 15px;">
          <strong>Note:</strong> Reading products will work, but image uploads will fail until you use a web server.
        </p>
      </div>
    `;
    showAlert(errorMessage, 'error');
  }
  
  // Check authentication
  const isAuthenticated = await window.firebaseHelpers.requireAuth();
  if (!isAuthenticated) return;

  // Initialize products management
  await initProducts();
});

let productsCollection;
let currentEditId = null;
let productImages = []; // Array to store multiple images
let allProducts = []; // Store all products for filtering

/**
 * Initialize products management
 */
async function initProducts() {try {
    // Check if Firestore is available
    if (!window.firebaseDb) {throw new Error('Firestore is not initialized. Please check Firebase configuration.');
    }productsCollection = window.firebaseDb.collection('products');
    
    // Load existing products
    await loadProducts();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Set up modal handlers
    setupModalHandlers();
    
    // Set up image management
    setupImageManagement();} catch (error) {
    console.error('Error initializing products:', error);// Check for database doesn't exist error
    if (error.code === 'not-found' && error.message && error.message.includes('does not exist')) {const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-database"></i> Firestore Database Not Created
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            The Firestore database does not exist for this project. You need to create it first.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.firebase.google.com/project/spoolin-industries/firestore" target="_blank" style="color: var(--admin-red-secondary);">Firebase Console - Firestore</a></li>
            <li>Click "Create database"</li>
            <li>Choose "Start in production mode" or "Start in test mode"</li>
            <li>Select a location for your database</li>
            <li>Wait for the database to be created</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      `;
      showAlert(errorMessage, 'error');
    }
    // Check for Firestore API not enabled error
    else if (error.code === 'permission-denied' && error.message && error.message.includes('Cloud Firestore API has not been used')) {const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-exclamation-triangle"></i> Firestore API Not Enabled
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            The Cloud Firestore API needs to be enabled in your Firebase project.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=spoolin-industries" target="_blank" style="color: var(--admin-red-secondary);">Google Cloud Console</a></li>
            <li>Click "Enable" to activate the Firestore API</li>
            <li>Wait a few minutes for the changes to propagate</li>
            <li>Refresh this page</li>
          </ol>
          <p style="color: var(--admin-text-muted); font-size: 0.9rem;">
            <strong>Note:</strong> You may also need to enable Firestore in the 
            <a href="https://console.firebase.google.com/project/spoolin-industries/firestore" target="_blank" style="color: var(--admin-red-secondary);">Firebase Console</a> 
            if you haven't created a database yet.
          </p>
        </div>
      `;
      showAlert(errorMessage, 'error');
    }
    // Check for security rules blocking access
    else if (error.code === 'permission-denied' && (error.message.includes('Missing or insufficient permissions') || error.message.includes('permission-denied'))) {const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-shield-alt"></i> Firestore Security Rules Blocking Access
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            Your Firestore security rules are preventing access. Update the rules to allow authenticated users.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.firebase.google.com/project/spoolin-industries/firestore/rules" target="_blank" style="color: var(--admin-red-secondary);">Firestore Rules</a></li>
            <li>Add rules to allow authenticated access to products collection</li>
            <li>Click "Publish"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      `;
      showAlert(errorMessage, 'error');
    } else {showAlert('Error initializing products: ' + (error.message || 'Please check Firebase configuration.'), 'error');
    }
  }
}

/**
 * Load all products from Firestore
 */
async function loadProducts() {try {
    showLoading(true);const snapshot = await productsCollection.orderBy('createdAt', 'desc').get();const products = [];
    
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Store all products for filtering
    allProducts = products;
    
    renderProductsTable(products);
    showLoading(false);
  } catch (error) {
    console.error('Error loading products:', error);// Check for database doesn't exist error
    if (error.code === 'not-found' && error.message && error.message.includes('does not exist')) {const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-database"></i> Firestore Database Not Created
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            The Firestore database does not exist for this project. You need to create it first.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.firebase.google.com/project/spoolin-industries/firestore" target="_blank" style="color: var(--admin-red-secondary);">Firebase Console - Firestore</a></li>
            <li>Click "Create database"</li>
            <li>Choose "Start in production mode" or "Start in test mode"</li>
            <li>Select a location for your database</li>
            <li>Wait for the database to be created</li>
            <li>Refresh this page</li>
          </ol>
          <p style="color: var(--admin-text-muted); font-size: 0.9rem;">
            <strong>Note:</strong> You can also use the 
            <a href="https://console.cloud.google.com/datastore/setup?project=spoolin-industries" target="_blank" style="color: var(--admin-red-secondary);">Google Cloud Console</a> 
            to set up the database.
          </p>
        </div>
      `;
      showAlert(errorMessage, 'error');
    }
    // Check for Firestore API not enabled error
    else if (error.code === 'permission-denied' && error.message && error.message.includes('Cloud Firestore API has not been used')) {const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-exclamation-triangle"></i> Firestore API Not Enabled
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            The Cloud Firestore API needs to be enabled in your Firebase project.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=spoolin-industries" target="_blank" style="color: var(--admin-red-secondary);">Google Cloud Console</a></li>
            <li>Click "Enable" to activate the Firestore API</li>
            <li>Wait a few minutes for the changes to propagate</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      `;
      showAlert(errorMessage, 'error');
    }
    // Check for security rules blocking access
    else if (error.code === 'permission-denied' && (error.message.includes('Missing or insufficient permissions') || error.message.includes('permission-denied'))) {const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-shield-alt"></i> Firestore Security Rules Blocking Access
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            Your Firestore security rules are preventing access to the products collection. You need to update the rules to allow authenticated users to read/write.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.firebase.google.com/project/spoolin-industries/firestore/rules" target="_blank" style="color: var(--admin-red-secondary);">Firebase Console - Firestore Rules</a></li>
            <li>Update your rules to allow authenticated access. Example:</li>
          </ol>
          <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; overflow-x: auto; margin: 15px 0; color: var(--admin-text); font-size: 0.85rem;"><code>rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
  }
}</code></pre>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);" start="3">
            <li>Click "Publish" to save the rules</li>
            <li>Refresh this page</li>
          </ol>
          <p style="color: var(--admin-text-muted); font-size: 0.9rem;">
            <strong>Note:</strong> Make sure you're logged in. If you're not authenticated, you'll be redirected to the login page.
          </p>
        </div>
      `;showAlert(errorMessage, 'error');
    } else {showAlert('Error loading products: ' + error.message, 'error');
    }
    
    showLoading(false);
    
    // Show empty state in table
    const tbody = document.getElementById('products-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 40px;">
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--admin-red-primary); margin-bottom: 15px; opacity: 0.7;"></i>
            <p style="color: var(--admin-text-muted);">Unable to load products. Please check the error message above.</p>
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Render products table
 * @param {Array} products 
 */
function renderProductsTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  
  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3>No products found</h3>
            <p>Click "Add Product" to create your first product.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = products.map(product => {
    const primaryImage = product.images && product.images.length > 0 
      ? product.images.find(img => img.isPrimary) || product.images[0]
      : null;
    
    const imageCount = product.images ? product.images.length : 0;
    const statusBadge = getStatusBadge(product.status || 'active');
    
    return `
      <tr>
        <td>
          ${primaryImage 
            ? `<img src="${primaryImage.url}" alt="${product.name}" class="table-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'60\\'%3E%3Crect fill=\\'%232c2c2c\\' width=\\'60\\' height=\\'60\\'/%3E%3Ctext fill=\\'%23c7c7c7\\' font-family=\\'sans-serif\\' font-size=\\'12\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3ENo Image%3C/text%3E%3C/svg%3E';" />
               <span style="font-size: 0.75rem; color: var(--admin-text-muted); display: block; margin-top: 4px;">${imageCount} image${imageCount !== 1 ? 's' : ''}</span>`
            : '<div class="table-image" style="background-color: #2c2c2c; display: flex; align-items: center; justify-content: center; color: #c7c7c7; font-size: 0.75rem;">No Image</div>'
          }
        </td>
        <td>
          <strong>${escapeHtml(product.name)}</strong>
          ${product.sku ? `<br><small style="color: var(--admin-text-muted);">SKU: ${escapeHtml(product.sku)}</small>` : ''}
        </td>
        <td>${escapeHtml(product.category || 'N/A')}</td>
        <td>$${parseFloat(product.price || 0).toFixed(2)}</td>
        <td>${product.stock || 0}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" onclick="editProduct('${product.id}')">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}', '${escapeHtml(product.name)}')">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const badges = {
    active: '<span style="background: rgba(49, 205, 76, 0.2); color: #31cd4c; padding: 4px 12px; border-radius: 12px; font-size: 0.875rem;">Active</span>',
    inactive: '<span style="background: rgba(199, 199, 199, 0.2); color: #c7c7c7; padding: 4px 12px; border-radius: 12px; font-size: 0.875rem;">Inactive</span>',
    draft: '<span style="background: rgba(203, 39, 35, 0.2); color: #cb2723; padding: 4px 12px; border-radius: 12px; font-size: 0.875rem;">Draft</span>'
  };
  return badges[status] || badges.active;
}

/**
 * Setup form handlers
 */
function setupFormHandlers() {
  const form = document.getElementById('product-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });
}

/**
 * Setup modal handlers
 */
function setupModalHandlers() {
  // Close modal handlers
  const closeButtons = document.querySelectorAll('.modal-close, .modal-overlay');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    });
  });
  
  // Cancel button
  const cancelBtn = document.getElementById('cancel-product');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
}

/**
 * Setup image management
 */
function setupImageManagement() {
  const imageInput = document.getElementById('product-images');
  if (imageInput) {
    imageInput.addEventListener('change', handleMultipleImageUpload);
  }
}

/**
 * Handle multiple image upload preview
 */
function handleMultipleImageUpload(e) {
  const files = Array.from(e.target.files);
  const container = document.getElementById('images-preview-container');
  
  if (!container) return;
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      showAlert('Please select only image files.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        file: file,
        url: e.target.result,
        order: productImages.length,
        isPrimary: productImages.length === 0,
        isNew: true
      };
      productImages.push(imageData);
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
  
  // Clear input so same file can be added again
  e.target.value = '';
}

/**
 * Render image previews with sorting
 */
function renderImagePreviews() {
  const container = document.getElementById('images-preview-container');
  if (!container) return;
  
  if (productImages.length === 0) {
    container.innerHTML = '<p style="color: var(--admin-text-muted); text-align: center; padding: 20px;">No images added yet</p>';
    return;
  }
  
  container.innerHTML = productImages.map((image, index) => `
    <div class="image-preview-item" data-index="${index}" draggable="true">
      <img src="${image.url}" alt="Product image ${index + 1}">
      <div class="image-preview-controls">
        <button type="button" class="btn-icon" onclick="setPrimaryImage(${index})" title="Set as primary">
          <i class="fas fa-star${image.isPrimary ? ' primary-star' : '-o'}"></i>
        </button>
        <button type="button" class="btn-icon" onclick="removeImage(${index})" title="Remove">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      ${image.isPrimary ? '<div class="primary-badge">Primary</div>' : ''}
      <div class="drag-handle"><i class="fas fa-grip-vertical"></i></div>
    </div>
  `).join('');
  
  // Setup drag and drop
  setupImageDragAndDrop();
}

/**
 * Setup drag and drop for image sorting
 */
function setupImageDragAndDrop() {
  const items = document.querySelectorAll('.image-preview-item');
  let draggedItem = null;
  
  items.forEach(item => {
    item.addEventListener('dragstart', function(e) {
      draggedItem = this;
      this.style.opacity = '0.5';
    });
    
    item.addEventListener('dragend', function(e) {
      this.style.opacity = '';
    });
    
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(e.clientY);
      const container = document.getElementById('images-preview-container');
      if (afterElement == null) {
        container.appendChild(draggedItem);
      } else {
        container.insertBefore(draggedItem, afterElement);
      }
    });
    
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      updateImageOrder();
    });
  });
}

/**
 * Get drag after element
 */
function getDragAfterElement(y) {
  const container = document.getElementById('images-preview-container');
  const draggableElements = [...container.querySelectorAll('.image-preview-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Update image order based on DOM position
 */
function updateImageOrder() {
  const items = document.querySelectorAll('.image-preview-item');
  const newOrder = [];
  
  items.forEach((item, index) => {
    const oldIndex = parseInt(item.dataset.index);
    productImages[oldIndex].order = index;
    newOrder.push(productImages[oldIndex]);
  });
  
  productImages = newOrder;
  renderImagePreviews();
}

/**
 * Set primary image
 */
function setPrimaryImage(index) {
  productImages.forEach((img, i) => {
    img.isPrimary = (i === index);
  });
  renderImagePreviews();
}

/**
 * Remove image
 */
function removeImage(index) {
  productImages.splice(index, 1);
  
  // If removed primary, make first image primary
  if (productImages.length > 0 && !productImages.some(img => img.isPrimary)) {
    productImages[0].isPrimary = true;
  }
  
  renderImagePreviews();
}

/**
 * Open modal for adding new product
 */
function addProduct() {
  currentEditId = null;
  productImages = [];
  
  const form = document.getElementById('product-form');
  if (form) form.reset();
  
  renderImagePreviews();
  
  const modalTitle = document.querySelector('#product-modal .modal-header h2');
  if (modalTitle) modalTitle.textContent = 'Add New Product';
  
  openModal('product-modal');
}

/**
 * Edit product
 */
async function editProduct(productId) {
  try {
    showLoading(true);
    currentEditId = productId;
    
    const doc = await productsCollection.doc(productId).get();
    if (!doc.exists) {
      showAlert('Product not found.', 'error');
      showLoading(false);
      return;
    }
    
    const product = doc.data();
    
    // Populate form
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-sku').value = product.sku || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-stock').value = product.stock || '';
    document.getElementById('product-status').value = product.status || 'active';
    document.getElementById('product-featured').checked = product.featured || false;
    
    // Load existing images
    productImages = product.images ? product.images.map(img => ({
      ...img,
      isNew: false
    })) : [];
    
    renderImagePreviews();
    
    const modalTitle = document.querySelector('#product-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'Edit Product';
    
    openModal('product-modal');
    showLoading(false);
  } catch (error) {
    console.error('Error loading product:', error);
    showAlert('Error loading product: ' + error.message, 'error');
    showLoading(false);
  }
}

/**
 * Save product (create or update)
 */
async function saveProduct() {
  try {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    // Validate form
    const name = document.getElementById('product-name').value.trim();
    const sku = document.getElementById('product-sku').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value) || 0;
    const status = document.getElementById('product-status').value;
    const featured = document.getElementById('product-featured').checked;
    
    if (!name) {
      showAlert('Product name is required.', 'error');
      return;
    }
    
    if (isNaN(price) || price < 0) {
      showAlert('Please enter a valid price.', 'error');
      return;
    }
    
    showLoading(true);
    
    // Upload new images
    const uploadedImages = [];
    for (const image of productImages) {
      if (image.isNew && image.file) {
        // #region agent log
        debugLog('products.js:632', 'about to upload image in saveProduct', {imageFileName:image.file.name,imageFileSize:image.file.size,imageFileType:image.file.type,currentEditId:currentEditId}, 'A');
        // #endregion
        try {
          const url = await uploadImage(image.file, currentEditId);
          uploadedImages.push({
            url: url,
            order: image.order,
            isPrimary: image.isPrimary
          });
        } catch (uploadError) {
          // #region agent log
          debugLog('products.js:639', 'uploadError caught in saveProduct', {uploadErrorMessage:uploadError.message||null,uploadErrorCode:uploadError.code||null}, 'A');
          // #endregion
          showLoading(false);
          // Show user-friendly error message
          if (uploadError.message.includes('web server') || uploadError.message.includes('file://')) {
            showAlert('Cannot upload files when opening HTML directly. Please access the admin panel via a web server (e.g., http://localhost:8000/admin-products.html)', 'error');
          } else if (uploadError.message === 'CORS_STORAGE_RULES' || uploadError.message === 'STORAGE_PERMISSION_DENIED' || uploadError.message === 'STORAGE_UPLOAD_FAILED' || uploadError.message.includes('Storage permission') || uploadError.message.includes('Storage rules') || uploadError.message.includes('CORS')) {
            const errorMessage = `
              <div style="padding: 20px;">
                <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
                  <i class="fas fa-shield-alt"></i> Firebase Storage Rules Blocking Upload
                </h3>
                <p style="margin-bottom: 15px; color: var(--admin-text);">
                  Your Firebase Storage security rules are preventing image uploads. Update the rules to allow authenticated uploads to the "products/" path.
                </p>
                <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
                  <li>Go to <a href="https://console.firebase.google.com/project/spoolin-industries/storage/rules" target="_blank" style="color: var(--admin-red-secondary);">Firebase Console - Storage Rules</a></li>
                  <li>Add rules for the products path:</li>
                </ol>
                <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; overflow-x: auto; margin: 15px 0; color: var(--admin-text); font-size: 0.85rem;"><code>rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}</code></pre>
                <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);" start="3">
                  <li>Click "Publish" to save the rules</li>
                  <li>Try uploading again</li>
                </ol>
              </div>
            `;
            showAlert(errorMessage, 'error');
          } else {
            showAlert('Error uploading image: ' + uploadError.message, 'error');
          }
          return; // Stop saving product if image upload fails
        }
      } else {
        uploadedImages.push({
          url: image.url,
          order: image.order,
          isPrimary: image.isPrimary
        });
      }
    }
    
    // Track if this is a create or update
    const isUpdate = !!currentEditId;
    
    // Prepare product data
    const productData = {
      name,
      sku,
      description,
      category,
      price,
      stock,
      status,
      featured,
      images: uploadedImages,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Create or update product
    let productId = currentEditId;
    if (currentEditId) {
      await productsCollection.doc(currentEditId).update(productData);
      showAlert('Product updated successfully!', 'success');
      
      // Track product update
      if (window.analytics) {
        const user = await window.firebaseHelpers.getCurrentUser();
        window.analytics.trackEvent('update_product', {
          user_id: user ? user.uid : null,
          product_id: currentEditId,
          product_name: name,
          product_category: category
        });
      }
    } else {
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await productsCollection.add(productData);
      productId = docRef.id;
      showAlert('Product added successfully!', 'success');
      
      // Track product creation
      if (window.analytics) {
        const user = await window.firebaseHelpers.getCurrentUser();
        window.analytics.trackEvent('create_product', {
          user_id: user ? user.uid : null,
          product_id: productId,
          product_name: name,
          product_category: category
        });
      }
    }
    
    // Track image upload if images were uploaded
    if (uploadedImages.length > 0 && window.analytics) {
      const user = await window.firebaseHelpers.getCurrentUser();
      window.analytics.trackEvent('product_image_upload', {
        user_id: user ? user.uid : null,
        product_id: productId,
        image_count: uploadedImages.length
      });
    }
    
    // Reload products and close modal
    await loadProducts();
    // Reapply filters after reload
    filterProducts();
    closeModal();
    showLoading(false);
  } catch (error) {
    console.error('Error saving product:', error);
    showAlert('Error saving product: ' + error.message, 'error');
    showLoading(false);
  }
}

/**
 * Upload image to Firebase Storage
 */
async function uploadImage(file, productId = null) {
  // #region agent log
  debugLog('products.js:752', 'uploadImage entry', {fileName:file.name,fileSize:file.size,fileType:file.type,productId:productId,protocol:window.location.protocol,origin:window.location.origin}, 'A');
  // #endregion
  try {
    // #region agent log
    const authUser = await window.firebaseHelpers.getCurrentUser();
    debugLog('products.js:758', 'auth state before upload', {isAuthenticated:!!authUser,userId:authUser?.uid||null,email:authUser?.email||null}, 'B');
    // #endregion
    
    const storage = firebase.storage();
    // #region agent log
    debugLog('products.js:763', 'storage initialized', {storageBucket:storage.app.options.storageBucket||null,appName:storage.app.name||null}, 'C');
    // #endregion
    
    const timestamp = Date.now();
    const fileName = productId 
      ? `products/${productId}_${timestamp}_${file.name}`
      : `products/${timestamp}_${file.name}`;
    // #region agent log
    debugLog('products.js:771', 'storage path before put', {fileName:fileName,fullPath:`gs://${storage.app.options.storageBucket}/${fileName}`}, 'D');
    // #endregion
    
    const storageRef = storage.ref().child(fileName);
    // #region agent log
    debugLog('products.js:776', 'about to call put', {refPath:storageRef.fullPath||null}, 'E');
    // #endregion
    
    await storageRef.put(file);
    // #region agent log
    debugLog('products.js:781', 'put succeeded', {}, 'E');
    // #endregion
    
    const downloadURL = await storageRef.getDownloadURL();
    // #region agent log
    debugLog('products.js:785', 'uploadImage success', {downloadURL:downloadURL}, 'E');
    // #endregion
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    // #region agent log
    debugLog('products.js:791', 'uploadImage error caught', {errorCode:error.code||null,errorMessage:error.message||null,errorStack:error.stack?.substring(0,500)||null,errorName:error.name||null,isCORS:error.message&&(error.message.includes('CORS')||error.message.includes('cors')||error.message.includes('preflight')||error.message.includes('access control')),isFileProtocol:window.location.protocol==='file:'}, 'A');
    // #endregion
    
    // Check for CORS error - this usually indicates Storage rules or API issue
    const errorMsg = (error.message || '').toLowerCase();
    const errorCode = error.code || '';
    const isCORS = errorMsg.includes('cors') || errorMsg.includes('preflight') || errorMsg.includes('access control') || errorMsg.includes('cross-origin');
    const isFileProtocol = window.location.protocol === 'file:';
    // Network errors (ERR_FAILED, network error) on authenticated requests often indicate Storage rules blocking preflight
    const isNetworkError = errorCode === 'storage/unknown' || errorMsg.includes('failed') || errorMsg.includes('network') || errorMsg.includes('err_failed');
    const isAuthenticated = await window.firebaseHelpers.getCurrentUser() !== null;
    
    if (isCORS || (isNetworkError && isAuthenticated && !isFileProtocol)) {
      if (isFileProtocol) {
        throw new Error('Cannot upload files when opening HTML directly. Please use a web server (e.g., http://localhost).');
      } else {
        // CORS error on deployed site = Storage rules issue
        throw new Error('CORS_STORAGE_RULES');
      }
    }
    
    // Check for permission denied
    if (error.code === 'storage/unauthorized' || error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
      throw new Error('STORAGE_PERMISSION_DENIED');
    }
    
    // Check for network/404 errors
    if (error.code === 'storage/unknown' || error.message.includes('Failed to load resource') || error.message.includes('404') || error.message.includes('ERR_FAILED')) {
      throw new Error('STORAGE_UPLOAD_FAILED');
    }
    
    throw new Error('Failed to upload image: ' + error.message);
  }
}

/**
 * Delete product
 */
async function deleteProduct(productId, productName) {
  if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    showLoading(true);
    await productsCollection.doc(productId).delete();
    showAlert('Product deleted successfully!', 'success');
    
    // Track product deletion
    if (window.analytics) {
      const user = await window.firebaseHelpers.getCurrentUser();
      window.analytics.trackEvent('delete_product', {
        user_id: user ? user.uid : null,
        product_id: productId,
        product_name: productName
      });
    }
    
    await loadProducts();
    // Reapply filters after reload
    filterProducts();
    showLoading(false);
  } catch (error) {
    console.error('Error deleting product:', error);
    showAlert('Error deleting product: ' + error.message, 'error');
    showLoading(false);
  }
}

/**
 * Open modal
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close modal
 */
function closeModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
  
  const form = document.getElementById('product-form');
  if (form) {
    form.reset();
    currentEditId = null;
  }
  
  productImages = [];
  renderImagePreviews();
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  
  // Check if message contains HTML tags
  if (/<[a-z][\s\S]*>/i.test(message)) {
    alertDiv.innerHTML = message;
  } else {
    alertDiv.textContent = message;
  }
  
  const content = document.querySelector('.admin-content');if (content) {
    content.insertBefore(alertDiv, content.firstChild);// For error messages with HTML, show longer (15 seconds instead of 5)
    const timeout = type === 'error' && /<[a-z][\s\S]*>/i.test(message) ? 15000 : 5000;
    setTimeout(() => alertDiv.remove(), timeout);
  } else {}
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    if (show) {
      spinner.classList.add('active');
    } else {
      spinner.classList.remove('active');
    }
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Filter products based on search and category
 */
function filterProducts() {
  const searchTerm = document.getElementById('product-search')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('category-filter')?.value || '';
  
  let filtered = [...allProducts];
  
  // Filter by search term (name or description)
  if (searchTerm) {
    filtered = filtered.filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      return name.includes(searchTerm) || description.includes(searchTerm);
    });
  }
  
  // Filter by category
  if (categoryFilter) {
    filtered = filtered.filter(product => {
      return (product.category || '') === categoryFilter;
    });
  }
  
  renderProductsTable(filtered);
}

// Make functions available globally
window.addProduct = addProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.setPrimaryImage = setPrimaryImage;
window.removeImage = removeImage;
window.filterProducts = filterProducts;

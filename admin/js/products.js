/**
 * Products Management - CRUD Operations with Multiple Images
 * Handles Firestore operations and Firebase Storage image uploads
 */

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
          <li><strong>VS Code:</strong> Install "Live Server" extension, then right-click HTML file and select "Open with Live Server"</li>
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
async function initProducts() {
  try {
    // Check if Firestore is available
    if (!window.firebaseDb) {
      throw new Error('Firestore is not initialized. Please check Firebase configuration.');
    }
    productsCollection = window.firebaseDb.collection('products');
    
    // Load existing products
    await loadProducts();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Set up modal handlers
    setupModalHandlers();
    
    // Set up image management
    setupImageManagement();
  } catch (error) {
    console.error('Error initializing products:', error);
    // Check for database doesn't exist error
    if (error.code === 'not-found' && error.message && error.message.includes('does not exist')) {
      const errorMessage = `
        <div style="padding: 20px;">
          <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
            <i class="fas fa-database"></i> Firestore Database Not Created
          </h3>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            The Firestore database does not exist for this project. You need to create it first.
          </p>
          <ol style="margin-left: 20px; margin-bottom: 15px; color: var(--admin-text);">
            <li>Go to <a href="https://console.firebase.google.com/project/spoolin-industries/firestore" target="_blank" style="color: var(--admin-red-secondary);">Firebase Console</a></li>
            <li>Click "Create database"</li>
            <li>Choose production mode (recommended for production)</li>
            <li>Enable the Firestore API if prompted</li>
          </ol>
          <p style="margin-bottom: 15px; color: var(--admin-text);">
            <strong>Important:</strong> After creating the database, make sure to also enable the Firestore API in Google Cloud Console:
          </p>
          <p style="margin-bottom: 15px;">
            <a href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=spoolin-industries" target="_blank" style="color: var(--admin-red-secondary);">
              Enable Firestore API for spoolin-industries project
            </a>
          </p>
          <p style="color: var(--admin-text-muted); font-size: 0.9rem;">
            Note: It may take 2-5 minutes for the API to be fully enabled after clicking.
          </p>
        </div>
      `;
      showAlert(errorMessage, 'error');
    } else {
      showAlert(`Error initializing products: ${error.message}`, 'error');
    }
  }
}

/**
 * Load all products from Firestore
 */
async function loadProducts() {
  try {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="loading"></div>
          <p style="margin-top: 10px; color: var(--admin-text-muted);">Loading products...</p>
        </td>
      </tr>
    `;
    
    const snapshot = await productsCollection.orderBy('createdAt', 'desc').get();
    allProducts = [];
    
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <p style="padding: 20px; color: var(--admin-text-muted);">
              <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
              No products found. <a href="#" onclick="addProduct()" style="color: var(--admin-red-secondary);">Add your first product</a>.
            </p>
          </td>
        </tr>
      `;
      return;
    }
    
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      allProducts.push(product);
      addProductToTable(product);
    });
    
    // Update category filter options based on actual products
    updateCategoryFilter();
    
    // Track admin page view
    if (window.analytics) {
      window.analytics.trackPageView('admin_products', {
        product_count: allProducts.length
      });
    }
    
  } catch (error) {
    console.error('Error loading products:', error);
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div style="padding: 20px;">
            <h3 style="color: var(--admin-red-primary); margin-bottom: 15px;">
              <i class="fas fa-exclamation-triangle"></i> Error Loading Products
            </h3>
            <p style="margin-bottom: 15px; color: var(--admin-text);">
              ${error.message || 'Unknown error occurred'}
            </p>
            <button class="btn btn-primary" onclick="window.location.reload()">
              <i class="fas fa-sync"></i> Retry
            </button>
          </div>
        </td>
      </tr>
    `;
    
    // Track error
    if (window.analytics) {
      window.analytics.trackEvent('admin_products_load_error', {
        error_code: error.code || 'unknown',
        error_message: error.message || 'Unknown error'
      });
    }
  }
}

/**
 * Add a product row to the table
 */
function addProductToTable(product) {
  const tbody = document.getElementById('products-tbody');
  const row = document.createElement('tr');
  
  // Format price with 2 decimal places
  const price = product.price ? parseFloat(product.price).toFixed(2) : '0.00';
  
  // Determine stock status style
  let stockClass = '';
  let stockText = product.stock || 0;
  if (stockText === 0) {
    stockClass = 'text-danger';
    stockText = 'Out of Stock';
  } else if (stockText < 5) {
    stockClass = 'text-warning';
  }
  
  // Determine status badge
  let statusBadge = '';
  switch (product.status) {
    case 'active':
      statusBadge = '<span class="badge badge-success">Active</span>';
      break;
    case 'inactive':
      statusBadge = '<span class="badge badge-secondary">Inactive</span>';
      break;
    case 'draft':
      statusBadge = '<span class="badge badge-info">Draft</span>';
      break;
    default:
      statusBadge = '<span class="badge badge-secondary">Unknown</span>';
  }
  
  // Get primary image or placeholder
  const primaryImage = product.images && product.images.length > 0 
    ? product.images.find(img => img.isPrimary) || product.images[0]
    : null;
  
  const imageHtml = primaryImage
    ? `<img src="${primaryImage.url}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`
    : '<div style="width: 40px; height: 40px; background: var(--admin-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--admin-text-muted);"><i class="fas fa-image"></i></div>';
  
  // Format created date
  const createdDate = product.createdAt
    ? new Date(product.createdAt.toDate ? product.createdAt.toDate() : product.createdAt).toLocaleDateString()
    : 'Unknown';
  
  row.innerHTML = `
    <td>${imageHtml}</td>
    <td>
      <div style="font-weight: 500;">${escapeHtml(product.name)}</div>
      ${product.sku ? `<div style="font-size: 0.8rem; color: var(--admin-text-muted);">SKU: ${escapeHtml(product.sku)}</div>` : ''}
    </td>
    <td>${escapeHtml(product.category || '')}</td>
    <td>$${price}</td>
    <td class="${stockClass}">${stockText}</td>
    <td>${statusBadge}</td>
    <td>
      <div style="display: flex; gap: 5px;">
        <button class="btn btn-sm btn-secondary" onclick="editProduct('${product.id}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </td>
  `;
  
  tbody.appendChild(row);
}

/**
 * Update category filter with actual categories from products
 */
function updateCategoryFilter() {
  const categories = [...new Set(allProducts
    .filter(p => p.category)
    .map(p => p.category)
  )].sort();
  
  const select = document.getElementById('category-filter');
  const currentValue = select.value;
  
  // Clear existing options except the first one
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    select.appendChild(option);
  });
  
  // Restore selected value
  select.value = currentValue;
}

/**
 * Filter products based on search and category
 */
function filterProducts() {
  const searchTerm = document.getElementById('product-search').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      (product.name && product.name.toLowerCase().includes(searchTerm)) ||
      (product.description && product.description.toLowerCase().includes(searchTerm)) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm));
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Update table with filtered products
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <p style="padding: 20px; color: var(--admin-text-muted);">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
            No products match your filters. <a href="#" onclick="clearFilters()" style="color: var(--admin-red-secondary);">Clear filters</a>.
          </p>
        </td>
      </tr>
    `;
    return;
  }
  
  filteredProducts.forEach(product => {
    addProductToTable(product);
  });
}

/**
 * Clear all filters
 */
function clearFilters() {
  document.getElementById('product-search').value = '';
  document.getElementById('category-filter').value = '';
  filterProducts();
}

/**
 * Set up form handlers
 */
function setupFormHandlers() {
  const form = document.getElementById('product-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
      const productData = {
        name: document.getElementById('product-name').value.trim(),
        sku: document.getElementById('product-sku').value.trim(),
        description: document.getElementById('product-description').value.trim(),
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value) || 0,
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        status: document.getElementById('product-status').value,
        featured: document.getElementById('product-featured').checked,
        images: productImages,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add createdAt for new products
      if (!currentEditId) {
        productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      if (currentEditId) {
        // Update existing product
        await productsCollection.doc(currentEditId).update(productData);
        showAlert('Product updated successfully!', 'success');
        
        // Track update
        if (window.analytics) {
          window.analytics.trackEvent('update_product', {
            product_id: currentEditId,
            product_name: productData.name,
            category: productData.category
          });
        }
      } else {
        // Create new product
        const docRef = await productsCollection.add(productData);
        showAlert('Product created successfully!', 'success');
        
        // Track creation
        if (window.analytics) {
          window.analytics.trackEvent('create_product', {
            product_id: docRef.id,
            product_name: productData.name,
            category: productData.category
          });
        }
      }
      
      // Reset form and reload products
      closeModal();
      await loadProducts();
      
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert(`Error saving product: ${error.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/**
 * Set up modal handlers
 */
function setupModalHandlers() {
  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });
  
  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/**
 * Set up image management
 */
function setupImageManagement() {
  const fileInput = document.getElementById('product-images');
  const previewContainer = document.getElementById('images-preview-container');
  
  if (!fileInput || !previewContainer) return;
  
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        showAlert(`File "${file.name}" is too large. Maximum size is 2MB.`, 'error');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showAlert(`File "${file.name}" is not an image.`, 'error');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const imageData = {
          id: imageId,
          file: file,
          url: e.target.result,
          isNew: true,
          isPrimary: productImages.length === 0 // First image is primary by default
        };
        
        productImages.push(imageData);
        addImagePreview(imageData);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    fileInput.value = '';
  });
}

/**
 * Add image preview to the preview container
 */
function addImagePreview(imageData) {
  const previewContainer = document.getElementById('images-preview-container');
  
  // Clear placeholder text if this is the first image
  if (productImages.length === 1) {
    previewContainer.innerHTML = '';
  }
  
  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-preview-item';
  imageContainer.id = `image-${imageData.id}`;
  
  imageContainer.innerHTML = `
    <img src="${imageData.url}" alt="Product image" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;">
    <div class="image-preview-controls">
      <button type="button" class="btn btn-xs ${imageData.isPrimary ? 'btn-primary' : 'btn-secondary'}" onclick="togglePrimaryImage('${imageData.id}')" title="${imageData.isPrimary ? 'Primary image' : 'Set as primary'}">
        <i class="fas fa-star"></i>
      </button>
      <button type="button" class="btn btn-xs btn-danger" onclick="removeImage('${imageData.id}')" title="Remove image">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  // Add drag functionality
  imageContainer.draggable = true;
  imageContainer.addEventListener('dragstart', handleDragStart);
  imageContainer.addEventListener('dragover', handleDragOver);
  imageContainer.addEventListener('drop', handleDrop);
  
  previewContainer.appendChild(imageContainer);
}

/**
 * Toggle primary image
 */
function togglePrimaryImage(imageId) {
  // Remove primary status from all images
  productImages.forEach(img => {
    img.isPrimary = false;
  });
  
  // Set primary status to selected image
  const image = productImages.find(img => img.id === imageId);
  if (image) {
    image.isPrimary = true;
  }
  
  // Update UI
  productImages.forEach(img => {
    const btn = document.querySelector(`#image-${img.id} button:first-child`);
    if (btn) {
      btn.className = `btn btn-xs ${img.isPrimary ? 'btn-primary' : 'btn-secondary'}`;
      btn.title = img.isPrimary ? 'Primary image' : 'Set as primary';
    }
  });
}

/**
 * Remove image
 */
function removeImage(imageId) {
  const index = productImages.findIndex(img => img.id === imageId);
  if (index !== -1) {
    productImages.splice(index, 1);
    
    // Remove preview element
    const element = document.getElementById(`image-${imageId}`);
    if (element) {
      element.remove();
    }
    
    // If no images left, show placeholder
    if (productImages.length === 0) {
      document.getElementById('images-preview-container').innerHTML = '<p style="color: var(--admin-text-muted); text-align: center; padding: 20px;">No images added yet</p>';
    }
    
    // If removed image was primary, make first image primary
    if (productImages.length > 0 && !productImages.some(img => img.isPrimary)) {
      productImages[0].isPrimary = true;
      
      // Update UI
      const btn = document.querySelector(`#image-${productImages[0].id} button:first-child`);
      if (btn) {
        btn.className = 'btn btn-xs btn-primary';
        btn.title = 'Primary image';
      }
    }
  }
}

/**
 * Drag and drop handlers
 */
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.target.closest('.image-preview-item');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const dropTarget = e.target.closest('.image-preview-item');
  if (dropTarget && dropTarget !== draggedElement) {
    dropTarget.style.border = '2px dashed var(--admin-red-primary)';
  }
}

function handleDrop(e) {
  e.preventDefault();
  
  const dropTarget = e.target.closest('.image-preview-item');
  if (!dropTarget || dropTarget === draggedElement) return;
  
  // Get image data
  const draggedId = draggedElement.id.replace('image-', '');
  const targetId = dropTarget.id.replace('image-', '');
  
  const draggedIndex = productImages.findIndex(img => img.id === draggedId);
  const targetIndex = productImages.findIndex(img => img.id === targetId);
  
  if (draggedIndex !== -1 && targetIndex !== -1) {
    // Swap in array
    const temp = productImages[draggedIndex];
    productImages[draggedIndex] = productImages[targetIndex];
    productImages[targetIndex] = temp;
    
    // Reorder in DOM
    const parent = dropTarget.parentNode;
    const draggedNextSibling = draggedElement.nextSibling;
    const targetNextSibling = dropTarget.nextSibling;
    
    parent.insertBefore(draggedElement, targetNextSibling);
    parent.insertBefore(dropTarget, draggedNextSibling);
  }
  
  // Reset styles
  dropTarget.style.border = '';
  draggedElement = null;
}

/**
 * Upload images to Firebase Storage
 */
async function uploadImages(productId) {
  if (!productImages.length) return [];
  
  const uploadPromises = productImages
    .filter(img => img.isNew) // Only upload new images
    .map(async (imageData) => {
      try {
        const file = imageData.file;
        const fileName = `${productId}_${Date.now()}_${file.name}`;
        const storageRef = window.firebaseStorage.ref().child(`products/${fileName}`);
        
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        
        return {
          id: imageData.id,
          url: url,
          order: productImages.findIndex(img => img.id === imageData.id),
          isPrimary: imageData.isPrimary
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Error uploading image "${file.name}": ${error.message}`);
      }
    });
  
  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

/**
 * Add product - open modal for new product
 */
function addProduct() {
  currentEditId = null;
  productImages = [];
  
  // Reset form
  const form = document.getElementById('product-form');
  if (form) {
    form.reset();
  }
  
  // Reset image preview
  const previewContainer = document.getElementById('images-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = '<p style="color: var(--admin-text-muted); text-align: center; padding: 20px;">No images added yet</p>';
  }
  
  // Update modal title
  const modalTitle = document.querySelector('#product-modal .modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = 'Add New Product';
  }
  
  // Show modal
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Edit product
 */
async function editProduct(productId) {
  try {
    // Get product data
    const doc = await productsCollection.doc(productId).get();
    if (!doc.exists) {
      showAlert('Product not found', 'error');
      return;
    }
    
    const product = { id: doc.id, ...doc.data() };
    currentEditId = productId;
    
    // Populate form
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-sku').value = product.sku || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-price').value = product.price || 0;
    document.getElementById('product-stock').value = product.stock || 0;
    document.getElementById('product-status').value = product.status || 'active';
    document.getElementById('product-featured').checked = product.featured || false;
    
    // Load existing images
    productImages = product.images ? [...product.images] : [];
    
    // Reset and populate image preview
    const previewContainer = document.getElementById('images-preview-container');
    if (previewContainer) {
      if (productImages.length === 0) {
        previewContainer.innerHTML = '<p style="color: var(--admin-text-muted); text-align: center; padding: 20px;">No images added yet</p>';
      } else {
        previewContainer.innerHTML = '';
        productImages.forEach(imageData => {
          addImagePreview(imageData);
        });
      }
    }
    
    // Update modal title
    const modalTitle = document.querySelector('#product-modal .modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = 'Edit Product';
    }
    
    // Show modal
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
  } catch (error) {
    console.error('Error editing product:', error);
    showAlert(`Error loading product: ${error.message}`, 'error');
  }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  try {
    // Get product data before deleting
    const doc = await productsCollection.doc(productId).get();
    const product = { id: doc.id, ...doc.data() };
    
    // Delete product
    await productsCollection.doc(productId).delete();
    
    // If the product had images, we might want to delete them from storage too
    // This is a complex operation that requires listing files with the product ID prefix
    // For simplicity, we're not automatically deleting storage files in this example
    // In a production app, you would implement this with Cloud Functions
    
    showAlert('Product deleted successfully!', 'success');
    await loadProducts();
    
    // Track deletion
    if (window.analytics) {
      window.analytics.trackEvent('delete_product', {
        product_id: productId,
        product_name: product.name
      });
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showAlert(`Error deleting product: ${error.message}`, 'error');
  }
}

/**
 * Close modal function
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
  }
  
  const preview = document.getElementById('image-preview');
  if (preview) {
    preview.src = '';
    preview.classList.remove('active');
  }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  // Create or update alert container
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.maxWidth = '400px';
    document.body.appendChild(alertContainer);
  }
  
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.style.marginBottom = '10px';
  alert.style.padding = '12px 16px';
  alert.style.borderRadius = '4px';
  alert.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Style based on type
  switch (type) {
    case 'success':
      alert.style.backgroundColor = '#d4edda';
      alert.style.color = '#155724';
      alert.style.border = '1px solid #c3e6cb';
      break;
    case 'error':
      alert.style.backgroundColor = '#f8d7da';
      alert.style.color = '#721c24';
      alert.style.border = '1px solid #f5c6cb';
      break;
    case 'warning':
      alert.style.backgroundColor = '#fff3cd';
      alert.style.color = '#856404';
      alert.style.border = '1px solid #ffeaa7';
      break;
    default:
      alert.style.backgroundColor = '#d1ecf1';
      alert.style.color = '#0c5460';
      alert.style.border = '1px solid #bee5eb';
  }
  
  alert.innerHTML = message;
  alertContainer.appendChild(alert);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert);
    }
  }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
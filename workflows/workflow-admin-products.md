# Admin Products Workflow

## Overview
Complete CRUD operations for product management with multiple image upload support. This is the only fully functional admin module beyond login and dashboard.

## Status
✅ **Fully Implemented**

## Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-products.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| InitProducts[Initialize Products Module]
    
    InitProducts --> CheckFirestore{Firestore<br/>Available?}
    CheckFirestore -->|No| ShowError[Show Error Message<br/>Database not created]
    CheckFirestore -->|Yes| LoadProducts[Load Products from<br/>Firestore Collection: products]
    
    LoadProducts --> Query[Query: products.orderBy<br/>createdAt desc]
    Query --> RenderTable[Render Products Table]
    RenderTable --> DisplayProducts[Display Products with:<br/>- Image thumbnail<br/>- Name, SKU<br/>- Category<br/>- Price, Stock<br/>- Status badge<br/>- Edit/Delete buttons]
    
    DisplayProducts --> UserAction{User Action}
    
    UserAction -->|Add Product| OpenAddModal[Open Add Product Modal]
    UserAction -->|Edit Product| OpenEditModal[Open Edit Product Modal]
    UserAction -->|Delete Product| ConfirmDelete[Confirm Deletion]
    UserAction -->|Search/Filter| FilterProducts[Filter Products List]
    UserAction -->|Sign Out| SignOut[Sign Out User]
    
    OpenAddModal --> ResetForm[Reset Form & Clear Images]
    ResetForm --> FillForm[User Fills Form:<br/>- Name, SKU<br/>- Description<br/>- Category<br/>- Price, Stock<br/>- Status<br/>- Featured checkbox]
    
    FillForm --> UploadImages[Upload Multiple Images]
    UploadImages --> ImagePreview[Preview Images with:<br/>- Drag to reorder<br/>- Set primary image<br/>- Remove images]
    
    ImagePreview --> SubmitForm[User Submits Form]
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| UploadNewImages[Upload New Images to<br/>Firebase Storage: products/]
    UploadNewImages --> UploadResult{Upload<br/>Success?}
    UploadResult -->|No| ShowUploadError[Show Upload Error<br/>with troubleshooting]
    ShowUploadError --> FillForm
    
    UploadResult -->|Yes| SaveProduct[Save Product to<br/>Firestore: products/]
    SaveProduct --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveProduct --> SaveResult{Save<br/>Success?}
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadProducts[Reload Products List]
    ReloadProducts --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    OpenEditModal --> LoadProduct[Load Product from<br/>Firestore by ID]
    LoadProduct --> PopulateForm[Populate Form with<br/>Existing Data]
    PopulateForm --> LoadExistingImages[Load Existing Images]
    LoadExistingImages --> FillForm
    
    ConfirmDelete --> DeleteConfirm{User<br/>Confirms?}
    DeleteConfirm -->|No| DisplayProducts
    DeleteConfirm -->|Yes| DeleteFromFirestore[Delete from<br/>Firestore: products/]
    DeleteFromFirestore --> DeleteResult{Delete<br/>Success?}
    DeleteResult -->|No| ShowDeleteError[Show Delete Error]
    DeleteResult -->|Yes| ShowDeleteSuccess[Show Success Message]
    ShowDeleteSuccess --> ReloadProducts
    
    FilterProducts --> ApplyFilters[Apply Search &<br/>Category Filters]
    ApplyFilters --> RenderTable
    
    SignOut --> Redirect
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadProducts fill:#c8e6c9
    style UploadNewImages fill:#fff9c4
    style SaveProduct fill:#c8e6c9
    style DeleteFromFirestore fill:#ffcdd2
```

## Integration Points

### Firebase Services
- **Firestore**: `products` collection
  - Fields: `name`, `sku`, `description`, `category`, `price`, `stock`, `status`, `featured`, `images[]`, `createdAt`, `updatedAt`
- **Firebase Storage**: `products/{productId}/` path for images
  - Image metadata stored in Firestore: `url`, `order`, `isPrimary`
- **Firebase Authentication**: Required for all operations

### Data Operations

#### Create Product
1. User fills form and uploads images
2. Images uploaded to Storage: `products/{timestamp}_{filename}`
3. Product document created in Firestore with image URLs
4. `createdAt` set via `serverTimestamp()`

#### Update Product
1. Load existing product data
2. User modifies form and/or adds new images
3. New images uploaded to Storage: `products/{productId}_{timestamp}_{filename}`
4. Existing images preserved (not re-uploaded)
5. Product document updated in Firestore
6. `updatedAt` set via `serverTimestamp()`

#### Delete Product
1. User confirms deletion
2. Product document deleted from Firestore
3. **Note**: Images in Storage are NOT automatically deleted (manual cleanup required)

#### Read Products
1. Query all products ordered by `createdAt` descending
2. Display in table with filtering/search capabilities
3. Filter by category and search by name/description

### Storage Paths
- **Product Images**: `products/{productId}_{timestamp}_{filename}` or `products/{timestamp}_{filename}` for new products

### Frontend Integration
- Products displayed on `shop.html` (public-facing)
- Products filtered by `status: 'active'` for public display
- Featured products highlighted

### Related Pages
- **shop.html**: Public product display (reads from same Firestore collection)

## Files
- `admin-products.html`: Product management UI
- `admin/js/products.js`: Product CRUD logic, image upload, Firestore operations
- `admin/js/firebase-config.js`: Firebase initialization

## Known Limitations
- Image deletion from Storage not implemented when product deleted
- No batch operations
- No product variants/options support


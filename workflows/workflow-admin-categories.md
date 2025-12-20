# Admin Categories Workflow

## Overview
Category management with sorting/display order, category mapping to products, and rules for product consistency.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-categories.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadCategories[Load Categories from<br/>Firestore: categories/]
    
    LoadCategories --> Query[Query categories ordered by displayOrder]
    Query --> RenderTable[Render Categories Table]
    RenderTable --> DisplayCategories[Display Categories with:<br/>- Name<br/>- Display order<br/>- Product count<br/>- Status]
    
    DisplayCategories --> UserAction{User Action}
    
    UserAction -->|Add Category| OpenAddModal[Open Add Category Modal]
    UserAction -->|Edit Category| OpenEditModal[Open Edit Category Modal]
    UserAction -->|Delete Category| DeleteCategory[Delete Category]
    UserAction -->|Reorder Categories| ReorderCategories[Change Display Order]
    UserAction -->|View Products| ViewProducts[View Products in Category]
    UserAction -->|Filter/Search| FilterCategories[Filter Categories List]
    
    OpenAddModal --> FillForm[User Fills Form:<br/>- Category name<br/>- Description optional<br/>- Display order<br/>- Status]
    
    FillForm --> CheckDuplicate{Duplicate<br/>Check}
    CheckDuplicate -->|Found| ShowDuplicate[Show: Category exists]
    CheckDuplicate -->|Not Found| SubmitForm[User Submits Form]
    
    ShowDuplicate --> FillForm
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveCategory[Save Category to<br/>Firestore: categories/]
    SaveCategory --> SetDisplayOrder[Set Display Order]
    SaveCategory --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveCategory --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadCategories[Reload Categories List]
    ReloadCategories --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    DeleteCategory --> CheckProducts{Has<br/>Products?}
    CheckProducts -->|Yes| ShowWarning[Show Warning:<br/>Category has products]
    CheckProducts -->|No| ConfirmDelete[Confirm Deletion]
    
    ShowWarning --> ChooseAction{Choose<br/>Action}
    ChooseAction -->|Reassign| ReassignProducts[Reassign Products to<br/>Other Category]
    ChooseAction -->|Delete Anyway| ConfirmDelete
    ChooseAction -->|Cancel| DisplayCategories
    
    ReassignProducts --> SelectNewCategory[Select New Category]
    SelectNewCategory --> UpdateProducts[Update Products in<br/>Firestore: products/]
    UpdateProducts --> ConfirmDelete
    
    ConfirmDelete --> DeleteFromFirestore[Delete from<br/>Firestore: categories/]
    DeleteFromFirestore --> DeleteResult{Delete<br/>Success?}
    DeleteResult -->|No| ShowDeleteError[Show Delete Error]
    DeleteResult -->|Yes| ShowDeleteSuccess[Show Success Message]
    ShowDeleteSuccess --> ReloadCategories
    
    ReorderCategories --> DragCategory[Drag Category to New Position]
    DragCategory --> UpdateDisplayOrder[Update Display Order in<br/>Firestore]
    UpdateDisplayOrder --> ReloadCategories
    
    ViewProducts --> LoadProducts[Load Products with<br/>Selected Category]
    LoadProducts --> DisplayProducts[Display Products Table]
    DisplayProducts --> NavigateProducts[Navigate to<br/>admin-products.html]
    
    FilterCategories --> ApplyFilters[Apply Filters:<br/>- Name<br/>- Status]
    ApplyFilters --> RenderTable
    
    ValidateProductCategory[Validate Product Category Rules] --> CheckRequired{Category<br/>Required?}
    CheckRequired -->|Yes| EnforceCategory[Enforce: Product must have category]
    CheckRequired -->|No| AllowOptional[Allow: Category optional]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadCategories fill:#c8e6c9
    style SaveCategory fill:#c8e6c9
    style DeleteCategory fill:#ffcdd2
    style ReorderCategories fill:#fff9c4
    style ValidateProductCategory fill:#fff9c4
```

## Planned Features

### Category Management
- **Category Creation**: Name, description, display order
- **Display Order**: Sort categories for display
- **Status**: Active, inactive
- **Duplicate Prevention**: Check for duplicate category names
- **Product Count**: Show number of products in category

### Category Rules
- **Product Consistency**: Rules for product category assignment
- **Required Categories**: Enforce category requirement for products
- **Category Validation**: Validate product categories

### Category Operations
- **Reorder**: Change display order
- **Delete**: Delete category with product reassignment option
- **Product View**: View all products in category

### Integration Points

#### Firestore Collections
- **`categories/{categoryId}`**: Category documents
  - Fields: `name`, `description`, `displayOrder`, `status`, `createdAt`, `updatedAt`
- **`products/{productId}`**: Product documents (category field)
  - Fields: `category` (references category)

#### Cross-Module Integration
- **Categories → Products**: Products assigned to categories
- **Products → Categories**: Category selection in product form
- **Categories → Shop**: Display categories on shop page

### Related Pages
- **admin-products.html**: Product category assignment
- **shop.html**: Category display and filtering

## Implementation Notes
- Display order management (drag-and-drop or manual entry)
- Product reassignment when deleting category
- Category validation rules
- Category-based product filtering
- Category hierarchy support (future enhancement)


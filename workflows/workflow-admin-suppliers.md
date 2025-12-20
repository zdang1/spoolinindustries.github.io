# Admin Suppliers Workflow

## Overview
Supplier directory with terms, contacts, linked purchase orders, and preferred supplier per category.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-suppliers.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadSuppliers[Load Suppliers from<br/>Firestore: suppliers/]
    
    LoadSuppliers --> Query[Query suppliers with filters]
    Query --> RenderTable[Render Suppliers Table]
    RenderTable --> DisplaySuppliers[Display Suppliers with:<br/>- Name<br/>- Contact<br/>- Terms<br/>- PO count<br/>- Status]
    
    DisplaySuppliers --> UserAction{User Action}
    
    UserAction -->|Add Supplier| OpenAddModal[Open Add Supplier Modal]
    UserAction -->|Edit Supplier| OpenEditModal[Open Edit Supplier Modal]
    UserAction -->|View Supplier| OpenDetailView[Open Supplier Detail View]
    UserAction -->|View POs| ViewPOs[View Purchase Orders]
    UserAction -->|Set Preferred| SetPreferred[Set as Preferred Supplier]
    UserAction -->|Filter/Search| FilterSuppliers[Filter Suppliers List]
    
    OpenAddModal --> FillForm[User Fills Form:<br/>- Supplier name<br/>- Contact person<br/>- Email<br/>- Phone<br/>- Address<br/>- Payment terms]
    
    FillForm --> EnterTerms[Enter Payment Terms:<br/>- Payment method<br/>- Credit terms<br/>- Discounts]
    EnterTerms --> AddContacts[Add Additional Contacts:<br/>- Sales contact<br/>- Accounts contact<br/>- Technical contact]
    AddContacts --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveSupplier[Save Supplier to<br/>Firestore: suppliers/]
    SaveSupplier --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveSupplier --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadSuppliers[Reload Suppliers List]
    ReloadSuppliers --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    OpenDetailView --> LoadSupplierData[Load Supplier Data]
    LoadSupplierData --> LoadPOs[Load Purchase Orders from<br/>purchaseOrders/ collection]
    LoadPOs --> LoadProducts[Load Products from<br/>products/ collection]
    LoadProducts --> DisplayDetail[Display Supplier Detail:<br/>- Contact info<br/>- Terms<br/>- Purchase orders<br/>- Products supplied<br/>- Performance metrics]
    
    ViewPOs --> FilterPOs[Filter Purchase Orders by Supplier]
    FilterPOs --> DisplayPOs[Display Purchase Orders Table]
    DisplayPOs --> NavigatePO[Navigate to<br/>admin-purchase-orders.html]
    
    SetPreferred --> SelectCategory[Select Category]
    SelectCategory --> SetPreferredSupplier[Set as Preferred Supplier<br/>for Category]
    SetPreferredSupplier --> SavePreferred[Save to Firestore:<br/>categories/{categoryId}/preferredSupplier]
    SavePreferred --> ReloadSuppliers
    
    FilterSuppliers --> ApplyFilters[Apply Filters:<br/>- Name<br/>- Status<br/>- Category]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadSuppliers fill:#c8e6c9
    style SaveSupplier fill:#c8e6c9
    style OpenDetailView fill:#fff9c4
    style SetPreferred fill:#fff9c4
```

## Planned Features

### Supplier Management
- **Supplier Profiles**: Name, contact information, address
- **Contact Management**: Multiple contacts (sales, accounts, technical)
- **Payment Terms**: Payment methods, credit terms, discounts
- **Status Tracking**: Active, inactive
- **Performance Metrics**: Track supplier performance

### Preferred Suppliers
- **Category Assignment**: Set preferred supplier per category
- **Auto-selection**: Auto-select preferred supplier when creating PO
- **Supplier Comparison**: Compare suppliers for categories

### Integration Points

#### Firestore Collections
- **`suppliers/{supplierId}`**: Supplier documents
  - Fields: `name`, `contactPerson`, `email`, `phone`, `address`, `paymentTerms`, `creditTerms`, `discounts`, `status`, `createdAt`, `updatedAt`
- **`suppliers/{supplierId}/contacts/{contactId}`**: Contact subcollection
- **`categories/{categoryId}`**: Category documents (preferredSupplier field)

#### Cross-Module Integration
- **Suppliers → Purchase Orders**: Link POs to suppliers
- **Suppliers → Products**: Link products to suppliers
- **Suppliers → Inventory**: Link inventory items to suppliers
- **Categories → Suppliers**: Preferred supplier per category

### Related Pages
- **admin-purchase-orders.html**: Supplier selection for POs
- **admin-products.html**: Supplier assignment to products
- **admin-inventory.html**: Supplier assignment to inventory
- **admin-categories.html**: Preferred supplier per category

## Implementation Notes
- Supplier performance tracking (delivery time, quality, etc.)
- Preferred supplier auto-selection
- Supplier contact management
- Supplier comparison tools (future enhancement)


# Admin Inventory Workflow

## Overview
Stock on hand tracking with reorder points, low-stock alerts, reserved stock for jobs, and adjustments log.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-inventory.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadInventory[Load Inventory Items from<br/>Firestore: inventory/]
    
    LoadInventory --> Query[Query inventory with filters]
    Query --> CheckLowStock[Check for Low Stock Items]
    CheckLowStock --> RenderTable[Render Inventory Table]
    RenderTable --> DisplayInventory[Display Inventory with:<br/>- Product/Part name<br/>- SKU<br/>- Stock on hand<br/>- Reserved<br/>- Available<br/>- Reorder point<br/>- Status]
    
    DisplayInventory --> UserAction{User Action}
    
    UserAction -->|Add Item| OpenAddModal[Open Add Item Modal]
    UserAction -->|Edit Item| OpenEditModal[Open Edit Item Modal]
    UserAction -->|View Item| OpenDetailView[Open Item Detail View]
    UserAction -->|Adjust Stock| AdjustStock[Adjust Stock Level]
    UserAction -->|Set Reorder Point| SetReorderPoint[Set Reorder Point]
    UserAction -->|Create PO| CreatePO[Create Purchase Order from Low Stock]
    UserAction -->|Filter/Search| FilterInventory[Filter Inventory List]
    
    OpenAddModal --> SelectProduct{Link to<br/>Product?}
    SelectProduct -->|Yes| SelectProductFromShop[Select Product from<br/>products/ collection]
    SelectProduct -->|No| EnterManual[Enter Manual Item Details]
    
    SelectProductFromShop --> LoadProductData[Load Product Data]
    LoadProductData --> EnterInventory[Enter Inventory Details:<br/>- Stock on hand<br/>- Reorder point<br/>- Location<br/>- Supplier]
    
    EnterManual --> EnterInventory
    
    EnterInventory --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> EnterInventory
    
    Validate -->|Yes| SaveInventory[Save Inventory Item to<br/>Firestore: inventory/]
    SaveInventory --> LinkProduct[Link to Product if applicable]
    SaveInventory --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveInventory --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> EnterInventory
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadInventory[Reload Inventory List]
    ReloadInventory --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    AdjustStock --> SelectItem[Select Inventory Item]
    SelectItem --> EnterAdjustment[Enter Adjustment:<br/>- Adjustment type add/remove<br/>- Quantity<br/>- Reason]
    EnterAdjustment --> SaveAdjustment[Save Adjustment to<br/>Firestore: inventory/{itemId}/adjustments/]
    SaveAdjustment --> UpdateStock[Update Stock on Hand]
    UpdateStock --> SaveStock[Save Updated Stock to<br/>Firestore]
    SaveStock --> CheckReorder{Below<br/>Reorder Point?}
    CheckReorder -->|Yes| ShowLowStockAlert[Show Low Stock Alert]
    CheckReorder -->|No| ReloadInventory
    
    ShowLowStockAlert --> SuggestPO[Suggest Create Purchase Order]
    SuggestPO --> ReloadInventory
    
    SetReorderPoint --> SelectItem2[Select Inventory Item]
    SelectItem2 --> EnterReorderPoint[Enter Reorder Point Quantity]
    EnterReorderPoint --> SaveReorderPoint[Save Reorder Point to<br/>Firestore]
    SaveReorderPoint --> CheckCurrentStock{Current Stock<br/>Below Point?}
    CheckCurrentStock -->|Yes| ShowLowStockAlert
    CheckCurrentStock -->|No| ReloadInventory
    
    CreatePO --> SelectLowStockItems[Select Low Stock Items]
    SelectLowStockItems --> GeneratePO[Generate Purchase Order<br/>in purchaseOrders/]
    GeneratePO --> NavigatePO[Navigate to<br/>admin-purchase-orders.html]
    
    FilterInventory --> ApplyFilters[Apply Filters:<br/>- Product name<br/>- SKU<br/>- Stock status<br/>- Location<br/>- Supplier]
    ApplyFilters --> RenderTable
    
    ReserveStock[Reserve Stock for Job] --> SelectItem3[Select Inventory Item]
    SelectItem3 --> SetReservedQty[Set Reserved Quantity]
    SetReservedQty --> SaveReservation[Save Reservation to<br/>Firestore: inventory/{itemId}/reservations/]
    SaveReservation --> UpdateAvailable[Update Available Stock:<br/>Stock - Reserved]
    UpdateAvailable --> SaveAvailable[Save Available Stock to<br/>Firestore]
    SaveAvailable --> ReloadInventory
    
    UseStock[Use Stock from Job] --> SelectItem4[Select Inventory Item]
    SelectItem4 --> SetUsedQty[Set Used Quantity]
    SetUsedQty --> ReleaseReservation[Release Reservation]
    ReleaseReservation --> UpdateStock2[Update Stock on Hand:<br/>Stock - Used]
    UpdateStock2 --> SaveStock2[Save Updated Stock]
    SaveStock2 --> ReloadInventory
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadInventory fill:#c8e6c9
    style SaveInventory fill:#c8e6c9
    style AdjustStock fill:#fff9c4
    style ReserveStock fill:#fff9c4
    style UseStock fill:#fff9c4
    style CreatePO fill:#fff9c4
```

## Planned Features

### Inventory Management
- **Stock Tracking**: Stock on hand, reserved, available
- **Product Linking**: Link inventory items to products
- **Location Tracking**: Track item locations
- **Supplier Linking**: Link items to suppliers
- **Reorder Points**: Set reorder point thresholds
- **Low Stock Alerts**: Automatic alerts when below reorder point

### Stock Adjustments
- **Adjustment Types**: Add stock, remove stock, correction
- **Adjustment Reasons**: Reason for adjustment
- **Adjustment Log**: Track all stock adjustments
- **Audit Trail**: Complete history of stock changes

### Stock Reservation
- **Job Reservations**: Reserve stock for jobs
- **Available Stock**: Calculate available = stock - reserved
- **Reservation Release**: Release reservations when stock used
- **Double-booking Prevention**: Prevent over-reservation

### Integration Points

#### Firestore Collections
- **`inventory/{itemId}`**: Inventory item documents
  - Fields: `productId`, `sku`, `name`, `stockOnHand`, `reserved`, `available`, `reorderPoint`, `location`, `supplierId`, `status`, `createdAt`, `updatedAt`
- **`inventory/{itemId}/adjustments/{adjustmentId}`**: Stock adjustment subcollection
- **`inventory/{itemId}/reservations/{reservationId}`**: Stock reservation subcollection

#### Cross-Module Integration
- **Products → Inventory**: Link inventory to products
- **Inventory → Jobs**: Reserve stock for jobs
- **Jobs → Inventory**: Use stock from jobs
- **Inventory → Purchase Orders**: Create PO from low stock
- **Suppliers → Inventory**: Link items to suppliers

### Related Pages
- **admin-products.html**: Product selection
- **admin-jobs.html**: Reserve/use stock for jobs
- **admin-purchase-orders.html**: Create PO from low stock
- **admin-suppliers.html**: Supplier selection

## Implementation Notes
- Real-time stock calculation (available = stock - reserved)
- Low stock alert system
- Stock reservation system for jobs
- Automatic PO suggestion from low stock
- Stock adjustment audit trail
- Stock location tracking (optional)


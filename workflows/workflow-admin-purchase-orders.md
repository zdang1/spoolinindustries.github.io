# Admin Purchase Orders Workflow

## Overview
Purchase order creation from low stock, receiving, reconciliation, ETA tracking, and freight cost tracking.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-purchase-orders.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadPOs[Load Purchase Orders from<br/>Firestore: purchaseOrders/]
    
    LoadPOs --> Query[Query POs with filters]
    Query --> RenderTable[Render Purchase Orders Table]
    RenderTable --> DisplayPOs[Display Purchase Orders with:<br/>- PO number<br/>- Supplier<br/>- Total amount<br/>- Status<br/>- ETA<br/>- Received status]
    
    DisplayPOs --> UserAction{User Action}
    
    UserAction -->|Create PO| OpenCreateModal[Open Create PO Modal]
    UserAction -->|Edit PO| OpenEditModal[Open Edit PO Modal]
    UserAction -->|View PO| OpenDetailView[Open PO Detail View]
    UserAction -->|Send PO| SendPO[Send PO to Supplier]
    UserAction -->|Receive PO| ReceivePO[Receive Purchase Order]
    UserAction -->|Reconcile| ReconcilePO[Reconcile Received Items]
    UserAction -->|Filter/Search| FilterPOs[Filter Purchase Orders]
    
    OpenCreateModal --> SelectSource{PO<br/>Source?}
    SelectSource -->|From Low Stock| SelectLowStock[Select Low Stock Items from<br/>inventory/ collection]
    SelectSource -->|Manual| ManualEntry[Manual Entry]
    
    SelectLowStock --> LoadLowStock[Load Low Stock Items]
    LoadLowStock --> SelectItems[Select Items to Order]
    ManualEntry --> SelectItems
    
    SelectItems --> SelectSupplier[Select Supplier from<br/>suppliers/ collection]
    SelectSupplier --> AutoSelect{Preferred<br/>Supplier?}
    AutoSelect -->|Yes| UsePreferred[Use Preferred Supplier]
    AutoSelect -->|No| ManualSelect[Manual Supplier Selection]
    
    UsePreferred --> EnterQuantities[Enter Quantities for Each Item]
    ManualSelect --> EnterQuantities
    
    EnterQuantities --> EnterPrices[Enter Unit Prices]
    EnterPrices --> CalculateTotal[Calculate Subtotal,<br/>Tax, Freight, Total]
    CalculateTotal --> SetETA[Set Expected Delivery Date ETA]
    SetETA --> EnterNotes[Enter Notes/Instructions]
    EnterNotes --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> EnterQuantities
    
    Validate -->|Yes| SavePO[Save PO to<br/>Firestore: purchaseOrders/]
    SavePO --> GenerateNumber[Generate PO Number]
    SavePO --> SetStatus[Set Status: draft]
    SavePO --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SavePO --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> EnterQuantities
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadPOs[Reload Purchase Orders]
    ReloadPOs --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    SendPO --> GeneratePDF[Generate PDF PO<br/>optional]
    GeneratePDF --> SendEmail[Send Email to Supplier<br/>with PO]
    SendEmail --> UpdateStatus[Update Status to: sent]
    UpdateStatus --> SaveStatus[Save to Firestore]
    SaveStatus --> ReloadPOs
    
    ReceivePO --> SelectPO[Select Purchase Order]
    SelectPO --> EnterReceived[Enter Received Items:<br/>- Items received<br/>- Quantities received<br/>- Condition]
    EnterReceived --> CompareOrdered{Match<br/>Ordered?}
    CompareOrdered -->|Yes| MarkReceived[Mark Items as Received]
    CompareOrdered -->|No| EnterDiscrepancies[Enter Discrepancies:<br/>- Shortages<br/>- Overages<br/>- Damages]
    
    EnterDiscrepancies --> ResolveDiscrepancies[Resolve Discrepancies]
    ResolveDiscrepancies --> MarkReceived
    
    MarkReceived --> UpdateInventory[Update Inventory Stock:<br/>Add Received Items]
    UpdateInventory --> UpdateStatus2[Update PO Status: received]
    UpdateStatus2 --> SaveStatus2[Save to Firestore]
    SaveStatus2 --> ReloadPOs
    
    ReconcilePO --> SelectPO2[Select Purchase Order]
    SelectPO2 --> CompareReceived[Compare Received vs Ordered]
    CompareReceived --> AdjustQuantities[Adjust Quantities if needed]
    AdjustQuantities --> UpdateInventory2[Update Inventory]
    UpdateInventory2 --> MarkReconciled[Mark PO as Reconciled]
    MarkReconciled --> SaveStatus3[Save to Firestore]
    SaveStatus3 --> ReloadPOs
    
    FilterPOs --> ApplyFilters[Apply Filters:<br/>- Status draft/sent/received/reconciled<br/>- Supplier<br/>- Date range]
    ApplyFilters --> RenderTable
    
    TrackETA[Track ETA] --> CheckDue[Check Due Dates]
    CheckDue --> ShowOverdue[Show Overdue POs]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadPOs fill:#c8e6c9
    style SavePO fill:#c8e6c9
    style SendPO fill:#fff9c4
    style ReceivePO fill:#fff9c4
    style ReconcilePO fill:#fff9c4
    style UpdateInventory fill:#fff9c4
```

## Planned Features

### Purchase Order Creation
- **From Low Stock**: Auto-create PO from low stock items
- **Manual Entry**: Manual PO creation
- **Supplier Selection**: Select supplier (preferred or manual)
- **Line Items**: Items, quantities, unit prices
- **Calculations**: Subtotal, tax, freight, total
- **ETA Tracking**: Expected delivery date

### Purchase Order Status
1. **draft** → Being created
2. **sent** → Sent to supplier
3. **received** → Items received
4. **reconciled** → Received items reconciled with inventory
5. **cancelled** → PO cancelled

### Receiving Process
- **Receive Items**: Record received items and quantities
- **Discrepancy Handling**: Handle shortages, overages, damages
- **Inventory Update**: Update inventory when items received
- **Reconciliation**: Reconcile received vs ordered

### Integration Points

#### Firestore Collections
- **`purchaseOrders/{poId}`**: Purchase order documents
  - Fields: `poNumber`, `supplierId`, `status`, `lineItems[]`, `subtotal`, `tax`, `freight`, `total`, `eta`, `receivedDate`, `createdAt`, `updatedAt`
- **`purchaseOrders/{poId}/items/{itemId}`**: PO line items subcollection
- **`purchaseOrders/{poId}/receipts/{receiptId}`**: Receiving records subcollection

#### Storage Paths
- **PO PDFs**: `purchaseOrders/{poId}/po_{poNumber}.pdf` (optional)

#### Cross-Module Integration
- **Inventory → Purchase Orders**: Create PO from low stock
- **Suppliers → Purchase Orders**: Link PO to supplier
- **Purchase Orders → Inventory**: Update inventory when received
- **Categories → Purchase Orders**: Use preferred supplier

### Related Pages
- **admin-inventory.html**: Source for low stock items
- **admin-suppliers.html**: Supplier selection
- **admin-reports.html**: PO analysis and reporting

## Implementation Notes
- Automatic PO creation from low stock alerts
- Preferred supplier auto-selection
- ETA tracking and overdue alerts
- Receiving workflow with discrepancy handling
- Inventory update on receipt
- PO PDF generation (optional)
- Email sending to suppliers (optional)


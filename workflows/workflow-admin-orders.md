# Admin Orders Workflow

## Overview
Order management for customer orders from the shop. This page is a placeholder with basic structure.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-orders.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadOrders[Load Orders from<br/>Firestore: orders/]
    
    LoadOrders --> Query[Query orders with filters]
    Query --> RenderTable[Render Orders Table]
    RenderTable --> DisplayOrders[Display Orders with:<br/>- Order number<br/>- Customer<br/>- Products<br/>- Total amount<br/>- Status<br/>- Date]
    
    DisplayOrders --> UserAction{User Action}
    
    UserAction -->|View Order| ViewOrder[View Order Details]
    UserAction -->|Update Status| UpdateStatus[Update Order Status]
    UserAction -->|Process Order| ProcessOrder[Process Order]
    UserAction -->|Cancel Order| CancelOrder[Cancel Order]
    UserAction -->|Filter/Search| FilterOrders[Filter Orders List]
    
    ViewOrder --> LoadOrderData[Load Order Data]
    LoadOrderData --> DisplayOrderDetail[Display Order Detail:<br/>- Customer info<br/>- Products ordered<br/>- Shipping address<br/>- Payment status<br/>- Order history]
    
    UpdateStatus --> SelectStatus[Select New Status:<br/>- Pending<br/>- Processing<br/>- Shipped<br/>- Delivered<br/>- Cancelled]
    SelectStatus --> SaveStatus[Save Status to<br/>Firestore]
    SaveStatus --> ReloadOrders[Reload Orders List]
    
    ProcessOrder --> ValidateOrder{Order<br/>Valid?}
    ValidateOrder -->|No| ShowError[Show Error]
    ValidateOrder -->|Yes| CheckInventory[Check Inventory Stock]
    CheckInventory --> ReserveStock[Reserve Stock for Order]
    ReserveStock --> CreateInvoice[Create Invoice<br/>optional]
    CreateInvoice --> UpdateStatus2[Update Status: Processing]
    UpdateStatus2 --> ReloadOrders
    
    CancelOrder --> ConfirmCancel{Confirm<br/>Cancellation?}
    ConfirmCancel -->|No| DisplayOrders
    ConfirmCancel -->|Yes| ReleaseStock[Release Reserved Stock]
    ReleaseStock --> UpdateStatus3[Update Status: Cancelled]
    UpdateStatus3 --> ReloadOrders
    
    FilterOrders --> ApplyFilters[Apply Filters:<br/>- Status<br/>- Customer<br/>- Date range]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadOrders fill:#c8e6c9
    style ProcessOrder fill:#fff9c4
    style UpdateStatus fill:#fff9c4
```

## Planned Features

### Order Management
- **Order Viewing**: View customer orders
- **Order Status**: Track order status (pending, processing, shipped, delivered, cancelled)
- **Order Processing**: Process orders and reserve stock
- **Order Cancellation**: Cancel orders and release stock

### Integration Points

#### Firestore Collections
- **`orders/{orderId}`**: Order documents
  - Fields: `orderNumber`, `customerId`, `products[]`, `total`, `status`, `shippingAddress`, `paymentStatus`, `createdAt`, `updatedAt`

#### Cross-Module Integration
- **Shop → Orders**: Orders created from shop
- **Orders → Inventory**: Reserve/use stock for orders
- **Orders → Invoices**: Create invoice from order
- **Orders → Customers**: Link orders to customers

### Related Pages
- **shop.html**: Source for orders
- **admin-inventory.html**: Stock management for orders
- **admin-invoices.html**: Invoice creation from orders
- **admin-customers.html**: Customer order history

## Implementation Notes
- Order creation from shop cart
- Stock reservation for orders
- Order status workflow
- Order cancellation handling
- Integration with payment processing (future)


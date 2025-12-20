# Admin Customers Workflow

## Overview
Customer management with profiles, contact information, history tracking, and relationship management.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-customers.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadCustomers[Load Customers from<br/>Firestore: customers/]
    
    LoadCustomers --> Query[Query customers with filters]
    Query --> RenderTable[Render Customers Table]
    RenderTable --> DisplayCustomers[Display Customers with:<br/>- Name<br/>- Contact info<br/>- Total jobs<br/>- Last activity<br/>- Status]
    
    DisplayCustomers --> UserAction{User Action}
    
    UserAction -->|Add Customer| OpenAddModal[Open Add Customer Modal]
    UserAction -->|Edit Customer| OpenEditModal[Open Edit Customer Modal]
    UserAction -->|View Customer| OpenDetailView[Open Customer Detail View]
    UserAction -->|View History| ViewHistory[View Customer History]
    UserAction -->|Add Note| AddNote[Add Customer Note]
    UserAction -->|Filter/Search| FilterCustomers[Filter Customers List]
    
    OpenAddModal --> FillForm[User Fills Form:<br/>- Name<br/>- Email<br/>- Phone<br/>- Address<br/>- Notes]
    
    FillForm --> CheckDuplicate{Duplicate<br/>Check}
    CheckDuplicate -->|Found| ShowDuplicate[Show: Customer exists]
    CheckDuplicate -->|Not Found| SubmitForm[User Submits Form]
    
    ShowDuplicate --> MergeOrNew{Merge or<br/>New?}
    MergeOrNew -->|Merge| MergeCustomer[Merge with Existing]
    MergeOrNew -->|New| FillForm
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveCustomer[Save Customer to<br/>Firestore: customers/]
    SaveCustomer --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveCustomer --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadCustomers[Reload Customers List]
    ReloadCustomers --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    OpenDetailView --> LoadCustomerData[Load Customer Data]
    LoadCustomerData --> LoadVehicles[Load Vehicles from<br/>vehicles/ collection]
    LoadVehicles --> LoadJobs[Load Jobs from<br/>jobs/ collection]
    LoadJobs --> LoadQuotes[Load Quotes from<br/>quotes/ collection]
    LoadQuotes --> LoadInvoices[Load Invoices from<br/>invoices/ collection]
    LoadInvoices --> DisplayDetail[Display Customer Detail:<br/>- Profile<br/>- Vehicles<br/>- Job history<br/>- Quote history<br/>- Invoice history<br/>- Notes]
    
    ViewHistory --> LoadHistory[Load Customer History:<br/>- All jobs<br/>- All quotes<br/>- All invoices<br/>- All interactions]
    LoadHistory --> DisplayTimeline[Display Timeline View]
    
    AddNote --> EnterNote[Enter Note Text]
    EnterNote --> SaveNote[Save Note to<br/>Firestore: customers/{customerId}/notes/]
    SaveNote --> ReloadCustomers
    
    FilterCustomers --> ApplyFilters[Apply Filters:<br/>- Name<br/>- Email<br/>- Phone<br/>- Status<br/>- Date range]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadCustomers fill:#c8e6c9
    style SaveCustomer fill:#c8e6c9
    style OpenDetailView fill:#fff9c4
    style ViewHistory fill:#fff9c4
```

## Planned Features

### Customer Management
- **Customer Profiles**: Name, email, phone, address
- **Contact Information**: Multiple contact methods
- **Customer Notes**: Internal notes and communication history
- **Status Tracking**: Active, inactive, archived
- **Duplicate Detection**: Check for existing customers

### Customer History
- **Job History**: All jobs for customer
- **Quote History**: All quotes for customer
- **Invoice History**: All invoices for customer
- **Vehicle History**: All vehicles for customer
- **Interaction Timeline**: Chronological view of all interactions

### Integration Points

#### Firestore Collections
- **`customers/{customerId}`**: Customer documents
  - Fields: `name`, `email`, `phone`, `address`, `status`, `notes`, `createdAt`, `updatedAt`
- **`customers/{customerId}/notes/{noteId}`**: Customer notes subcollection
- **`customers/{customerId}/vehicles/{vehicleId}`**: Customer vehicles subcollection (alternative to separate vehicles collection)

#### Cross-Module Integration
- **Customers → Vehicles**: Link vehicles to customers
- **Customers → Jobs**: Link jobs to customers
- **Customers → Quotes**: Link quotes to customers
- **Customers → Invoices**: Link invoices to customers
- **Leads → Customers**: Create customer from won lead

### Related Pages
- **admin-vehicles.html**: Customer vehicle management
- **admin-jobs.html**: Customer job history
- **admin-quotes.html**: Customer quote history
- **admin-invoices.html**: Customer invoice history
- **admin-leads.html**: Create customer from lead

## Implementation Notes
- Duplicate customer detection (by email/phone)
- Customer merge functionality (optional)
- Customer history aggregation
- Customer communication log (future enhancement)


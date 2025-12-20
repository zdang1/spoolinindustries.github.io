# Admin Quotes Workflow

## Overview
Quote builder with line items for labour, parts, and materials. Supports versioning, approvals, and conversion to jobs.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-quotes.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadQuotes[Load Quotes from<br/>Firestore: quotes/]
    
    LoadQuotes --> Query[Query quotes with filters]
    Query --> RenderTable[Render Quotes Table]
    RenderTable --> DisplayQuotes[Display Quotes with:<br/>- Quote number<br/>- Customer<br/>- Total amount<br/>- Status<br/>- Created date<br/>- Expiry date]
    
    DisplayQuotes --> UserAction{User Action}
    
    UserAction -->|Create Quote| OpenCreateModal[Open Create Quote Modal]
    UserAction -->|Edit Quote| OpenEditModal[Open Edit Quote Modal]
    UserAction -->|View Quote| OpenDetailView[Open Quote Detail View]
    UserAction -->|Send Quote| SendQuote[Send Quote to Customer]
    UserAction -->|Approve Quote| ApproveQuote[Approve Quote Version]
    UserAction -->|Convert to Job| ConvertJob[Convert Quote to Job]
    UserAction -->|Filter/Search| FilterQuotes[Filter Quotes List]
    
    OpenCreateModal --> SelectCustomer[Select Customer from<br/>customers/ collection]
    SelectCustomer --> SelectVehicle[Select Vehicle optional<br/>from vehicles/ collection]
    SelectVehicle --> BuildLineItems[Build Line Items:<br/>- Labour items<br/>- Parts from products/<br/>- Materials<br/>- Custom items]
    
    BuildLineItems --> AddLineItem[Add Line Item:<br/>- Description<br/>- Quantity<br/>- Unit price<br/>- Total]
    AddLineItem --> CalculateTotal[Calculate Subtotal,<br/>Tax, Total]
    CalculateTotal --> MoreItems{More<br/>Items?}
    MoreItems -->|Yes| AddLineItem
    MoreItems -->|No| SetExpiry[Set Expiry Date]
    
    SetExpiry --> SetStatus[Set Status: draft]
    SetStatus --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> BuildLineItems
    
    Validate -->|Yes| SaveQuote[Save Quote to<br/>Firestore: quotes/]
    SaveQuote --> GenerateNumber[Generate Quote Number]
    SaveQuote --> AddVersion[Add Version: 1]
    SaveQuote --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveQuote --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> BuildLineItems
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadQuotes[Reload Quotes List]
    ReloadQuotes --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    SendQuote --> GeneratePDF[Generate PDF Quote<br/>optional]
    GeneratePDF --> SendEmail[Send Email to Customer<br/>with quote link]
    SendEmail --> UpdateStatus[Update Status to: sent]
    UpdateStatus --> SaveStatus[Save to Firestore]
    SaveStatus --> ReloadQuotes
    
    ApproveQuote --> CheckVersion{Version<br/>Approved?}
    CheckVersion -->|No| RequestApproval[Request Manager Approval]
    RequestApproval --> SaveApproval[Save Approval Request]
    CheckVersion -->|Yes| MarkApproved[Mark Version Approved]
    MarkApproved --> SaveStatus
    
    ConvertJob --> ConfirmConvert{Confirm<br/>Conversion?}
    ConfirmConvert -->|No| DisplayQuotes
    ConfirmConvert -->|Yes| CreateJob[Create Job in<br/>Firestore: jobs/]
    CreateJob --> LinkQuote[Link Job to Quote]
    LinkQuote --> UpdateQuoteStatus[Update Quote Status to: accepted]
    UpdateQuoteStatus --> SaveStatus
    SaveStatus --> NavigateJob[Navigate to<br/>admin-jobs.html]
    
    FilterQuotes --> ApplyFilters[Apply Filters:<br/>- Status draft/sent/accepted/expired<br/>- Customer<br/>- Date range]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadQuotes fill:#c8e6c9
    style SaveQuote fill:#c8e6c9
    style SendQuote fill:#fff9c4
    style ConvertJob fill:#fff9c4
    style CreateJob fill:#c8e6c9
```

## Planned Features

### Quote Builder
- **Line Items**: Labour, parts (from products), materials, custom items
- **Pricing**: Quantity × unit price = line total
- **Calculations**: Subtotal, tax, total
- **Customer Selection**: Link to customer and vehicle
- **Quote Number**: Auto-generated sequential number

### Quote Statuses
1. **draft** → Being created, not sent
2. **sent** → Sent to customer
3. **accepted** → Customer accepted, converted to job
4. **expired** → Past expiry date
5. **declined** → Customer declined

### Quote Versioning
- **Version History**: Track multiple versions of same quote
- **Approvals**: Manager approval for quote versions
- **Change Tracking**: Track what changed between versions

### Integration Points

#### Firestore Collections
- **`quotes/{quoteId}`**: Main quote documents
  - Fields: `quoteNumber`, `customerId`, `vehicleId`, `status`, `lineItems[]`, `subtotal`, `tax`, `total`, `expiryDate`, `version`, `createdAt`, `updatedAt`
- **`quotes/{quoteId}/items/{itemId}`**: Line items subcollection (alternative structure)
- **`quotes/{quoteId}/versions/{versionId}`**: Version history subcollection

#### Storage Paths
- **Quote PDFs**: `quotes/{quoteId}/quote_{quoteNumber}.pdf` (optional)

#### Cross-Module Integration
- **Leads → Quotes**: Convert lead to quote
- **Quotes → Jobs**: Convert accepted quote to job
- **Products → Quotes**: Add products as line items
- **Customers → Quotes**: Link quote to customer
- **Vehicles → Quotes**: Link quote to vehicle

### Related Pages
- **admin-leads.html**: Source for new quotes
- **admin-jobs.html**: Destination for converted quotes
- **admin-customers.html**: Customer selection
- **admin-vehicles.html**: Vehicle selection
- **admin-products.html**: Product selection for line items

## Implementation Notes
- Quote PDF generation (optional, could use Cloud Functions)
- Email sending (optional, could use Cloud Functions or third-party service)
- Expiry date checking (could use Cloud Functions scheduled job)
- Quote templates (future enhancement)


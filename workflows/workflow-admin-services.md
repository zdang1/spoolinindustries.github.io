# Admin Services Workflow

## Overview
Service management for service offerings. This page is a placeholder with basic structure.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-services.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadServices[Load Services from<br/>Firestore: services/]
    
    LoadServices --> Query[Query services with filters]
    Query --> RenderTable[Render Services Table]
    RenderTable --> DisplayServices[Display Services with:<br/>- Name<br/>- Description<br/>- Price<br/>- Duration<br/>- Status]
    
    DisplayServices --> UserAction{User Action}
    
    UserAction -->|Add Service| OpenAddModal[Open Add Service Modal]
    UserAction -->|Edit Service| OpenEditModal[Open Edit Service Modal]
    UserAction -->|View Service| ViewService[View Service Details]
    UserAction -->|Delete Service| DeleteService[Delete Service]
    UserAction -->|Filter/Search| FilterServices[Filter Services List]
    
    OpenAddModal --> FillForm[User Fills Form:<br/>- Service name<br/>- Description<br/>- Price<br/>- Duration<br/>- Category]
    
    FillForm --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveService[Save Service to<br/>Firestore: services/]
    SaveService --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveService --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadServices[Reload Services List]
    ReloadServices --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    DeleteService --> ConfirmDelete{Confirm<br/>Deletion?}
    ConfirmDelete -->|No| DisplayServices
    ConfirmDelete -->|Yes| DeleteFromFirestore[Delete from<br/>Firestore: services/]
    DeleteFromFirestore --> ReloadServices
    
    FilterServices --> ApplyFilters[Apply Filters:<br/>- Name<br/>- Category<br/>- Status]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadServices fill:#c8e6c9
    style SaveService fill:#c8e6c9
```

## Planned Features

### Service Management
- **Service Creation**: Create service offerings
- **Service Editing**: Edit service details
- **Service Deletion**: Delete services
- **Service Categories**: Organize services by category
- **Service Pricing**: Set service prices
- **Service Duration**: Set service duration

### Integration Points

#### Firestore Collections
- **`services/{serviceId}`**: Service documents
  - Fields: `name`, `description`, `price`, `duration`, `category`, `status`, `createdAt`, `updatedAt`

#### Cross-Module Integration
- **Services → Quotes**: Add services to quotes
- **Services → Jobs**: Link services to jobs
- **Services → Templates**: Service package templates
- **Services → Shop**: Display services on shop (optional)

### Related Pages
- **admin-quotes.html**: Add services to quotes
- **admin-jobs.html**: Link services to jobs
- **admin-templates.html**: Service package templates

## Implementation Notes
- Service CRUD operations
- Service category management
- Service pricing and duration tracking
- Integration with quotes and jobs


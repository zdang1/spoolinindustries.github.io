# Admin Vehicles Workflow

## Overview
Vehicle profiles per customer with vehicle history, fitment notes, specs, and attachments.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-vehicles.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadVehicles[Load Vehicles from<br/>Firestore: vehicles/]
    
    LoadVehicles --> Query[Query vehicles with filters]
    Query --> RenderTable[Render Vehicles Table]
    RenderTable --> DisplayVehicles[Display Vehicles with:<br/>- Make/Model<br/>- Year<br/>- Registration<br/>- Customer<br/>- Last service]
    
    DisplayVehicles --> UserAction{User Action}
    
    UserAction -->|Add Vehicle| OpenAddModal[Open Add Vehicle Modal]
    UserAction -->|Edit Vehicle| OpenEditModal[Open Edit Vehicle Modal]
    UserAction -->|View Vehicle| OpenDetailView[Open Vehicle Detail View]
    UserAction -->|View History| ViewHistory[View Vehicle History]
    UserAction -->|Add Fitment Note| AddFitmentNote[Add Fitment Note]
    UserAction -->|Upload Attachment| UploadAttachment[Upload Attachment]
    UserAction -->|Filter/Search| FilterVehicles[Filter Vehicles List]
    
    OpenAddModal --> SelectCustomer[Select Customer from<br/>customers/ collection]
    SelectCustomer --> FillForm[User Fills Form:<br/>- Make<br/>- Model<br/>- Year<br/>- Registration<br/>- VIN optional<br/>- Color<br/>- Engine specs]
    
    FillForm --> EnterSpecs[Enter Vehicle Specs:<br/>- Engine type<br/>- Transmission<br/>- Drivetrain<br/>- Modifications]
    EnterSpecs --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveVehicle[Save Vehicle to<br/>Firestore: vehicles/]
    SaveVehicle --> LinkCustomer[Link to Customer]
    SaveVehicle --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveVehicle --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadVehicles[Reload Vehicles List]
    ReloadVehicles --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    OpenDetailView --> LoadVehicleData[Load Vehicle Data]
    LoadVehicleData --> LoadJobs[Load Jobs from<br/>jobs/ collection]
    LoadJobs --> LoadQuotes[Load Quotes from<br/>quotes/ collection]
    LoadQuotes --> LoadFitmentNotes[Load Fitment Notes from<br/>vehicles/{vehicleId}/fitmentNotes/]
    LoadFitmentNotes --> LoadAttachments[Load Attachments from<br/>vehicles/{vehicleId}/attachments/]
    LoadAttachments --> DisplayDetail[Display Vehicle Detail:<br/>- Specs<br/>- Job history<br/>- Quote history<br/>- Fitment notes<br/>- Attachments]
    
    ViewHistory --> LoadHistory[Load Vehicle History:<br/>- All jobs<br/>- All quotes<br/>- All services<br/>- All modifications]
    LoadHistory --> DisplayTimeline[Display Timeline View]
    
    AddFitmentNote --> EnterFitment[Enter Fitment Note:<br/>- Part fitted<br/>- Date<br/>- Notes<br/>- Photos]
    EnterFitment --> UploadFitmentPhoto[Upload Photo to<br/>Storage: vehicles/{vehicleId}/fitment/]
    UploadFitmentPhoto --> SaveFitmentNote[Save Note to<br/>Firestore: vehicles/{vehicleId}/fitmentNotes/]
    SaveFitmentNote --> ReloadVehicles
    
    UploadAttachment --> SelectFile[Select File to Upload]
    SelectFile --> UploadToStorage[Upload to Storage:<br/>vehicles/{vehicleId}/attachments/]
    UploadToStorage --> SaveAttachment[Save Attachment Metadata to<br/>Firestore: vehicles/{vehicleId}/attachments/]
    SaveAttachment --> ReloadVehicles
    
    FilterVehicles --> ApplyFilters[Apply Filters:<br/>- Make/Model<br/>- Year<br/>- Customer<br/>- Registration]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadVehicles fill:#c8e6c9
    style SaveVehicle fill:#c8e6c9
    style OpenDetailView fill:#fff9c4
    style ViewHistory fill:#fff9c4
    style AddFitmentNote fill:#fff9c4
```

## Planned Features

### Vehicle Management
- **Vehicle Profiles**: Make, model, year, registration, VIN
- **Vehicle Specs**: Engine, transmission, drivetrain, modifications
- **Customer Linking**: Link vehicle to customer
- **Fitment Notes**: Track parts fitted to vehicle
- **Attachments**: Store documents, photos, etc.

### Vehicle History
- **Job History**: All jobs performed on vehicle
- **Quote History**: All quotes for vehicle
- **Service History**: Service and maintenance records
- **Modification History**: Parts and modifications fitted
- **Timeline View**: Chronological view of all work

### Integration Points

#### Firestore Collections
- **`vehicles/{vehicleId}`**: Vehicle documents
  - Fields: `customerId`, `make`, `model`, `year`, `registration`, `vin`, `color`, `engineSpecs`, `transmission`, `drivetrain`, `modifications`, `createdAt`, `updatedAt`
- **`vehicles/{vehicleId}/fitmentNotes/{noteId}`**: Fitment notes subcollection
- **`vehicles/{vehicleId}/attachments/{attachmentId}`**: Attachment metadata subcollection

#### Storage Paths
- **Vehicle Attachments**: `vehicles/{vehicleId}/attachments/{filename}`
- **Fitment Photos**: `vehicles/{vehicleId}/fitment/{filename}`

#### Cross-Module Integration
- **Customers → Vehicles**: Link vehicles to customers
- **Vehicles → Jobs**: Link jobs to vehicles
- **Vehicles → Quotes**: Link quotes to vehicles
- **Vehicles → Products**: Track products fitted to vehicles

### Related Pages
- **admin-customers.html**: Customer selection
- **admin-jobs.html**: Vehicle job history
- **admin-quotes.html**: Vehicle quote history
- **admin-products.html**: Products fitted to vehicle

## Implementation Notes
- Vehicle VIN validation (optional)
- Fitment note tracking for warranty purposes
- Vehicle modification history
- Vehicle service reminders (future enhancement)


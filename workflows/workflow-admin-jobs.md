# Admin Jobs Workflow

## Overview
Job board by stage (Booked → Fab → QA → Complete) with tech assignment, due dates, notes, and parts tracking.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-jobs.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadJobs[Load Jobs from<br/>Firestore: jobs/]
    
    LoadJobs --> Query[Query jobs with filters]
    Query --> RenderBoard[Render Job Board by Stage]
    RenderBoard --> DisplayStages[Display Job Stages:<br/>- Booked<br/>- Fab Fabrication<br/>- QA Quality Assurance<br/>- Complete]
    
    DisplayStages --> UserAction{User Action}
    
    UserAction -->|Create Job| OpenCreateModal[Open Create Job Modal]
    UserAction -->|Edit Job| OpenEditModal[Open Edit Job Modal]
    UserAction -->|View Job| OpenDetailView[Open Job Detail View]
    UserAction -->|Change Stage| ChangeStage[Move Job to Next Stage]
    UserAction -->|Assign Tech| AssignTech[Assign Technician]
    UserAction -->|Set Due Date| SetDueDate[Set Due Date]
    UserAction -->|Add Note| AddNote[Add Job Note]
    UserAction -->|Reserve Parts| ReserveParts[Reserve Parts from Inventory]
    UserAction -->|Filter/Search| FilterJobs[Filter Jobs List]
    
    OpenCreateModal --> SelectSource{Job<br/>Source?}
    SelectSource -->|From Quote| SelectQuote[Select Quote from<br/>quotes/ collection]
    SelectSource -->|From Lead| SelectLead[Select Lead from<br/>leads/ collection]
    SelectSource -->|Manual| ManualEntry[Manual Entry]
    
    SelectQuote --> LoadQuoteData[Load Quote Data:<br/>- Customer<br/>- Vehicle<br/>- Line items]
    SelectLead --> LoadLeadData[Load Lead Data]
    ManualEntry --> SelectCustomer[Select Customer]
    
    LoadQuoteData --> SelectCustomer
    LoadLeadData --> SelectCustomer
    
    SelectCustomer --> SelectVehicle[Select Vehicle from<br/>vehicles/ collection]
    SelectVehicle --> EnterJobDetails[Enter Job Details:<br/>- Description<br/>- Work required<br/>- Priority]
    
    EnterJobDetails --> AssignTech[Assign Technician]
    AssignTech --> SetDueDate[Set Due Date]
    SetDueDate --> ReserveParts[Reserve Parts from<br/>inventory/ collection]
    ReserveParts --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> EnterJobDetails
    
    Validate -->|Yes| SaveJob[Save Job to<br/>Firestore: jobs/]
    SaveJob --> GenerateNumber[Generate Job Number]
    SaveJob --> SetStage[Set Stage: booked]
    SaveJob --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveJob --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> EnterJobDetails
    
    SaveResult -->|Yes| UpdateInventory[Update Inventory:<br/>Reserve Parts]
    UpdateInventory --> ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadJobs[Reload Jobs List]
    ReloadJobs --> CloseModal[Close Modal]
    CloseModal --> RenderBoard
    
    ChangeStage --> SelectStage[Select New Stage]
    SelectStage --> ValidateTransition{Valid<br/>Transition?}
    ValidateTransition -->|No| ShowTransitionError[Show Error:<br/>Invalid transition]
    ValidateTransition -->|Yes| UpdateStage[Update Stage in<br/>Firestore]
    
    UpdateStage --> StageActions{Stage<br/>Actions}
    StageActions -->|Fab → QA| CreateQAChecklist[Create QA Checklist]
    StageActions -->|QA → Complete| FinalCheck[Final Handover Check]
    StageActions -->|Complete| GenerateInvoice[Generate Invoice<br/>optional]
    
    CreateQAChecklist --> SaveStage
    FinalCheck --> SaveStage
    GenerateInvoice --> SaveStage
    
    SaveStage --> SaveStatus[Save to Firestore]
    SaveStatus --> ReloadJobs
    
    AssignTech --> SelectTech[Select Technician from<br/>users/ collection]
    SelectTech --> SaveAssignment[Save Assignment to<br/>Firestore]
    SaveAssignment --> ReloadJobs
    
    AddNote --> EnterNote[Enter Note Text]
    EnterNote --> SaveNote[Save Note to<br/>Firestore: jobs/{jobId}/notes/]
    SaveNote --> ReloadJobs
    
    ReserveParts --> SelectParts[Select Parts from<br/>inventory/]
    SelectParts --> SetQuantity[Set Reserved Quantity]
    SetQuantity --> SaveReservation[Save Reservation to<br/>Firestore: jobs/{jobId}/parts/]
    SaveReservation --> UpdateInventoryStock[Update Inventory Stock:<br/>Reserved count]
    UpdateInventoryStock --> ReloadJobs
    
    FilterJobs --> ApplyFilters[Apply Filters:<br/>- Stage<br/>- Technician<br/>- Customer<br/>- Due date range]
    ApplyFilters --> RenderBoard
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadJobs fill:#c8e6c9
    style SaveJob fill:#c8e6c9
    style ChangeStage fill:#fff9c4
    style ReserveParts fill:#fff9c4
    style UpdateInventory fill:#fff9c4
```

## Planned Features

### Job Stages
1. **Booked** → Job scheduled, parts reserved
2. **Fab** → Fabrication in progress
3. **QA** → Quality assurance check
4. **Complete** → Job finished, ready for handover

### Job Management
- **Job Number**: Auto-generated sequential number
- **Customer & Vehicle**: Link to customer and vehicle records
- **Technician Assignment**: Assign jobs to technicians
- **Due Dates**: Set and track due dates
- **Priority**: Set job priority level
- **Job Notes**: Internal notes and customer updates
- **Parts Tracking**: Reserve and track parts used

### Parts Management
- **Reserved Stock**: Reserve parts from inventory for job
- **Used Stock**: Track parts actually used
- **Inventory Integration**: Update inventory when parts reserved/used

### Integration Points

#### Firestore Collections
- **`jobs/{jobId}`**: Main job documents
  - Fields: `jobNumber`, `customerId`, `vehicleId`, `quoteId`, `leadId`, `stage`, `assignedTo`, `dueDate`, `priority`, `description`, `status`, `createdAt`, `updatedAt`
- **`jobs/{jobId}/notes/{noteId}`**: Job notes subcollection
- **`jobs/{jobId}/parts/{partId}`**: Reserved/used parts subcollection
- **`jobs/{jobId}/stages/{stageId}`**: Stage history subcollection
- **`jobs/{jobId}/checklists/{checklistId}`**: QA checklists subcollection

#### Storage Paths
- **Job Photos**: `jobs/{jobId}/photos/{filename}`

#### Cross-Module Integration
- **Quotes → Jobs**: Convert accepted quote to job
- **Leads → Jobs**: Create job from booked lead
- **Jobs → Schedule**: Schedule job in calendar
- **Jobs → Time Tracking**: Track time spent on job
- **Jobs → QA**: Create QA checklist when moving to QA stage
- **Jobs → Invoices**: Generate invoice when job complete
- **Jobs → Inventory**: Reserve and use parts
- **Jobs → Customers**: Link to customer and vehicle

### Related Pages
- **admin-quotes.html**: Source for new jobs
- **admin-leads.html**: Source for new jobs
- **admin-schedule.html**: Schedule job appointments
- **admin-time.html**: Track time on job
- **admin-qa.html**: QA checklists for job
- **admin-invoices.html**: Generate invoice from job
- **admin-inventory.html**: Reserve parts for job

## Implementation Notes
- Stage transition validation (enforce valid transitions)
- Automatic QA checklist creation when moving to QA stage
- Automatic invoice generation when job complete (optional)
- Inventory reservation system (prevent double-booking)
- Job board drag-and-drop interface (optional UI enhancement)


# Admin Leads & Enquiries Workflow

## Overview
Lead capture and pipeline management system for tracking customer enquiries from various sources.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-leads.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadLeads[Load Leads from<br/>Firestore: leads/]
    
    LoadLeads --> Query[Query leads with filters]
    Query --> RenderTable[Render Leads Table]
    RenderTable --> DisplayLeads[Display Leads with:<br/>- Contact info<br/>- Source<br/>- Status<br/>- Created date<br/>- Assigned to]
    
    DisplayLeads --> UserAction{User Action}
    
    UserAction -->|Add Lead| OpenAddModal[Open Add Lead Modal]
    UserAction -->|Edit Lead| OpenEditModal[Open Edit Lead Modal]
    UserAction -->|View Details| OpenDetailView[Open Lead Detail View]
    UserAction -->|Change Status| UpdateStatus[Update Lead Status]
    UserAction -->|Add Note| AddNote[Add Internal Note]
    UserAction -->|Set Reminder| SetReminder[Set Follow-up Reminder]
    UserAction -->|Convert to Quote| ConvertQuote[Convert Lead to Quote]
    UserAction -->|Filter/Search| FilterLeads[Filter Leads List]
    
    OpenAddModal --> FillForm[User Fills Form:<br/>- Name, Email, Phone<br/>- Source web/phone/social<br/>- Enquiry details<br/>- Vehicle info optional]
    
    FillForm --> UploadAttachments[Upload Attachments:<br/>photos/videos]
    UploadAttachments --> UploadToStorage[Upload to Storage:<br/>leads/{leadId}/]
    UploadToStorage --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveLead[Save Lead to<br/>Firestore: leads/]
    SaveLead --> SetStatus[Set Status: new]
    SaveLead --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveLead --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadLeads[Reload Leads List]
    ReloadLeads --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    UpdateStatus --> StatusFlow{Status<br/>Transition}
    StatusFlow -->|new → contacted| Update1[Update Status]
    StatusFlow -->|contacted → booked| Update2[Update Status]
    StatusFlow -->|booked → won| Update3[Update Status +<br/>Create Customer]
    StatusFlow -->|booked → lost| Update4[Update Status +<br/>Add reason]
    
    Update1 --> SaveStatus[Save to Firestore]
    Update2 --> SaveStatus
    Update3 --> SaveStatus
    Update4 --> SaveStatus
    
    SaveStatus --> ReloadLeads
    
    AddNote --> SaveNote[Save Note to<br/>Firestore: leads/{leadId}/notes/]
    SaveNote --> ReloadLeads
    
    SetReminder --> SaveReminder[Save Reminder to<br/>Firestore with dueDate]
    SaveReminder --> ReloadLeads
    
    ConvertQuote --> CreateQuote[Create Quote from Lead<br/>in Firestore: quotes/]
    CreateQuote --> LinkLead[Link Quote to Lead]
    LinkLead --> UpdateLeadStatus[Update Lead Status to<br/>converted]
    UpdateLeadStatus --> ReloadLeads
    
    FilterLeads --> ApplyFilters[Apply Filters:<br/>- Status<br/>- Source<br/>- Date range<br/>- Assigned to]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadLeads fill:#c8e6c9
    style SaveLead fill:#c8e6c9
    style UpdateStatus fill:#fff9c4
    style ConvertQuote fill:#fff9c4
```

## Planned Features

### Lead Capture
- **Sources**: Web form, phone call, social media, walk-in
- **Contact Info**: Name, email, phone, address
- **Enquiry Details**: Description, vehicle info, service needed
- **Attachments**: Photos, videos (stored in Firebase Storage)

### Lead Status Pipeline
1. **new** → Initial enquiry received
2. **contacted** → Staff has reached out
3. **booked** → Appointment/job scheduled
4. **won** → Converted to customer/job
5. **lost** → Not converted (with reason)

### Lead Management
- **Internal Notes**: Staff notes and communication history
- **Follow-up Reminders**: Scheduled reminders for follow-up
- **Assignment**: Assign leads to staff members
- **Attachments**: Photos/videos from customer

### Integration Points

#### Firestore Collections
- **`leads/{leadId}`**: Main lead documents
  - Fields: `name`, `email`, `phone`, `source`, `status`, `enquiry`, `vehicleInfo`, `assignedTo`, `createdAt`, `updatedAt`
- **`leads/{leadId}/notes/{noteId}`**: Internal notes subcollection
- **`leads/{leadId}/attachments/{attachmentId}`**: Attachment metadata subcollection

#### Storage Paths
- **Lead Attachments**: `leads/{leadId}/{filename}`

#### Cross-Module Integration
- **Leads → Quotes**: Convert lead to quote
- **Leads → Customers**: When status = "won", create customer record
- **Leads → Jobs**: When status = "booked", create job record

### Related Pages
- **admin-quotes.html**: Convert lead to quote
- **admin-customers.html**: Create customer from won lead
- **admin-jobs.html**: Create job from booked lead

## Implementation Notes
- Lead source tracking for analytics
- Reminder system (could use Cloud Functions for scheduled reminders)
- Email notifications on status changes (optional)
- Lead scoring/priority (future enhancement)


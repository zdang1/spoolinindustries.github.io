# Admin Time Tracking Workflow

## Overview
Time entries per job with billable vs non-billable tracking, tech timesheets, and rework tracking.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-time.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadTimeEntries[Load Time Entries from<br/>Firestore: timeEntries/]
    
    LoadTimeEntries --> Query[Query time entries with filters]
    Query --> RenderTable[Render Time Entries Table]
    RenderTable --> DisplayEntries[Display Time Entries with:<br/>- Job<br/>- Technician<br/>- Date & time<br/>- Duration<br/>- Billable status<br/>- Description]
    
    DisplayEntries --> UserAction{User Action}
    
    UserAction -->|Add Time Entry| OpenAddModal[Open Add Time Entry Modal]
    UserAction -->|Edit Time Entry| OpenEditModal[Open Edit Time Entry Modal]
    UserAction -->|View Timesheet| ViewTimesheet[View Technician Timesheet]
    UserAction -->|Mark Billable| ToggleBillable[Toggle Billable Status]
    UserAction -->|Mark Rework| MarkRework[Mark as Rework Entry]
    UserAction -->|Filter/Search| FilterEntries[Filter Time Entries]
    UserAction -->|Export Timesheet| ExportTimesheet[Export Timesheet Report]
    
    OpenAddModal --> SelectJob[Select Job from<br/>jobs/ collection]
    SelectJob --> SelectTech[Select Technician from<br/>users/ collection]
    SelectTech --> EnterTime[Enter Time Details:<br/>- Start time<br/>- End time or<br/>- Duration]
    
    EnterTime --> CalculateDuration[Calculate Duration]
    CalculateDuration --> EnterDescription[Enter Description/Notes]
    EnterDescription --> SetBillable{Is<br/>Billable?}
    
    SetBillable -->|Yes| SetBillableRate[Set Billable Rate<br/>optional]
    SetBillable -->|No| SetRework{Is<br/>Rework?}
    
    SetBillableRate --> SetRework
    SetRework -->|Yes| EnterReworkReason[Enter Rework Reason]
    SetRework -->|No| SubmitForm
    
    EnterReworkReason --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> EnterTime
    
    Validate -->|Yes| SaveTimeEntry[Save Time Entry to<br/>Firestore: timeEntries/]
    SaveTimeEntry --> LinkJob[Link to Job]
    SaveTimeEntry --> LinkTech[Link to Technician]
    SaveTimeEntry --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveTimeEntry --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> EnterTime
    
    SaveResult -->|Yes| UpdateJobTime[Update Job Total Time<br/>in jobs/ collection]
    UpdateJobTime --> ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadEntries[Reload Time Entries]
    ReloadEntries --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    ViewTimesheet --> SelectTechForSheet[Select Technician]
    SelectTechForSheet --> LoadTechEntries[Load All Entries for<br/>Selected Technician]
    LoadTechEntries --> CalculateTotals[Calculate Totals:<br/>- Total hours<br/>- Billable hours<br/>- Non-billable hours<br/>- Rework hours]
    CalculateTotals --> DisplayTimesheet[Display Timesheet View]
    
    ToggleBillable --> UpdateBillable[Update Billable Status<br/>in Firestore]
    UpdateBillable --> RecalculateJob[Recalculate Job Billable Time]
    RecalculateJob --> ReloadEntries
    
    MarkRework --> EnterReworkReason2[Enter Rework Reason]
    EnterReworkReason2 --> UpdateRework[Update Rework Status<br/>in Firestore]
    UpdateRework --> RecalculateJob
    
    FilterEntries --> ApplyFilters[Apply Filters:<br/>- Job<br/>- Technician<br/>- Date range<br/>- Billable status<br/>- Rework status]
    ApplyFilters --> RenderTable
    
    ExportTimesheet --> GenerateReport[Generate Timesheet Report:<br/>- CSV export<br/>- PDF export optional]
    GenerateReport --> DownloadReport[Download Report]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadTimeEntries fill:#c8e6c9
    style SaveTimeEntry fill:#c8e6c9
    style UpdateJobTime fill:#fff9c4
    style ViewTimesheet fill:#fff9c4
    style ExportTimesheet fill:#fff9c4
```

## Planned Features

### Time Entry
- **Job Linking**: Link time entry to specific job
- **Technician**: Track which technician worked
- **Time Tracking**: Start/end time or duration entry
- **Description**: Notes about work performed
- **Billable Status**: Mark as billable or non-billable
- **Billable Rate**: Set hourly rate for billable work
- **Rework Tracking**: Mark entries as rework with reason

### Timesheet Management
- **Technician Timesheets**: View all entries for a technician
- **Job Timesheets**: View all entries for a job
- **Totals Calculation**: Total hours, billable hours, rework hours
- **Date Range Filtering**: Filter by date range
- **Export**: Export timesheets as CSV/PDF

### Rework Tracking
- **Rework Identification**: Mark time entries as rework
- **Rework Reasons**: Track why rework was needed
- **Rework Analysis**: Analyze rework patterns and costs
- **Quality Metrics**: Use rework data for quality improvement

### Integration Points

#### Firestore Collections
- **`timeEntries/{entryId}`**: Time entry documents
  - Fields: `jobId`, `technicianId`, `startTime`, `endTime`, `duration`, `description`, `billable`, `billableRate`, `isRework`, `reworkReason`, `date`, `createdAt`, `updatedAt`
- **`jobs/{jobId}`**: Job documents (updated with total time)
  - Fields: `totalTime`, `billableTime`, `reworkTime`

#### Cross-Module Integration
- **Jobs → Time Tracking**: Track time spent on jobs
- **Time Tracking → Jobs**: Update job total time
- **Time Tracking → Invoices**: Use billable time for invoicing
- **Time Tracking → Reports**: Time analysis and reporting
- **Users → Time Tracking**: Technician timesheets

### Related Pages
- **admin-jobs.html**: Source for job selection
- **admin-reports.html**: Time analysis reports
- **admin-invoices.html**: Use billable time for invoicing
- **admin-users.html**: Technician selection

## Implementation Notes
- Automatic duration calculation from start/end time
- Real-time job time totals update
- Rework pattern analysis (future enhancement)
- Time entry validation (prevent overlapping entries, optional)
- Mobile time entry (future enhancement for technicians)


# Admin Schedule Workflow

## Overview
Calendar system by bay/technician with capacity planning, drop-off/pick-up slots, and conflict warnings.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-schedule.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadSchedule[Load Schedule Events from<br/>Firestore: schedule/]
    
    LoadSchedule --> Query[Query events with date range]
    Query --> LoadResources[Load Resources:<br/>- Bays<br/>- Technicians]
    LoadResources --> RenderCalendar[Render Calendar View]
    RenderCalendar --> DisplayCalendar[Display Calendar:<br/>- By Bay<br/>- By Technician<br/>- Combined view]
    
    DisplayCalendar --> UserAction{User Action}
    
    UserAction -->|Create Event| OpenCreateModal[Open Create Event Modal]
    UserAction -->|Edit Event| OpenEditModal[Open Edit Event Modal]
    UserAction -->|View Event| OpenDetailView[Open Event Detail View]
    UserAction -->|Drag & Drop| DragEvent[Move Event to New Time/Slot]
    UserAction -->|Filter View| FilterView[Filter by Bay/Technician]
    UserAction -->|Check Conflicts| CheckConflicts[Check for Conflicts]
    
    OpenCreateModal --> SelectType{Event<br/>Type?}
    SelectType -->|Job| SelectJob[Select Job from<br/>jobs/ collection]
    SelectType -->|Drop-off| CreateDropoff[Create Drop-off Slot]
    SelectType -->|Pick-up| CreatePickup[Create Pick-up Slot]
    SelectType -->|Other| CreateOther[Create Other Event]
    
    SelectJob --> LoadJobInfo[Load Job Info:<br/>- Customer<br/>- Vehicle<br/>- Estimated duration]
    LoadJobInfo --> SelectResource[Select Resource:<br/>- Bay or<br/>- Technician]
    
    CreateDropoff --> EnterDropoff[Enter Drop-off Details:<br/>- Customer<br/>- Vehicle<br/>- Time slot]
    CreatePickup --> EnterPickup[Enter Pick-up Details:<br/>- Customer<br/>- Vehicle<br/>- Time slot]
    CreateOther --> EnterOther[Enter Event Details]
    
    SelectResource --> SetTime[Set Start & End Time]
    EnterDropoff --> SetTime
    EnterPickup --> SetTime
    EnterOther --> SetTime
    
    SetTime --> CheckAvailability[Check Resource Availability]
    CheckAvailability --> Available{Resource<br/>Available?}
    Available -->|No| ShowConflict[Show Conflict Warning:<br/>- Conflicting event<br/>- Suggest alternatives]
    ShowConflict --> AdjustTime[Adjust Time or Resource]
    AdjustTime --> CheckAvailability
    
    Available -->|Yes| SetCapacity[Set Capacity Requirements]
    SetCapacity --> CheckCapacity{Capacity<br/>Available?}
    CheckCapacity -->|No| ShowCapacityWarning[Show Capacity Warning]
    ShowCapacityWarning --> AdjustTime
    
    CheckCapacity -->|Yes| SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> SetTime
    
    Validate -->|Yes| SaveEvent[Save Event to<br/>Firestore: schedule/]
    SaveEvent --> LinkJob[Link Event to Job if applicable]
    SaveEvent --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveEvent --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> SetTime
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadSchedule[Reload Schedule]
    ReloadSchedule --> CloseModal[Close Modal]
    CloseModal --> RenderCalendar
    
    DragEvent --> ValidateDrag{Valid<br/>Move?}
    ValidateDrag -->|No| ShowDragError[Show Error:<br/>Conflict or invalid]
    ValidateDrag -->|Yes| UpdateEvent[Update Event Time/Resource<br/>in Firestore]
    UpdateEvent --> ReloadSchedule
    
    CheckConflicts --> ScanSchedule[Scan Schedule for:<br/>- Overlapping times<br/>- Double-booking<br/>- Capacity overruns]
    ScanSchedule --> DisplayConflicts[Display Conflict List]
    DisplayConflicts --> ResolveConflict[Resolve Conflicts]
    ResolveConflict --> UpdateEvent
    
    FilterView --> ApplyFilter[Apply Filter:<br/>- Bay filter<br/>- Technician filter<br/>- Date range]
    ApplyFilter --> RenderCalendar
    
    CapacityPlanning[Capacity Planning View] --> ShowCapacity[Show Capacity:<br/>- Available slots<br/>- Booked slots<br/>- Utilization %]
    ShowCapacity --> Optimize[Suggest Optimizations]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadSchedule fill:#c8e6c9
    style SaveEvent fill:#c8e6c9
    style CheckAvailability fill:#fff9c4
    style CheckConflicts fill:#fff9c4
    style CapacityPlanning fill:#fff9c4
```

## Planned Features

### Calendar Views
- **By Bay**: View schedule organized by work bays
- **By Technician**: View schedule organized by technician
- **Combined View**: See all resources in one calendar
- **Day/Week/Month Views**: Different time scale views

### Event Types
- **Job Events**: Scheduled work for jobs
- **Drop-off Slots**: Customer vehicle drop-off appointments
- **Pick-up Slots**: Customer vehicle pick-up appointments
- **Other Events**: Meetings, maintenance, etc.

### Capacity Planning
- **Resource Capacity**: Track capacity per bay/technician
- **Utilization Tracking**: Show utilization percentage
- **Conflict Detection**: Warn about overlapping bookings
- **Optimization Suggestions**: Suggest better scheduling

### Conflict Management
- **Overlap Detection**: Detect overlapping time slots
- **Double-booking Prevention**: Prevent same resource double-booking
- **Capacity Warnings**: Warn when capacity exceeded
- **Alternative Suggestions**: Suggest alternative times/resources

### Integration Points

#### Firestore Collections
- **`schedule/{eventId}`**: Schedule event documents
  - Fields: `type`, `jobId`, `customerId`, `vehicleId`, `resourceType` (bay/technician), `resourceId`, `startTime`, `endTime`, `duration`, `status`, `notes`, `createdAt`, `updatedAt`
- **`bays/{bayId}`**: Bay resource documents (if separate collection)
- **`technicians/{techId}`**: Technician resource documents (from users collection)

#### Cross-Module Integration
- **Jobs → Schedule**: Schedule job work in calendar
- **Schedule → Jobs**: Link scheduled events to jobs
- **Customers → Schedule**: Customer drop-off/pick-up slots
- **Vehicles → Schedule**: Vehicle-specific scheduling

### Related Pages
- **admin-jobs.html**: Source for job scheduling
- **admin-customers.html**: Customer drop-off/pick-up
- **admin-vehicles.html**: Vehicle-specific scheduling
- **admin-time.html**: Time tracking for scheduled work

## Implementation Notes
- Real-time conflict detection
- Drag-and-drop calendar interface (optional UI enhancement)
- Capacity planning algorithms
- Automated conflict resolution suggestions
- Calendar export (iCal format, optional)


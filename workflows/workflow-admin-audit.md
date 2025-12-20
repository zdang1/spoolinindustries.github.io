# Admin Audit Log Workflow

## Overview
Admin activity log with change history by entity, export audit trail, and suspicious activity flags.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-audit.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadAuditLogs[Load Audit Logs from<br/>Firestore: auditLogs/]
    
    LoadAuditLogs --> Query[Query audit logs with filters]
    Query --> RenderTable[Render Audit Logs Table]
    RenderTable --> DisplayLogs[Display Audit Logs with:<br/>- Timestamp<br/>- User<br/>- Action<br/>- Entity type<br/>- Entity ID<br/>- Changes<br/>- IP address]
    
    DisplayLogs --> UserAction{User Action}
    
    UserAction -->|View Details| ViewDetails[View Audit Log Details]
    UserAction -->|Filter Logs| FilterLogs[Filter Audit Logs]
    UserAction -->|Export Logs| ExportLogs[Export Audit Trail]
    UserAction -->|View Entity History| ViewEntityHistory[View Entity Change History]
    UserAction -->|Flag Suspicious| FlagSuspicious[Flag Suspicious Activity]
    
    ViewDetails --> SelectLog[Select Audit Log Entry]
    SelectLog --> LoadLogData[Load Full Log Data]
    LoadLogData --> DisplayDetails[Display Log Details:<br/>- Full change diff<br/>- Before/after values<br/>- User info<br/>- IP address<br/>- User agent]
    
    FilterLogs --> SelectFilters[Select Filters:<br/>- User<br/>- Action type<br/>- Entity type<br/>- Date range<br/>- IP address]
    SelectFilters --> ApplyFilters[Apply Filters to Query]
    ApplyFilters --> QueryFiltered[Query Filtered Logs]
    QueryFiltered --> RenderTable
    
    ViewEntityHistory --> SelectEntity[Select Entity Type & ID]
    SelectEntity --> LoadEntityHistory[Load All Changes for Entity]
    LoadEntityHistory --> DisplayHistory[Display Change History Timeline:<br/>- All changes<br/>- Chronological order<br/>- Change diffs]
    
    ExportLogs --> SelectExportFormat{Export<br/>Format?}
    SelectExportFormat -->|CSV| GenerateCSV[Generate CSV Export]
    SelectExportFormat -->|PDF| GeneratePDF[Generate PDF Export]
    SelectExportFormat -->|JSON| GenerateJSON[Generate JSON Export]
    
    GenerateCSV --> DownloadCSV[Download CSV]
    GeneratePDF --> DownloadPDF[Download PDF]
    GenerateJSON --> DownloadJSON[Download JSON]
    
    FlagSuspicious --> SelectLog2[Select Audit Log Entry]
    SelectLog2 --> EnterFlagReason[Enter Flag Reason]
    EnterFlagReason --> SaveFlag[Save Flag to<br/>Firestore: auditLogs/{logId}/flags/]
    SaveFlag --> NotifyAdmin[Notify Administrators]
    
    CheckSuspicious[Check for Suspicious Patterns] --> AnalyzePatterns[Analyze Activity Patterns:<br/>- Unusual access times<br/>- Bulk deletions<br/>- Unauthorized access attempts<br/>- Data export patterns]
    AnalyzePatterns --> FlagAuto[Auto-flag Suspicious Activity]
    FlagAuto --> NotifyAdmin
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadAuditLogs fill:#c8e6c9
    style ViewDetails fill:#fff9c4
    style ViewEntityHistory fill:#fff9c4
    style ExportLogs fill:#fff9c4
    style FlagSuspicious fill:#ffcdd2
    style CheckSuspicious fill:#ffcdd2
```

## Planned Features

### Audit Logging
- **Action Tracking**: Track all admin actions (create, update, delete)
- **Change History**: Track what changed (before/after values)
- **User Tracking**: Track which user performed action
- **Timestamp**: Track when action occurred
- **IP Address**: Track IP address of action
- **Entity Tracking**: Track entity type and ID

### Audit Log Features
- **Log Viewing**: View audit logs with filters
- **Log Details**: View full log details with change diffs
- **Entity History**: View all changes for specific entity
- **Export**: Export audit trail as CSV/PDF/JSON
- **Search**: Search audit logs

### Suspicious Activity
- **Manual Flagging**: Manually flag suspicious activity
- **Auto-flagging**: Auto-flag suspicious patterns
- **Pattern Detection**: Detect unusual activity patterns
- **Notifications**: Notify administrators of suspicious activity

### Integration Points

#### Firestore Collections
- **`auditLogs/{logId}`**: Audit log documents
  - Fields: `userId`, `action`, `entityType`, `entityId`, `changes`, `before`, `after`, `ipAddress`, `userAgent`, `timestamp`, `createdAt`
- **`auditLogs/{logId}/flags/{flagId}`**: Suspicious activity flags subcollection

#### Cross-Module Integration
- **All Modules → Audit Log**: All modules write to audit log
- **Audit Log → Users**: Track user activity
- **Audit Log → Security**: Security monitoring

### Related Pages
- **admin-users.html**: User activity in audit log
- **All Admin Pages**: Write to audit log on actions

## Implementation Notes
- Audit log writing on all CRUD operations
- Change diff calculation (before/after values)
- Suspicious activity pattern detection
- Audit log retention policy
- Export functionality
- Real-time audit log monitoring (optional)


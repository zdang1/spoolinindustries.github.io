# Admin Event Explorer Workflow

## Overview
View analytics events with filtering by event name/date/user, funnel exploration, and export functionality.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-events.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadEvents[Load Analytics Events]
    
    LoadEvents --> QueryEvents[Query Events from<br/>Analytics or Firestore]
    QueryEvents --> RenderTable[Render Events Table]
    RenderTable --> DisplayEvents[Display Events with:<br/>- Event name<br/>- Timestamp<br/>- User<br/>- Parameters<br/>- Value]
    
    DisplayEvents --> UserAction{User Action}
    
    UserAction -->|Filter Events| FilterEvents[Filter Events]
    UserAction -->|View Funnel| ViewFunnel[View Funnel Analysis]
    UserAction -->|Export Events| ExportEvents[Export Events]
    UserAction -->|View Event Details| ViewDetails[View Event Details]
    
    FilterEvents --> SelectFilters[Select Filters:<br/>- Event name<br/>- Date range<br/>- User<br/>- Parameters]
    SelectFilters --> ApplyFilters[Apply Filters to Query]
    ApplyFilters --> QueryFiltered[Query Filtered Events]
    QueryFiltered --> RenderTable
    
    ViewFunnel --> SelectFunnel[Select Funnel Type:<br/>- Lead to Quote<br/>- Quote to Job<br/>- Job to Invoice]
    SelectFunnel --> LoadFunnelData[Load Funnel Data]
    LoadFunnelData --> CalculateFunnel[Calculate Funnel Metrics:<br/>- Conversion rates<br/>- Drop-off points<br/>- Time between steps]
    CalculateFunnel --> RenderFunnel[Render Funnel Visualization]
    RenderFunnel --> DisplayFunnel[Display Funnel Chart]
    
    ViewDetails --> SelectEvent[Select Event]
    SelectEvent --> LoadEventData[Load Full Event Data]
    LoadEventData --> DisplayEventDetail[Display Event Details:<br/>- All parameters<br/>- User info<br/>- Context]
    
    ExportEvents --> SelectExportFormat{Export<br/>Format?}
    SelectExportFormat -->|CSV| GenerateCSV[Generate CSV Export]
    SelectExportFormat -->|JSON| GenerateJSON[Generate JSON Export]
    
    GenerateCSV --> DownloadCSV[Download CSV]
    GenerateJSON --> DownloadJSON[Download JSON]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadEvents fill:#c8e6c9
    style FilterEvents fill:#fff9c4
    style ViewFunnel fill:#fff9c4
    style ExportEvents fill:#fff9c4
```

## Planned Features

### Event Viewing
- **Event List**: View all analytics events
- **Event Filtering**: Filter by name, date, user, parameters
- **Event Details**: View full event data and context
- **Event Search**: Search events by parameters

### Funnel Exploration
- **Funnel Types**: Lead to Quote, Quote to Job, Job to Invoice
- **Conversion Rates**: Calculate conversion rates between steps
- **Drop-off Analysis**: Identify where users drop off
- **Time Analysis**: Time between funnel steps

### Export
- **CSV Export**: Export events as CSV
- **JSON Export**: Export events as JSON
- **Filtered Export**: Export filtered events only

### Integration Points

#### Analytics
- **Firebase Analytics**: Read events from Firebase Analytics
- **Custom Events**: Custom events stored in Firestore (optional)

#### Cross-Module Integration
- **All Modules → Events**: Events tracked from all modules
- **Events → Reports**: Event data for reporting

### Related Pages
- **admin-reports.html**: Use event data for reports
- **admin-dashboard.html**: Event summary on dashboard

## Implementation Notes
- Firebase Analytics integration (read events)
- Custom event storage in Firestore (optional)
- Funnel visualization (Chart.js, D3.js, etc.)
- Event filtering and search performance
- Export functionality


# Admin Reports Workflow

## Overview
Report generation for sales, job cycle time, margin reporting, and lead source performance.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-reports.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadReports[Load Available Reports]
    
    LoadReports --> DisplayReportTypes[Display Report Types:<br/>- Sales reports<br/>- Job cycle time<br/>- Margin reporting<br/>- Lead source performance]
    
    DisplayReportTypes --> UserAction{User Action}
    
    UserAction -->|Sales Report| GenerateSalesReport[Generate Sales Report]
    UserAction -->|Job Cycle Time| GenerateCycleTime[Generate Cycle Time Report]
    UserAction -->|Margin Report| GenerateMargin[Generate Margin Report]
    UserAction -->|Lead Source| GenerateLeadSource[Generate Lead Source Report]
    UserAction -->|Custom Report| CreateCustom[Create Custom Report]
    
    GenerateSalesReport --> SelectDateRange[Select Date Range]
    SelectDateRange --> SelectFilters[Select Filters:<br/>- Customer<br/>- Product<br/>- Category]
    SelectFilters --> QuerySales[Query Data from:<br/>- invoices/<br/>- quotes/<br/>- orders/]
    QuerySales --> CalculateSales[Calculate Sales Metrics:<br/>- Total sales<br/>- Sales by product<br/>- Sales by category<br/>- Sales trends]
    CalculateSales --> RenderChart[Render Charts & Tables]
    RenderChart --> DisplayReport[Display Sales Report]
    
    GenerateCycleTime --> SelectJobFilters[Select Job Filters:<br/>- Date range<br/>- Job type<br/>- Technician]
    SelectJobFilters --> QueryJobs[Query Jobs from<br/>jobs/ collection]
    QueryJobs --> CalculateCycleTime[Calculate Cycle Times:<br/>- Average cycle time<br/>- By stage<br/>- By job type<br/>- By technician]
    CalculateCycleTime --> RenderChart2[Render Charts & Tables]
    RenderChart2 --> DisplayReport2[Display Cycle Time Report]
    
    GenerateMargin --> SelectMarginFilters[Select Margin Filters:<br/>- Date range<br/>- Product<br/>- Job]
    SelectMarginFilters --> QueryMargin[Query Data from:<br/>- jobs/<br/>- invoices/<br/>- inventory/]
    QueryMargin --> CalculateMargin[Calculate Margins:<br/>- Gross margin<br/>- Net margin<br/>- By product<br/>- By job]
    CalculateMargin --> RenderChart3[Render Charts & Tables]
    RenderChart3 --> DisplayReport3[Display Margin Report]
    
    GenerateLeadSource --> SelectLeadFilters[Select Lead Filters:<br/>- Date range<br/>- Source type]
    SelectLeadFilters --> QueryLeads[Query Leads from<br/>leads/ collection]
    QueryLeads --> CalculateLeadMetrics[Calculate Lead Metrics:<br/>- Leads by source<br/>- Conversion rate<br/>- Revenue by source<br/>- Cost per lead]
    CalculateLeadMetrics --> RenderChart4[Render Charts & Tables]
    RenderChart4 --> DisplayReport4[Display Lead Source Report]
    
    CreateCustom --> SelectDataSources[Select Data Sources]
    SelectDataSources --> DefineMetrics[Define Metrics to Calculate]
    DefineMetrics --> SetFilters[Set Filters]
    SetFilters --> GenerateCustom[Generate Custom Report]
    GenerateCustom --> DisplayReport5[Display Custom Report]
    
    DisplayReport --> ExportReport[Export Report]
    DisplayReport2 --> ExportReport
    DisplayReport3 --> ExportReport
    DisplayReport4 --> ExportReport
    DisplayReport5 --> ExportReport
    
    ExportReport --> SelectFormat{Export<br/>Format?}
    SelectFormat -->|PDF| GeneratePDF[Generate PDF Report]
    SelectFormat -->|CSV| GenerateCSV[Generate CSV Report]
    SelectFormat -->|Excel| GenerateExcel[Generate Excel Report]
    
    GeneratePDF --> DownloadPDF[Download PDF]
    GenerateCSV --> DownloadCSV[Download CSV]
    GenerateExcel --> DownloadExcel[Download Excel]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadReports fill:#c8e6c9
    style GenerateSalesReport fill:#fff9c4
    style GenerateCycleTime fill:#fff9c4
    style GenerateMargin fill:#fff9c4
    style GenerateLeadSource fill:#fff9c4
    style ExportReport fill:#fff9c4
```

## Planned Features

### Report Types
- **Sales Reports**: Total sales, sales by product/category, sales trends
- **Job Cycle Time**: Average cycle time, by stage, by job type, by technician
- **Margin Reporting**: Gross margin, net margin, by product, by job
- **Lead Source Performance**: Leads by source, conversion rate, revenue by source

### Report Features
- **Date Range Selection**: Filter reports by date range
- **Custom Filters**: Filter by customer, product, category, etc.
- **Charts & Tables**: Visual and tabular data presentation
- **Export Options**: PDF, CSV, Excel export
- **Scheduled Reports**: Schedule automatic report generation (future)

### Integration Points

#### Firestore Collections
- **Reports use data from**: `invoices/`, `quotes/`, `orders/`, `jobs/`, `leads/`, `inventory/`

#### Cross-Module Integration
- **All Modules → Reports**: Reports aggregate data from all modules
- **Reports → Analytics**: Report data for analytics

### Related Pages
- **admin-dashboard.html**: Quick report links
- **admin-events.html**: Event data for reports

## Implementation Notes
- Report generation performance (consider caching for large datasets)
- Chart library integration (Chart.js, D3.js, etc.)
- Export functionality (PDF generation, CSV/Excel export)
- Scheduled reports (Cloud Functions, future enhancement)
- Custom report builder (future enhancement)


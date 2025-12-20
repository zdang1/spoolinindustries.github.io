# Admin Warranty / Aftercare Workflow

## Overview
Warranty claims tracking with root cause analysis, fix notes, cost/time impact, and customer outcomes.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-warranty.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadWarranties[Load Warranty Claims from<br/>Firestore: warranties/]
    
    LoadWarranties --> Query[Query warranties with filters]
    Query --> RenderTable[Render Warranty Claims Table]
    RenderTable --> DisplayWarranties[Display Warranty Claims with:<br/>- Claim number<br/>- Customer<br/>- Job<br/>- Status<br/>- Date<br/>- Cost impact]
    
    DisplayWarranties --> UserAction{User Action}
    
    UserAction -->|Create Claim| OpenCreateModal[Open Create Claim Modal]
    UserAction -->|Edit Claim| OpenEditModal[Open Edit Claim Modal]
    UserAction -->|View Claim| OpenDetailView[Open Claim Detail View]
    UserAction -->|Record Root Cause| RecordRootCause[Record Root Cause]
    UserAction -->|Record Fix| RecordFix[Record Fix Applied]
    UserAction -->|Update Status| UpdateStatus[Update Claim Status]
    UserAction -->|Filter/Search| FilterWarranties[Filter Warranty Claims]
    
    OpenCreateModal --> SelectSource{Claim<br/>Source?}
    SelectSource -->|From Job| SelectJob[Select Job from<br/>jobs/ collection]
    SelectSource -->|From QA Defect| SelectDefect[Select QA Defect from<br/>qaReports/ collection]
    SelectSource -->|Customer Report| CustomerReport[Customer Reported Issue]
    
    SelectJob --> LoadJobInfo[Load Job Info:<br/>- Customer<br/>- Vehicle<br/>- Work performed]
    SelectDefect --> LoadDefectInfo[Load Defect Info]
    CustomerReport --> EnterReport[Enter Customer Report Details]
    
    LoadJobInfo --> EnterClaimDetails[Enter Claim Details:<br/>- Issue description<br/>- Reported date<br/>- Customer impact]
    LoadDefectInfo --> EnterClaimDetails
    EnterReport --> EnterClaimDetails
    
    EnterClaimDetails --> SetWarrantyPeriod[Set Warranty Period:<br/>- Start date job completion<br/>- End date]
    SetWarrantyPeriod --> ValidateWarranty{Warranty<br/>Valid?}
    ValidateWarranty -->|No| ShowExpired[Show: Warranty Expired]
    ValidateWarranty -->|Yes| SetStatus[Set Status: open]
    SetStatus --> SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> EnterClaimDetails
    
    Validate -->|Yes| SaveClaim[Save Claim to<br/>Firestore: warranties/]
    SaveClaim --> GenerateNumber[Generate Claim Number]
    SaveClaim --> LinkJob[Link to Job]
    SaveClaim --> LinkCustomer[Link to Customer]
    SaveClaim --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveClaim --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> EnterClaimDetails
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadWarranties[Reload Warranty Claims]
    ReloadWarranties --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    RecordRootCause --> EnterRootCause[Enter Root Cause:<br/>- Cause description<br/>- Category<br/>- Contributing factors]
    EnterRootCause --> UploadEvidence[Upload Evidence Photos<br/>to Storage: warranties/{claimId}/rootCause/]
    UploadEvidence --> SaveRootCause[Save Root Cause to<br/>Firestore: warranties/{claimId}/rootCause]
    SaveRootCause --> UpdateStatus2[Update Status: investigating]
    UpdateStatus2 --> ReloadWarranties
    
    RecordFix --> EnterFix[Enter Fix Details:<br/>- Fix description<br/>- Parts used<br/>- Time spent]
    EnterFix --> LinkReworkJob[Link to Rework Job if applicable]
    LinkReworkJob --> CalculateCost[Calculate Cost Impact:<br/>- Parts cost<br/>- Labour cost<br/>- Total cost]
    CalculateCost --> CalculateTime[Calculate Time Impact:<br/>- Time spent<br/>- Time lost]
    CalculateTime --> SaveFix[Save Fix to<br/>Firestore: warranties/{claimId}/fix]
    SaveFix --> UpdateStatus3[Update Status: fixed]
    UpdateStatus3 --> RecordOutcome[Record Customer Outcome]
    
    RecordOutcome --> EnterOutcome[Enter Outcome:<br/>- Customer satisfaction<br/>- Resolution status<br/>- Follow-up needed]
    EnterOutcome --> SaveOutcome[Save Outcome to<br/>Firestore]
    SaveOutcome --> UpdateStatus4[Update Status: resolved]
    UpdateStatus4 --> ReloadWarranties
    
    UpdateStatus --> SelectNewStatus[Select New Status:<br/>- open<br/>- investigating<br/>- fixed<br/>- resolved<br/>- denied]
    SelectNewStatus --> SaveStatus[Save Status to<br/>Firestore]
    SaveStatus --> ReloadWarranties
    
    FilterWarranties --> ApplyFilters[Apply Filters:<br/>- Status<br/>- Customer<br/>- Job<br/>- Date range<br/>- Cost range]
    ApplyFilters --> RenderTable
    
    WarrantyAnalysis[Warranty Analysis] --> ShowMetrics[Show Metrics:<br/>- Total claims<br/>- Cost impact<br/>- Common root causes<br/>- Resolution time]
    ShowMetrics --> GenerateReport[Generate Warranty Report]
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadWarranties fill:#c8e6c9
    style SaveClaim fill:#c8e6c9
    style RecordRootCause fill:#fff9c4
    style RecordFix fill:#fff9c4
    style RecordOutcome fill:#fff9c4
    style WarrantyAnalysis fill:#fff9c4
```

## Planned Features

### Warranty Claim Management
- **Claim Number**: Auto-generated sequential number
- **Claim Source**: From job, QA defect, or customer report
- **Warranty Period**: Track warranty start/end dates
- **Status Tracking**: open, investigating, fixed, resolved, denied
- **Customer Impact**: Track impact on customer

### Root Cause Analysis
- **Root Cause Recording**: Document root cause of issue
- **Cause Categories**: Categorize root causes
- **Contributing Factors**: Identify contributing factors
- **Evidence**: Photo evidence of root cause
- **Analysis**: Use for quality improvement

### Fix Tracking
- **Fix Description**: Document fix applied
- **Parts Used**: Track parts used in fix
- **Time Spent**: Track time spent on fix
- **Cost Calculation**: Calculate total cost impact
- **Rework Job Linking**: Link to rework job if applicable

### Customer Outcomes
- **Resolution Status**: Track resolution status
- **Customer Satisfaction**: Record customer satisfaction
- **Follow-up**: Track follow-up requirements
- **Outcome Analysis**: Analyze warranty outcomes

### Integration Points

#### Firestore Collections
- **`warranties/{warrantyId}`**: Warranty claim documents
  - Fields: `claimNumber`, `jobId`, `customerId`, `vehicleId`, `status`, `issueDescription`, `reportedDate`, `warrantyStart`, `warrantyEnd`, `rootCause`, `fix`, `outcome`, `costImpact`, `timeImpact`, `createdAt`, `updatedAt`
- **`warranties/{warrantyId}/rootCause/{rootCauseId}`**: Root cause analysis subcollection
- **`warranties/{warrantyId}/fix/{fixId}`**: Fix records subcollection
- **`warranties/{warrantyId}/photos/{photoId}`**: Photo metadata subcollection

#### Storage Paths
- **Warranty Photos**: `warranties/{warrantyId}/photos/{filename}`
- **Root Cause Evidence**: `warranties/{warrantyId}/rootCause/{filename}`
- **Fix Evidence**: `warranties/{warrantyId}/fix/{filename}`

#### Cross-Module Integration
- **Jobs → Warranty**: Create warranty claim from job
- **QA → Warranty**: Create warranty claim from QA defect
- **Warranty → Jobs**: Link to rework job
- **Warranty → Time Tracking**: Track warranty fix time
- **Warranty → Inventory**: Track parts used in warranty fixes
- **Warranty → Reports**: Warranty analysis and reporting

### Related Pages
- **admin-jobs.html**: Source for job selection
- **admin-qa.html**: Source for QA defect selection
- **admin-customers.html**: Customer warranty history
- **admin-reports.html**: Warranty analysis reports

## Implementation Notes
- Warranty period validation (check if within warranty period)
- Automatic warranty claim creation from QA defects
- Cost and time impact calculation
- Root cause analysis for quality improvement
- Warranty trend analysis (future enhancement)


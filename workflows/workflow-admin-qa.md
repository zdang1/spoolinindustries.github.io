# Admin QA / Checklists Workflow

## Overview
Job checklists with sign-offs, photos, defects tracking, rework reasons, and final handover checklist.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-qa.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadQAChecks[Load QA Checklists from<br/>Firestore: qaReports/]
    
    LoadQAChecks --> Query[Query QA reports with filters]
    Query --> RenderTable[Render QA Reports Table]
    RenderTable --> DisplayReports[Display QA Reports with:<br/>- Job<br/>- Checklist type<br/>- Status<br/>- Completed by<br/>- Date]
    
    DisplayReports --> UserAction{User Action}
    
    UserAction -->|Create Checklist| OpenCreateModal[Open Create Checklist Modal]
    UserAction -->|Edit Checklist| OpenEditModal[Open Edit Checklist Modal]
    UserAction -->|View Checklist| OpenDetailView[Open Checklist Detail View]
    UserAction -->|Complete Item| CompleteItem[Mark Checklist Item Complete]
    UserAction -->|Add Defect| AddDefect[Add Defect Record]
    UserAction -->|Sign Off| SignOff[Sign Off Checklist]
    UserAction -->|Filter/Search| FilterReports[Filter QA Reports]
    
    OpenCreateModal --> SelectJob[Select Job from<br/>jobs/ collection]
    SelectJob --> SelectTemplate{Use<br/>Template?}
    SelectTemplate -->|Yes| SelectTemplateType[Select Template from<br/>templates/ collection]
    SelectTemplate -->|No| CreateCustom[Create Custom Checklist]
    
    SelectTemplateType --> LoadTemplate[Load Template Items]
    LoadTemplate --> CustomizeItems[Customize Items if needed]
    CreateCustom --> AddItems[Add Checklist Items:<br/>- Description<br/>- Required/Optional<br/>- Photo required]
    
    CustomizeItems --> AddItems
    AddItems --> MoreItems{More<br/>Items?}
    MoreItems -->|Yes| AddItems
    MoreItems -->|No| SubmitForm[User Submits Form]
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> AddItems
    
    Validate -->|Yes| SaveChecklist[Save Checklist to<br/>Firestore: qaReports/]
    SaveChecklist --> LinkJob[Link to Job]
    SaveChecklist --> SetStatus[Set Status: in-progress]
    SaveChecklist --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveChecklist --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> AddItems
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadReports[Reload QA Reports]
    ReloadReports --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    CompleteItem --> SelectItem[Select Checklist Item]
    SelectItem --> ItemAction{Item<br/>Action?}
    ItemAction -->|Photo Required| UploadPhoto[Upload Photo to<br/>Storage: qa/{qaId}/photos/]
    ItemAction -->|Just Check| MarkComplete[Mark Item Complete]
    
    UploadPhoto --> SavePhoto[Save Photo URL to<br/>Firestore item]
    SavePhoto --> MarkComplete
    
    MarkComplete --> UpdateItem[Update Item Status in<br/>Firestore]
    UpdateItem --> CheckAllComplete{All Items<br/>Complete?}
    CheckAllComplete -->|No| ReloadReports
    CheckAllComplete -->|Yes| ReadyForSignOff[Ready for Sign-off]
    
    AddDefect --> EnterDefect[Enter Defect Details:<br/>- Description<br/>- Severity<br/>- Location<br/>- Photo]
    EnterDefect --> UploadDefectPhoto[Upload Defect Photo to<br/>Storage: qa/{qaId}/defects/]
    UploadDefectPhoto --> SaveDefect[Save Defect to<br/>Firestore: qaReports/{qaId}/defects/]
    SaveDefect --> LinkRework[Link to Rework if needed]
    LinkRework --> UpdateJobStatus[Update Job Status:<br/>Needs rework]
    UpdateJobStatus --> ReloadReports
    
    SignOff --> SelectSigner[Select Sign-off Person]
    SelectSigner --> EnterSignature[Enter Digital Signature<br/>or confirmation]
    EnterSignature --> SaveSignOff[Save Sign-off to<br/>Firestore]
    SaveSignOff --> UpdateStatus[Update Checklist Status: complete]
    UpdateStatus --> CheckJobStage{Job<br/>Stage?}
    CheckJobStage -->|QA Stage| UpdateJobStage[Update Job Stage:<br/>Move to Complete]
    CheckJobStage -->|Other| CreateHandover[Create Handover Checklist]
    
    UpdateJobStage --> SaveJobStatus[Save Job Status to<br/>Firestore: jobs/]
    CreateHandover --> SaveHandover[Save Handover Checklist]
    SaveHandover --> ReloadReports
    
    FilterReports --> ApplyFilters[Apply Filters:<br/>- Job<br/>- Checklist type<br/>- Status<br/>- Date range]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadQAChecks fill:#c8e6c9
    style SaveChecklist fill:#c8e6c9
    style CompleteItem fill:#fff9c4
    style AddDefect fill:#ffcdd2
    style SignOff fill:#fff9c4
    style UpdateJobStage fill:#c8e6c9
```

## Planned Features

### Checklist Types
- **Job Checklists**: Standard job quality checks
- **QA Checklists**: Quality assurance specific checks
- **Handover Checklists**: Final customer handover checks
- **Template Checklists**: Reusable checklist templates

### Checklist Items
- **Item Description**: What needs to be checked
- **Required/Optional**: Mark items as required or optional
- **Photo Requirement**: Require photo evidence for items
- **Completion Status**: Track item completion
- **Sign-off**: Digital signature or confirmation

### Defect Tracking
- **Defect Recording**: Record defects found during QA
- **Defect Details**: Description, severity, location
- **Defect Photos**: Photo evidence of defects
- **Rework Linking**: Link defects to rework requirements
- **Defect Resolution**: Track defect resolution

### Sign-off Process
- **Sign-off Person**: Track who signed off
- **Sign-off Date**: When checklist was signed off
- **Digital Signature**: Optional digital signature
- **Job Stage Update**: Auto-update job stage when QA complete

### Integration Points

#### Firestore Collections
- **`qaReports/{qaId}`**: QA report documents
  - Fields: `jobId`, `checklistType`, `templateId`, `status`, `items[]`, `completedBy`, `signedOffBy`, `signedOffAt`, `createdAt`, `updatedAt`
- **`qaReports/{qaId}/defects/{defectId}`**: Defect records subcollection
- **`qaReports/{qaId}/photos/{photoId}`**: Photo metadata subcollection
- **`templates/{templateId}`**: Checklist templates (if separate collection)

#### Storage Paths
- **QA Photos**: `qa/{qaId}/photos/{filename}`
- **Defect Photos**: `qa/{qaId}/defects/{defectId}/{filename}`

#### Cross-Module Integration
- **Jobs → QA**: Create QA checklist when job moves to QA stage
- **QA → Jobs**: Update job stage when QA complete
- **QA → Time Tracking**: Link rework time to defects
- **QA → Warranty**: Link defects to warranty claims
- **Templates → QA**: Use templates for checklist creation

### Related Pages
- **admin-jobs.html**: Source for job selection
- **admin-templates.html**: Checklist templates
- **admin-warranty.html**: Link defects to warranty
- **admin-time.html**: Track rework time for defects

## Implementation Notes
- Automatic checklist creation when job moves to QA stage
- Photo upload and storage for checklist items
- Defect tracking and rework linking
- Digital signature support (optional)
- Checklist template system
- Final handover checklist workflow


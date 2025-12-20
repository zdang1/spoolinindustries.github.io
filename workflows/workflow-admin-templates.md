# Admin Templates Workflow

## Overview
Template management for quote templates, job checklist templates, email/SMS templates, and service packages.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-templates.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadTemplates[Load Templates from<br/>Firestore: templates/]
    
    LoadTemplates --> Query[Query templates with filters]
    Query --> RenderTable[Render Templates Table]
    RenderTable --> DisplayTemplates[Display Templates with:<br/>- Name<br/>- Type<br/>- Category<br/>- Status<br/>- Usage count]
    
    DisplayTemplates --> UserAction{User Action}
    
    UserAction -->|Add Template| OpenAddModal[Open Add Template Modal]
    UserAction -->|Edit Template| OpenEditModal[Open Edit Template Modal]
    UserAction -->|View Template| OpenDetailView[Open Template Detail View]
    UserAction -->|Use Template| UseTemplate[Use Template]
    UserAction -->|Delete Template| DeleteTemplate[Delete Template]
    UserAction -->|Filter/Search| FilterTemplates[Filter Templates List]
    
    OpenAddModal --> SelectType[Select Template Type:<br/>- Quote template<br/>- Job checklist<br/>- Email template<br/>- SMS template<br/>- Service package]
    SelectType --> FillForm[User Fills Form:<br/>- Template name<br/>- Description<br/>- Category]
    
    FillForm --> BuildTemplate{Build<br/>Template}
    BuildTemplate -->|Quote| BuildQuoteTemplate[Build Quote Template:<br/>- Line item structure<br/>- Default pricing<br/>- Terms & conditions]
    BuildTemplate -->|Checklist| BuildChecklistTemplate[Build Checklist Template:<br/>- Checklist items<br/>- Required items<br/>- Photo requirements]
    BuildTemplate -->|Email| BuildEmailTemplate[Build Email Template:<br/>- Subject<br/>- Body with variables<br/>- Attachments]
    BuildTemplate -->|SMS| BuildSMSTemplate[Build SMS Template:<br/>- Message with variables]
    BuildTemplate -->|Service Package| BuildPackageTemplate[Build Service Package:<br/>- Services included<br/>- Pricing<br/>- Duration]
    
    BuildQuoteTemplate --> SubmitForm[User Submits Form]
    BuildChecklistTemplate --> SubmitForm
    BuildEmailTemplate --> SubmitForm
    BuildSMSTemplate --> SubmitForm
    BuildPackageTemplate --> SubmitForm
    
    SubmitForm --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowValidationError[Show Validation Error]
    ShowValidationError --> FillForm
    
    Validate -->|Yes| SaveTemplate[Save Template to<br/>Firestore: templates/]
    SaveTemplate --> AddTimestamp[Add createdAt<br/>serverTimestamp]
    SaveTemplate --> SaveResult{Save<br/>Success?}
    
    SaveResult -->|No| ShowSaveError[Show Save Error]
    ShowSaveError --> FillForm
    
    SaveResult -->|Yes| ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadTemplates[Reload Templates List]
    ReloadTemplates --> CloseModal[Close Modal]
    CloseModal --> RenderTable
    
    UseTemplate --> SelectTemplate[Select Template]
    SelectTemplate --> SelectContext{Template<br/>Context?}
    SelectContext -->|Quote| CreateQuoteFromTemplate[Create Quote from Template<br/>Navigate to admin-quotes.html]
    SelectContext -->|Job| CreateJobFromTemplate[Create Job Checklist from Template<br/>Navigate to admin-jobs.html]
    SelectContext -->|Email| UseEmailTemplate[Use Email Template<br/>in email composer]
    SelectContext -->|SMS| UseSMSTemplate[Use SMS Template<br/>in SMS composer]
    SelectContext -->|Package| CreateServiceFromTemplate[Create Service from Package<br/>Navigate to admin-services.html]
    
    DeleteTemplate --> ConfirmDelete{Confirm<br/>Deletion?}
    ConfirmDelete -->|No| DisplayTemplates
    ConfirmDelete -->|Yes| DeleteFromFirestore[Delete from<br/>Firestore: templates/]
    DeleteFromFirestore --> ReloadTemplates
    
    FilterTemplates --> ApplyFilters[Apply Filters:<br/>- Type<br/>- Category<br/>- Status]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style LoadTemplates fill:#c8e6c9
    style SaveTemplate fill:#c8e6c9
    style UseTemplate fill:#fff9c4
    style BuildTemplate fill:#fff9c4
```

## Planned Features

### Template Types
- **Quote Templates**: Pre-configured quote structures
- **Job Checklist Templates**: Reusable job checklists
- **Email Templates**: Email message templates with variables
- **SMS Templates**: SMS message templates with variables
- **Service Packages**: Pre-configured service packages

### Template Management
- **Template Creation**: Create templates for each type
- **Template Editing**: Edit existing templates
- **Template Usage**: Use templates when creating quotes/jobs/etc.
- **Template Categories**: Organize templates by category
- **Usage Tracking**: Track template usage count

### Template Variables
- **Variable Support**: Support variables in templates (e.g., {{customerName}})
- **Variable Replacement**: Replace variables with actual values
- **Variable Types**: Customer, job, quote, date, etc.

### Integration Points

#### Firestore Collections
- **`templates/{templateId}`**: Template documents
  - Fields: `name`, `type`, `category`, `content`, `variables[]`, `status`, `usageCount`, `createdAt`, `updatedAt`

#### Cross-Module Integration
- **Templates → Quotes**: Use quote templates
- **Templates → Jobs**: Use checklist templates
- **Templates → QA**: Use QA checklist templates
- **Templates → Communications**: Use email/SMS templates
- **Templates → Services**: Use service package templates

### Related Pages
- **admin-quotes.html**: Use quote templates
- **admin-jobs.html**: Use checklist templates
- **admin-qa.html**: Use QA checklist templates
- **admin-services.html**: Use service package templates

## Implementation Notes
- Template variable system
- Template usage tracking
- Template preview functionality
- Template versioning (future enhancement)
- Template sharing (future enhancement)


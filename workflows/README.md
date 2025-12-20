# Admin Workflow Diagrams

This directory contains comprehensive workflow diagrams for all 27 admin pages in the Spoolin Industries admin panel. Each diagram shows data flow, user interactions, Firebase integration points, and relationships between modules.

## Overview

The admin panel is organized into the following sections:

- **Authentication**: Login and access control
- **Sales Pipeline**: Leads, Quotes, Invoices
- **Production**: Jobs, Schedule, Time Tracking, QA, Warranty
- **Customers**: Customers, Vehicles
- **Inventory & Purchasing**: Inventory, Products, Categories, Suppliers, Purchase Orders
- **Analytics**: Reports, Events, Health
- **Settings**: Users, Templates, Integrations, Audit

## Workflow Diagrams

### ✅ Fully Implemented (3 pages)

1. **[Admin Login](workflow-admin-login.md)** - Authentication workflow
2. **[Admin Dashboard](workflow-admin-dashboard.md)** - Main navigation hub
3. **[Admin Products](workflow-admin-products.md)** - Product CRUD with image uploads

### 🚧 Planned - Coming Soon (24 pages)

#### Sales Pipeline
4. **[Admin Leads](workflow-admin-leads.md)** - Lead capture and pipeline management
5. **[Admin Quotes](workflow-admin-quotes.md)** - Quote builder with line items
6. **[Admin Invoices](workflow-admin-invoices.md)** - Invoice generation and payment tracking

#### Production
7. **[Admin Jobs](workflow-admin-jobs.md)** - Job board by stage
8. **[Admin Schedule](workflow-admin-schedule.md)** - Calendar by bay/technician
9. **[Admin Time Tracking](workflow-admin-time.md)** - Time entries per job
10. **[Admin QA](workflow-admin-qa.md)** - Job checklists and QA reports
11. **[Admin Warranty](workflow-admin-warranty.md)** - Warranty claims tracking

#### Customers
12. **[Admin Customers](workflow-admin-customers.md)** - Customer management
13. **[Admin Vehicles](workflow-admin-vehicles.md)** - Vehicle profiles per customer

#### Inventory & Purchasing
14. **[Admin Inventory](workflow-admin-inventory.md)** - Stock tracking and reorder points
15. **[Admin Categories](workflow-admin-categories.md)** - Category management
16. **[Admin Suppliers](workflow-admin-suppliers.md)** - Supplier directory
17. **[Admin Purchase Orders](workflow-admin-purchase-orders.md)** - PO creation and tracking

#### Analytics
18. **[Admin Reports](workflow-admin-reports.md)** - Report generation
19. **[Admin Events](workflow-admin-events.md)** - Event exploration
20. **[Admin Health](workflow-admin-health.md)** - System health monitoring

#### Settings
21. **[Admin Users](workflow-admin-users.md)** - User and role management
22. **[Admin Templates](workflow-admin-templates.md)** - Template management
23. **[Admin Integrations](workflow-admin-integrations.md)** - Integration management
24. **[Admin Audit](workflow-admin-audit.md)** - Audit log viewing

#### Additional
25. **[Admin Orders](workflow-admin-orders.md)** - Order management (placeholder)
26. **[Admin Services](workflow-admin-services.md)** - Service management (placeholder)

## Diagram Format

Each workflow diagram includes:

1. **Mermaid Flowchart**: Visual representation of the workflow
2. **Status**: ✅ Implemented or 🚧 Planned
3. **Overview**: Description of the page/module
4. **Planned Features**: List of features (for planned pages)
5. **Integration Points**: 
   - Firestore collections used
   - Storage paths
   - Cross-module relationships
6. **Related Pages**: Links to related admin pages
7. **Implementation Notes**: Technical considerations

## Key Integration Points

### Data Flow Patterns

1. **Sales Pipeline**: Leads → Quotes → Jobs → Invoices
2. **Production**: Jobs → Schedule → Time Tracking → QA → Warranty
3. **Inventory**: Products → Inventory → Purchase Orders → Suppliers
4. **Customers**: Customers → Vehicles → Jobs/Quotes/Invoices

### Firebase Services

- **Firestore**: Primary database for all operational data
- **Firebase Storage**: File storage (images, attachments, PDFs)
- **Firebase Authentication**: User authentication and role-based access
- **Firebase Analytics**: Event tracking (GA4)
- **Firebase Performance Monitoring**: Performance tracking
- **Firebase Crash Reporting**: Error monitoring

### Common Collections

- `products/` - Product catalog
- `customers/` - Customer records
- `vehicles/` - Vehicle records
- `jobs/` - Job records
- `quotes/` - Quote records
- `invoices/` - Invoice records
- `leads/` - Lead records
- `inventory/` - Inventory items
- `suppliers/` - Supplier records
- `purchaseOrders/` - Purchase order records
- `schedule/` - Schedule events
- `timeEntries/` - Time tracking entries
- `qaReports/` - QA checklist reports
- `warranties/` - Warranty claims
- `auditLogs/` - Audit trail
- `users/` - User profiles
- `templates/` - Template definitions
- `integrations/` - Integration configurations

## Usage

To view a workflow diagram:

1. Open the corresponding `.md` file
2. The Mermaid diagram will render in any Markdown viewer that supports Mermaid (GitHub, VS Code with Mermaid extension, etc.)
3. For best viewing, use a Mermaid-compatible viewer or online Mermaid editor

## Notes

- **Implemented Pages**: Show actual current workflows based on existing code
- **Planned Pages**: Show planned workflows based on feature lists in "Coming Soon" pages
- **Status Icons**: 
  - ✅ = Fully implemented
  - 🚧 = Planned/Coming Soon

## Maintenance

When implementing new pages:

1. Update the workflow diagram to reflect actual implementation
2. Change status from 🚧 to ✅
3. Update integration points based on actual Firestore collections used
4. Document any deviations from the planned workflow

---

**Last Updated**: December 2024
**Total Pages**: 27
**Implemented**: 3
**Planned**: 24


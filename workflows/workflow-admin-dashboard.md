# Admin Dashboard Workflow

## Overview
Main entry point and navigation hub for the admin panel. Provides quick access to all admin sections.

## Status
✅ **Fully Implemented**

## Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-dashboard.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| LoadPage[Load Dashboard Page]
    
    LoadPage --> DisplayCards[Display Quick Access Cards]
    DisplayCards --> Card1[Products Card]
    DisplayCards --> Card2[Jobs Card]
    DisplayCards --> Card3[Customers Card]
    
    Card1 --> Link1[Link to<br/>admin-products.html]
    Card2 --> Link2[Link to<br/>admin-jobs.html]
    Card3 --> Link3[Link to<br/>admin-customers.html]
    
    LoadPage --> DisplayLinks[Display Quick Links Section]
    DisplayLinks --> Link4[Leads & Enquiries]
    DisplayLinks --> Link5[Quotes]
    DisplayLinks --> Link6[Invoices & Payments]
    DisplayLinks --> Link7[Schedule]
    DisplayLinks --> Link8[Reports]
    DisplayLinks --> Link9[Users & Roles]
    
    Link1 --> Nav1[User clicks link]
    Link2 --> Nav2[User clicks link]
    Link3 --> Nav3[User clicks link]
    Link4 --> Nav4[User clicks link]
    Link5 --> Nav5[User clicks link]
    Link6 --> Nav6[User clicks link]
    Link7 --> Nav7[User clicks link]
    Link8 --> Nav8[User clicks link]
    Link9 --> Nav9[User clicks link]
    
    Nav1 --> Page1[admin-products.html]
    Nav2 --> Page2[admin-jobs.html]
    Nav3 --> Page3[admin-customers.html]
    Nav4 --> Page4[admin-leads.html]
    Nav5 --> Page5[admin-quotes.html]
    Nav6 --> Page6[admin-invoices.html]
    Nav7 --> Page7[admin-schedule.html]
    Nav8 --> Page8[admin-reports.html]
    Nav9 --> Page9[admin-users.html]
    
    LoadPage --> SignOutBtn[Sign Out Button]
    SignOutBtn --> SignOutClick[User clicks Sign Out]
    SignOutClick --> Confirm{Confirm<br/>Sign Out?}
    Confirm -->|No| Stay[Stay on Dashboard]
    Confirm -->|Yes| SignOut[Call Firebase<br/>signOut]
    SignOut --> Redirect
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style DisplayCards fill:#c8e6c9
    style DisplayLinks fill:#c8e6c9
```

## Integration Points

### Firebase Services
- **Firebase Authentication**: `requireAuth()` check on page load
- **Firebase Auth**: Sign out functionality

### Navigation Structure
The dashboard provides access to all admin sections organized by category:

1. **Sales Pipeline**
   - Leads & Enquiries
   - Quotes
   - Invoices & Payments

2. **Production**
   - Jobs
   - Schedule
   - Time Tracking
   - QA / Checklists
   - Warranty / Aftercare

3. **Customers**
   - Customers
   - Vehicles

4. **Inventory & Purchasing**
   - Inventory
   - Products (Shop)
   - Categories
   - Suppliers
   - Purchase Orders

5. **Analytics**
   - Reports
   - Event Explorer
   - System Health

6. **Settings**
   - Users & Roles
   - Templates
   - Integrations
   - Audit Log

### Related Pages
- **admin-login.html**: Redirect destination if not authenticated
- All other admin pages: Accessible via navigation links

## Files
- `admin-dashboard.html`: Dashboard page with quick links and cards


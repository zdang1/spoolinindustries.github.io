# Admin Users & Roles Workflow

## Overview
Role-based access control with user management, invite/remove staff, permissions matrix, and activity per user.

## Status
🚧 **Planned - Coming Soon**

## Planned Workflow Diagram

```mermaid
flowchart TD
    Start([User navigates to<br/>admin-users.html]) --> AuthCheck[Check Authentication<br/>via requireAuth]
    AuthCheck --> AuthResult{Authenticated?}
    AuthResult -->|No| Redirect[Redirect to<br/>admin-login.html]
    AuthResult -->|Yes| CheckAdminRole{User is<br/>Admin?}
    CheckAdminRole -->|No| AccessDenied[Show: Access Denied]
    CheckAdminRole -->|Yes| LoadUsers[Load Users from<br/>Firestore: users/]
    
    LoadUsers --> Query[Query users with filters]
    Query --> RenderTable[Render Users Table]
    RenderTable --> DisplayUsers[Display Users with:<br/>- Name<br/>- Email<br/>- Role<br/>- Status<br/>- Last activity]
    
    DisplayUsers --> UserAction{User Action}
    
    UserAction -->|Invite User| OpenInviteModal[Open Invite User Modal]
    UserAction -->|Edit User| OpenEditModal[Open Edit User Modal]
    UserAction -->|Remove User| RemoveUser[Remove User]
    UserAction -->|View Activity| ViewActivity[View User Activity]
    UserAction -->|Set Role| SetRole[Set User Role]
    UserAction -->|View Permissions| ViewPermissions[View Permissions Matrix]
    UserAction -->|Filter/Search| FilterUsers[Filter Users List]
    
    OpenInviteModal --> EnterInvite[Enter Invite Details:<br/>- Email<br/>- Name<br/>- Role]
    EnterInvite --> SendInvite[Send Invitation Email<br/>with sign-up link]
    SendInvite --> CreateUserRecord[Create User Record in<br/>Firestore: users/]
    CreateUserRecord --> SetCustomClaims[Set Custom Claims in<br/>Firebase Auth]
    SetCustomClaims --> ShowSuccess[Show Success Message]
    ShowSuccess --> ReloadUsers[Reload Users List]
    
    OpenEditModal --> LoadUserData[Load User Data]
    LoadUserData --> EditUser[Edit User Details:<br/>- Name<br/>- Role<br/>- Status]
    EditUser --> SaveUser[Save User to<br/>Firestore]
    SaveUser --> UpdateClaims[Update Custom Claims]
    UpdateClaims --> ReloadUsers
    
    RemoveUser --> ConfirmRemove{Confirm<br/>Removal?}
    ConfirmRemove -->|No| DisplayUsers
    ConfirmRemove -->|Yes| DeleteUser[Delete User from<br/>Firebase Auth]
    DeleteUser --> DeleteUserRecord[Delete User Record from<br/>Firestore]
    DeleteUserRecord --> ReloadUsers
    
    SetRole --> SelectUser[Select User]
    SelectUser --> SelectRole[Select Role:<br/>- Admin<br/>- Manager<br/>- Tech<br/>- Sales]
    SelectRole --> UpdateRole[Update Role in<br/>Firestore & Custom Claims]
    UpdateRole --> ReloadUsers
    
    ViewActivity --> SelectUser2[Select User]
    SelectUser2 --> LoadActivity[Load User Activity from<br/>auditLogs/ collection]
    LoadActivity --> DisplayActivity[Display Activity Timeline:<br/>- Actions performed<br/>- Timestamps<br/>- Entities affected]
    
    ViewPermissions --> LoadPermissions[Load Permissions Matrix]
    LoadPermissions --> DisplayMatrix[Display Permissions Matrix:<br/>- Roles vs Permissions<br/>- Module access<br/>- Action permissions]
    
    FilterUsers --> ApplyFilters[Apply Filters:<br/>- Role<br/>- Status<br/>- Name]
    ApplyFilters --> RenderTable
    
    style Start fill:#e1f5ff
    style AuthCheck fill:#fff9c4
    style CheckAdminRole fill:#ffcdd2
    style LoadUsers fill:#c8e6c9
    style SendInvite fill:#fff9c4
    style SetRole fill:#fff9c4
    style ViewActivity fill:#fff9c4
```

## Planned Features

### User Management
- **User Invitation**: Invite users via email
- **User Creation**: Create user accounts
- **User Editing**: Edit user details and roles
- **User Removal**: Remove users from system
- **User Status**: Active, inactive, suspended

### Role Management
- **Roles**: Admin, Manager, Tech, Sales
- **Custom Claims**: Set Firebase Auth custom claims
- **Role Assignment**: Assign roles to users
- **Role Permissions**: Define permissions per role

### Permissions Matrix
- **Module Access**: Control access to admin modules
- **Action Permissions**: Control create/read/update/delete permissions
- **Permission Display**: Visual permissions matrix

### Activity Tracking
- **User Activity**: Track user actions
- **Activity Timeline**: View user activity history
- **Activity Filtering**: Filter by date, action, entity

### Integration Points

#### Firebase Services
- **Firebase Authentication**: User accounts and custom claims
- **Firestore**: User records and activity logs

#### Firestore Collections
- **`users/{userId}`**: User profile documents
  - Fields: `name`, `email`, `role`, `status`, `invitedAt`, `lastActivity`, `createdAt`, `updatedAt`
- **`auditLogs/{logId}`**: Activity logs (user activity)

#### Cross-Module Integration
- **All Modules → Users**: Role-based access control
- **Users → Audit Log**: Track user activity

### Related Pages
- **admin-audit.html**: User activity in audit log
- **All Admin Pages**: Role-based access enforcement

## Implementation Notes
- Firebase Auth custom claims for roles
- Email invitation system (Cloud Functions or third-party)
- Permission matrix definition and enforcement
- User activity tracking
- Role-based UI rendering (show/hide features based on role)


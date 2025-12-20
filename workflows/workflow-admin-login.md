# Admin Login Workflow

## Overview
Authentication workflow for admin panel access. This is the entry point for all admin operations.

## Status
✅ **Fully Implemented**

## Workflow Diagram

```mermaid
flowchart TD
    Start([User visits admin-login.html]) --> CheckAuth{Already<br/>Authenticated?}
    CheckAuth -->|Yes| Redirect[Redirect to<br/>admin-dashboard.html]
    CheckAuth -->|No| ShowForm[Display Login Form]
    
    ShowForm --> UserInput[User enters<br/>email & password]
    UserInput --> Validate{Form<br/>Valid?}
    Validate -->|No| ShowError[Show Error Message]
    ShowError --> UserInput
    
    Validate -->|Yes| SignIn[Call Firebase<br/>signInWithEmailAndPassword]
    SignIn --> AuthResult{Authentication<br/>Success?}
    
    AuthResult -->|No| HandleError[Handle Error Code]
    HandleError -->|user-not-found| Error1[Show: No account found]
    HandleError -->|wrong-password| Error2[Show: Incorrect password]
    HandleError -->|invalid-email| Error3[Show: Invalid email]
    HandleError -->|user-disabled| Error4[Show: Account disabled]
    HandleError -->|too-many-requests| Error5[Show: Too many attempts]
    HandleError -->|network-request-failed| Error6[Show: Network error]
    HandleError -->|Other| Error7[Show: Login failed]
    
    Error1 --> UserInput
    Error2 --> UserInput
    Error3 --> UserInput
    Error4 --> UserInput
    Error5 --> UserInput
    Error6 --> UserInput
    Error7 --> UserInput
    
    AuthResult -->|Yes| Success[Show Success Message]
    Success --> Redirect
    
    Redirect --> End([User on Dashboard])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style AuthResult fill:#fff9c4
    style CheckAuth fill:#fff9c4
```

## Integration Points

### Firebase Services
- **Firebase Authentication**: Email/password authentication
- **Firebase Config**: `admin/js/firebase-config.js`

### Data Flow
1. Page loads → Check existing auth state
2. If authenticated → Redirect to dashboard
3. If not → Show login form
4. On submit → Authenticate via Firebase Auth
5. On success → Redirect to dashboard
6. On error → Display user-friendly error message

### Related Pages
- **admin-dashboard.html**: Redirect destination after successful login
- **admin-login.html**: Self (login page)

### Security
- All admin pages require authentication via `requireAuth()` helper
- Failed login attempts are handled gracefully
- Network errors are caught and displayed

## Files
- `admin-login.html`: Login page UI and logic
- `admin/js/firebase-config.js`: Firebase initialization and auth helpers


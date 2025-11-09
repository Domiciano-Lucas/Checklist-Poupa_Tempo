# Checklist Poupa Tempo - AI Agent Instructions

## Project Overview
This is a web-based checklist application for Poupa Tempo, built with vanilla JavaScript and Firebase integration. The application supports two user roles: technicians and managers, with role-specific views and functionalities.

## Architecture Overview

### Core Components
- `AppCore`: Central state management and Firebase service initialization (`main.js`)
- `UIService`: Handles screen/view management and UI state (`main.js`)
- Frontend: Uses TailwindCSS for styling with custom CSS overrides

### Key Integration Points
- Firebase Services Used:
  - Authentication (`firebase-auth.js`)
  - Firestore (`firebase-firestore.js`)
  - Firebase App (`firebase-app.js`)

## Project Structure
```
/
├── js/
│   └── main.js       # Core application logic
├── css/
│   └── style.css     # Custom styles
└── index.html        # Main entry point
```

## Development Patterns

### State Management
- `AppCore.currentUser` tracks authentication state
- `AppCore.currentChecklistType` manages active checklist context
- UI state is managed through `UIService` screen/view toggles

### UI Conventions
- Use TailwindCSS classes for primary styling
- Custom CSS in `style.css` only for specific overrides or animations
- Screen visibility controlled via `UIService.showView()` method
- Dark mode support built into UI components

### Firebase Integration
- Firebase configuration is in `main.js`
- All Firebase operations should be wrapped in try-catch blocks
- Use `setLogLevel('debug')` during development for detailed Firebase logs

### CSS Patterns
- `.hidden-screen` class for inactive views
- `.conditional-field` for conditionally shown form elements
- Custom animations defined in `style.css` (e.g., spinner)

## Common Operations

### Screen Management
```javascript
// Show a specific screen
UIService.showView('login|tecnico|gestor');

// Toggle between technician views
UIService.showTecnicoView('selection|checklist');
```

### Firebase Operations
- Always handle potential Firebase errors with try-catch blocks
- Use `AppCore.db` for Firestore operations
- Check `AppCore.currentUser` before protected operations

## Need Help?
Key files to understand the codebase:
- `main.js`: Application core logic and Firebase integration
- `index.html`: UI structure and screen definitions
- `style.css`: Custom styling and animations
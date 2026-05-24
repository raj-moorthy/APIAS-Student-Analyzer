# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the React frontend for the Student Analyzer system.

## Project Structure

This is a modern React application built with Vite, React 18, and React Router.

Key directories:
- `frontend/src/` - Source code for the React application
- `frontend/src/components/` - Reusable UI components (Header, Sidebar, etc.)
- `frontend/src/pages/` - Page components for each route (Dashboard, Planner, etc.)
- `frontend/src/context/` - React context providers (AuthContext)
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/utils/` - Utility functions and helpers
- `frontend/src/assets/` - Static assets (images, icons, etc.)

## Development Commands

To work with this React frontend, use the following commands from the `frontend/` directory:

### Setup
```bash
# Install dependencies (run once)
npm install
```

### Development
```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Dependencies
- React 18.2.0
- React DOM 18.2.0
- React Router DOM 6.8.0
- Vite 4.0.0 (build tool)
- @vitejs/plugin-react (Vite plugin for React)

## Architecture Overview

### Application Structure
The application follows a standard React architecture with:

1. **Entry Point**: `src/main.jsx` - ReactDOM render call
2. **Root Component**: `src/App.jsx` - Main application component with routing
3. **Authentication**: `src/context/AuthContext.jsx` - Manages user auth state
4. **Routing**: Defined in App.jsx using React Router v6
5. **Components**: Reusable UI elements in src/components/
6. **Pages**: Route-specific components in src/pages/
7. **Styling**: Global styles in src/index.css

### State Management
- **Auth State**: Managed via React Context (AuthContext)
- **UI State**: Local component state using useState/useReducer hooks
- **Server State**: To be implemented with API calls to backend
- **Form State**: Controlled components with useState

### Routing
- Public routes: `/login`, `/register`
- Protected routes: All other routes require authentication
- Redirects: Unauthenticated users redirected to login
- Navigation: Uses useNavigate hook and Link components

### Component Hierarchy
```
App
├── AuthContext.Provider
├── BrowserRouter
├── Sidebar (always visible)
├── Main Content Area
│   ├── Header
│   ├── Routes
│   │   ├── Dashboard
│   │   ├── Planner
│   │   ├── Analytics
│   │   ├── Resources
│   │   ├── Goals
│   │   ├── Logs
│   │   ├── Profile
│   │   └── Settings
│   └── (404 page)
└── (end)
```

## API Integration
The frontend is designed to consume the Go backend API:

### Base URL
All API calls should be made to: `http://localhost:8080/api` (adjust for deployment)

### Authentication
- JWT tokens stored in localStorage
- AuthContext provides login/logout functions
- Protected routes check for authentication
- API calls should include Authorization header: `Bearer <token>`

### Example API Call
```javascript
// In a service or component
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:8080/api/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Endpoints Available
Based on the Go backend implementation:
- Auth: `/api/auth/*` (register, login, logout)
- User: `/api/profile`, `/api/password`
- Dashboard: `/api/dashboard/*` (stats, trend)
- Planner: `/api/planner/tasks/*`
- Analytics: `/api/analytics/*` (performance, risk)
- Resources: `/api/resources/*`
- Goals: `/api/goals/*`
- Logs: `/api/logs/*`
- Settings: `/api/settings/*`

## Code Conventions

### React Best Practices
- Functional components with hooks
- Arrow functions for event handlers
- Proper key props in lists
- Controlled components for forms
- Early returns for loading/error states
- Descriptive component and variable names
- Comments for complex logic

### File Organization
- Pages: One file per route in src/pages/
- Components: Reusable UI in src/components/
- Context: Shared state in src/context/
- Styles: Global CSS in src/index.css
- Assets: Images, icons in src/assets/

### Styling Approach
- CSS modules or styled-components could be added later
- Currently using global CSS with BEM-like naming
- Responsive design considerations
- Theme support via CSS variables (to be enhanced)

## Common Tasks

### 1. Adding a New Page/Feature
- Create component in src/pages/
- Add route in App.jsx
- Add navigation item in Sidebar/Header
- Implement API calls to backend
- Add any needed components/hooks

### 2. Modifying Authentication
- Update AuthContext.jsx for state changes
- Modify login/register pages for form changes
- Update API call logic in login/register
- Adjust protected route behavior if needed

### 3. Adding API Integration
- Create service files in src/services/ or src/utils/
- Use fetch or axios for HTTP requests
- Handle loading and error states
- Consider implementing custom hooks for data fetching

### 4. State Management Enhancements
- For complex state, consider useReducer or Zustand
- Implement caching for API responses
- Add optimistic updates where appropriate
- Consider React Query for server state management

### 5. Styling and Theming
- Enhance CSS with variables for theming
- Implement dark/light theme switching
- Add responsive breakpoints
- Consider CSS-in-JS solution for scoped styles

## Connecting to Backend
The frontend expects the Go backend to be running on `http://localhost:8080`:
1. Start backend: `cd backend && go run main.go`
2. Start frontend: `cd frontend && npm run dev`
3. Backend provides API at `http://localhost:8080/api`
4. Frontend consumes API and displays data

## Environment Variables
Create a `.env` file in frontend/ for configuration:
```
VITE_API_URL=http://localhost:8080/api
```

Then access in code: `import.meta.env.VITE_API_URL`

## Testing
Consider adding:
- Unit tests with Jest and React Testing Library
- E2E tests with Cypress or Playwright
- Component testing for isolated UI elements
- API mocking for development

## Production Build
```bash
npm run build
# Outputs to dist/
npm run preview
# Preview built version locally
```

The build output can be served by any static file server or integrated with the Go backend for serving.

Note: This React frontend replaces the original static HTML/CSS/JS implementation while maintaining the same visual design and functionality. It provides a modern foundation for enhancing the application with real-time updates, complex state management, and better developer experience.
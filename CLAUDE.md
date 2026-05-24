# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Structure

This is a full-stack application consisting of:
1. A React/Vite frontend in the `frontend/` directory
2. A Go-based microservice backend in the `backend/` directory

### Frontend (React Application)
Located in `frontend/src/`, this is a modern React application built with Vite, React 18, and React Router.

Key directories and files:
- `frontend/src/main.jsx` - Entry point with ReactDOM render
- `frontend/src/App.jsx` - Root component with routing and layout
- `frontend/src/components/` - Reusable UI components (Header, Sidebar, etc.)
- `frontend/src/pages/` - Page components for each route (Dashboard, Planner, etc.)
- `frontend/src/context/` - React context providers (AuthContext)
- `frontend/src/index.css` - Global stylesheet
- `frontend/vite.config.js` - Vite configuration

### Backend (Go Microservice)
Located in `backend/`, this is a Go-based microservice backend using MongoDB for data storage and JWT for authentication.

Key directories:
- `backend/config/` - Configuration management
- `backend/controllers/` - HTTP request handlers
- `backend/models/` - Data models and database connection
- `backend/middleware/` - HTTP middleware (authentication, etc.)
- `backend/routes/` - Route definitions and router setup
- `backend/auth/` - JWT authentication utilities

## Development Commands

### Frontend Development
To work with this React frontend, use the following commands from the `frontend/` directory:

#### Setup
```bash
# Install dependencies (run once)
npm install
```

#### Development
```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

#### Dependencies
- React 18.2.0
- React DOM 18.2.0
- React Router DOM 6.8.0
- Vite 4.0.0 (build tool)
- @vitejs/plugin-react (Vite plugin for React)

### Backend Development
To work with this Go backend, use the following commands from the `backend/` directory:

#### Setup
```bash
# Install dependencies (run once)
go mod tidy

# Create .env file (copy from example or create manually)
# Example .env contents:
# ENVIRONMENT=development
# MONGO_URI=mongodb://localhost:27017/student_analyzer
# SERVER_PORT=8080
# JWT_SECRET=your-super-secret-key-change-in-production
# TOKEN_EXPIRY_HOURS=24
```

#### Development
```bash
# Run the backend server
go run main.go
```

#### Testing
```bash
# Run tests
go test ./...

# Run tests with coverage
go test ./... -cover
```

#### Building
```bash
# Build for current platform
go build -o student-analyzer-backend main.go
```

## Architecture Overview

### Frontend Architecture
The frontend follows a standard React architecture:
- **`src/main.jsx`**: Entry point - ReactDOM render call
- **`src/App.jsx`**: Root component managing routing, layout, and authentication context
- **`src/context/AuthContext.jsx`**: Manages user authentication state via React Context
- **`src/components/`**: Reusable UI components (Header, Sidebar, buttons, etc.)
- **`src/pages/`**: Route-specific page components (Dashboard, Planner, Analytics, etc.)
- **Routing**: Defined in App.jsx using React Router v6
- **State Management**: 
  - Authentication state via React Context
  - UI state via useState/useReducer hooks
  - Server state handled through API calls to backend

### Backend Architecture (Multi-Agentic System)
The backend is designed with a multi-agentic architecture where different agents handle specific domains:

1. **Auth Agent**: Handles user authentication, registration, JWT token management
2. **Dashboard Agent**: Manages dashboard statistics and trend data
3. **Planner Agent**: Handles study planner functionality (tasks, schedules)
4. **Analytics Agent**: Processes performance and risk analytics
5. **Resources Agent**: Manages learning resources and materials
6. **Goals Agent**: Handles goal setting and tracking
7. **Logs Agent**: Manages study logs and learning activities
8. **Settings Agent**: Handles user preferences and settings

Each agent follows the MVC-like pattern:
- **Controllers**: Handle HTTP requests/responses
- **Models**: Define data structures and database interactions
- **Routes**: Define API endpoints

### Technology Stack
**Frontend:**
- Language: JavaScript/JSX (React 18)
- Build Tool: Vite 4.0.0
- Routing: React Router DOM 6.8.0
- Styling: CSS with plans for enhancement
- State Management: React Context + local state

**Backend:**
- Language: Go 1.26+
- Framework: Gorilla Mux for routing
- Database: MongoDB with official Go driver
- Authentication: JWT (golang-jwt/jwt/v4)
- Password Hashing: bcrypt
- Configuration: Environment variables with godotenv

### API Design
RESTful API with JSON request/response bodies:
- Base path: `/api`
- Auth endpoints: `/api/auth/*` (public)
- Protected endpoints require JWT in Authorization header: `Bearer <token>`
- Standard HTTP status codes used
- Error responses include message field

### Data Flow
1. Frontend makes API requests to backend endpoints
2. Backend validates JWT tokens via middleware
3. Controllers interact with MongoDB database via models
4. Business logic is executed (to be expanded in services layer)
5. Data is returned as JSON to frontend
6. Frontend updates UI based on API responses

## Code Conventions

### Frontend Conventions
- **React**: Functional components with hooks
- **JavaScript**: ES6+ features (`const`, `let`, arrow functions, template literals)
- **JSX**: Proper key props in lists, controlled components for forms
- **CSS**: 
  - Global stylesheet with considerations for BEM-like naming
  - Responsive design principles
  - Theme support planned via CSS variables or styled-components

### Backend Go Conventions
- Follow standard Go formatting (gofmt)
- Use meaningful variable and function names
- Error handling: Check and handle errors explicitly
- Context usage: Pass context.Context for cancellation and timeouts
- Dependency injection: Pass configurations and clients rather than using globals
- JSON struct tags: Use lowercase field names for JSON unless specified otherwise
- HTTP status codes: Use constants from net/http package

### File Organization
**Frontend:**
- Pages: One file per route in `src/pages/`
- Components: Reusable UI in `src/components/`
- Context: Shared state in `src/context/`
- Styles: Global CSS in `src/index.css`
- Assets: Images, icons in `src/assets/` (to be added)
- Utils: Helper functions in `src/utils/` (to be added)
- Hooks: Custom React hooks in `src/hooks/` (to be added)

**Backend:**
- Each major feature gets its own controller file (auth.go, user.go, dashboard.go, planner.go, analytics.go, etc.)
- Models shared across features are in models/
- Cross-cutting concerns (auth, middleware) in their respective packages
- Configuration loaded at startup and passed to components

## Common Tasks

### Frontend Tasks
1. **Adding a new page/feature**:
   - Create component in `src/pages/`
   - Add route definition in `App.jsx`
   - Add navigation item in `Sidebar`/`Header` components
   - Implement API calls to backend
   - Add any needed components/hooks

2. **Modifying authentication**:
   - Update `AuthContext.jsx` for state changes
   - Modify login/register pages (`src/pages/Login.jsx`, `src/pages/Register.jsx`) for form changes
   - Update API call logic for login/register
   - Adjust protected route behavior in `App.jsx` if needed

3. **Adding API integration**:
   - Create service files in `src/services/` or `src/utils/` for API calls
   - Use `fetch` or `axios` for HTTP requests
   - Handle loading and error states in components
   - Consider implementing custom hooks for data fetching (e.g., `useDashboardData`)

4. **State management enhancements**:
   - For complex state, consider `useReducer` or state management libraries (Zustand, Redux Toolkit)
   - Implement caching for API responses
   - Add optimistic updates where appropriate
   - Consider React Query for server state management

5. **Styling and theming**:
   - Enhance CSS with variables for theming (light/dark modes)
   - Implement dark/light theme switching
   - Add responsive breakpoints for mobile/tablet
   - Consider CSS-in-JS solution (styled-components, emotion) for scoped styles
   - Add animations and transitions for better UX

### Backend Tasks
1. **Adding new endpoint**:
   - Add handler function in appropriate controller file
   - Add route definition in `routes/router.go`
   - Implement any needed models or business logic
   - Add middleware if special permissions needed

2. **Modifying authentication**:
   - Update `auth/jwt.go` for token generation/validation changes
   - Update `middleware/auth.go` for auth logic changes
   - Update `controller/auth.go` for login/register logic changes

3. **Database operations**:
   - Use `models/database.go` for connection helpers
   - Access collections via `models.GetCollection()`
   - Use MongoDB Go driver methods for CRUD operations
   - Always handle context and check for `mongo.ErrNoDocuments`

4. **Adding new model/collection**:
   - Define struct in appropriate controller or models/
   - Include bson tags for MongoDB mapping
   - Add json tags for API serialization
   - Consider adding to models/ if shared across multiple controllers

5. **Environment Setup**:
   - For development: Install MongoDB locally, update .env with correct MONGO_URI, generate JWT_SECRET, run `go run main.go`
   - For production: Set ENVIRONMENT=production, use secure JWT_SECRET, consider reverse proxy for TLS termination

## Database Schema

### Users Collection (MongoDB)
```javascript
{
  _id: ObjectId,
  username: string (unique),
  email: string (unique),
  password: string (bcrypt hashed),
  firstName: string,
  lastName: string,
  role: string ("student"|"teacher"|"admin"),
  semester: int,
  major: string,
  createdAt: ISODate,
  updatedAt: ISODate,
  lastLogin: ISODate (optional),
  isActive: boolean,
  preferences: {
    theme: string ("light"|"dark"),
    notifications: boolean,
    emailUpdates: boolean,
    studyReminders: boolean,
    defaultView: string,
    language: string,
    timeZone: string
  }
}
```

Additional collections are created automatically as needed for features like study_tasks, goals, resources, etc.

## Connecting Frontend to Backend
The frontend is designed to consume the backend API:
- All API calls should be made to `http://localhost:8080/api` (adjust host/port as needed)
- Authentication tokens should be stored in localStorage or cookies
- The frontend's `AuthContext` handles token storage and user state
- Chart data and other dynamic content should be populated from backend analytics endpoints
- Environment variable `VITE_API_URL` can be used for configurable API base URL

## Running the Full Stack
To run the complete application:
1. Start MongoDB (local instance or MongoDB Atlas)
2. Update backend/.env with correct MONGO_URI if needed
3. Start backend: `cd backend && go run main.go` (runs on :8080)
4. Start frontend: `cd frontend && npm run dev` (runs on :3000 by default)
5. Access application at http://localhost:3000

Note: The React frontend replaces the original static HTML/CSS/JS implementation while maintaining the same visual design and functionality. It provides a modern foundation for enhancing the application with real-time updates, complex state management, and better developer experience.
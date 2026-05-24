# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Go backend for the Student Analyzer system.

## Project Structure

This is a Go-based microservice backend using MongoDB for data storage and JWT for authentication.

Key directories:
- `backend/` - Root of the Go backend application
- `backend/config/` - Configuration management
- `backend/controllers/` - HTTP request handlers
- `backend/models/` - Data models and database connection
- `backend/middleware/` - HTTP middleware (authentication, etc.)
- `backend/routes/` - Route definitions and router setup
- `backend/auth/` - JWT authentication utilities
- `backend/services/` - Business logic layer (to be expanded)
- `backend/utils/` - Utility functions

## Development Commands

To work with this Go backend, use the following commands from the `backend/` directory:

### Setup
```bash
# Install dependencies (run once)
go mod tidy

# Create .env file from template (if not exists)
cp .env.example .env   # or manually create based on requirements
```

### Development
```bash
# Run the backend server
go run main.go

# Run with hot reload (using air or similar tool)
# air   # if installed
```

### Testing
```bash
# Run tests
go test ./...

# Run tests with coverage
go test ./... -cover
```

### Building
```bash
# Build for current platform
go build -o student-analyzer-backend main.go

# Build for specific platform (example: Linux)
GOOS=linux GOARCH=amd64 go build -o student-analyzer-backend-linux main.go
```

## Architecture Overview

### Multi-Agentic System Design
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
- **Services**: Contain business logic (to be implemented)
- **Routes**: Define API endpoints

### Technology Stack
- **Language**: Go 1.26+
- **Framework**: Gorilla Mux for routing
- **Database**: MongoDB with official Go driver
- **Authentication**: JWT (golang-jwt/jwt/v4)
- **Password Hashing**: bcrypt
- **Configuration**: Environment variables with godotenv
- **Middleware**: Custom authentication middleware

### API Design
RESTful API with JSON request/response bodies:
- Base path: `/api`
- Auth endpoints: `/api/auth/*`
- Protected endpoints require JWT in Authorization header: `Bearer <token>`
- Standard HTTP status codes used
- Error responses include message field

### Data Models
Primary model: `User` (in `models/user.go`)
- Contains profile information, preferences, and metadata
- Passwords are bcrypt hashed and never returned in API responses
- Preferences store UI/theme settings, notification configs, etc.
- Timestamps track creation, updates, and last login

Additional models for domain-specific entities (StudyTask, Goal, Resource, etc.) are defined in their respective controllers.

## Code Conventions

### Go Best Practices
- Follow standard Go formatting (gofmt)
- Use meaningful variable and function names
- Error handling: Check and handle errors explicitly
- Context usage: Pass context.Context for cancellation and timeouts
- Dependency injection: Pass configurations and clients rather than using globals
- JSON struct tags: Use lowercase field names for JSON unless specified otherwise
- HTTP status codes: Use constants from net/http package

### File Organization
- Each major feature gets its own controller file
- Models shared across features are in models/
- Cross-cutting concerns (auth, middleware) in their respective packages
- Configuration loaded at startup and passed to components

### Environment Variables
Required environment variables (in .env file):
- `ENVIRONMENT`: development, staging, production
- `MONGO_URI`: MongoDB connection string
- `SERVER_PORT`: Port to run the server on (default: 8080)
- `JWT_SECRET`: Secret key for signing JWT tokens
- `TOKEN_EXPIRY_HOURS`: Hours until JWT token expires (default: 24)

## Common Tasks

When working with this codebase:
1. **Adding new endpoint**:
   - Add handler function in appropriate controller file
   - Add route definition in routes/router.go
   - Implement any needed models or business logic
   - Add middleware if special permissions needed

2. **Modifying authentication**:
   - Update auth/jwt.go for token generation/validation changes
   - Update middleware/auth.go for auth logic changes
   - Update controller/auth.go for login/register logic changes

3. **Database operations**:
   - Use models/database.go for connection helpers
   - Access collections via models.GetCollection()
   - Use MongoDB Go driver methods for CRUD operations
   - Always handle context and check for mongo.ErrNoDocuments

4. **Adding new model/collection**:
   - Define struct in appropriate controller or models/
   - Include bson tags for MongoDB mapping
   - Add json tags for API serialization
   - Consider adding to models/ if shared across multiple controllers

5. **Testing**:
   - Write table-driven tests for controller functions
   - Mock dependencies where appropriate (database, external services)
   - Test both success and error cases
   - Use httptest package for HTTP handler testing

6. **Configuration changes**:
   - Update config/config.go for new configuration values
   - Add to .env.example and .env files
   - Pass config to components that need it

7. **Security considerations**:
   - Never log sensitive information (passwords, tokens)
   - Validate and sanitize all inputs
   - Use proper HTTP status codes for security responses
   - Consider rate limiting for auth endpoints
   - Implement proper CORS policies if needed

## Database Schema

### Users Collection
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

## Environment Setup

For development:
1. Install MongoDB locally or use MongoDB Atlas
2. Update .env with correct MONGO_URI
3. Generate a strong JWT_SECRET for development
4. Run: `go run main.go`

For production:
1. Set ENVIRONMENT=production
2. Use secure, strong JWT_SECRET
3. Consider using a reverse proxy (NGINX) for TLS termination
4. Set appropriate resource limits
5. Use MongoDB Atlas or secured MongoDB instance

Note: This backend is designed to work with the existing React frontend in the `frontend/` directory. The frontend expects API endpoints under `/api` and handles JWT token storage/management automatically.
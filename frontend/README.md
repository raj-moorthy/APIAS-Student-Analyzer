# APAIS - AI Personal Academic Intelligence System Frontend

This is the React frontend for the Student Analyzer system, built with Vite, React 18, and React Router.

## Overview

A modern React application that provides an interface for the AI Personal Academic Intelligence System. Features include:

- Dashboard with academic performance metrics
- Study planner for task management
- Analytics for performance tracking
- Resource library
- Goal setting and tracking
- Study logs
- User profile management
- Settings and preferences
- Authentication system

## Technology Stack

- **React 18** - UI library
- **Vite 4** - Build tool and development server
- **React Router 6** - Client-side routing
- **React Context** - State management (authentication)
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
├── main.jsx          # Entry point
├── App.jsx           # Root component with routing
├── components/       # Reusable UI components
│   ├── Header.jsx
│   └── Sidebar.jsx
├── pages/            # Page components
│   ├── Dashboard.jsx
│   ├── Planner.jsx
│   ├── Analytics.jsx
│   ├── Resources.jsx
│   ├── Goals.jsx
│   ├── Logs.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── context/          # React context providers
│   └── AuthContext.jsx
├── index.css         # Global stylesheet
└── vite.config.js    # Vite configuration
```

## API Integration

This frontend is designed to work with the Go backend API running on `http://localhost:8080/api`.

### Authentication

- JWT tokens are stored in localStorage
- Login/register pages handle authentication
- Protected routes redirect unauthenticated users to login
- API calls should include Authorization header: `Bearer <token>`

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:8080/api
```

Access in code: `import.meta.env.VITE_API_URL`

## Available Features

### Authentication
- Login page with email/password validation
- Registration page with form validation
- JWT token storage and management
- Protected route handling

### Dashboard
- Welcome message with username
- Statistics cards (study hours, completion rate, etc.)
- Charts placeholder for performance trends

### Study Planner
- Task creation form (title, subject, priority, due date, estimated hours)
- Task listing with filtering capabilities
- Task status tracking (pending, in-progress, completed)

### Analytics
- Performance metrics display
- Subject-wise performance breakdown
- Charts for visualizing trends

### Resources
- Browse learning materials
- Search functionality
- Resource categorization

### Goals
- Goal setting with target dates
- Progress tracking
- Categorization of goals

### Study Logs
- Log study sessions
- Duration tracking
- Date-based logging

### Profile
- View and edit profile information
- Display user details and preferences

### Settings
- Theme selection (light/dark)
- Notification preferences
- Language and timezone settings
- Default view selection

## Development Guidelines

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `Sidebar` or `Header`
4. Implement any needed API integration

### State Management
- Authentication state managed via `AuthContext`
- Local component state using `useState`/`useReducer`
- Consider custom hooks for data fetching
- For complex state, evaluate state management libraries

### Styling
- Global styles in `src/index.css`
- Consider CSS modules or styled-components for scoped styles
- Responsive design principles
- Theme support via CSS variables

### API Calls
- Create service files in `src/services/` or `src/utils/`
- Use `fetch` or `axios` for HTTP requests
- Handle loading and error states
- Implement custom hooks for reusable data logic

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API requests | `http://localhost:8080/api` |

## Building for Production

```bash
npm run build
# Outputs to dist/
```

The built assets can be served by any static file host or integrated with the Go backend.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design

## License

This project is part of the Student Analyzer system.
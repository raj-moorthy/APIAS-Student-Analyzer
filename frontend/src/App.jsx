import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import Analytics from './pages/Analytics';
import Resources from './pages/Resources';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Careers from './pages/Careers';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

/* Page Transition Wrapper */
const AnimatedPage = ({ children }) => {
  const ref = useRef(null);
  const location = useLocation();
  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove('page-enter');
      void ref.current.offsetWidth; // reflow
      ref.current.classList.add('page-enter');
    }
  }, [location.pathname]);
  return <div ref={ref} className="page-transition-wrapper page-enter">{children}</div>;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="page-loader premium-loader">
        <div className="loader-ring" />
        <span>Loading APAIS...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Only Route Wrapper (e.g. don't show login if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="page-loader premium-loader">
        <div className="loader-ring" />
        <span>Loading APAIS...</span>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`app ${user ? 'authenticated' : 'public'}`}>
      {!isLandingPage && <Sidebar />}
      <div className="main-content">
        {!isLandingPage && <Header />}
        <main className={isLandingPage ? "" : "page-content"}>
          <AnimatedPage>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route path="/careers" element={<Careers />} />

              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/planner" 
                element={
                  <ProtectedRoute>
                    <Planner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resources" 
                element={
                  <ProtectedRoute>
                    <Resources />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/goals" 
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all for 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatedPage>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
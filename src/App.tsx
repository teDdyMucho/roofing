import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Component imports
import Login from './components/Login';
import Register from './components/Register';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import UserSettings from './components/UserSettings';

// Context imports
import { AuthProvider, useAuth } from './contexts/AuthContext';

/**
 * Protected route component - ensures user is authenticated before allowing access
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  return isAuthenticated ? 
    element : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

/**
 * AppContent component with optimized routing logic
 * Handles all routes and their access control
 */
const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Only render the Landing component on the home route for non-authenticated users
  const renderLanding = location.pathname === '/' && !isAuthenticated;
  
  return (
    <Routes>
      {/* Public routes - redirect to dashboard if already authenticated */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute element={<Dashboard />} />} 
      />
      <Route 
        path="/user-settings" 
        element={<ProtectedRoute element={<UserSettings />} />} 
      />
      
      {/* Landing page - show landing for guests, dashboard for authenticated users */}
      <Route 
        path="/" 
        element={renderLanding ? <Landing /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Catch all - redirect to home */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

/**
 * Main App component
 * Sets up the authentication provider and router
 */
function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;

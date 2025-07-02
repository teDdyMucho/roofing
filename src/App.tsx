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
 */
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Redirect to login if not authenticated, otherwise render the element
  return isAuthenticated ? element : <Navigate to="/login" state={{ from: location }} replace />;
};

// AppContent component with optimized routing logic
const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Only render the Landing component on the home route for non-authenticated users
  const renderLanding = location.pathname === '/' && !isAuthenticated;
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/user-settings" element={<ProtectedRoute element={<UserSettings />} />} />
      <Route path="/" element={renderLanding ? <Landing /> : <Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

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

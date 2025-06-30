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
 * Protected route component - modified to always allow access while keeping auth functionality
 */
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Always allow access to the protected route
  return element;
};

// AppContent component to prevent rendering Landing and Dashboard simultaneously
const AppContent = () => {
  const location = useLocation();
  
  // Only render the Landing component on the home route
  const renderLanding = location.pathname === '/';
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/user-settings" element={<ProtectedRoute element={<UserSettings />} />} />
      <Route path="/" element={renderLanding ? <Landing /> : <Navigate to="/dashboard" />} />
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

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import './App.css';


// Component imports
import Login from './components/Login';
import Register from './components/Register';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import UserSettings from './components/UserSettings';
import UserRoleSelection from './components/UserRoleSelection';
import FlashCoHome from './components/FlashCo/FlashCoHome';
import ProductList from './components/FlashCo/ProductList/ProductList';
import ProductGrid from './components/FlashCo/ProductGrid/ProductGrid';
import ProductDetail from './components/FlashCo/ProductDetail';
import CategoryPage from './components/FlashCo/CategoryPage';
import CalendarPage from './components/Calendar/CalendarPage';

// Context imports
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { sampleProducts } from './data/products';

/**
 * Protected route component - ensures user is authenticated before allowing access
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  
  // Strict authentication check: must have both isAuthenticated flag AND a currentUser object
  const isFullyAuthenticated = isAuthenticated && currentUser !== null;
  
  // If not authenticated, redirect to login with current location for redirect after login
  if (!isFullyAuthenticated) {
    console.log('Access denied: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, allow access to the protected route
  return element;
};

/**
 * AppContent component with optimized routing logic
 * Handles all routes and their access control
 */
const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Initial role selection screen - redirect to dashboard if already authenticated */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <UserRoleSelection />} 
      />
      
      {/* Employee landing page */}
      <Route 
        path="/landing" 
        element={<Landing />} 
      />
      
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
      <Route 
        path="/calendar" 
        element={<ProtectedRoute element={<CalendarPage />} />} 
      />

      {/* FlashCo routes - could also be protected if needed */}
      <Route path="/SouthlandRoofing" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <FlashCoHome />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/products" element={<ProductList products={sampleProducts} />} />
      <Route path="/product-grid" element={<ProductGrid products={sampleProducts} />} />
      
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

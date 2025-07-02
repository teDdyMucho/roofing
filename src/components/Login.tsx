/**
 * Login Component
 * Handles user authentication and login process
 */
import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaHome, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

/**
 * Interface for login form data
 */
interface LoginFormData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Whether to remember the user's login */
  rememberMe: boolean;
}

/**
 * Login component for user authentication
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Form state
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle form input changes
   */
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  /**
   * Effect to handle redirection when authenticated
   * Redirects to dashboard when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles the login form submission
   * Attempts to authenticate the user and manages redirection on success
   * @param e - Form event
   */
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset state
    setError('');
    setSuccessMessage('');
    
    // Validate form inputs
    if (!loginData.email || !loginData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the login function from AuthContext
      const success = await login(loginData.email, loginData.password);
      
      if (success) {
        // Show success message
        setSuccessMessage('Login successful! Redirecting...');
        // The useEffect will handle the actual redirection when isAuthenticated changes
      } else {
        // Handle failed login
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (err) {
      // Handle exceptions
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Navigate to the registration page
   */
  const redirectToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="company-info">
        <div className="logo">
          <FaHome className="logo-icon" />
          <h1>Southland Roofing</h1>
        </div>
        <p className="tagline">Professional Roofing Management System</p>
        <div className="company-image"></div>
      </div>
      
      <div className="login-form">
        <h2>Sign In</h2>
        {successMessage && <div className="success-message">{successMessage}</div>}
        <form onSubmit={handleLoginSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
          </div>
          
          <div className="form-footer">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleLoginChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="register-prompt">
          <p>Don't have an account? <button onClick={redirectToRegister} className="text-button">Register now</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

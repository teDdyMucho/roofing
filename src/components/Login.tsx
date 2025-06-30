import React, { useState } from 'react';
import { FaUser, FaLock, FaHome, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [signupData, setSignupData] = useState<SignupFormData>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value
    });
  };

  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.email || !loginData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await login(loginData.email, loginData.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate form
    if (!signupData.email || !signupData.username || !signupData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await signup(
        signupData.email, 
        signupData.password, 
        signupData.username, 
        signupData.firstName, 
        signupData.lastName
      );
      
      if (success) {
        setSuccessMessage('Account created successfully! You can now sign in.');
        setIsSignup(false);
        // Reset form
        setSignupData({
          email: '',
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccessMessage('');
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
        {!isSignup ? (
          // Login Form
          <>
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
              <p>Don't have an account? <button onClick={toggleForm} className="text-button">Register now</button></p>
            </div>
          </>
        ) : (
          // Signup Form
          <>
            <h2>Create Account</h2>
            <form onSubmit={handleSignupSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="input-group">
                <label htmlFor="signup-email">Email</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="signup-username">Username</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="signup-username"
                    name="username"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="signup-firstName">First Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="signup-firstName"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="signup-lastName">Last Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="signup-lastName"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="signup-password">Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="signup-password"
                    name="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="signup-confirm-password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="register-prompt">
              <p>Already have an account? <button onClick={toggleForm} className="text-button">Sign in</button></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

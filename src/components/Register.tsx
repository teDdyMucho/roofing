import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaImage, FaUserTag, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Register.css';

interface RegisterFormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    role: 'User', // Default role
    avatar_url: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing again
    if (errors[name as keyof RegisterFormData]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistrationError(null);
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        console.log('Form data validated successfully:', { 
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          avatar_url: formData.avatar_url
        });
        
        // Call the signup function from AuthContext
        const success = await signup(
          formData.email,
          formData.password,
          formData.username,
          formData.first_name,
          formData.last_name,
          formData.role
          // Note: avatar_url is set as an empty string by default in the AuthContext
        );
        
        if (success) {
          console.log('Registration successful, redirecting to login');
          // Redirect to login page on successful registration
          navigate('/login');
        } else {
          console.error('Registration failed: signup function returned false');
          setRegistrationError('Registration failed. Please check the console for more details.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          setRegistrationError(`Registration error: ${error.message}`);
        } else {
          setRegistrationError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('Form validation failed');
    }
  };

  return (
    <div className="register-container">
      <div className="company-info">
        <div className="logo">
          <FaHome className="logo-icon" />
          <h1>Southland Roofing</h1>
        </div>
        <p className="tagline">Professional Roofing Management System</p>
        <div className="company-image"></div>
      </div>
      
      <div className="register-form">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="first_name">First Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            {errors.first_name && <span className="error-message">{errors.first_name}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="last_name">Last Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            {errors.last_name && <span className="error-message">{errors.last_name}</span>}
          </div>
          
          {/* Role is set to 'User' by default */}
          
          <div className="input-group">
            <label htmlFor="avatar_url">Avatar URL (Optional)</label>
            <div className="input-with-icon">
              <FaImage className="input-icon" />
              <input
                type="text"
                id="avatar_url"
                name="avatar_url"
                placeholder="Enter avatar URL"
                value={formData.avatar_url}
                onChange={handleChange}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
          
          <button 
            type="submit" 
            className="register-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
          
          {registrationError && (
            <div className="error-message registration-error">
              {registrationError}
            </div>
          )}
        </form>
        
        <div className="register-footer">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

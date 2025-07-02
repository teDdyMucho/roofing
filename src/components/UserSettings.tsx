import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaSave, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UserSettings.css';

interface UserData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    username: currentUser?.username || '',
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('profile');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};
    let isValid = true;

    // Validate username
    if (!userData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    
    // Validate first name
    if (!userData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    
    // Validate last name
    if (!userData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Only validate password fields if the user is trying to change password
    if (userData.currentPassword || userData.newPassword || userData.confirmPassword) {
      // Validate current password
      if (!userData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
        isValid = false;
      }

      // Validate new password
      if (!userData.newPassword) {
        newErrors.newPassword = 'New password is required';
        isValid = false;
      } else if (userData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
        isValid = false;
      }

      // Validate confirm password
      if (!userData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
        isValid = false;
      } else if (userData.newPassword !== userData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, you would send this data to your backend API
      console.log('Saving user data:', userData);
      
      // Show success message
      setSuccessMessage('Your settings have been updated successfully!');
      
      // Clear password fields
      setUserData({
        ...userData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    try {
      console.log('UserSettings: Initiating logout');
      // Start the logout process but don't wait for it
      logout().then(() => {
        console.log('UserSettings: Logout successful, navigating to landing page');
        // Navigate to landing page after logout completes
        navigate('/', { replace: true });
      }).catch(error => {
        console.error('UserSettings: Logout failed, still navigating to landing page', error);
        // Even if logout fails, still navigate to landing page
        navigate('/', { replace: true });
      });
    } catch (error) {
      console.error('UserSettings: Error in handleLogout', error);
      // If anything goes wrong, still try to navigate away
      navigate('/', { replace: true });
    }
  };

  // Update user data if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserData(prevData => ({
        ...prevData,
        username: currentUser.username,
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  return (
    <div className="settings-container">
      <aside className="settings-sidebar">
        <div className="sidebar-header">
          <FaHome className="logo-icon" />
          <h2>RoofMaster Pro</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> <span>Profile Settings</span>
            </li>
            <li 
              className={activeTab === 'security' ? 'active' : ''} 
              onClick={() => setActiveTab('security')}
            >
              <FaLock /> <span>Security</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="back-btn" onClick={handleBackToDashboard}>
            <FaArrowLeft /> <span>Back to Dashboard</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="settings-content">
        <header className="settings-header">
          <h1>User Settings</h1>
          <button className="back-btn-mobile" onClick={handleBackToDashboard}>
            <FaArrowLeft /> <span>Back</span>
          </button>
        </header>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="settings-form-container">
          <form onSubmit={handleSubmit}>
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2>Profile Information</h2>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={userData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                    />
                  </div>
                  {errors.username && <p className="error-message">{errors.username}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.firstName && <p className="error-message">{errors.firstName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.lastName && <p className="error-message">{errors.lastName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                <button type="submit" className="save-btn">
                  <FaSave /> Save Changes
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Change Password</h2>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={userData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                    />
                  </div>
                  {errors.currentPassword && <p className="error-message">{errors.currentPassword}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={userData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                    />
                  </div>
                  {errors.newPassword && <p className="error-message">{errors.newPassword}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" className="save-btn">
                  <FaSave /> Update Password
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserSettings;

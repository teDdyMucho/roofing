import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserRoleSelection.css';

/**
 * UserRoleSelection component
 * Initial screen where users select their role (employee or customer)
 * Uses a split-screen design with translucent background images
 */
const UserRoleSelection: React.FC = () => {
  const navigate = useNavigate();

  // Handle employee selection - redirect to employee landing page
  const handleEmployeeSelection = () => {
    // Store the role selection in localStorage to remember the choice
    localStorage.setItem('userRole', 'employee');
    navigate('/landing');
  };

  // Handle customer selection - placeholder for now
  const handleCustomerSelection = () => {
    // Store the role selection in localStorage to remember the choice
    localStorage.setItem('userRole', 'customer');
    // For now, just show an alert as this is a placeholder
    // alert('Customer portal coming soon!');
    navigate('/SouthlandRoofing');
  };

  return (
    <div className="role-selection-container">
      {/* Employee half */}
      <div 
        className="role-half employee-half"
        onClick={handleEmployeeSelection}
      >
        <div className="role-content">
          <h2>Employee Portal</h2>
          <p>Access tools and resources for Southland Roofing staff</p>
          <div className="role-icon">👷</div>
          <button className="role-button">Enter as Employee</button>
        </div>
      </div>
      
      {/* Customer half */}
      <div 
        className="role-half customer-half"
        onClick={handleCustomerSelection}
      >
        <div className="role-content">
          <h2>Customer Portal</h2>
          <p>Track your project and communicate with our team</p>
          <div className="role-icon">🏠</div>
          <button className="role-button">Enter as Customer</button>
        </div>
      </div>
      
      {/* Company logo overlay */}
      <div className="company-logo-overlay">
        <h1>Southland Roofing</h1>
        <p>Quality roofing solutions since 2010</p>
      </div>
    </div>
  );
};

export default UserRoleSelection;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: number;
  message: string;
  time: string;
}

interface DashboardHeaderProps {
  notifications: Notification[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ notifications }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleUserProfileClick = () => {
    navigate('/user-settings');
  };

  return (
    <header className="dashboard-header">
      <div className="header-actions">
        <div className="notifications">
          <FaBell />
          <span className="notification-badge">{notifications.length}</span>
        </div>
        <div className="user-profile" onClick={handleUserProfileClick}>
          <div className={`role-badge ${currentUser?.role === 'Administrator' ? 'admin-badge' : 'user-badge'}`}>
            {currentUser?.role === 'Administrator' ? 'Admin' : 'User'}
          </div>
          <div className="avatar">{currentUser?.username.split(' ').map((name: string) => name[0]).join('') || 'U'}</div>
          <div className="user-info">
            <h4>{currentUser?.username || 'User'}</h4>
            <p>{currentUser?.role || 'Guest'}</p>
          </div>
          <div className="profile-dropdown">
            <span>Edit Profile</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

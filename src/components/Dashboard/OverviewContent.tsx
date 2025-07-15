import React from 'react';
import { FaBell } from 'react-icons/fa';
import { Project, formatCurrency, formatDate } from '../../services/projectService';

interface Appointment {
  id: number;
  client: string;
  address: string;
  type: string;
  date: string;
  time: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
}

interface OverviewContentProps {
  projects: Project[];
  handleProjectClick: (projectId: string) => void;
  setActiveTab: (tab: string) => void;
  upcomingAppointments: Appointment[];
  notifications: Notification[];
}

const OverviewContent: React.FC<OverviewContentProps> = ({
  projects,
  handleProjectClick,
  setActiveTab,
  upcomingAppointments,
  notifications
}) => {
  return (
    <>
      <h1>Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Active Projects</h3>
          <p className="stat-value">12</p>
          <p className="stat-change positive">+2 from last month</p>
        </div>
        <div className="stat-card">
          <h3>Pending Estimates</h3>
          <p className="stat-value">8</p>
          <p className="stat-change positive">+3 from last month</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <p className="stat-value">$45,250</p>
          <p className="stat-change positive">+12% from last month</p>
        </div>
        <div className="stat-card">
          <h3>Customer Satisfaction</h3>
          <p className="stat-value">4.8/5</p>
          <p className="stat-change neutral">Same as last month</p>
        </div>
      </div>
      
      {/* Recent Projects */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Projects</h2>
          <button className="view-all-btn" onClick={() => setActiveTab('projects')}>View All</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Address</th>
                <th>Status</th>
                <th>Date</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map(project => (
                <tr key={project.id}>
                  <td>{project.client}</td>
                  <td>{project.address}</td>
                  <td>
                    <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>{formatDate(project.start_date)}</td>
                  <td>{formatCurrency(project.value)}</td>
                  <td>
                    <button className="action-btn" onClick={() => {
                      handleProjectClick(project.id);
                      setActiveTab('projects');
                    }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Upcoming Appointments */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Upcoming Appointments</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="appointments-container">
          {upcomingAppointments.map(appointment => (
            <div className="appointment-card" key={appointment.id}>
              <div className="appointment-date">
                <div className="date-badge">
                  {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <p>{appointment.time}</p>
              </div>
              <div className="appointment-details">
                <h4>{appointment.client}</h4>
                <p>{appointment.address}</p>
                <span className="appointment-type">{appointment.type}</span>
              </div>
              <div className="appointment-actions">
                <button className="action-btn">Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Notifications Panel */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Notifications</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="notifications-container">
          {notifications.map(notification => (
            <div className="notification-item" key={notification.id}>
              <div className="notification-icon">
                <FaBell />
              </div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OverviewContent;

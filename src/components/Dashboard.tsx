/**
 * Dashboard Component
 * Main interface for authenticated users providing access to all app features
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaChartLine, FaCog, FaSignOutAlt,
  FaBell, FaSearch, FaRobot, FaPlus
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { User as AppUser } from '../services/userService';
import ProjectTeamPanel from './ProjectTeamPanel';
import ProjectsList from './ProjectsList';
import '../styles/Dashboard.css';

/**
 * Dashboard component for the main user interface after authentication
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showAiMenu, setShowAiMenu] = useState(false);
  
  // ========== MOCK DATA ==========
  /**
   * Recent projects data
   * In a production app, this would come from an API call
   */
  const recentProjects = [
    { id: 1, client: 'Johnson Residence', address: '123 Oak St', status: 'In Progress', date: '2025-06-25', value: '$12,500' },
    { id: 2, client: 'Smith Commercial', address: '456 Pine Ave', status: 'Scheduled', date: '2025-07-05', value: '$28,750' },
    { id: 3, client: 'Garcia Family', address: '789 Maple Dr', status: 'Completed', date: '2025-06-20', value: '$8,900' },
    { id: 4, client: 'Downtown Office', address: '101 Main St', status: 'Estimate', date: '2025-07-10', value: '$34,200' }
  ];
  
  /**
   * Upcoming appointments data
   */
  const upcomingAppointments = [
    { id: 1, client: 'Thompson Residence', address: '234 Elm St', type: 'Inspection', date: '2025-07-01', time: '10:00 AM' },
    { id: 2, client: 'Wilson Property', address: '567 Cedar Ln', type: 'Estimate', date: '2025-07-02', time: '1:30 PM' },
    { id: 3, client: 'Martinez Home', address: '890 Birch Ave', type: 'Repair', date: '2025-07-03', time: '9:00 AM' }
  ];
  
  /**
   * Notification data
   */
  const notifications = [
    { id: 1, message: 'New estimate request from Lee Residence', time: '2 hours ago' },
    { id: 2, message: 'Material delivery scheduled for Smith project', time: '5 hours ago' },
    { id: 3, message: 'Weather alert: Rain expected tomorrow', time: '1 day ago' }
  ];
  
  /**
   * Team members data
   */
  const teamMembers = [
    { id: '1', name: 'Sarah Johnson', role: 'Project Manager', status: 'online' as const },
    { id: '2', name: 'Michael Chen', role: 'Roofing Specialist', status: 'online' as const },
    { id: '3', name: 'David Rodriguez', role: 'Estimator', status: 'away' as const, lastActive: '15 min ago' },
    { id: '4', name: 'Emily Taylor', role: 'Customer Service', status: 'online' as const },
    { id: '5', name: 'Robert Wilson', role: 'Installation Lead', status: 'offline' as const, lastActive: '2 hours ago' },
    { id: '6', name: 'Jessica Martinez', role: 'Admin Assistant', status: 'online' as const }
  ];
  
  /**
   * Handle user logout
   * Attempts to log out the user and navigates to landing page regardless of success/failure
   */
  const handleLogout = () => {
    try {
      console.log('Dashboard: Initiating logout');
      
      // Start the logout process but don't wait for it
      logout()
        .then(() => {
          console.log('Dashboard: Logout successful, navigating to landing page');
          // Navigate to landing page after logout completes
          navigate('/', { replace: true });
        })
        .catch(error => {
          console.error('Dashboard: Logout failed, still navigating to landing page', error);
          // Even if logout fails, still navigate to landing page
          navigate('/', { replace: true });
        });
    } catch (error) {
      console.error('Dashboard: Error in handleLogout', error);
      // If anything goes wrong, still try to navigate away
      navigate('/', { replace: true });
    }
  };

  /**
   * Navigate to user settings page
   */
  const handleUserProfileClick = () => {
    navigate('/user-settings');
  };

  // ========== AI ASSISTANT FEATURE ==========
  /**
   * AI chat interface state
   */
  const [estimatingAiMessage, setEstimatingAiMessage] = useState('');
  const [adminAiMessage, setAdminAiMessage] = useState('');
  
  // Initial AI chat messages
  const [estimatingAiChat, setEstimatingAiChat] = useState([
    { 
      sender: 'ai', 
      message: 'Hello! I\'m your Estimating AI assistant. How can I help you create roofing estimates today?' 
    }
  ]);
  
  const [adminAiChat, setAdminAiChat] = useState([
    { 
      sender: 'ai', 
      message: 'Welcome! I\'m your Admin AI assistant. I can help with scheduling, customer management, and business analytics.' 
    }
  ]);

  /**
   * Handle sending messages to AI assistants
   * @param aiType - The type of AI assistant ('estimating' or 'admin')
   */
  const handleSendMessage = useCallback((aiType: string) => {
    if (aiType === 'estimating') {
      if (estimatingAiMessage.trim() === '') return;
      
      // Add user message to chat
      setEstimatingAiChat(prev => [...prev, { 
        sender: 'user', 
        message: estimatingAiMessage 
      }]);
      
      // Clear input field
      setEstimatingAiMessage('');
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        setEstimatingAiChat(prev => [
          ...prev, 
          { 
            sender: 'ai', 
            message: `I can help you estimate that roofing project. Based on your description, I'd recommend considering premium shingles for a project of that size.` 
          }
        ]);
      }, 1000);
    } else if (aiType === 'admin') {
      if (adminAiMessage.trim() === '') return;
      
      // Add user message to chat
      setAdminAiChat(prev => [...prev, { 
        sender: 'user', 
        message: adminAiMessage 
      }]);
      
      // Clear input field
      setAdminAiMessage('');
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        setAdminAiChat(prev => [
          ...prev, 
          { 
            sender: 'ai', 
            message: `I've analyzed your schedule and found optimal times for the team meeting. Would Tuesday at 10am or Thursday at 2pm work better?` 
          }
        ]);
      }, 1000);
    }
  }, [estimatingAiMessage, adminAiMessage]);
  
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <FaHome className="logo-icon" />
          <h2>Southland Roofing</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              <FaChartLine /> <span>Overview</span>
            </li>
            <li className={activeTab === 'ai' || activeTab.startsWith('ai-') ? 'active' : ''} onClick={() => setShowAiMenu(!showAiMenu)}>
              <div className="menu-item-container">
                <div className="menu-item-content">
                  <FaRobot /> <span>AI Agents</span>
                </div>
                <div className={`dropdown-arrow ${showAiMenu ? 'open' : ''}`}></div>
              </div>
            </li>
            {showAiMenu && (
              <>
                <li className={`ai-submenu-item ${activeTab === 'ai-estimating' ? 'active' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('ai-estimating');
                  }}
                >
                  <span className="ai-bullet">•</span>
                  <span>Estimating AI</span>
                </li>
                <li className={`ai-submenu-item ${activeTab === 'ai-admin' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('ai-admin');
                  }}
                >
                  <span className="ai-bullet">•</span>
                  <span>Admin AI</span>
                </li>
              </>
            )}
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <FaCog /> <span>Settings</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search projects, clients..." />
          </div>
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

        {/* Dashboard Content */}
        <div className="dashboard-content">

          {activeTab === 'overview' && (
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
              <button className="view-all-btn">View All</button>
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
                  {recentProjects.map(project => (
                    <tr key={project.id}>
                      <td>{project.client}</td>
                      <td>{project.address}</td>
                      <td>
                        <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>{project.date}</td>
                      <td>{project.value}</td>
                      <td>
                        <button className="action-btn">View</button>
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
          )}

          {/* Estimating AI Content */}
          {activeTab === 'ai-estimating' && (
            <div className="ai-chat-container">
              <h1>Estimating AI Assistant</h1>
              <div className="ai-description">
                <p>Your intelligent assistant for creating accurate roofing estimates, material calculations, and cost projections.</p>
              </div>
              <div className="chat-messages">
                {estimatingAiChat.map((chat, index) => (
                  <div key={index} className={`message ${chat.sender}`}>
                    {chat.sender === 'ai' && <div className="ai-avatar"><FaRobot /></div>}
                    <div className="message-content">{chat.message}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Ask about roofing estimates, materials, or pricing..." 
                  value={estimatingAiMessage}
                  onChange={(e) => setEstimatingAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('estimating')}
                />
                <button onClick={() => handleSendMessage('estimating')}>
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Admin AI Content */}
          {activeTab === 'ai-admin' && (
            <div className="admin-ai-container">
              <h1>Admin AI Assistant</h1>
              
              <div className="admin-content-wrapper">
                {/* Left side: Projects Navigation */}
                <div className="admin-projects-sidebar">
                  <div className="projects-sidebar-header">
                    <h3>Ongoing Projects</h3>
                    <button className="new-project-btn"><FaPlus /> New</button>
                  </div>
                  
                  <div className="projects-list-sidebar">
                    {recentProjects.map((project) => (
                      <div 
                        key={project.id} 
                        className={`project-item ${project.id === 1 ? 'active' : ''}`}
                        onClick={() => console.log(`Selected project ${project.id}`)}
                      >
                        <div className="project-item-header">
                          <h4>{project.client}</h4>
                          <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="project-address">{project.address}</p>
                        <p className="project-value">{project.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right side: Combined Project Details and Chat */}
                <div className="project-combined-panel">
                  <div className="project-details-section">
                    <div className="project-details-header">
                      <button className="back-button">
                        <span>← Back to Projects</span>
                      </button>
                      <h2>Johnson Residence Roof Replacement</h2>
                      <span className="status-badge in-progress">In Progress</span>
                    </div>
                    
                    <div className="project-info-section">
                      <div className="info-group">
                        <h4>Client:</h4>
                        <p>Robert Johnson</p>
                      </div>
                      
                      <div className="info-group">
                        <h4>Address:</h4>
                        <p>123 Oak Street, Springfield, IL</p>
                      </div>
                      
                      <div className="info-group">
                        <h4>Timeline:</h4>
                        <p>Jun 15, 2025 - Jul 10, 2025</p>
                      </div>
                      
                      <div className="info-group">
                        <h4>Value:</h4>
                        <p>$12,500</p>
                      </div>
                      
                      <div className="info-group">
                        <h4>Progress:</h4>
                        <div className="progress-bar-container">
                          <div className="progress-bar" style={{ width: '60%' }}></div>
                          <span>60% Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-chat-section">
                    <div className="chat-panel-header">
                      <h3>Johnson Residence Roof Replacement - Project Chat</h3>
                    </div>
                    
                    <div className="project-chat-messages">
                      <div className="chat-day-divider">Today</div>
                      
                      <div className="project-message">
                        <div className="message-avatar">SJ</div>
                        <div className="message-content-wrapper">
                          <div className="message-header">
                            <span className="message-sender">Sarah Johnson</span>
                            <span className="message-role">Project Manager</span>
                            <span className="message-time">08:30 AM</span>
                          </div>
                          <div className="message-body">
                            Good morning team! Just wanted to check in on the progress for the shingle installation.
                          </div>
                        </div>
                      </div>
                      
                      <div className="project-message">
                        <div className="message-avatar">MC</div>
                        <div className="message-content-wrapper">
                          <div className="message-header">
                            <span className="message-sender">Michael Chen</span>
                            <span className="message-role">Roofing Specialist</span>
                            <span className="message-time">08:45 AM</span>
                          </div>
                          <div className="message-body">
                            We've completed about 60% of the shingle installation. Should be done by tomorrow afternoon if weather permits.
                          </div>
                        </div>
                      </div>
                      
                      <div className="project-message">
                        <div className="message-avatar">DR</div>
                        <div className="message-content-wrapper">
                          <div className="message-header">
                            <span className="message-sender">David Rodriguez</span>
                            <span className="message-role">Estimator</span>
                            <span className="message-time">09:15 AM</span>
                          </div>
                          <div className="message-body">
                            The client called asking about adding gutter guards. I've prepared an additional estimate for that work.
                            <div className="message-attachment">
                              <span className="attachment-icon">📄</span>
                              <span className="attachment-name">Gutter Guard Estimate.pdf</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="project-chat-input">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={adminAiMessage}
                        onChange={(e) => setAdminAiMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('admin')}
                      />
                      <button className="upload-photo-btn" title="Upload Photo">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="photo-upload" 
                          style={{ display: 'none' }} 
                          onChange={(e) => console.log('Photo selected:', e.target.files?.[0]?.name)}
                        />
                        <label htmlFor="photo-upload">📷</label>
                      </button>
                      <button className="attach-btn" title="Attach File">📎</button>
                      <button className="send-btn" onClick={() => handleSendMessage('admin')}>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

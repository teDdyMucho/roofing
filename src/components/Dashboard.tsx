/**
 * Dashboard Component
 * Main interface for authenticated users providing access to all app features
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaCog, FaSignOutAlt,
  FaClipboardList, FaCalendarAlt, FaUsers, FaFileInvoiceDollar, 
  FaRobot, FaSearch, FaBell, FaPaperPlane, FaPlus, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { User as AppUser } from '../services/userService';
import { Project, fetchProjects, createProject, formatCurrency, formatDate } from '../services/projectService';
import { ChatMessage, fetchProjectMessages, sendProjectMessage, subscribeToProjectMessages } from '../services/projectChatService';
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  
  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    address: '',
    start_date: '',
    end_date: '',
    value: ''
  });
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Project chat state
  const [projectMessages, setProjectMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Handle new project form input changes
  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Load projects from the database
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Handle back button click to return to projects list
  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };
  
  // Format timeline for display
  const formatTimeline = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return 'Not specified';
    if (startDate && !endDate) return `Starts ${formatDate(startDate)}`;
    if (!startDate && endDate) return `Due by ${formatDate(endDate)}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  // Load project messages when a project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      try {
        const messages = await fetchProjectMessages(selectedProjectId);
        setProjectMessages(messages);
      } catch (err) {
        console.error('Failed to load project messages:', err);
      }
    };
    
    loadMessages();
    
    // Subscribe to new messages
    const unsubscribe = subscribeToProjectMessages(selectedProjectId, (message) => {
      setProjectMessages(prev => [...prev, message]);
    });
    
    // Cleanup subscription on unmount or when project changes
    return () => {
      unsubscribe();
    };
  }, [selectedProjectId]);
  
  // Handle sending a new message
  const handleSendProjectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjectId || !newMessage.trim() || !currentUser) return;
    
    try {
      setIsSendingMessage(true);
      
      await sendProjectMessage({
        project_id: selectedProjectId,
        user_id: currentUser.id,
        message: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  // Handle new project form submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse value to number
      const valueNumber = newProject.value ? parseFloat(newProject.value.replace(/[^0-9.]/g, '')) : null;
      
      // Create a new project with the form data
      const projectData = {
        name: newProject.name,
        client: newProject.client,
        address: newProject.address,
        status: 'Estimate' as const,
        start_date: newProject.start_date || null,
        end_date: newProject.end_date || null,
        value: valueNumber
      };
      
      // Send to database
      const createdProject = await createProject(projectData);
      
      // Add the new project to the list
      setProjects(prev => [createdProject, ...prev]);
      console.log('Created new project:', createdProject);
      
      // Set the selected project to the newly created one
      setSelectedProjectId(createdProject.id);
      
      // Reset form and close modal
      setNewProject({
        name: '',
        client: '',
        address: '',
        start_date: '',
        end_date: '',
        value: ''
      });
      setShowCreateProjectForm(false);
      
      // Switch to the Projects tab to show the new project
      setActiveTab('projects');
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Please try again.');
    }
  };
  
  // Handle project click to view project details
  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };
  
  // ========== MOCK DATA ==========
  /**
   * This data will be replaced by real data from the database
   */
  
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
      {/* Create Project Modal */}
      {showCreateProjectForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="close-button" onClick={() => setShowCreateProjectForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="project-name">Project Name</label>
                <input 
                  type="text" 
                  id="project-name" 
                  name="name" 
                  value={newProject.name} 
                  onChange={handleNewProjectChange} 
                  placeholder="Enter project name" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="project-client">Client</label>
                <input 
                  type="text" 
                  id="project-client" 
                  name="client" 
                  value={newProject.client} 
                  onChange={handleNewProjectChange} 
                  placeholder="Client name or company" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="project-address">Address</label>
                <input 
                  type="text" 
                  id="project-address" 
                  name="address" 
                  value={newProject.address} 
                  onChange={handleNewProjectChange} 
                  placeholder="Full project address" 
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project-start-date">Start Date</label>
                  <input 
                    type="date" 
                    id="project-start-date" 
                    name="start_date" 
                    value={newProject.start_date} 
                    onChange={handleNewProjectChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="project-end-date">End Date</label>
                  <input 
                    type="date" 
                    id="project-end-date" 
                    name="end_date" 
                    value={newProject.end_date} 
                    onChange={handleNewProjectChange} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="project-value">Value ($)</label>
                <input 
                  type="text" 
                  id="project-value" 
                  name="value" 
                  value={newProject.value} 
                  onChange={handleNewProjectChange} 
                  placeholder="e.g., 5,000" 
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateProjectForm(false)}>Cancel</button>
                <button type="submit">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
            <li className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>
              <FaClipboardList /> <span>Projects</span>
            </li>
            <li className={activeTab === 'calendar' ? 'active' : ''} onClick={() => setActiveTab('calendar')}>
              <FaCalendarAlt /> <span>Calendar</span>
            </li>
            <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
              <FaUsers /> <span>Clients</span>
            </li>
            <li className={activeTab === 'invoices' ? 'active' : ''} onClick={() => setActiveTab('invoices')}>
              <FaFileInvoiceDollar /> <span>Invoices</span>
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
          )}
          
          {/* Projects Tab Content */}
          {activeTab === 'projects' && (
            <div className="projects-container">
              <h1>Projects</h1>
              
              <div className="projects-content-wrapper">
                {/* Left side: Projects Navigation */}
                <div className="projects-sidebar">
                  <div className="projects-sidebar-header">
                    <h3>Projects</h3>
                    <button className="new-project-btn" onClick={() => setShowCreateProjectForm(true)}><FaPlus /> New</button>
                  </div>
                  
                  <div className="projects-list-sidebar">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className={`project-item ${project.id === selectedProjectId ? 'active' : ''}`}
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <div className="project-item-header">
                          <h4>{project.client}</h4>
                          <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="project-address">{project.address}</p>
                        <p className="project-value">{formatCurrency(project.value)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="create-project-footer">
                    <button 
                      className="create-project-btn"
                      onClick={() => setShowCreateProjectForm(true)}
                    >
                      <FaPlus /> Create New Project
                    </button>
                  </div>
                </div>
                
                {/* Right side: Combined Project Details and Chat */}
                <div className="project-combined-panel">
                  {selectedProjectId ? (
                  <>
                  <div className="project-details-section">
                    <div className="horizontal-layout">
                      <div className="project-title-area">
                        <h2>{projects.find(project => project.id === selectedProjectId)?.name}</h2>
                        <span className="status-badge in-progress">In Progress</span>
                      </div>
                      
                      <div className="project-details-divider"></div>
                      
                      <div className="project-info-grid">
                        <div className="info-group">
                          <h4>Client:</h4>
                          <p>{projects.find(project => project.id === selectedProjectId)?.client}</p>
                        </div>
                        
                        <div className="info-group">
                          <h4>Address:</h4>
                          <p>{projects.find(project => project.id === selectedProjectId)?.address}</p>
                        </div>
                        
                        <div className="info-group">
                          <h4>Timeline:</h4>
                          {selectedProjectId && (
                            <p>{formatTimeline(
                              projects.find(project => project.id === selectedProjectId)?.start_date || null,
                              projects.find(project => project.id === selectedProjectId)?.end_date || null
                            )}</p>
                          )}
                        </div>
                        
                        <div className="info-group">
                          <h4>Value:</h4>
                          {selectedProjectId && (
                            <p>{formatCurrency(
                              projects.find(project => project.id === selectedProjectId)?.value || null
                            )}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-chat-section">
                    
                    <div className="project-chat-messages">
                      {projectMessages.length === 0 ? (
                        <div className="empty-chat-message">No messages yet. Start the conversation!</div>
                      ) : (
                        <>
                          <div className="chat-day-divider">Today</div>
                          {projectMessages.map(message => (
                            <div key={message.id} className={`project-message ${message.user_id === currentUser?.id ? 'own-message' : ''}`}>
                              <div className="message-avatar">
                                {message.user?.first_name?.[0]}{message.user?.last_name?.[0] || ''}
                              </div>
                              <div className="message-content-wrapper">
                                <div className="message-header">
                                  <span className="message-sender">{message.user?.first_name || 'User'} {message.user?.last_name || ''}</span>
                                  <span className="message-role">{message.user?.role || 'Member'}</span>
                                  <span className="message-time">{new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="message-body">{message.message}</div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    
                    <form className="project-chat-input" onSubmit={handleSendProjectMessage}>
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSendingMessage}
                        className="chat-input"
                      />
                      <button className="upload-photo-btn" title="Upload Photo">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="project-photo-upload" 
                          style={{ display: 'none' }} 
                          onChange={(e) => console.log('Photo selected:', e.target.files?.[0]?.name)}
                        />
                        <label htmlFor="project-photo-upload">📷</label>
                      </button>
                      <button className="attach-btn" title="Attach File">📎</button>
                      <button type="submit" className="send-btn" disabled={isSendingMessage || !newMessage.trim()} title="Press Enter to send">
                        {isSendingMessage ? 'Sending...' : 'Enter ↵'}
                      </button>
                    </form>
                  </div>
                  </>
                  ) : (
                    <div className="no-project-selected">
                      <div className="empty-state">
                        <FaClipboardList className="empty-icon" />
                        <h3>Select a Project</h3>
                        <p>Click on a project from the list to view details and chat</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                <div className="ai-description">
                  <p>Your intelligent assistant for managing administrative tasks, scheduling, and business analytics.</p>
                </div>
                <div className="chat-messages">
                  {adminAiChat.map((chat, index) => (
                    <div key={index} className={`message ${chat.sender}`}>
                      {chat.sender === 'ai' && <div className="ai-avatar"><FaRobot /></div>}
                      <div className="message-content">{chat.message}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    placeholder="Ask about scheduling, team management, or business analytics..." 
                    value={adminAiMessage}
                    onChange={(e) => setAdminAiMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('admin')}
                  />
                  <button onClick={() => handleSendMessage('admin')}>
                    Send
                  </button>
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

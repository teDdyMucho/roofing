import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaClipboardList, FaUsers, FaCalendarAlt, FaCog, 
  FaRobot, FaSignOutAlt, FaFileInvoiceDollar 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAiMenu, setShowAiMenu] = useState(false);

  const handleLogout = () => {
    logout()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/', { replace: true }));
  };

  return (
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
  );
};

export default Sidebar;

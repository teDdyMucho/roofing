import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaClipboardList, FaUsers, FaCalendarAlt, FaCog, 
  FaRobot, FaSignOutAlt, FaFileInvoiceDollar, FaCloudSun 
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
        <FaHome className="logo-icon" style={{ color: 'var(--primary-color)' }} />
        <h2>Southland Roofing</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <FaChartLine style={{ color: activeTab === 'overview' ? 'var(--primary-color)' : 'var(--info)' }} /> <span>Overview</span>
          </li>
          <li className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>
            <FaClipboardList style={{ color: activeTab === 'projects' ? 'var(--primary-color)' : 'var(--success)' }} /> <span>Projects</span>
          </li>
          <li className={activeTab === 'weather' ? 'active' : ''} onClick={() => setActiveTab('weather')}>
            <FaCloudSun style={{ color: activeTab === 'weather' ? 'var(--primary-color)' : '#4dabf7' }} /> <span>Weather</span>
          </li>
          <li className={activeTab === 'calendar' ? 'active' : ''} onClick={() => setActiveTab('calendar')}>
            <FaCalendarAlt style={{ color: activeTab === 'calendar' ? 'var(--primary-color)' : 'var(--warning)' }} /> <span>Calendar</span>
          </li>
          <li className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
            <FaUsers style={{ color: activeTab === 'clients' ? 'var(--primary-color)' : '#6366f1' }} /> <span>Clients</span>
          </li>
          <li className={activeTab === 'invoices' ? 'active' : ''} onClick={() => setActiveTab('invoices')}>
            <FaFileInvoiceDollar style={{ color: activeTab === 'invoices' ? 'var(--primary-color)' : '#10b981' }} /> <span>Invoices</span>
          </li>
          <li className={activeTab === 'ai' || activeTab.startsWith('ai-') ? 'active' : ''} onClick={() => setShowAiMenu(!showAiMenu)}>
            <div className="menu-item-container">
              <div className="menu-item-content">
                <FaRobot style={{ color: activeTab === 'ai' || activeTab.startsWith('ai-') ? 'var(--primary-color)' : '#8b5cf6' }} /> <span>AI Agents</span>
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
            <FaCog style={{ color: activeTab === 'settings' ? 'var(--primary-color)' : '#64748b' }} /> <span>Settings</span>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt style={{ color: 'var(--danger)' }} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

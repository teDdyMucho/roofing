import React, { useState } from 'react';
import { 
  FaFileInvoiceDollar, 
  FaFileContract, 
  FaFileAlt, 
  FaFileSignature,
  FaMoneyCheckAlt,
  FaHardHat,
  FaImages,
  FaTimes,
  FaTasks,
  FaShieldAlt,
  FaComments
} from 'react-icons/fa';
import '../../styles/Modal.css';
import '../../styles/ProjectNavBar.css';

interface ProjectNavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Professional Modal component
const Modal: React.FC<ModalProps & { children?: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-title-icon">
              {title === 'Estimate' && <FaFileInvoiceDollar />}
              {title === 'POs' && <FaFileAlt />}
              {title === 'Bidding Documents' && <FaFileSignature />}
              {title === 'Contracts' && <FaFileContract />}
              {title === 'Billing Documents' && <FaMoneyCheckAlt />}
              {title === 'Labor Compliance' && <FaHardHat />}
              {title === 'Photos' && <FaImages />}
              {title === 'Safety' && <FaShieldAlt />}
              {title === 'Communication' && <FaComments />}
            </div>
            <div className="modal-title-text">
              <h2>{title}</h2>
              <p className="modal-subtitle">Manage your {title.toLowerCase()} information</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="modal-divider"></div>
        <div className="modal-content">
          {children || (
            <div className="modal-placeholder">
              <div className="modal-placeholder-icon">
                {title === 'Estimate' && <FaFileInvoiceDollar size={48} />}
                {title === 'POs' && <FaFileAlt size={48} />}
                {title === 'Bidding Documents' && <FaFileSignature size={48} />}
                {title === 'Contracts' && <FaFileContract size={48} />}
                {title === 'Billing Documents' && <FaMoneyCheckAlt size={48} />}
                {title === 'Labor Compliance' && <FaHardHat size={48} />}
                {title === 'Photos' && <FaImages size={48} />}
                {title === 'Safety' && <FaShieldAlt size={48} />}
                {title === 'Communication' && <FaComments size={48} />}
              </div>
              <h3>No {title} Available</h3>
              <p>Click the button below to add new {title.toLowerCase()} information</p>
              <button className="modal-action-btn">Add {title}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const progressCategories = [
    { name: 'Pre-Construction', percentage: 25 },
    { name: 'Construction', percentage: 50 },
    { name: 'Post-Construction', percentage: 10 }
  ];
  
  return (
    <>
      <div className="progress-dropdown-backdrop" onClick={onClose}></div>
      <div className="progress-dropdown-panel">
        <div className="progress-dropdown-header">
          <h3>Progress Bar Tasks</h3>
          <button className="progress-dropdown-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="progress-dropdown-content">
          {progressCategories.map((category, index) => (
            <div className="progress-category" key={`progress-${index}`}>
              <div className="progress-category-header">
                <h4>{category.name}</h4>
                <span className="progress-percentage">{category.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
              <div className="progress-edit-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={category.percentage.toString()} 
                  className="progress-slider" 
                />
                <button className="progress-save-btn">Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const ProjectNavBar: React.FC<ProjectNavBarProps> = ({ 
  activeTab = 'Estimate', 
  onTabChange = () => {} 
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [progressModalOpen, setProgressModalOpen] = useState<boolean>(false);

  // Function to handle tab change and modal opening
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    
    // Only open modal if it's not already open for this tab
    if (activeModal !== tabId) {
      setActiveModal(tabId);
    } else {
      // If clicking the same tab again, close the modal
      setActiveModal(null);
    }
  };

  // Function to close modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Define navigation items with icons
  const navItems: NavItem[] = [
    {
      id: 'Estimate',
      label: 'Estimate',
      icon: <FaFileInvoiceDollar />
    },
    {
      id: 'POs',
      label: 'POs',
      icon: <FaFileAlt />
    },
    {
      id: 'Bidding Documents',
      label: 'Bidding Documents',
      icon: <FaFileSignature />
    },
    {
      id: 'Contracts',
      label: 'Contracts',
      icon: <FaFileContract />
    },
    {
      id: 'Billing Documents',
      label: 'Billing Documents',
      icon: <FaMoneyCheckAlt />
    },
    {
      id: 'Labor Compliance',
      label: 'Labor Compliance',
      icon: <FaHardHat />
    },
    {
      id: 'Photos',
      label: 'Photos',
      icon: <FaImages />
    },
    {
      id: 'Safety',
      label: 'Safety',
      icon: <FaShieldAlt />
    },
    {
      id: 'Communication',
      label: 'Communication',
      icon: <FaComments />
    }
  ];

  return (
    <>
      <div className="project-nav-bar">
        <div className="project-nav-items">
          {navItems.map((item) => (
            <div
              key={`nav-item-${item.id}`}
              className={`project-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="with-bottom-line"></div>
        <div className="nav-bottom-buttons">
          <button className="nav-bottom-button">Safety Videos</button>
          <span className="nav-bottom-separator">|</span>
          <button className="nav-bottom-button">Time Sheet</button>
        </div>
        <div className="nav-bottom-progress" id="progress-button-container">
          <button 
            className="progress-button" 
            onClick={() => setProgressModalOpen(!progressModalOpen)}
            id="progress-dropdown-trigger"
          >
            <FaTasks className="progress-icon" />
            <span>Progress Bar (Tasks)</span>
          </button>
        </div>
      </div>

      {/* Modals for each navigation item */}
      {navItems.map((item) => (
        <Modal
          key={`modal-${item.id}`}
          isOpen={activeModal === item.id}
          onClose={closeModal}
          title={item.label}
        />
      ))}
      
      {/* Progress Modal */}
      {progressModalOpen && (
        <ProgressModal 
          isOpen={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProjectNavBar;

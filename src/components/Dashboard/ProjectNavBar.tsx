import React, { useState } from 'react';
import {
  FaFileInvoiceDollar,
  FaFileContract,
  FaFileAlt,
  FaFileSignature,
  FaMoneyCheckAlt,
  FaHardHat,
  FaImages,
  FaTasks,
  FaShieldAlt,
  FaComments,
  FaFolderOpen
} from 'react-icons/fa';

import '../../styles/ProjectNavBar.css';

export interface ProjectNavBarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onIndexClick?: () => void;
  onEstimateClick?: () => void;
  onBiddingDocumentsClick?: () => void;
  onLaborComplianceClick?: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ProjectNavBar: React.FC<ProjectNavBarProps> = ({
  activeTab = 'Project Info',
  onTabChange = () => {},
  onIndexClick = () => {},
  onEstimateClick = () => {},
  onBiddingDocumentsClick = () => {},
  onLaborComplianceClick = () => {}
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [progressModalOpen, setProgressModalOpen] = useState<boolean>(false);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);

    if (tabId === 'Project Index') {
      onIndexClick();
      return;
    }

    if (tabId === 'Estimate') {
      onEstimateClick();
      return;
    }
    
    if (tabId === 'Bidding Documents') {
      onBiddingDocumentsClick();
      return;
    }
    
    if (tabId === 'Labor Compliance') {
      onLaborComplianceClick();
      return;
    }

    if (activeModal !== tabId) {
      setActiveModal(tabId);
    } else {
      setActiveModal(null);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const navItems: NavItem[] = [
    {
      id: 'Project Index',
      label: 'Project Info',
      icon: <FaFolderOpen />
    },
    {
      id: 'Estimate',
      label: 'Estimate',
      icon: <FaFileInvoiceDollar />
    },
    // {
    //   id: 'POs',
    //   label: 'POs',
    //   icon: <FaFileAlt />
    // },
    {
      id: 'Bidding Documents',
      label: 'Documents',
      icon: <FaFileSignature />
    },
    // {
    //   id: 'Contracts',
    //   label: 'Contracts',
    //   icon: <FaFileContract />
    // },
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
    <div className="project-nav-bar">
      <div className="project-nav-items">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`project-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="with-bottom-line"></div>
      <div className="nav-bottom-progress">
        <button
          className="progress-button"
          onClick={() => setProgressModalOpen(!progressModalOpen)}
        >
          <FaTasks className="progress-icon" />
          <span>Progress Bar (Tasks)</span>
        </button>
      </div>

      {/* Optional: modal logic (if needed in this component) */}
    </div>
  );
};

export default ProjectNavBar;

import React, { useState } from 'react';
import {
  FaFileInvoiceDollar,
  FaFileContract,
  FaFileAlt,
  FaFileSignature,
  FaMoneyCheckAlt,
  FaHardHat,
  FaImages,
  FaShieldAlt,
  FaComments,
  FaFolderOpen
} from 'react-icons/fa';
import ProgressBar from '../navbarDocuments/progressBar';

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
        <ProgressBar tasks={[
          { id: '1', name: 'G Drive', completed: true },
          { id: '2', name: 'Pre Bid', completed: true },
          { id: '3', name: 'Calendar', completed: true },
          { id: '4', name: 'Job Walk', completed: true },
          { id: '5', name: 'Project Index', completed: false },
          { id: '6', name: 'Bid Form', completed: false },
          { id: '7', name: 'Pricing', completed: false },
          { id: '8', name: 'Bid Bond', completed: false }
        ]} />
      </div>
    </div>
  );
};

export default ProjectNavBar;

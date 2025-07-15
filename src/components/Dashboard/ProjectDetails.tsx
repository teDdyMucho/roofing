import React, { useState } from 'react';
import { FaListUl } from 'react-icons/fa';
import { Project, formatCurrency, formatDate } from '../../services/projectService';
import ProjectNavBar from './ProjectNavBar';

interface ProjectDetailsProps {
  selectedProjectId: string | null;
  projects: Project[];
  setShowIndexModal: (show: boolean) => void;
}

// Reusable InfoRow component for consistent display of label-value pairs
interface InfoRowProps {
  label: string;
  value: string | number | React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="info-row">
    <h4>{label}:</h4>
    <p>{value}</p>
  </div>
);

// Component for the project header section
interface ProjectHeaderProps {
  name: string;
  status: string;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ name, status }) => (
  <div className="project-title-area">
    <h2>{name}</h2>
    <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
      {status}
    </span>
  </div>
);

// Component for contact information section
interface ContactInfoProps {
  projectName: string;
  client: string;
  phone?: string;
  email?: string;
}

const ContactInfoGroup: React.FC<ContactInfoProps> = ({ 
  projectName, 
  client, 
  phone = "(714) 628-4400", // Default values that should come from project data
  email = "leadership@orangeusd.org" 
}) => (
  <div className="contact-info-group">
    <InfoRow label="Name" value={projectName} />
    <InfoRow label="Company" value={client} />
    <InfoRow label="Phone" value={phone} />
    <InfoRow label="Email" value={email} />
    <InfoRow label="Mailing" value="Same as Location" />
    <InfoRow label="Billing" value="Same as Location" />
  </div>
);

// Component for location information
interface LocationInfoProps {
  address: string;
  category?: string;
  workType?: string;
  trade?: string;
  leadSource?: string;
  initialAppt: string | null;
}

const LocationInfoGroup: React.FC<LocationInfoProps> = ({ 
  address, 
  category = "PUBLIC WORK", 
  workType = "New", 
  trade = "New Roof", 
  leadSource = "ONLINE BIDDING (Plan Hub, Build)", 
  initialAppt 
}) => (
  <div className="location-info-group">
    <h3 className="info-group-title">Location Info</h3>
    <InfoRow label="Address" value={address} />
    <InfoRow label="Category" value={category} />
    <InfoRow label="Work Type" value={workType} />
    <InfoRow label="Trade" value={trade} />
    <InfoRow label="Lead Source" value={leadSource} />
    <InfoRow label="Initial Appt" value={initialAppt || 'Not scheduled'} />
  </div>
);

// Component for project details information
interface ProjectDetailsInfoProps {
  value: number | null;
  startDate: string | null;
  endDate: string | null;
  onIndexClick: (e: React.MouseEvent) => void;
}

const ProjectDetailsInfoGroup: React.FC<ProjectDetailsInfoProps> = ({ 
  value, 
  startDate, 
  endDate, 
  onIndexClick 
}) => (
  <div className="project-details-info-group">
    <div className="index-button-horizontal">
    <span className="index-preview" onClick={onIndexClick} aria-label="Project Index">
        Preview Project
      </span>
      <button 
        className="index-button" 
        onClick={onIndexClick}
        aria-label="Project Index"
      >
        <FaListUl />
      </button>
    </div>
  </div>
);

// Main ProjectDetails component
const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  selectedProjectId,
  projects,
  setShowIndexModal
}) => {
  const [activeNavTab, setActiveNavTab] = useState<string>('Estimate');
  
  if (!selectedProjectId) return null;
  
  const selectedProject = projects.find(project => project.id === selectedProjectId);
  if (!selectedProject) return <div className="project-not-found">Project not found</div>;

  // Handler for index button click
  const handleIndexClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowIndexModal(true);
  };
  
  // Handler for navigation tab change
  const handleNavTabChange = (tab: string) => {
    setActiveNavTab(tab);
  };

  return (
    <>
      <div className="project-details-section">
        <div className="horizontal-layout">
          <ProjectHeader 
            name={selectedProject.name} 
            status="In Progress" 
          />
          
          <div className="project-details-divider" />
          
          <div className="project-info-grid">
            <ContactInfoGroup 
              projectName="Orange USD - Villa Park ES APOC" 
              client={selectedProject.client} 
            />
            
            <LocationInfoGroup 
              address={selectedProject.address} 
              initialAppt={selectedProject.start_date} 
            />
            
            <ProjectDetailsInfoGroup 
              value={selectedProject.value} 
              startDate={selectedProject.start_date} 
              endDate={selectedProject.end_date} 
              onIndexClick={handleIndexClick} 
            />
          </div>
        </div>
      </div>
      
      {/* Navigation bar positioned below the project details section */}
      <div className="project-nav-container">
        <ProjectNavBar 
          activeTab={activeNavTab}
          onTabChange={handleNavTabChange}
        />
      </div>
    </>
  );
};

export default ProjectDetails;

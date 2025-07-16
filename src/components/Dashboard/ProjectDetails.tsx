import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaFolder, FaFileAlt, FaPencilAlt, FaFolderOpen } from 'react-icons/fa';
import { Project, getProjectById } from '../../services/projectService';
import ProjectNavBar from './ProjectNavBar';
import EditProjectModal from './EditProjectModal';

interface ProjectDetailsProps {
  selectedProjectId: string | null;
  projects: Project[];
  setShowIndexModal: (show: boolean) => void;
  setSelectedProjectId: (projectId: string | null) => void;
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
  phone?: string | null;
  email?: string | null;
  mailing?: string | null;
  billing?: string | null;
}

const ContactInfoGroup: React.FC<ContactInfoProps> = ({ 
  projectName, 
  client, 
  phone = null, // Default to null, will display as N/A
  email = null, // Default to null, will display as N/A
  mailing = null,
  billing = null
}) => (
  <div className="contact-info-group">
    <h3 className="info-group-title">User Info</h3>
    <InfoRow label="Name" value={client || 'N/A'} />
    <InfoRow label="Company" value={projectName || 'N/A'} />
    <InfoRow label="Phone" value={phone || 'N/A'} />
    <InfoRow label="Email" value={email || 'N/A'} />
    <InfoRow label="Mailing" value={mailing || 'N/A'} />
    <InfoRow label="Billing" value={billing || 'N/A'} />
  </div>
);

// Component for location information
interface LocationInfoProps {
  address: string;
  category?: string | null;
  workType?: string | null;
  trade?: string | null;
  leadSource?: string | null;
  initialAppt?: string | null;
}

const LocationInfoGroup: React.FC<LocationInfoProps> = ({ 
  address, 
  category = null, 
  workType = null, 
  trade = null, 
  leadSource = null, 
  initialAppt = null
}) => (
  <div className="location-info-group">
    <h3 className="info-group-title">Location Info</h3>
    <InfoRow label="Address" value={address || 'N/A'} />
    <InfoRow label="Category" value={category || 'N/A'} />
    <InfoRow label="Work Type" value={workType || 'N/A'} />
    <InfoRow label="Trade" value={trade || 'N/A'} />
    <InfoRow label="Lead Source" value={leadSource || 'N/A'} />
    <InfoRow label="Initial Appt" value={initialAppt || 'N/A'} />
  </div>
);

// Component for project details information
interface ProjectDetailsInfoProps {
  value: number | null;
  startDate: string | null;
  endDate: string | null;
  onIndexClick: (e: React.MouseEvent) => void;
  onPreviewClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
}

const ProjectDetailsInfoGroup: React.FC<ProjectDetailsInfoProps> = ({ 
  value, 
  startDate, 
  endDate, 
  onIndexClick,
  onEditClick,
  onPreviewClick,
}) => (
  <div className="project-details-info-group">
    <div className="buttons-vertical">
      <button 
        className="action-button action-preview" 
        onClick={onPreviewClick}
        aria-label="Preview Project"
      >
        <span className="button-icon-wrapper">
          <FaFileAlt className="button-icon" />
        </span>
        <span className="button-text">Preview Project</span>
      </button>
      <button 
        className="action-button action-edit" 
        onClick={onEditClick}
        aria-label="Edit Project"
      >
        <span className="button-icon-wrapper">
          <FaPencilAlt className="button-icon" />
        </span>
        <span className="button-text">Edit Details</span>
      </button>
      <button 
        className="action-button action-index" 
        onClick={onIndexClick}
        aria-label="Project Index"
      >
        <span className="button-icon-wrapper">
          <FaFolderOpen className="button-icon" />
        </span>
        <span className="button-text">Project Index</span>
      </button>
    </div>
  </div>
);

// Main ProjectDetails component
const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  selectedProjectId,
  projects,
  setShowIndexModal,
  setSelectedProjectId
}) => {
  const [activeNavTab, setActiveNavTab] = useState<string>('Estimate');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // Initialize and update currentProject when selectedProjectId or projects change
  useEffect(() => {
    if (selectedProjectId) {
      const projectFromList = projects.find(project => project.id === selectedProjectId);
      if (projectFromList) {
        setCurrentProject(projectFromList);
      }
    }
  }, [selectedProjectId, projects]);
  
  if (!selectedProjectId) return null;
  if (!currentProject) return <div className="project-not-found">Loading project...</div>;

  // Handler for index button click
  const handleIndexClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowIndexModal(true);
  };

  // Handler for edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Show the edit modal
    setShowEditModal(true);
  };
  
  // Handler for project update
  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      // Immediately update the current project with the updated data
      setCurrentProject(updatedProject);
      
      // Fetch the latest project data from the database to ensure UI is fully in sync
      const refreshedProject = await getProjectById(selectedProjectId);
      setCurrentProject(refreshedProject);
      
      // Show a temporary success message
      const successElement = document.createElement('div');
      successElement.className = 'project-update-success';
      successElement.textContent = 'Project updated successfully!';
      document.body.appendChild(successElement);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successElement)) {
          document.body.removeChild(successElement);
        }
      }, 3000);
    } catch (error) {
      console.error('Error refreshing project data:', error);
    }
  };

  // Handler for preview button click - navigates back to project selection screen
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate back to the 'Select Project' screen by clearing the selected project
    setSelectedProjectId(null);
  };
  
  // Handler for navigation tab change
  const handleNavTabChange = (tab: string) => {
    setActiveNavTab(tab);
  };

  return (
    <>
      {/* Edit Project Modal */}
      <EditProjectModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        project={currentProject}
        onProjectUpdate={handleProjectUpdate}
      />
      
      <div className="project-details-section">
        <div className="horizontal-layout">
          <ProjectHeader 
            name={currentProject.name} 
            status="In Progress" 
          />
          
          <div className="project-details-divider" />
          
          <div className="project-info-grid">
            <ContactInfoGroup 
              projectName={currentProject.name} 
              client={currentProject.client}
              phone={currentProject.phone || null}
              email={currentProject.email || null}
              mailing={currentProject.mailing || null}
              billing={currentProject.billing || null}
            />
            
            <LocationInfoGroup 
              address={currentProject.address} 
              category={currentProject.category || null}
              workType={currentProject.workType || null}
              trade={currentProject.trade || null}
              leadSource={currentProject.leadSource || null}
              initialAppt={currentProject.start_date} 
            />
            
            <ProjectDetailsInfoGroup 
              value={currentProject.value} 
              startDate={currentProject.start_date} 
              endDate={currentProject.end_date} 
              onIndexClick={handleIndexClick}
              onPreviewClick={handlePreviewClick}
              onEditClick={handleEditClick} 
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

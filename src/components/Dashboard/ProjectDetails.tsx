import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Project, getProjectById } from '../../services/projectService';
import ProjectNavBar from './ProjectNavBar';
import EditProjectModal from './EditProjectModal';
import formStyles from './FormStyles.module.css';
import EstimateForm from '../navbarDocuments/EstimateForm';
import BiddingDocumentsForm from '../navbarDocuments/BiddingDocumentsForm';
import LaborComplianceForm from '../navbarDocuments/LaborComplianceForm';

import type { IndexModalProps } from './IndexModal';

interface ProjectDetailsProps {
  selectedProjectId: string | null;
  projects: Project[];
  setShowIndexModal: (show: boolean) => void;
  setSelectedProjectId: (id: string | null) => void;
  // Props for inline IndexModal
  indexFormData: IndexModalProps['indexFormData'];
  handleIndexFormChange: IndexModalProps['handleIndexFormChange'];
  handleDocumentUpload: IndexModalProps['handleDocumentUpload'];
  handleSaveIndexForm: IndexModalProps['handleSaveIndexForm'];
  uploadedDocument: IndexModalProps['uploadedDocument'];
  isProcessingDocument: IndexModalProps['isProcessingDocument'];
  documentKeywords: IndexModalProps['documentKeywords'];
  documentError: IndexModalProps['documentError'];
  handleDeleteProject: IndexModalProps['handleDeleteProject'];
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
    <h3 className="info-group-title">Project Info</h3>
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
    <h3 className="info-group-title">General Contractor</h3>
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
  onEditClick: (e: React.MouseEvent) => void;
  handleToggleProjectList: () => void;
}

const ProjectDetailsInfoGroup: React.FC<ProjectDetailsInfoProps> = ({ 
  value, 
  startDate, 
  endDate, 
  onEditClick
}) => (
  <div className="project-details-info-group">
    <div className="buttons-vertical">
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
    </div>
  </div>
);

// Main ProjectDetails component
const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  selectedProjectId,
  projects,
  setShowIndexModal,
  setSelectedProjectId,
  indexFormData,
  handleIndexFormChange,
  handleDocumentUpload,
  handleSaveIndexForm,
  uploadedDocument,
  isProcessingDocument,
  documentKeywords,
  documentError,
  handleDeleteProject,
}) => {
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [roofingTypeOpen, setRoofingTypeOpen] = useState(false);
  const [manufacturerOpen, setManufacturerOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [bidProposalOpen, setBidProposalOpen] = useState(false);
  const [bidBondOpen, setBidBondOpen] = useState(false);
  const [laborComplianceOpen, setLaborComplianceOpen] = useState(false);
  
  const [showIndexForm, setShowIndexForm] = useState<boolean>(false);
  const [showEstimateForm, setShowEstimateForm] = useState<boolean>(false);
  const [showBiddingDocumentsForm, setShowBiddingDocumentsForm] = useState<boolean>(false);
  const [showLaborComplianceForm, setShowLaborComplianceForm] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<string>('Project Index');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showProjectList, setShowProjectList] = useState<boolean>(false);
  
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
  
  // Handler for toggling project list visibility
  const handleToggleProjectList = () => {
    // Create a custom event to notify parent component
    const event = new CustomEvent('toggleProjectList', { bubbles: true });
    document.dispatchEvent(event);
    setShowProjectList(!showProjectList);
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

  
  // Handler for navigation tab change
  const handleNavTabChange = (tab: string) => {
    setActiveNavTab(tab);
  };
  
  // Handle index form toggle
  const handleIndexClick = () => {
    setShowIndexForm(prev => !prev);
    setShowEstimateForm(false);
    setShowBiddingDocumentsForm(false);
    setShowLaborComplianceForm(false);
  };
  
  // Handle estimate form toggle
  const handleEstimateClick = () => {
    setShowEstimateForm(prev => !prev);
    setShowIndexForm(false);
    setShowBiddingDocumentsForm(false);
    setShowLaborComplianceForm(false);
  };
  
  // Handle bidding documents form toggle
  const handleBiddingDocumentsClick = () => {
    setShowBiddingDocumentsForm(prev => !prev);
    setShowIndexForm(false);
    setShowEstimateForm(false);
    setShowLaborComplianceForm(false);
  };
  
  // Handle labor compliance form toggle
  const handleLaborComplianceClick = () => {
    setShowLaborComplianceForm(prev => !prev);
    setShowIndexForm(false);
    setShowEstimateForm(false);
    setShowBiddingDocumentsForm(false);
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
              onEditClick={handleEditClick} 
              handleToggleProjectList={handleToggleProjectList}
            />
          </div>
        </div>
      </div>
  
      {/* Navigation bar positioned below the project details section */}
      <div className="project-nav-container">
        <div className="navbar-with-toggle">
          {/* Toggle Project List Button */}
          <button 
            className="toggle-project-list-btn" 
            onClick={handleToggleProjectList}
            title="Toggle Project List"
          >
            {showProjectList ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          <ProjectNavBar 
            activeTab={activeNavTab}
            onTabChange={handleNavTabChange}
            onIndexClick={handleIndexClick}
            onEstimateClick={handleEstimateClick}
            onBiddingDocumentsClick={handleBiddingDocumentsClick}
            onLaborComplianceClick={handleLaborComplianceClick}
          />
        </div>
  
        {/* Inline Project Index/Info below nav bar */}
        {showIndexForm && (
          <div className={formStyles['form-container']}>
            <div>
              <h2 className={formStyles['form-title']}>Project Information Form</h2>
              <form onSubmit={e => { e.preventDefault(); handleSaveIndexForm(); }}>
                {/* Project Owner Info Section */}
                <div className="form-section">
                  <div
                    className={formStyles['section-header']}
                    onClick={() => setOwnerOpen(o => !o)}
                  >
                    <span className={formStyles['section-icon']}>{ownerOpen ? '–' : '+'}</span>
                    <h3 className={formStyles['section-title']}>Project Owner Information</h3>
                  </div>
                  {ownerOpen && (
                    <>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="ownerOfTheProject">Owner of the Project</label>
                        <input
                          type="text"
                          id="ownerOfTheProject"
                          value={indexFormData.ownerOfTheProject}
                          onChange={e => handleIndexFormChange(e, 'ownerOfTheProject')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="ownerEntityAddress">Owner Entity Address</label>
                        <textarea
                          id="ownerEntityAddress"
                          value={indexFormData.ownerEntityAddress}
                          onChange={e => handleIndexFormChange(e, 'ownerEntityAddress')}
                          className={formStyles['form-control']}
                          rows={3}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="department">Attention To or Department</label>
                        <input
                          type="text"
                          id="department"
                          value={indexFormData.department}
                          onChange={e => handleIndexFormChange(e, 'department')}
                          className={formStyles['form-control']}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Bid Deadlines Section */}
                <div className="form-section">
                  <div
                    className={formStyles['section-header']}
                    onClick={() => setBidOpen(b => !b)}
                  >
                    <span className={formStyles['section-icon']}>{bidOpen ? '–' : '+'}</span>
                    <h3 className={formStyles['section-title']}>Bid Deadlines</h3>
                  </div>
                  {bidOpen && (
                    <>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="preBidConferenceDt">Pre-Bid Conference or Job Walk Date and Times</label>
                        <input
                          type="datetime-local"
                          id="preBidConferenceDt"
                          value={indexFormData.preBidConferenceDt}
                          onChange={e => handleIndexFormChange(e, 'preBidConferenceDt')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="preBidConferenceLocation">Pre-Bid Conference Location</label>
                        <textarea
                          id="preBidConferenceLocation"
                          value={indexFormData.preBidConferenceLocation}
                          onChange={e => handleIndexFormChange(e, 'preBidConferenceLocation')}
                          className={formStyles['form-control']}
                          rows={2}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="rfiDue">Request for Information (RFI) Due</label>
                        <input
                          type="datetime-local"
                          id="rfiDue"
                          value={indexFormData.rfiDue}
                          onChange={e => handleIndexFormChange(e, 'rfiDue')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="rfsDue">Request for Substitution Form Due</label>
                        <input
                          type="datetime-local"
                          id="rfsDue"
                          value={indexFormData.rfsDue}
                          onChange={e => handleIndexFormChange(e, 'rfsDue')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="bidDue">Bid Due or Closing Date and Time</label>
                        <input
                          type="datetime-local"
                          id="bidDue"
                          value={indexFormData.bidDue}
                          onChange={e => handleIndexFormChange(e, 'bidDue')}
                          className={formStyles['form-control']}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Submission Type Section */}
                <div className="form-section">
                  <div
                    className={formStyles['section-header']}
                    onClick={() => setSubmissionOpen(s => !s)}
                  >
                    <span className={formStyles['section-icon']}>{submissionOpen ? '–' : '+'}</span>
                    <h3 className={formStyles['section-title']}>Submission Type</h3>
                  </div>
                  {submissionOpen && (
                    <>
                    <div className={formStyles['form-group']}>
                      <label className={formStyles['form-label']} htmlFor="typeOfBidSubmission">Type of Bid Submission</label>
                      <select
                        id="typeOfBidSubmission"
                        value={indexFormData.typeOfBidSubmission}
                        onChange={e => handleIndexFormChange(e, 'typeOfBidSubmission')}
                        className={formStyles['form-control']}
                      >
                        <option value="">Select submission type</option>
                        <option value="Online">Online</option>
                        <option value="In Person">In Person</option>
                        <option value="Both">Both</option>
                      </select>
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="website">Website/Portal for Digital Bid Submission</label>
                        <input
                          type="url"
                          id="website"
                          value={indexFormData.website|| ''}
                          onChange={e => handleIndexFormChange(e, 'website')}
                          className={formStyles['form-control']}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="bidDeliveryAttentionTo">Bid Delivery Attention To</label>
                        <input
                          type="text"
                          id="bidDeliveryAttentionTo"
                          value={indexFormData.bidDeliveryAttention|| ''}
                          onChange={e => handleIndexFormChange(e, 'bidDeliveryAttention')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="bidDeliveryDepartment">Bid Delivery Department</label>
                        <input
                          type="text"
                          id="bidDeliveryDepartment"
                          value={indexFormData.bidDeliveryDepartment|| ''}
                          onChange={e => handleIndexFormChange(e, 'bidDeliveryDepartment')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="bidDeliveryEntityName">Bid Delivery Entity Name</label>
                        <input
                          type="text"
                          id="bidDeliveryEntityName"
                          value={indexFormData.bidDeliveryEntityName|| ''}
                          onChange={e => handleIndexFormChange(e, 'bidDeliveryEntityName')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      <div className={formStyles['form-group']}>
                        <label className={formStyles['form-label']} htmlFor="bidDeliveryAddress">Bid Delivery Address or PO Box</label>
                        <input
                          type="text"
                          id="bidDeliveryAddress"
                          value={indexFormData.bidDeliveryDetails|| ''}
                          onChange={e => handleIndexFormChange(e, 'bidDeliveryDetails')}
                          className={formStyles['form-control']}
                        />
                      </div>
                      </>
                    )}
                  </div>
                  {/* Roofing Type Section */}
                    <div className="form-section">
                      <div
                        className={formStyles['section-header']}
                        onClick={() => setRoofingTypeOpen(b => !b)}
                      >
                        <span className={formStyles['section-icon']}>{roofingTypeOpen ? '–' : '+'}</span>
                        <h3 className={formStyles['section-title']}>Roofing Type</h3>
                      </div>
                    </div>
                     {/* Manufacturer Section */}
                    <div className="form-section">
                      <div
                        className={formStyles['section-header']}
                        onClick={() => setManufacturerOpen(b => !b)}
                      >
                        <span className={formStyles['section-icon']}>{manufacturerOpen ? '–' : '+'}</span>
                        <h3 className={formStyles['section-title']}>Manufacturer</h3>
                      </div>
                    </div>
                    {/* Bid Proposal Information */}
                    <div className="form-section">
                      <div
                        className={formStyles['section-header']}
                        onClick={() => setBidProposalOpen(b => !b)}
                      >
                        <span className={formStyles['section-icon']}>{bidProposalOpen ? '–' : '+'}</span>
                        <h3 className={formStyles['section-title']}>Bid Proposal Information</h3>
                      </div>
                    </div>
                     {/* Bid Bond Section */}
                    <div className="form-section">
                      <div
                        className={formStyles['section-header']}
                        onClick={() => setBidBondOpen(b => !b)}
                      >
                        <span className={formStyles['section-icon']}>{bidBondOpen ? '–' : '+'}</span>
                        <h3 className={formStyles['section-title']}>Bid Bond</h3>
                      </div>
                    </div>
                    {/* Labor Compliance Section */}
                    <div className="form-section">
                      <div
                        className={formStyles['section-header']}
                        onClick={() => setLaborComplianceOpen(b => !b)}
                      >
                        <span className={formStyles['section-icon']}>{laborComplianceOpen ? '–' : '+'}</span>
                        <h3 className={formStyles['section-title']}>Labor Compliance Information</h3>
                      </div>
                    </div>

                  
                {/* Document Upload */}
                <div className={formStyles['form-section']}>
                  <div className={formStyles['form-group']}>
                    <label className={formStyles['form-label']} htmlFor="documentUpload">Upload Document</label>
                    <div className={formStyles['file-input-wrapper']}>
                      <label className={formStyles['file-input-label']} htmlFor="documentUpload">Choose File</label>
                      <input
                        type="file"
                        id="documentUpload"
                        onChange={handleDocumentUpload}
                        className={formStyles['file-input']}
                      />
                    </div>
                    {uploadedDocument && <div className={formStyles['file-name']}>Selected: {uploadedDocument.name}</div>}
                    {isProcessingDocument && <div className={formStyles['file-name']}>Processing...</div>}
                    {documentError && <div className={formStyles['error-text']}>{documentError}</div>}
                  </div>
                  {documentKeywords && documentKeywords.length > 0 && (
                    <div className={formStyles['form-group']}>
                      <label className={formStyles['form-label']}>Extracted Keywords:</label>
                      <div className={formStyles['keywords-container']}>
                        {documentKeywords.map((keyword: string, index: number) => (
                          <span key={index} className={formStyles['keyword-tag']}>{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Save Button*/}
                <div className={formStyles['form-actions']}>
                  <button type="submit" className={`${formStyles['btn']} ${formStyles['btn-primary']}`}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inline Estimate Form */}
        {showEstimateForm && (
          <div className={formStyles['form-container']}>
            <div>
              <h2 className={formStyles['form-title']}>Project Estimate</h2>
              <EstimateForm projectId={selectedProjectId} onSave={() => setShowEstimateForm(false)} />
            </div>
          </div>
        )}
        
        {/* Inline Bidding Documents Form */}
        {showBiddingDocumentsForm && (
          <div className={formStyles['form-container']}>
            <div>
              <h2 className={formStyles['form-title']}>Documents</h2>
              <BiddingDocumentsForm projectId={selectedProjectId} onSave={() => setShowBiddingDocumentsForm(false)} />
            </div>
          </div>
        )}
        
        {/* Inline Labor Compliance Form */}
        {showLaborComplianceForm && (
          <div className={formStyles['form-container']}>
            <div>
              <h2 className={formStyles['form-title']}>Labor Compliance</h2>
              <LaborComplianceForm projectId={selectedProjectId} onSave={() => setShowLaborComplianceForm(false)} />
            </div>
          </div>
        )}
        
      </div>
    </>
  );
};

export default ProjectDetails;

import React from 'react';
import { FaTimes, FaFileUpload, FaTrash } from 'react-icons/fa';
import { Project, formatCurrency, formatDate } from '../../services/projectService';

export interface IndexModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  indexFormData: {
    bidNumber: string;
    nameOfProject: string;
    addressOfProject: string;
    ownerOfTheProject: string;
    ownerEntityAddress: string;
    department: string;
    preBidConferenceDt: string;
    preBidConferenceLocation: string;
    rfiDue: string;
    rfsDue: string;
    bidDue: string;
    typeOfBidSubmission: string;
    website: string;
    bidDeliveryDetails: string;
    estimatedProjectCost: string;
    startDate: string;
    duration: string;
    liquidatedDamage: string;
    laborWarranty: string;
  };
  handleIndexFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof IndexModalProps['indexFormData']) => void;
  handleDocumentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveIndexForm: () => void;
  uploadedDocument: File | null;
  isProcessingDocument: boolean;
  documentKeywords: string[];
  documentError: string | null;
  selectedProjectId: string | null;
  projects: Project[];
  handleDeleteProject: (e: React.MouseEvent, projectId: string) => void;
}

const IndexModal: React.FC<IndexModalProps> = ({
  showModal,
  setShowModal,
  indexFormData,
  handleIndexFormChange,
  handleDocumentUpload,
  handleSaveIndexForm,
  uploadedDocument,
  isProcessingDocument,
  documentKeywords,
  documentError,
  selectedProjectId,
  projects,
  handleDeleteProject
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Project Index</h2>
          <div className="modal-header-actions">
            <div className="document-upload-container">
              <input 
                type="file" 
                id="document-upload" 
                style={{ display: 'none' }} 
                onChange={handleDocumentUpload} 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
                disabled={isProcessingDocument} 
              />
              <label htmlFor="document-upload" className={`upload-button ${isProcessingDocument ? 'disabled' : ''}`}>
                {isProcessingDocument ? (<><span className="spinner"></span> Processing...</>) : (<><FaFileUpload /> Upload Document</>)}
              </label>
            </div>
            {uploadedDocument && (<span className="uploaded-filename" title={uploadedDocument.name}>{uploadedDocument.name}</span>)}
            {documentError && (<span className="document-error">{documentError}</span>)}
          </div>
          <button className="close-button" onClick={() => setShowModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body index-modal-content">
          {/* Document Keywords Section */}
          {documentKeywords.length > 0 && (
            <div className="document-keywords-container">
              <h4>Extracted Keywords</h4>
              <div className="keywords-list">
                {documentKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          )}
          
          {/* Project Database Record Section */}
          {selectedProjectId && (
            <div className="project-data-container">
              <h3>Project Database Record</h3>
              <div className="project-data-table">
                {(() => {
                  const selectedProject = projects.find(p => p.id === selectedProjectId);
                  if (!selectedProject) return <p>Project not found</p>;
                  
                  return (
                    <table className="supabase-data-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedProject).map(([key, value]) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>
                              {key === 'value' && typeof value === 'number' 
                                ? formatCurrency(value)
                                : key.includes('date') && value 
                                  ? formatDate(value as string)
                                  : String(value ?? 'N/A')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()} 
              </div>
              
              {/* Delete Project Button */}
              <div className="delete-project-container">
                <button 
                  className="delete-project-button" 
                  onClick={(e) => handleDeleteProject(e, selectedProjectId)}
                >
                  <FaTrash /> Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="save-button" onClick={handleSaveIndexForm}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexModal;

import React, { useState, useRef } from 'react';
import { FaTimes, FaFileUpload, FaTrash } from 'react-icons/fa';
import { Project, formatCurrency, formatDate, formatDateWithTime } from '../../services/projectService';

// Custom DateTimeInput component that displays dates in a user-friendly format
interface DateTimeInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({ id, value, onChange, className }) => {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Make sure we have a valid date value for the input
  const ensureValidDateValue = (val: string): string => {
    if (!val || val.trim() === '') return '';
    
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        // Return ISO string format required by datetime-local input
        return date.toISOString().slice(0, 16);
      }
    } catch (e) {
      // Silent fail - return original value
    }
    
    return val;
  };
  
  // Format the date for display
  const formattedValue = formatDateWithTime(value);
  const validDateValue = ensureValidDateValue(value);
  
  const handleClick = () => {
    setShowPicker(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.showPicker();
      }
    }, 50);
  };
  
  return (
    <div className="date-time-input-container" style={{ position: 'relative' }}>
      <input
        type="text"
        className={className}
        value={formattedValue}
        onClick={handleClick}
        readOnly
        placeholder="Click to select date and time"
      />
      {showPicker && (
        <input
          ref={inputRef}
          type="datetime-local"
          id={id}
          value={validDateValue}
          onChange={(e) => {
            onChange(e);
            setShowPicker(false);
          }}
          onBlur={() => setShowPicker(false)}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            width: '100%',
            height: '100%'
          }}
        />
      )}
    </div>
  );
};

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
    bidDeliveryAttention: string;
    bidDeliveryDepartment: string;
    bidDeliveryEntityName: string;
    estimatedProjectCost: string;
    startDate: string;
    duration: string;
    liquidatedDamage: string;
    laborWarranty: string;
  };
  handleIndexFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof IndexModalProps['indexFormData']) => void;
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
  const [activeTab, setActiveTab] = useState<string>('owner');

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Project Info</h2>
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
          
     {/* Unified Form Interface (No Tabs) */}
<div className="form-container space-y-6">
  {/* Project Owner Information */}
  <div className="form-section">
    <h3 className="section-title">Project Owner Information</h3>
    
    <div className="form-group">
      <label htmlFor="ownerOfTheProject">Owner of the Project</label>
      <input
        type="text"
        id="ownerOfTheProject"
        value={indexFormData.ownerOfTheProject}
        onChange={(e) => handleIndexFormChange(e, 'ownerOfTheProject')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="ownerEntityAddress">Owner Entity Address</label>
      <textarea
        id="ownerEntityAddress"
        value={indexFormData.ownerEntityAddress}
        onChange={(e) => handleIndexFormChange(e, 'ownerEntityAddress')}
        className="form-control"
        rows={3}
      />
    </div>

    <div className="form-group">
      <label htmlFor="department">Attention To or Department</label>
      <input
        type="text"
        id="department"
        value={indexFormData.department}
        onChange={(e) => handleIndexFormChange(e, 'department')}
        className="form-control"
      />
    </div>
  </div>

  {/* Bid Deadlines */}
  <div className="form-section">
    <h3 className="section-title">Bid Deadlines</h3>

    <div className="form-group">
      <label htmlFor="preBidConferenceDt">Pre-Bid Conference or Job Walk Date and Times</label>
      <DateTimeInput
        id="preBidConferenceDt"
        value={indexFormData.preBidConferenceDt}
        onChange={(e) => handleIndexFormChange(e, 'preBidConferenceDt')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="preBidConferenceLocation">Pre-Bid Conference Location</label>
      <textarea
        id="preBidConferenceLocation"
        value={indexFormData.preBidConferenceLocation}
        onChange={(e) => handleIndexFormChange(e, 'preBidConferenceLocation')}
        className="form-control"
        rows={2}
      />
    </div>

    <div className="form-group">
      <label htmlFor="rfiDue">Request for Information (RFI) Due</label>
      <DateTimeInput
        id="rfiDue"
        value={indexFormData.rfiDue}
        onChange={(e) => handleIndexFormChange(e, 'rfiDue')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="rfsDue">Request for Substitution Form Due</label>
      <DateTimeInput
        id="rfsDue"
        value={indexFormData.rfsDue}
        onChange={(e) => handleIndexFormChange(e, 'rfsDue')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="bidDue">Bid Due or Closing Date and Time</label>
      <DateTimeInput
        id="bidDue"
        value={indexFormData.bidDue}
        onChange={(e) => handleIndexFormChange(e, 'bidDue')}
        className="form-control"
      />
    </div>
  </div>

  {/* Submission Type */}
  <div className="form-section">
    <h3 className="section-title">Submission Type</h3>

    <div className="form-group">
      <label htmlFor="typeOfBidSubmission">Type of Bid Submission</label>
      <select
        id="typeOfBidSubmission"
        value={indexFormData.typeOfBidSubmission}
        onChange={(e) => handleIndexFormChange(e, 'typeOfBidSubmission')}
        className="form-control"
      >
        <option value="">Select submission type</option>
        <option value="Online">Online</option>
        <option value="In Person">In Person</option>
        <option value="Both">Both</option>
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="website">Website/Portal for Digital Bid Submission</label>
      <input
        type="url"
        id="website"
        value={indexFormData.website}
        onChange={(e) => handleIndexFormChange(e, 'website')}
        className="form-control"
        placeholder="https://"
      />
    </div>

    <div className="form-group">
      <label htmlFor="bidDeliveryAttention">Bid Delivery Attention To</label>
      <input
        type="text"
        id="bidDeliveryAttention"
        value={indexFormData.bidDeliveryAttention || ''}
        onChange={(e) => handleIndexFormChange(e, 'bidDeliveryAttention')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="bidDeliveryDepartment">Bid Delivery Department</label>
      <input
        type="text"
        id="bidDeliveryDepartment"
        value={indexFormData.bidDeliveryDepartment || ''}
        onChange={(e) => handleIndexFormChange(e, 'bidDeliveryDepartment')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="bidDeliveryEntityName">Bid Delivery Entity Name</label>
      <input
        type="text"
        id="bidDeliveryEntityName"
        value={indexFormData.bidDeliveryEntityName || ''}
        onChange={(e) => handleIndexFormChange(e, 'bidDeliveryEntityName')}
        className="form-control"
      />
    </div>

    <div className="form-group">
      <label htmlFor="bidDeliveryDetails">Bid Delivery Address or PO Box</label>
      <textarea
        id="bidDeliveryDetails"
        value={indexFormData.bidDeliveryDetails}
        onChange={(e) => handleIndexFormChange(e, 'bidDeliveryDetails')}
        className="form-control"
        rows={3}
      />
    </div>
  </div>
</div>

          
          {/* Clear Fields Button */}
          <div className="delete-project-container">
            <button 
              className="delete-project-button" 
              onClick={() => {
                // Only clear the form fields locally without affecting the database
                // We'll create a temporary event handler that doesn't persist changes
                const clearFormFields = () => {
                  const formInputs = document.querySelectorAll('.index-modal-content input, .index-modal-content textarea, .index-modal-content select');
                  formInputs.forEach((input: Element) => {
                    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
                      input.value = '';
                    }
                  });
                };
                
                // Clear the visual form fields
                clearFormFields();
                
                // Show confirmation to the user
                alert('Form fields cleared. Changes will not be saved unless you click the Save button.');
              }}
            >
              <FaTrash /> Clear All Fields
            </button>
          </div>
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

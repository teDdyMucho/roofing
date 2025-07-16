import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import { Project, updateProject } from '../../services/projectService';
import { supabase } from '../../lib/supabase';

interface EditProjectModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  showModal,
  setShowModal,
  project,
  onProjectUpdate
}) => {
  // State for form fields
  const [formData, setFormData] = useState({
    // User Info fields
    client: project.client || '',
    phone: project.phone || '',
    email: project.email || '',
    mailing: project.mailing || '',
    billing: project.billing || '',
    
    // Location Info fields
    address: project.address || '',
    category: project.category || '',
    workType: project.workType || '',
    trade: project.trade || '',
    leadSource: project.leadSource || ''
  });
  
  // State for form validation
  const [validation, setValidation] = useState({
    email: true,
    phone: true
  });
  
  // State for tracking unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for loading status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // State for real-time updates
  const [realtimeProject, setRealtimeProject] = useState<Project | null>(null);
  
  // Initialize form data when modal opens
  useEffect(() => {
    if (showModal) {
      // Initialize form data only once when the modal opens
      setFormData({
        client: project.client || '',
        phone: project.phone || '',
        email: project.email || '',
        mailing: project.mailing || '',
        billing: project.billing || '',
        address: project.address || '',
        category: project.category || '',
        workType: project.workType || '',
        trade: project.trade || '',
        leadSource: project.leadSource || ''
      });
      setError(null);
      setSuccessMessage(null);
      setHasUnsavedChanges(false);
      setShowConfirmation(false);
    }
  }, [showModal, project]); // Include the entire project object to properly update when it changes
  
  // Set up real-time subscription separately
  useEffect(() => {
    if (showModal) {
      // Set up real-time subscription
      const subscription = supabase
        .channel(`project-${project.id}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${project.id}` },
          (payload) => {
            console.log('Real-time update received:', payload);
            // Update the real-time project data
            setRealtimeProject(payload.new as Project);
            
            // Only show notification if this update wasn't triggered by the current user
            if (!isSubmitting) {
              setSuccessMessage('Project was updated in real-time by another user');
              
              // Don't automatically update form data while user is editing
              // This prevents disrupting the user's current edits
            }
          }
        )
        .subscribe();
      
      // Clean up subscription when modal closes
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [showModal, project.id, isSubmitting]);
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Empty email is valid (not required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate phone format
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Empty phone is valid (not required)
    const phoneRegex = /^[\d\s\-()+]+$/;
    return phoneRegex.test(phone);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data immediately
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Track unsaved changes
    setHasUnsavedChanges(true);
    
    // Clear any previous error messages when user starts typing
    setError(null);
    
    // Validate specific fields
    if (name === 'email') {
      // Only validate email if it's not empty
      if (value.trim() !== '') {
        setValidation(prev => ({
          ...prev,
          email: validateEmail(value)
        }));
      } else {
        // Empty email is considered valid
        setValidation(prev => ({
          ...prev,
          email: true
        }));
      }
    } else if (name === 'phone') {
      // Only validate phone if it's not empty
      if (value.trim() !== '') {
        setValidation(prev => ({
          ...prev,
          phone: validatePhone(value)
        }));
      } else {
        // Empty phone is considered valid
        setValidation(prev => ({
          ...prev,
          phone: true
        }));
      }
    }
  };

  // Handle pre-submission validation
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);
    
    setValidation({
      email: isEmailValid,
      phone: isPhoneValid
    });
    
    // If validation fails, stop submission
    if (!isEmailValid || !isPhoneValid) {
      setError('Please correct the validation errors before submitting.');
      return;
    }
    
    // If no changes were made, inform the user
    if (!hasUnsavedChanges) {
      setError('No changes detected. Please make changes before saving.');
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  // Handle actual form submission after confirmation
  const handleSubmit = async (confirmed: boolean) => {
    if (!confirmed) {
      setShowConfirmation(false);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setShowConfirmation(false);
    
    try {
      // Update project in database
      const updatedProject = await updateProject(project.id, formData);
      
      // Reset submission state
      setIsSubmitting(false);
      setHasUnsavedChanges(false);
      
      // Immediately close the modal
      setShowModal(false);
      
      // Immediately notify parent component to refresh the UI with updated data
      onProjectUpdate(updatedProject);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle modal close with confirmation if there are unsaved changes
  const handleCloseModal = () => {
    // Clear any errors or success messages
    setError(null);
    setSuccessMessage(null);
    
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setShowModal(false);
      }
    } else {
      setShowModal(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      {showConfirmation && (
        <div className="confirmation-dialog">
          <div className="confirmation-header">
            <FaExclamationTriangle className="confirmation-icon" />
            <h3>Confirm Update</h3>
          </div>
          <p>Are you sure you want to update this project with your changes?</p>
          <div className="confirmation-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => handleSubmit(false)}
            >
              No
            </button>
            <button 
              type="button" 
              className="save-button" 
              onClick={() => handleSubmit(true)}
            >
              Yes
            </button>
          </div>
        </div>
      )}
      <div className="modal-content">
        
        <div className="modal-header">
          <h2>Edit Project Details</h2>
          <button className="close-button" onClick={handleCloseModal}>
            <FaTimes />
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {realtimeProject && !successMessage && (
          <div className="update-notification">
            This project has been updated in real-time by another user.
            <button 
              type="button" 
              className="refresh-button" 
              onClick={() => {
                // Update form with the latest data from the server
                if (realtimeProject) {
                  setFormData({
                    client: realtimeProject.client || '',
                    phone: realtimeProject.phone || '',
                    email: realtimeProject.email || '',
                    mailing: realtimeProject.mailing || '',
                    billing: realtimeProject.billing || '',
                    address: realtimeProject.address || '',
                    category: realtimeProject.category || '',
                    workType: realtimeProject.workType || '',
                    trade: realtimeProject.trade || '',
                    leadSource: realtimeProject.leadSource || ''
                  });
                  setHasUnsavedChanges(false);
                  setRealtimeProject(null);
                }
              }}
            >
              Load Latest Data
            </button>
          </div>
        )}
        
        <form onSubmit={handlePreSubmit}>
          <div className="modal-body">
            {/* User Info Section */}
            <div className="modal-section">
              <h3>User Info</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="client">Client Name</label>
                  <input 
                    type="text" 
                    id="client" 
                    name="client" 
                    value={formData.client} 
                    onChange={handleInputChange} 
                    placeholder="Client name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleInputChange} 
                    placeholder="Phone number"
                    className={!validation.phone ? 'input-error' : ''}
                  />
                  {!validation.phone && (
                    <div className="field-error-message">Please enter a valid phone number</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email || ''} 
                    onChange={handleInputChange} 
                    placeholder="Email address"
                    className={!validation.email ? 'input-error' : ''}
                  />
                  {!validation.email && (
                    <div className="field-error-message">Please enter a valid email address</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="mailing">Mailing Address</label>
                  <input 
                    type="text" 
                    id="mailing" 
                    name="mailing" 
                    value={formData.mailing || ''} 
                    onChange={handleInputChange} 
                    placeholder="Mailing address"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="billing">Billing Address</label>
                  <input 
                    type="text" 
                    id="billing" 
                    name="billing" 
                    value={formData.billing || ''} 
                    onChange={handleInputChange} 
                    placeholder="Billing address"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-section-divider"></div>
            
            {/* Location Info Section */}
            <div className="modal-section">
              <h3>Location Info</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="address">Project Address</label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Project address"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input 
                    type="text" 
                    id="category" 
                    name="category" 
                    value={formData.category || ''} 
                    onChange={handleInputChange} 
                    placeholder="Project category"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="workType">Work Type</label>
                  <input 
                    type="text" 
                    id="workType" 
                    name="workType" 
                    value={formData.workType || ''} 
                    onChange={handleInputChange} 
                    placeholder="Type of work"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="trade">Trade</label>
                  <input 
                    type="text" 
                    id="trade" 
                    name="trade" 
                    value={formData.trade || ''} 
                    onChange={handleInputChange} 
                    placeholder="Trade"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="leadSource">Lead Source</label>
                  <input 
                    type="text" 
                    id="leadSource" 
                    name="leadSource" 
                    value={formData.leadSource || ''} 
                    onChange={handleInputChange} 
                    placeholder="Lead source"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button" 
              disabled={isSubmitting || !validation.email || !validation.phone}
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <FaSave className="button-icon-left" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;

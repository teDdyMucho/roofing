import React, { useState } from 'react';
import formStyles from '../Dashboard/FormStyles.module.css';
import { FaImages, FaPlus, FaMinus } from 'react-icons/fa';

interface PhotosFormProps {
  projectId: string;
  onSave?: () => void;
}

const PhotosForm: React.FC<PhotosFormProps> = ({ projectId, onSave }) => {
  // State for collapsible sections
  const [beforeWorkSectionOpen, setBeforeWorkSectionOpen] = useState(true);
  const [duringWorkSectionOpen, setDuringWorkSectionOpen] = useState(false);
  const [afterWorkSectionOpen, setAfterWorkSectionOpen] = useState(false);
  const [additionalPhotosSectionOpen, setAdditionalPhotosSectionOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave();
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.formContainer}>      
      {/* Before Work Photos Section */}
      <div className={formStyles['form-section']}>
        <div
          className={formStyles['section-header']}
          onClick={() => setBeforeWorkSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>
            {beforeWorkSectionOpen ? <FaMinus /> : <FaPlus />}
          </span>
          <h3 className={formStyles['section-title']}>Before Work Photos</h3>
        </div>
        
        {beforeWorkSectionOpen && (
          <div className={formStyles['section-content']} style={{ maxHeight: 'unset', opacity: 1, transform: 'none' }}>
            <div className={formStyles['document-upload-area']}>
              <div className={formStyles['upload-icon']}>📷</div>
              <div className={formStyles['upload-text']}>
                <p>Drag and drop before work photos here</p>
                <span>or click to browse files</span>
              </div>
            </div>
            
            <div className={formStyles['document-list']}>
              {/* Photo items would be mapped here */}
            </div>
          </div>
        )}
      </div>

      {/* During Work Photos Section */}
      <div className={formStyles['form-section']}>
        <div
          className={formStyles['section-header']}
          onClick={() => setDuringWorkSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>
            {duringWorkSectionOpen ? <FaMinus /> : <FaPlus />}
          </span>
          <h3 className={formStyles['section-title']}>During Work Photos</h3>
        </div>
        
        {duringWorkSectionOpen && (
          <div className={formStyles['section-content']} style={{ maxHeight: 'unset', opacity: 1, transform: 'none' }}>
            <div className={formStyles['document-upload-area']}>
              <div className={formStyles['upload-icon']}>📷</div>
              <div className={formStyles['upload-text']}>
                <p>Drag and drop during work photos here</p>
                <span>or click to browse files</span>
              </div>
            </div>
            
            <div className={formStyles['document-list']}>
              {/* Photo items would be mapped here */}
            </div>
          </div>
        )}
      </div>

      {/* After Work Photos Section */}
      <div className={formStyles['form-section']}>
        <div
          className={formStyles['section-header']}
          onClick={() => setAfterWorkSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>
            {afterWorkSectionOpen ? <FaMinus /> : <FaPlus />}
          </span>
          <h3 className={formStyles['section-title']}>After Work Photos</h3>
        </div>
        
        {afterWorkSectionOpen && (
          <div className={formStyles['section-content']} style={{ maxHeight: 'unset', opacity: 1, transform: 'none' }}>
            <div className={formStyles['document-upload-area']}>
              <div className={formStyles['upload-icon']}>📷</div>
              <div className={formStyles['upload-text']}>
                <p>Drag and drop after work photos here</p>
                <span>or click to browse files</span>
              </div>
            </div>
            
            <div className={formStyles['document-list']}>
              {/* Photo items would be mapped here */}
            </div>
          </div>
        )}
      </div>

      {/* Additional Photos Section */}
      <div className={formStyles['form-section']}>
        <div
          className={formStyles['section-header']}
          onClick={() => setAdditionalPhotosSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>
            {additionalPhotosSectionOpen ? <FaMinus /> : <FaPlus />}
          </span>
          <h3 className={formStyles['section-title']}>Additional Photos</h3>
        </div>
        
        {additionalPhotosSectionOpen && (
          <div className={formStyles['section-content']} style={{ maxHeight: 'unset', opacity: 1, transform: 'none' }}>
            <div className={formStyles['document-upload-area']}>
              <div className={formStyles['upload-icon']}>📷</div>
              <div className={formStyles['upload-text']}>
                <p>Drag and drop additional photos here</p>
                <span>or click to browse files</span>
              </div>
            </div>
            
            <div className={formStyles['document-list']}>
              {/* Photo items would be mapped here */}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className={formStyles['form-actions']}>
        <button type="submit" className={`${formStyles.btn} ${formStyles['btn-primary']}`}>
          Save Photos
        </button>
      </div>
    </form>
  );
};

export default PhotosForm;
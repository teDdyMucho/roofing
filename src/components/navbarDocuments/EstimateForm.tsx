import React, { useState } from 'react';
import formStyles from '../Dashboard/FormStyles.module.css';

interface EstimateFormProps {
  projectId: string;
  onSave?: () => void;
}

const EstimateForm: React.FC<EstimateFormProps> = ({ projectId, onSave }) => {
  // State for collapsible sections
  const [costSectionOpen, setCostSectionOpen] = useState(true);
  const [timelineSectionOpen, setTimelineSectionOpen] = useState(false);
  const [notesSectionOpen, setNotesSectionOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave();
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.formWrapper}>
        
      {/* Documents & Job Walk Photos & Notes Section - Always visible */}
        <div className={formStyles['document-section']}>
          <div className={formStyles['document-upload-area']}>
            <div className={formStyles['document-upload-icon']}>📁</div>
            <div className={formStyles['document-upload-text']}>Documents & Job Walk Photos & Notes</div>
          </div>
        </div>
      
      {/* Type of Roofing Section */}
      <div className="form-section">
        <div
          className={formStyles['section-header']}
          onClick={() => setCostSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>{costSectionOpen ? '–' : '+'}</span>
          <h3 className={formStyles['section-title']}>Type of Roofing</h3>
        </div>
      </div>

      {/* Layers of Roofing & Materials of Roofing Section */}
      <div className="form-section">
        <div
          className={formStyles['section-header']}
          onClick={() => setTimelineSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>{timelineSectionOpen ? '–' : '+'}</span>
          <h3 className={formStyles['section-title']}>Layers of Roofing & Materials of Roofing</h3>
        </div>
      </div>

      {/* Estimate Section */}
      <div className="form-section">
        <div
          className={formStyles['section-header']}
          onClick={() => setNotesSectionOpen(prev => !prev)}
        >
          <span className={formStyles['section-icon']}>{notesSectionOpen ? '–' : '+'}</span>
          <h3 className={formStyles['section-title']}>Estimate</h3>
        </div>
      </div>
    </form>
  );
};

export default EstimateForm;

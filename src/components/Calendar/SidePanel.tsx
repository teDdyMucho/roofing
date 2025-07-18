import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/CalendarTypes';
import './SidePanel.css';

interface SidePanelProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  event: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  mode,
  event,
  onSave,
  onDelete,
  onClose
}) => {
  const [formData, setFormData] = useState<CalendarEvent>(event || {
    id: '',
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    location: '',
    allDay: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle date/time changes
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'start' || name === 'end') {
      // Parse the YYYY-MM-DD format correctly to avoid timezone issues
      const [year, month, day] = value.split('-').map(num => parseInt(num));
      // Create date using local timezone (month is 0-indexed in JS Date)
      const date = new Date(year, month - 1, day);
      
      setFormData({
        ...formData,
        [name]: date
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.start) {
      newErrors.start = 'Start date/time is required';
    }
    
    if (!formData.end) {
      newErrors.end = 'End date/time is required';
    } else if (formData.end < formData.start) {
      newErrors.end = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Handle event deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(formData.id);
    }
  };

  // Format date for date input (without time) - ensuring correct local date is used
  const formatDateForInput = (date: Date): string => {
    // Format as YYYY-MM-DD using local date values to prevent timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if this is a project event
  const isProjectEvent = formData.id?.toString().startsWith('project-');

  return (
    <div className={`side-panel-overlay ${isOpen ? 'open' : ''}`}>
      <div className="side-panel">
        <div className="side-panel-header">
          <h3>
            {isProjectEvent ? 'Project Details' : 
             mode === 'add' ? 'Add Event' : 'Edit Event'}
          </h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {isProjectEvent && formData.project && (
          <div className="project-info">
            <h4>Project Information</h4>
            <div className="project-info-item">
              <span className="project-info-label">Client:</span>
              <span className="project-info-value">{formData.project.client}</span>
            </div>
            <div className="project-info-item">
              <span className="project-info-label">Status:</span>
              <span className="project-info-value">{formData.project.status}</span>
            </div>
            <div className="project-info-item">
              <span className="project-info-label">Address:</span>
              <span className="project-info-value">{formData.project.address}</span>
            </div>
            {formData.project.value && (
              <div className="project-info-item">
                <span className="project-info-label">Value:</span>
                <span className="project-info-value">${formData.project.value.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Project*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              disabled={isProjectEvent}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="start">Start Date*</label>
            <input
              type="date"
              id="start"
              name="start"
              value={formatDateForInput(formData.start)}
              onChange={handleDateTimeChange}
              className={errors.start ? 'error' : ''}
              disabled={isProjectEvent}
            />
            {errors.start && <span className="error-message">{errors.start}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="end">End Date*</label>
            <input
              type="date"
              id="end"
              name="end"
              value={formatDateForInput(formData.end)}
              onChange={handleDateTimeChange}
              className={errors.end ? 'error' : ''}
              disabled={isProjectEvent}
            />
            {errors.end && <span className="error-message">{errors.end}</span>}
          </div>
          
          {!isProjectEvent && (
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="allDay"
                name="allDay"
                checked={formData.allDay || false}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="allDay">All Day Event</label>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              disabled={isProjectEvent}
            />
          </div>
          
          {!isProjectEvent && (
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
              />
            </div>
          )}
          
          {!isProjectEvent && (
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color || '#3174ad'}
                onChange={handleChange}
              />
            </div>
          )}
          
          <div className="form-actions">
            {mode === 'edit' && !isProjectEvent && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            
            <div>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                style={{ marginRight: '8px' }}
              >
                Cancel
              </button>
              
              {!isProjectEvent && (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {mode === 'add' ? 'Add Event' : 'Update Event'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SidePanel;

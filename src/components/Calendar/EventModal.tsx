import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/CalendarTypes';
import './EventModal.css';

interface EventModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  event: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  mode,
  event,
  onSave,
  onDelete,
  onClose
}) => {
  const [formData, setFormData] = useState<CalendarEvent>(event);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update form data when event prop changes
  useEffect(() => {
    setFormData(event);
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
      setFormData({
        ...formData,
        [name]: new Date(value)
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

  if (!isOpen) return null;

  // Format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <div className="event-modal-header">
          <h3>{mode === 'add' ? 'Add Event' : 'Edit Event'}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="start">Start Date/Time*</label>
            <input
              type="datetime-local"
              id="start"
              name="start"
              value={formatDateForInput(formData.start)}
              onChange={handleDateTimeChange}
              className={errors.start ? 'error' : ''}
            />
            {errors.start && <span className="error-message">{errors.start}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="end">End Date/Time*</label>
            <input
              type="datetime-local"
              id="end"
              name="end"
              value={formatDateForInput(formData.end)}
              onChange={handleDateTimeChange}
              className={errors.end ? 'error' : ''}
            />
            {errors.end && <span className="error-message">{errors.end}</span>}
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>
          
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
          
          <div className="form-actions">
            <button type="submit" className="save-button">
              {mode === 'add' ? 'Add Event' : 'Update Event'}
            </button>
            
            {mode === 'edit' && (
              <button 
                type="button" 
                className="delete-button" 
                onClick={handleDelete}
              >
                Delete Event
              </button>
            )}
            
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;

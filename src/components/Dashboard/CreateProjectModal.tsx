import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface CreateProjectModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  newProject: {
    name: string;
    client: string;
    address: string;
    start_date: string;
    end_date: string;
    value: string;
  };
  handleNewProjectChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateProject: (e: React.FormEvent) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  showModal,
  setShowModal,
  newProject,
  handleNewProjectChange,
  handleCreateProject
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-button" onClick={() => setShowModal(false)}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input 
              type="text" 
              id="project-name" 
              name="name" 
              value={newProject.name} 
              onChange={handleNewProjectChange} 
              placeholder="Enter project name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="project-client">Client</label>
            <input 
              type="text" 
              id="project-client" 
              name="client" 
              value={newProject.client} 
              onChange={handleNewProjectChange} 
              placeholder="Client name or company" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="project-address">Address</label>
            <input 
              type="text" 
              id="project-address" 
              name="address" 
              value={newProject.address} 
              onChange={handleNewProjectChange} 
              placeholder="Full project address" 
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project-start-date">Start Date</label>
              <input 
                type="date" 
                id="project-start-date" 
                name="start_date" 
                value={newProject.start_date} 
                onChange={handleNewProjectChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="project-end-date">End Date</label>
              <input 
                type="date" 
                id="project-end-date" 
                name="end_date" 
                value={newProject.end_date} 
                onChange={handleNewProjectChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="project-value">Value ($)</label>
            <input 
              type="text" 
              id="project-value" 
              name="value" 
              value={newProject.value} 
              onChange={handleNewProjectChange} 
              placeholder="e.g., 5,000" 
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;

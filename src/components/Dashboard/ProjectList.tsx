import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Project, formatCurrency } from '../../services/projectService';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  projectStatusFilter: string;
  handleProjectClick: (projectId: string) => void;
  handleDeleteProject: (e: React.MouseEvent, projectId: string) => void;
  setShowCreateProjectForm: (show: boolean) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  projectStatusFilter,
  handleProjectClick,
  handleDeleteProject,
  setShowCreateProjectForm
}) => {
  return (
    <div className="projects-sidebar">
      <div className="projects-sidebar-header">
        <h3>Projects List</h3>
      </div>
      
      <div className="projects-list-sidebar">
        {projects
          .filter(project => projectStatusFilter === 'Bidding' || project.status === projectStatusFilter)
          .map((project) => (
          <div 
            key={project.id} 
            className={`project-item ${project.id === selectedProjectId ? 'active' : ''}`}
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="project-item-header">
              <h4>{project.client}</h4>
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            <p className="project-address">{project.address}</p>
            <div className="project-footer">
              <p className="project-value">{formatCurrency(project.value)}</p>
              <button 
                className="delete-project-btn" 
                onClick={(e) => handleDeleteProject(e, project.id)}
                title="Delete Project"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="create-project-footer">
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateProjectForm(true)}
        >
          <FaPlus /> Create New Project
        </button>
      </div>
    </div>
  );
};

export default ProjectList;

import React, { useState, useRef, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChevronRight, FaCircle, FaListUl } from 'react-icons/fa';
import ProjectChat from './ProjectChat';
import ProjectTeamPanel from './ProjectTeamPanel';
import '../styles/ProjectsList.css';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  lastActive?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  address: string;
  status: string;
  startDate: string;
  endDate?: string;
  value: number;
  progress: number;
  teamMembers: TeamMember[];
}

const ProjectsList: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [indexWindowOpen, setIndexWindowOpen] = useState<string | null>(null);
  const indexWindowRef = useRef<HTMLDivElement>(null);
  
  // Mock data for projects
  const projects: Project[] = [
    {
      id: '1',
      name: 'Johnson Residence Roof Replacement',
      client: 'Robert Johnson',
      address: '123 Oak Street, Springfield, IL',
      status: 'In Progress',
      startDate: '2025-06-15',
      endDate: '2025-07-10',
      value: 12500,
      progress: 60,
      teamMembers: [
        { id: '101', name: 'Sarah Johnson', role: 'Project Manager', status: 'online' },
        { id: '102', name: 'Michael Chen', role: 'Roofing Specialist', status: 'online' },
        { id: '103', name: 'David Rodriguez', role: 'Estimator', status: 'away', lastActive: '15 min ago' },
        { id: '104', name: 'Robert Wilson', role: 'Installation Lead', status: 'offline', lastActive: '2 hours ago' }
      ]
    },
    {
      id: '2',
      name: 'Smith Commercial Building',
      client: 'Smith Enterprises',
      address: '456 Pine Avenue, Springfield, IL',
      status: 'In Progress',
      startDate: '2025-06-20',
      endDate: '2025-07-25',
      value: 28750,
      progress: 35,
      teamMembers: [
        { id: '101', name: 'Sarah Johnson', role: 'Project Manager', status: 'online' },
        { id: '105', name: 'Emily Taylor', role: 'Customer Service', status: 'online' },
        { id: '106', name: 'Jessica Martinez', role: 'Admin Assistant', status: 'online' },
        { id: '107', name: 'Thomas Wright', role: 'Roofing Specialist', status: 'offline', lastActive: '1 day ago' }
      ]
    },
    {
      id: '3',
      name: 'Downtown Office Complex',
      client: 'Metro Business Group',
      address: '101 Main Street, Springfield, IL',
      status: 'In Progress',
      startDate: '2025-06-10',
      endDate: '2025-08-05',
      value: 34200,
      progress: 45,
      teamMembers: [
        { id: '102', name: 'Michael Chen', role: 'Roofing Specialist', status: 'online' },
        { id: '108', name: 'James Wilson', role: 'Project Manager', status: 'away', lastActive: '30 min ago' },
        { id: '109', name: 'Lisa Thompson', role: 'Safety Inspector', status: 'offline', lastActive: '3 hours ago' }
      ]
    },
    {
      id: '4',
      name: 'Garcia Family Residence',
      client: 'Maria Garcia',
      address: '789 Maple Drive, Springfield, IL',
      status: 'In Progress',
      startDate: '2025-06-25',
      endDate: '2025-07-05',
      value: 8900,
      progress: 80,
      teamMembers: [
        { id: '103', name: 'David Rodriguez', role: 'Estimator', status: 'away', lastActive: '15 min ago' },
        { id: '104', name: 'Robert Wilson', role: 'Installation Lead', status: 'offline', lastActive: '2 hours ago' },
        { id: '110', name: 'Anna Kim', role: 'Customer Service', status: 'online' }
      ]
    },
    {
      id: '5',
      name: 'Lakeside Apartments',
      client: 'Lakeside Property Management',
      address: '555 Lake View Road, Springfield, IL',
      status: 'In Progress',
      startDate: '2025-06-05',
      endDate: '2025-07-30',
      value: 42500,
      progress: 50,
      teamMembers: [
        { id: '101', name: 'Sarah Johnson', role: 'Project Manager', status: 'online' },
        { id: '102', name: 'Michael Chen', role: 'Roofing Specialist', status: 'online' },
        { id: '111', name: 'Carlos Mendez', role: 'Installation Lead', status: 'online' },
        { id: '112', name: 'Patricia Lee', role: 'Safety Inspector', status: 'away', lastActive: '45 min ago' }
      ]
    }
  ];
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProject(null);
    setIndexWindowOpen(null);
  };

  const handleIndexButtonClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setIndexWindowOpen(prevId => prevId === projectId ? null : projectId);
  };

  // Close index window when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (indexWindowRef.current && !indexWindowRef.current.contains(event.target as Node)) {
        setIndexWindowOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'in progress':
        return '#2196f3';
      case 'scheduled':
        return '#ff9800';
      case 'estimate':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };
  
  return (
    <div className="projects-container">
      {viewMode === 'list' ? (
        <>
          <div className="projects-header">
            <h2>Ongoing Projects</h2>
            <p>Click on a project to view details and team chat</p>
          </div>
          <div className="projects-list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="project-card" 
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <div className="header-right">
                    <div className="project-status">
                      <FaCircle style={{ color: getStatusColor(project.status) }} />
                      <span>{project.status}</span>
                    </div>
                    <div className="header-value-container">
                      <div className="header-value">{formatCurrency(project.value)}</div>
                      <button 
                        className="index-button" 
                        onClick={(e) => handleIndexButtonClick(e, project.id)}
                        aria-label="Project Index"
                      >
                        <FaListUl />
                      </button>
                      {indexWindowOpen === project.id && (
                        <div className="floating-index-window" ref={indexWindowRef}>
                          <h4>Project Index</h4>
                          <ul>
                            <li><a href="#overview">Overview</a></li>
                            <li><a href="#timeline">Timeline</a></li>
                            <li><a href="#budget">Budget</a></li>
                            <li><a href="#team">Team Members</a></li>
                            <li><a href="#documents">Documents</a></li>
                            <li><a href="#photos">Photos</a></li>
                            <li><a href="#notes">Notes</a></li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="project-details">
                  <div className="project-client">
                    <strong>Client:</strong> {project.client}
                  </div>
                  <div className="project-address">
                    <FaMapMarkerAlt /> {project.address}
                  </div>
                  <div className="project-dates">
                    <FaCalendarAlt /> {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                  </div>
                </div>
                
                <div className="project-footer">
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span>{project.progress}% Complete</span>
                  </div>
                  <div className="project-team">
                    <FaUsers /> {project.teamMembers.length} team members
                    <FaChevronRight className="view-details-icon" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        selectedProject ? (
          <div className="project-detail-view">
            <div className="detail-header">
              <button className="back-button" onClick={handleBackToList}>
                ← Back to Projects
              </button>
              <div className="detail-header-left">
                <h2>{selectedProject.name}</h2>
                <div className="project-status detail-status">
                  <FaCircle style={{ color: getStatusColor(selectedProject.status) }} />
                  <span>{selectedProject.status}</span>
                </div>
              </div>
              <div className="header-value-container">
                <div className="header-value">{formatCurrency(selectedProject.value)}</div>
                <button 
                  className="index-button" 
                  onClick={(e) => handleIndexButtonClick(e, selectedProject.id)}
                  aria-label="Project Index"
                >
                  <FaListUl />
                </button>
                {indexWindowOpen === selectedProject.id && (
                  <div className="floating-index-window detail-view" ref={indexWindowRef}>
                    <h4>Project Index</h4>
                    <ul>
                      <li><a href="#overview">Overview</a></li>
                      <li><a href="#timeline">Timeline</a></li>
                      <li><a href="#budget">Budget</a></li>
                      <li><a href="#team">Team Members</a></li>
                      <li><a href="#documents">Documents</a></li>
                      <li><a href="#photos">Photos</a></li>
                      <li><a href="#notes">Notes</a></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="project-detail-content">
              <div className="project-info-panel">
                <div className="info-section">
                  <h3>Project Details</h3>
                  <div className="info-grid">
                    <div>
                      <strong>Client:</strong> {selectedProject.client}
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedProject.address}
                    </div>
                    <div>
                      <strong>Start Date:</strong> {formatDate(selectedProject.startDate)}
                    </div>
                    <div>
                      <strong>End Date:</strong> {selectedProject.endDate ? formatDate(selectedProject.endDate) : 'TBD'}
                    </div>
                    <div className="full-width">
                      <strong>Progress:</strong>
                      <div className="detail-progress-container">
                        <div 
                          className="detail-progress-bar" 
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                        <span>{selectedProject.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h3>Team Members</h3>
                  <div className="team-members-count">
                    <FaUsers /> {selectedProject.teamMembers.length} Members
                  </div>
                </div>
              </div>
              
              <div className="project-chat-container">
                <ProjectChat projectId={selectedProject.id} projectName={selectedProject.name} />
              </div>
              
              <div className="project-team-container">
                <ProjectTeamPanel teamMembers={selectedProject.teamMembers} />
              </div>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default ProjectsList;

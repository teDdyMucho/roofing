import React from 'react';
import { FaUser, FaCircle } from 'react-icons/fa';
import '../styles/ProjectTeamPanel.css';

// Interface for team member data
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastActive?: string;
}

// Interface for component props
interface ProjectTeamPanelProps {
  projectId?: string;
  teamMembers: TeamMember[];
}

const ProjectTeamPanel: React.FC<ProjectTeamPanelProps> = ({ projectId, teamMembers }) => {
  // Force re-render to ensure component is displayed
  React.useEffect(() => {
    console.log('ProjectTeamPanel mounted with', teamMembers.length, 'members');
  }, [teamMembers.length]);
  // Get status color based on member status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'var(--success)';
      case 'away':
        return 'var(--warning)';
      case 'offline':
        return 'var(--gray-400)';
      default:
        return 'var(--gray-400)';
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  console.log('Rendering ProjectTeamPanel with', teamMembers.length, 'members');
  
  return (
    <div className="project-team-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <h3>Team Members</h3>
        <span className="member-count">{teamMembers.length} members</span>
      </div>
      
      <div className="team-members-list" style={{ flex: 1, overflowY: 'auto' }}>
        {teamMembers.map(member => (
          <div key={member.id} className="team-member">
            <div className="member-avatar">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(member.name)}
                </div>
              )}
              <span 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(member.status) }}
                title={`${member.status.charAt(0).toUpperCase() + member.status.slice(1)}`}
              />
            </div>
            <div className="member-info">
              <h4>{member.name}</h4>
              <p>{member.role}</p>
              {member.status !== 'online' && member.lastActive && (
                <span className="last-active">Last active: {member.lastActive}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTeamPanel;

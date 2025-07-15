import React from 'react';

// Define the project status data structure
interface ProjectStatusData {
  label: string;
  value: string | number;
  onClick?: () => void;
}

interface ProjectStatusTabsProps {
  projectStatusFilter: string;
  setProjectStatusFilter: (status: string) => void;
}

const ProjectStatusTabs: React.FC<ProjectStatusTabsProps> = ({
  projectStatusFilter,
  setProjectStatusFilter
}) => {
  // Define status cards data
  const statusCards: ProjectStatusData[] = [
    {
      label: 'Bidding',
      value: 12,
      onClick: () => setProjectStatusFilter('Bidding')
    },
    {
      label: 'Awarded',
      value: 8,
      onClick: () => setProjectStatusFilter('Awarded')
    },
    {
      label: 'Open',
      value: '$45,250',
      onClick: () => setProjectStatusFilter('Open')
    },
    {
      label: 'Closed',
      value: '4.8/5',
      onClick: () => setProjectStatusFilter('Closed')
    },
    {
      label: 'Billing',
      value: '4.8/5',
      onClick: () => setProjectStatusFilter('Billing')
    }
  ];

  return (
    <div className="project-status-tabs">
      <div className="projects-stats-section">
        {statusCards.map((card, index) => (
          <div 
            key={`status-card-${index}`}
            className={`stats-card ${projectStatusFilter === card.label ? 'active' : ''}`}
            onClick={card.onClick}
          >
            <h3>{card.label}</h3>
            <div className="stats-value">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectStatusTabs;

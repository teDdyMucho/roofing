import React from 'react';
import ProjectWeatherComponent from './ProjectWeatherComponent';
import { Project } from '../../services/projectService';

// Define the project status data structure
interface ProjectStatusData {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  onClick?: () => void;
}

interface ProjectStatusTabsProps {
  projectStatusFilter: string;
  setProjectStatusFilter: (status: string) => void;
  selectedProject: Project | null;
}

const ProjectStatusTabs: React.FC<ProjectStatusTabsProps> = ({
  projectStatusFilter,
  setProjectStatusFilter,
  selectedProject
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
    <div className="dashboard-metrics-container">
      <div className="metrics-cards-grid">
        {statusCards.map((card, index) => (
          <div 
            key={`status-card-${index}`}
            className={`metric-card ${projectStatusFilter === card.label ? 'active' : ''}`}
            onClick={card.onClick}
          >
            <div className="metric-card-content">
              <h3 className="metric-title">{card.label}</h3>
              <div className="metric-value">{card.value}</div>
              {card.trend ? (
                <div className={`metric-trend ${card.trend.isPositive ? 'positive' : 'negative'}`}>
                  <span className="trend-indicator">
                    {card.trend.isPositive ? '+' : '-'}{Math.abs(card.trend.value)} from {card.trend.period}
                  </span>
                </div>
              ) : card.subtitle ? (
                <div className="metric-subtitle">{card.subtitle}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <ProjectWeatherComponent projectLocation={selectedProject?.address} />
    </div>
  );
};

export default ProjectStatusTabs;

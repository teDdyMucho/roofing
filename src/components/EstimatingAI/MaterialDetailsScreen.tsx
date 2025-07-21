import React from 'react';
import './EstimatingAIAssistant.css';
import './insulation-styles.css';

// Types for all screen components
export interface MaterialType {
  id: string;
  name: string;
  description: string;
  image: string;
  features?: string[];
  example?: string;
}

export interface CategoryType {
  id: string;
  label: string;
  icon: string;
}

interface MaterialDetailsScreenProps {
  title: string;
  subtitle: string;
  materials: any[];
  onBack: () => void;
  onNext?: () => void;
  nextButtonText?: string;
  progressText?: string;
  showIntroMessage?: boolean;
  introMessage?: string;
}

interface MaterialCategoryScreenProps {
  title: string;
  subtitle: string;
  materials: CategoryType[];
  onBack: () => void;
  onMaterialSelect: (id: string) => void;
  onNext?: () => void;
  nextButtonText?: string;
  progressText?: string;
  buttonClassName?: string;
}

interface ImageModalProps {
  image: {src: string, alt: string} | null;
  onClose: () => void;
  isOpen: boolean;
}

interface WelcomeScreenProps {
  onStart: () => void;
  introMessage: string;
  buttonText: string;
}

interface StartScreenProps {
  onStart: () => void;
  subtitle: string;
}

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  message: string | null;
  onDismiss: () => void;
}

interface BreadcrumbProps {
  items: string[];
}

// Material Details Screen Component
export const MaterialDetailsScreen: React.FC<MaterialDetailsScreenProps> = ({ 
  title, 
  subtitle, 
  materials, 
  onBack,
  onNext,
  nextButtonText,
  progressText,
  showIntroMessage = false,
  introMessage
}) => {
  const handleImageClick = (src: string, alt: string) => {
    // Pass the event up to the parent component
    if (window.dispatchEvent) {
      const event = new CustomEvent('materialImageClick', {
        detail: { src, alt }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="material-details-screen">
      {showIntroMessage && introMessage && (
        <div className="ai-intro-message">
          <p>{introMessage}</p>
        </div>
      )}
      <div className="category-header">
        <div className="ai-greeting">
          <p>{subtitle}</p>
        </div>
      </div>
      <button className="back-button-corner" onClick={onBack}>
        ← Back
      </button>
      <br />
      <div className="title-material">
        <h4>{title}</h4>
      </div>
      <div className="material-grid">
        {materials.map((material) => (
          <div key={material.id} className="material-card">
            <div className="material-header">
              <img 
                src={material.image} 
                alt={material.name}
                className="material-image clickable-image"
                onClick={() => handleImageClick(material.image, material.name)}
                title="Click to view full size"
              />
              <div className="material-title">
                <h3>{material.name}</h3>
                {material.example && (
                  <span className="material-example">{material.example}</span>
                )}
              </div>
            </div>
            <div className="material-content">
              <p className="material-description">{material.description}</p>
              {material.features && (
                <div className="material-features">
                  <h4>Key Features:</h4>
                  <div className="features-list">
                    {material.features.map((feature: string, index: number) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {onNext && (
        <div className="section-navigation">
          <button className="next-section-button" onClick={onNext}>
            {nextButtonText || "Continue →"}
          </button>
          {progressText && (
            <p className="progress-text">{progressText}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Material Category Screen Component
export const MaterialCategoryScreen: React.FC<MaterialCategoryScreenProps> = ({
  title,
  subtitle,
  materials,
  onBack,
  onMaterialSelect,
  onNext,
  nextButtonText,
  progressText,
  buttonClassName = "material-category-button"
}) => {
  return (
    <div className={`${title.toLowerCase().replace(/\s+/g, '-')}-materials-screen`}>
      <div className="category-header">
        <div className="ai-greeting">
          <p>{title}</p>
          <p>{subtitle}</p>
        </div>
      </div>
      <button className="back-button-corner" onClick={onBack}>
        ← Back
      </button>
      <div className={`${title.toLowerCase().replace(/\s+/g, '-')}-materials-row`}>
        {materials.map((material) => (
          <button
            key={material.id}
            className={buttonClassName}
            onClick={() => onMaterialSelect(material.id)}
          >
            <span className="material-icon">{material.icon}</span>
            <span className="material-label">{material.label}</span>
          </button>
        ))}
      </div>
      {onNext && (
        <div className="section-navigation">
          <button className="next-section-button" onClick={onNext}>
            {nextButtonText || "Continue →"}
          </button>
          {progressText && (
            <p className="progress-text">{progressText}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Image Modal Component
export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, isOpen }) => {
  if (!isOpen || !image) return null;
  
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          ×
        </button>
        <img 
          src={image.src} 
          alt={image.alt}
          className="image-modal-image"
        />
        <div className="image-modal-caption">
          {image.alt}
        </div>
      </div>
    </div>
  );
};

// Welcome Screen Component
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, introMessage, buttonText }) => {
  return (
    <div className="welcome-screen">
      <div className="ai-intro-message">
        <p dangerouslySetInnerHTML={{ __html: introMessage }} />
      </div>
      <div className="welcome-action">
        <button className="lets-start-button" onClick={onStart}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

// Start Screen Component
export const StartScreen: React.FC<StartScreenProps> = ({ onStart, subtitle }) => {
  return (
    <div className="start-screen">
      <div className="start-text-container">
        <span className="start-text" onClick={onStart}>
          Start
        </span>
        <p className="start-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

// Loading State Component
export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading materials..." }) => {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

// Error State Component
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="error-state">
      <p>⚠️ {message}</p>
      <button onClick={onDismiss} className="dismiss-error-btn">
        Dismiss
      </button>
    </div>
  );
};

// Breadcrumb Component
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length === 0) return null;
  
  return (
    <div className="breadcrumb-container">
      <nav className="breadcrumb">
        {items.map((item, index) => (
          <span key={index} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator"> › </span>}
            <span className={index === items.length - 1 ? 'breadcrumb-current' : 'breadcrumb-link'}>
              {item}
            </span>
          </span>
        ))}
      </nav>
    </div>
  );
};

// Default export for backward compatibility
export default MaterialDetailsScreen;

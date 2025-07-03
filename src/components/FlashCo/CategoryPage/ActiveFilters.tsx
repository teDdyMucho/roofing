import React from 'react';
import { FiX } from 'react-icons/fi';
import styles from './CategoryPage.module.css';

interface ActiveFiltersProps {
  activeFilters: {
    priceRange: [number, number];
    materials: string[];
    sizes: string[];
    applications: string[];
    features: string[];
    ratings: string[];
  };
  onRemoveFilter: (filterType: string, value: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  activeFilters,
  onRemoveFilter,
  onClearAll
}) => {
  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      activeFilters.materials.length > 0 ||
      activeFilters.sizes.length > 0 ||
      activeFilters.applications.length > 0 ||
      activeFilters.features.length > 0 ||
      activeFilters.ratings.length > 0 ||
      activeFilters.priceRange[0] > 0 ||
      activeFilters.priceRange[1] < 500
    );
  };

  if (!hasActiveFilters()) {
    return null;
  }

  return (
    <div className={styles.activeFilters}>
      <div className={styles.activeFiltersHeader}>
        <h3>Active Filters:</h3>
        <button 
          className={styles.clearAllButton}
          onClick={onClearAll}
        >
          Clear All
        </button>
      </div>
      
      <div className={styles.filterTags}>
        {/* Price Range Tag */}
        {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 500) && (
          <div className={styles.filterTag}>
            <span>Price: ${activeFilters.priceRange[0]} - ${activeFilters.priceRange[1]}</span>
            <button 
              className={styles.removeTagButton}
              onClick={() => onClearAll()}
              aria-label="Remove price filter"
            >
              <FiX />
            </button>
          </div>
        )}
        
        {/* Material Tags */}
        {activeFilters.materials.map(material => (
          <div key={`material-${material}`} className={styles.filterTag}>
            <span>{material}</span>
            <button 
              className={styles.removeTagButton}
              onClick={() => onRemoveFilter('materials', material)}
              aria-label={`Remove ${material} filter`}
            >
              <FiX />
            </button>
          </div>
        ))}
        
        {/* Size Tags */}
        {activeFilters.sizes.map(size => (
          <div key={`size-${size}`} className={styles.filterTag}>
            <span>Size: {size}</span>
            <button 
              className={styles.removeTagButton}
              onClick={() => onRemoveFilter('sizes', size)}
              aria-label={`Remove ${size} size filter`}
            >
              <FiX />
            </button>
          </div>
        ))}
        
        {/* Application Tags */}
        {activeFilters.applications.map(application => (
          <div key={`application-${application}`} className={styles.filterTag}>
            <span>{application}</span>
            <button 
              className={styles.removeTagButton}
              onClick={() => onRemoveFilter('applications', application)}
              aria-label={`Remove ${application} filter`}
            >
              <FiX />
            </button>
          </div>
        ))}
        
        {/* Feature Tags */}
        {activeFilters.features.map(feature => (
          <div key={`feature-${feature}`} className={styles.filterTag}>
            <span>{feature}</span>
            <button 
              className={styles.removeTagButton}
              onClick={() => onRemoveFilter('features', feature)}
              aria-label={`Remove ${feature} filter`}
            >
              <FiX />
            </button>
          </div>
        ))}
        
        {/* Rating Tags */}
        {activeFilters.ratings.map(rating => (
          <div key={`rating-${rating}`} className={styles.filterTag}>
            <span>{rating}</span>
            <button 
              className={styles.removeTagButton}
              onClick={() => onRemoveFilter('ratings', rating)}
              aria-label={`Remove ${rating} filter`}
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;

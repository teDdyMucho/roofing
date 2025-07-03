import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './CategoryPage.module.css';

interface FilterSidebarProps {
  filterOptions: {
    materials: string[];
    sizes: string[];
    applications: string[];
    features: string[];
    ratings: string[];
  };
  activeFilters: {
    priceRange: [number, number];
    materials: string[];
    sizes: string[];
    applications: string[];
    features: string[];
    ratings: string[];
  };
  onFilterChange: (filterType: string, value: string | [number, number]) => void;
  onClearAll: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterOptions,
  activeFilters,
  onFilterChange,
  onClearAll
}) => {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    materials: true,
    sizes: true,
    applications: true,
    features: true,
    ratings: true
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle price range change
  const handlePriceChange = (min: number, max: number) => {
    onFilterChange('priceRange', [min, max]);
  };

  return (
    <div className={styles.filterSidebarContent}>
      {/* Price Range Filter */}
      <div className={styles.filterSection}>
        <div 
          className={styles.filterSectionHeader}
          onClick={() => toggleSection('price')}
        >
          <h3>Price Range</h3>
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.price && (
          <div className={styles.filterSectionContent}>
            <div className={styles.priceRangeInputs}>
              <div className={styles.priceInput}>
                <label htmlFor="min-price">Min</label>
                <div className={styles.priceInputWrapper}>
                  <span>$</span>
                  <input
                    type="number"
                    id="min-price"
                    min="0"
                    max={activeFilters.priceRange[1]}
                    value={activeFilters.priceRange[0]}
                    onChange={(e) => handlePriceChange(
                      Number(e.target.value),
                      activeFilters.priceRange[1]
                    )}
                  />
                </div>
              </div>
              <div className={styles.priceRangeDivider}>-</div>
              <div className={styles.priceInput}>
                <label htmlFor="max-price">Max</label>
                <div className={styles.priceInputWrapper}>
                  <span>$</span>
                  <input
                    type="number"
                    id="max-price"
                    min={activeFilters.priceRange[0]}
                    max="500"
                    value={activeFilters.priceRange[1]}
                    onChange={(e) => handlePriceChange(
                      activeFilters.priceRange[0],
                      Number(e.target.value)
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.priceRangeSlider}>
              <input
                type="range"
                min="0"
                max="500"
                value={activeFilters.priceRange[0]}
                onChange={(e) => handlePriceChange(
                  Number(e.target.value),
                  activeFilters.priceRange[1]
                )}
                className={styles.rangeSlider}
              />
              <input
                type="range"
                min="0"
                max="500"
                value={activeFilters.priceRange[1]}
                onChange={(e) => handlePriceChange(
                  activeFilters.priceRange[0],
                  Number(e.target.value)
                )}
                className={styles.rangeSlider}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Materials Filter */}
      <div className={styles.filterSection}>
        <div 
          className={styles.filterSectionHeader}
          onClick={() => toggleSection('materials')}
        >
          <h3>Materials</h3>
          {expandedSections.materials ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.materials && (
          <div className={styles.filterSectionContent}>
            {filterOptions.materials.map(material => (
              <div key={material} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  id={`material-${material}`}
                  checked={activeFilters.materials.includes(material)}
                  onChange={() => onFilterChange('materials', material)}
                />
                <label htmlFor={`material-${material}`}>{material}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Sizes Filter */}
      <div className={styles.filterSection}>
        <div 
          className={styles.filterSectionHeader}
          onClick={() => toggleSection('sizes')}
        >
          <h3>Sizes</h3>
          {expandedSections.sizes ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.sizes && (
          <div className={styles.filterSectionContent}>
            {filterOptions.sizes.map(size => (
              <div key={size} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  id={`size-${size}`}
                  checked={activeFilters.sizes.includes(size)}
                  onChange={() => onFilterChange('sizes', size)}
                />
                <label htmlFor={`size-${size}`}>{size}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Applications Filter */}
      <div className={styles.filterSection}>
        <div 
          className={styles.filterSectionHeader}
          onClick={() => toggleSection('applications')}
        >
          <h3>Applications</h3>
          {expandedSections.applications ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.applications && (
          <div className={styles.filterSectionContent}>
            {filterOptions.applications.map(application => (
              <div key={application} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  id={`application-${application}`}
                  checked={activeFilters.applications.includes(application)}
                  onChange={() => onFilterChange('applications', application)}
                />
                <label htmlFor={`application-${application}`}>{application}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Features Filter */}
      <div className={styles.filterSection}>
        <div 
          className={styles.filterSectionHeader}
          onClick={() => toggleSection('features')}
        >
          <h3>Features</h3>
          {expandedSections.features ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.features && (
          <div className={styles.filterSectionContent}>
            {filterOptions.features.map(feature => (
              <div key={feature} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={activeFilters.features.includes(feature)}
                  onChange={() => onFilterChange('features', feature)}
                />
                <label htmlFor={`feature-${feature}`}>{feature}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ratings Filter */}
      <div className={styles.filterSection}>
        <div 
          className={styles.filterSectionHeader}
          onClick={() => toggleSection('ratings')}
        >
          <h3>Ratings</h3>
          {expandedSections.ratings ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {expandedSections.ratings && (
          <div className={styles.filterSectionContent}>
            {filterOptions.ratings.map(rating => (
              <div key={rating} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  id={`rating-${rating.replace(/\s+/g, '-')}`}
                  checked={activeFilters.ratings.includes(rating)}
                  onChange={() => onFilterChange('ratings', rating)}
                />
                <label htmlFor={`rating-${rating.replace(/\s+/g, '-')}`}>
                  {rating}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Clear All Filters Button */}
      <button 
        className={styles.clearAllButton}
        onClick={onClearAll}
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;

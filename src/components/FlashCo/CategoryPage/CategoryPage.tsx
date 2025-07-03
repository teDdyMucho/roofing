import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiX, FiFilter, FiChevronDown, FiChevronUp, FiHeart, FiSearch } from 'react-icons/fi';
import { featuredProducts } from '../../Hero/Hero';
import ProductCard from '../ProductCard/ProductCard';
import FilterSidebar from './FilterSidebar';
import ActiveFilters from './ActiveFilters';
import styles from './CategoryPage.module.css';

// Define product categories
const productCategories = {
  'flashing': 'Flashing Products',
  'membranes': 'Waterproof Membranes',
  'drainage': 'Drainage Solutions',
  'panels': 'Panel Systems',
  'fasteners': 'Fastening Systems',
  'sealants': 'Sealants & Adhesives'
};

// Define filter options
const filterOptions = {
  materials: ['Aluminum', 'Galvanized Steel', 'Copper', 'PVC', 'TPO', 'EPDM Rubber'],
  sizes: ['Small', 'Medium', 'Large', 'Custom'],
  applications: ['Residential', 'Commercial', 'Industrial', 'DIY'],
  features: ['Waterproof', 'UV Resistant', 'Fire Resistant', 'Energy Efficient', 'Easy Install'],
  ratings: ['4 Stars & Up', '3 Stars & Up', '2 Stars & Up', '1 Star & Up']
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const viewParam = queryParams.get('view');
  const sortParam = queryParams.get('sort');
  
  const categoryName = productCategories[slug as keyof typeof productCategories] || 'All Products';
  
  // State for products and filters
  const [products, setProducts] = useState(featuredProducts);
  const [filteredProducts, setFilteredProducts] = useState(featuredProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(viewParam === 'list' ? 'list' : 'grid');
  const [sortOption, setSortOption] = useState(sortParam || 'featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [compareProducts, setCompareProducts] = useState<number[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<number | null>(null);
  
  // Active filters state
  const [activeFilters, setActiveFilters] = useState<{
    priceRange: [number, number];
    materials: string[];
    sizes: string[];
    applications: string[];
    features: string[];
    ratings: string[];
  }>({
    priceRange: [0, 500],
    materials: [],
    sizes: [],
    applications: [],
    features: [],
    ratings: []
  });

  // Filter products based on active filters
  useEffect(() => {
    let filtered = [...products];
    
    // Filter by category if slug is provided
    if (slug && slug !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === slug.toLowerCase()
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= activeFilters.priceRange[0] && 
      product.price <= activeFilters.priceRange[1]
    );
    
    // Filter by materials
    if (activeFilters.materials.length > 0) {
      filtered = filtered.filter(product => 
        // This is a placeholder - in a real app, products would have a materials property
        activeFilters.materials.some(material => 
          product.description.toLowerCase().includes(material.toLowerCase())
        )
      );
    }
    
    // Filter by sizes
    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        // This is a placeholder - in a real app, products would have a size property
        activeFilters.sizes.some(size => 
          product.description.toLowerCase().includes(size.toLowerCase())
        )
      );
    }
    
    // Filter by applications
    if (activeFilters.applications.length > 0) {
      filtered = filtered.filter(product => 
        // This is a placeholder - in a real app, products would have an applications property
        activeFilters.applications.some(application => 
          product.description.toLowerCase().includes(application.toLowerCase())
        )
      );
    }
    
    // Filter by features
    if (activeFilters.features.length > 0) {
      filtered = filtered.filter(product => 
        // This is a placeholder - in a real app, products would have a features property
        activeFilters.features.some(feature => 
          product.description.toLowerCase().includes(feature.toLowerCase())
        )
      );
    }
    
    // Filter by ratings
    if (activeFilters.ratings.length > 0) {
      filtered = filtered.filter(product => {
        return activeFilters.ratings.some(ratingFilter => {
          const minRating = parseInt(ratingFilter.split(' ')[0]);
          return product.rating >= minRating;
        });
      });
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        // Assume featured products are already in the desired order
        break;
    }
    
    setFilteredProducts(filtered);
  }, [slug, products, activeFilters, sortOption]);

  // Update URL when view mode or sort option changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (viewMode === 'list') {
      params.set('view', 'list');
    } else {
      params.delete('view');
    }
    
    if (sortOption !== 'featured') {
      params.set('sort', sortOption);
    } else {
      params.delete('sort');
    }
    
    const newSearch = params.toString();
    const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    // Only update if the URL would change
    if (location.search !== (newSearch ? `?${newSearch}` : '')) {
      navigate(newPath, { replace: true });
    }
  }, [viewMode, sortOption, location.pathname, location.search, navigate]);

  // Handle view mode toggle
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };
  
  // Handle sort option change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string | [number, number]) => {
    setActiveFilters(prev => {
      if (filterType === 'priceRange' && Array.isArray(value)) {
        return { ...prev, priceRange: value as [number, number] };
      } else if (
        ['materials', 'sizes', 'applications', 'features', 'ratings'].includes(filterType) && 
        typeof value === 'string'
      ) {
        const filterKey = filterType as 'materials' | 'sizes' | 'applications' | 'features' | 'ratings';
        const currentFilters = prev[filterKey];
        
        if (currentFilters.includes(value)) {
          // Remove filter if already active
          return {
            ...prev,
            [filterKey]: currentFilters.filter(item => item !== value)
          };
        } else {
          // Add filter if not already active
          return {
            ...prev,
            [filterKey]: [...currentFilters, value]
          };
        }
      }
      return prev;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      priceRange: [0, 500],
      materials: [],
      sizes: [],
      applications: [],
      features: [],
      ratings: []
    });
  };

  // Remove a specific filter
  const removeFilter = (filterType: string, value: string) => {
    setActiveFilters(prev => {
      if (['materials', 'sizes', 'applications', 'features', 'ratings'].includes(filterType)) {
        const filterKey = filterType as 'materials' | 'sizes' | 'applications' | 'features' | 'ratings';
        return {
          ...prev,
          [filterKey]: prev[filterKey].filter(item => item !== value)
        };
      }
      return prev;
    });
  };

  // Toggle product comparison
  const toggleCompare = (productId: number) => {
    setCompareProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // Limit to 3 products for comparison
        if (prev.length >= 3) {
          return [...prev.slice(1), productId];
        }
        return [...prev, productId];
      }
    });
  };

  // Get total active filters count
  const getActiveFiltersCount = () => {
    return (
      activeFilters.materials.length +
      activeFilters.sizes.length +
      activeFilters.applications.length +
      activeFilters.features.length +
      activeFilters.ratings.length +
      (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 500 ? 1 : 0)
    );
  };

  return (
    <div className={styles.categoryPage}>
      {/* Category Header */}
      <div className={styles.categoryHeader}>
        <div className={styles.categoryHeaderContent}>
          <h1>{categoryName}</h1>
          <p>Complete range of professional {categoryName.toLowerCase()} for superior roof protection and water management.</p>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link to="/flashco">Home</Link> / 
        {slug ? (
          <>
            <Link to="/category/all"> Products</Link> / 
            <span> {categoryName}</span>
          </>
        ) : (
          <span> All Products</span>
        )}
      </div>
      
      <div className={styles.categoryContent}>
        {/* Filter Sidebar - Desktop */}
        <div className={`${styles.filterSidebar} ${mobileFiltersOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.filterHeader}>
            <h2>Filters</h2>
            <button 
              className={styles.closeFiltersButton} 
              onClick={() => setMobileFiltersOpen(false)}
            >
              <FiX />
            </button>
          </div>
          
          <FilterSidebar 
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={clearAllFilters}
          />
        </div>
        
        {/* Main Content */}
        <div className={styles.productsContainer}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button 
                className={styles.mobileFilterButton}
                onClick={() => setMobileFiltersOpen(true)}
                aria-label="Open filters"
              >
                <FiFilter /> Filters
                {getActiveFiltersCount() > 0 && (
                  <span className={styles.filterCount}>{getActiveFiltersCount()}</span>
                )}
              </button>
              
              <div className={styles.productCount}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {filteredProducts.length !== products.length && ` (filtered from ${products.length})`}
              </div>
            </div>
            
            <div className={styles.toolbarRight}>
              <div className={styles.viewToggle}>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => handleViewModeChange('grid')}
                  aria-label="Grid view"
                >
                  <FiGrid />
                </button>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => handleViewModeChange('list')}
                  aria-label="List view"
                >
                  <FiList />
                </button>
              </div>
              
              <div className={styles.sortContainer}>
                <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
                <select 
                  id="sort-select"
                  className={styles.sortSelect}
                  value={sortOption}
                  onChange={handleSortChange}
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          <ActiveFilters 
            activeFilters={activeFilters}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
          />
          
          {/* Products Grid/List */}
          <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard 
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        category: product.category,
                        subcategory: product.subcategory,
                        isNew: product.isNew,
                        isBestSeller: product.isBestSeller,
                        variants: product.variants || [{
                          id: `${product.id}-default`,
                          name: '',
                          image: product.image,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          description: product.description || ''
                    }]
                  }}
                />
              ))
            ) : (
              <div className={styles.noProductsFound}>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button 
                  className={styles.clearFiltersButton}
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Compare Bar */}
      {compareProducts.length > 0 && (
        <div className={styles.compareBar}>
          <div className={styles.compareBarContent}>
            <div className={styles.compareTitle}>
              Compare Products ({compareProducts.length}/3)
            </div>
            <div className={styles.compareProducts}>
              {compareProducts.map(id => {
                const product = products.find(p => p.id === id);
                return product ? (
                  <div key={id} className={styles.compareProduct}>
                    <img src={product.image} alt={product.name} />
                    <button 
                      className={styles.removeCompareButton}
                      onClick={() => toggleCompare(id)}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
            <Link 
              to={`/compare/${compareProducts.join('-')}`}
              className={styles.compareButton}
            >
              Compare
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

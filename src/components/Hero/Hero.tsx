import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import ProductCard from '../FlashCo/ProductCard/ProductCard';

const features = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    subtitle: 'On orders over $99'
  },
  {
    icon: '🛡️',
    title: '2-Year Warranty',
    subtitle: 'On all products'
  },
  {
    icon: '🔄',
    title: '30-Day Returns',
    subtitle: 'Hassle-free returns'
  }
];

// Export featuredProducts for use in other components
export const featuredProducts = [
  {
    id: 1,
    name: 'Professional Roof Flashing System',
    image: '/images/triangular-flashing.png',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 1247,
    category: 'Flashing',
    subcategory: 'Triangular Corner Flashing',
    isNew: false,
    isBestSeller: true,
    description: 'Premium triangular corner flashing designed for complex roof intersections. Engineered for superior water diversion and long-lasting protection.'
  },
  {
    id: 2,
    name: 'Waterproof Membrane Underlayment',
    image: '/images/round-flashing.png',
    price: 149.99,
    originalPrice: 169.99,
    rating: 4.8,
    reviews: 42,
    category: 'Membranes',
    isNew: true,
    description: 'Advanced waterproof underlayment for maximum protection against water infiltration. Easy to install and highly durable.'
  },
  {
    id: 3,
    name: 'Professional Roof Drain',
    image: '/images/roof-drain.png',
    price: 129.99,
    rating: 4.7,
    reviews: 36,
    category: 'Drainage',
    isNew: false,
    description: 'Heavy-duty roof drain with high flow capacity. Corrosion-resistant materials ensure long-lasting performance.'
  },
  {
    id: 4,
    name: 'Flashing Panel System',
    image: '/images/panel-flashing.png',
    price: 99.99,
    originalPrice: 119.99,
    rating: 4.3,
    reviews: 18,
    category: 'Flashing',
    isNew: true,
    description: 'Professional-grade flashing panel system for superior waterproofing. Easy to install and highly durable.'
  },
  {
    id: 5,
    name: 'Flat Panel Solution',
    image: '/images/flat-panel.png',
    price: 179.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviews: 24,
    category: 'Panels',
    isNew: false,
    description: 'Advanced flat panel solution for modern roof designs. Weather-resistant and aesthetically pleasing.'
  },
  {
    id: 6,
    name: 'Advanced Vent System',
    image: '/images/roof-vent.png',
    price: 119.99,
    rating: 4.4,
    reviews: 22,
    category: 'Ventilation',
    isNew: true,
    description: 'Superior ventilation for enhanced roof performance. Prevents moisture buildup and extends roof lifespan.'
  }
];

const Hero = () => {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.hero}>
        <h1>Professional Roofing Solutions</h1>
        <p>Premium waterproofing and flashing systems for lasting protection</p>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className={styles.searchInput}
          />
        </div>
      </div>
      
      <div className={styles.features}>
        {features.map((feature, index) => (
          <div key={index} className={styles.feature}>
            <span className={styles.featureIcon}>{feature.icon}</span>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.featuredProductsSection}>
        <h2>Featured Products</h2>
        <p className={styles.featuredSubtitle}>Handpicked selection of the best roof products to enhance your lifestyle</p>
        
        <div className={styles.productGrid}>
          {featuredProducts.map(product => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviews={product.reviews}
              category={product.category}
              isNew={product.isNew}
              description={product.description}
            />
          ))}
        </div>
      </div>

      <div className={styles.storeLocations}>
        <h2>Our Store Locations</h2>
        <p>Visit us at any of our 110 locations across the United States</p>
        <div className={styles.mapContainer}>
          {/* Placeholder for map */}
          <div className={styles.map}></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

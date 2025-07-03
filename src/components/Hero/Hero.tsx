import React, { useState, useCallback } from 'react';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
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

// Define product variant interface
interface ProductVariant {
  id: string;
  name: string;
  image: string;
  color?: string;
  colorCode?: string;
  price: number;
  originalPrice?: number;
  description: string;
  features?: string[];
  material?: string;
  size?: string;
  type?: string;
}

// Export featuredProducts for use in other components
export const featuredProducts = [
  {
    id: 1,
    name: 'Round Split Flashing White',
    slug: 'round-split-flashing-white',
    image: 'images/FlashWrap_RoundSplitFlashings/FlashWrap_RoundSplitWhite.png',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 1247,
    category: 'Flashing',
    subcategory: 'Triangular Corner Flashing',
    isNew: false,
    isBestSeller: true,
    description: 'Premium triangular corner flashing designed for complex roof intersections. Engineered for superior water diversion and long-lasting protection.',
    variants: [
      {
        id: '1-1',
        name: '1" Standard White',
        image: 'images/FlashWrap_RoundSplitFlashings/FlashWrap_RoundSplitWhite.png',
        color: 'Silver',
        colorCode: '#C0C0C0',
        price: 89.99,
        originalPrice: 119.99,
        material: 'Aluminum',
        size: 'Standard',
        description: 'Premium aluminum triangular corner flashing designed for complex roof intersections. Engineered for superior water diversion and long-lasting protection.'
      },
      {
        id: '1-2',
        name: '3" Tan Premium',
        image: 'images/FlashWrap_RoundSplitFlashings/FlashWrap_RoundSplitTan.png',
        color: 'Copper',
        colorCode: '#B87333',
        price: 129.99,
        originalPrice: 159.99,
        material: 'Copper',
        size: 'Standard',
        description: 'Premium copper triangular corner flashing with enhanced durability and aesthetic appeal. Perfect for high-end residential and commercial applications.'
      },
      {
        id: '1-3',
        name: '6" Galvanized Steel Heavy-Duty',
        image: 'images/FlashWrap_RoundSplitFlashings/FlashWrap_RoundSplitGray.png',
        color: 'Steel Gray',
        colorCode: '#71797E',
        price: 99.99,
        originalPrice: 139.99,
        material: 'Galvanized Steel',
        size: 'Heavy-Duty',
        description: 'Heavy-duty galvanized steel triangular corner flashing for maximum strength and durability. Ideal for industrial applications and extreme weather conditions.'
      }
    ]
  },
  {
    id: 2,
    name: 'Waterproof Membrane Underlayment',
    slug: 'waterproof-membrane-underlayment',
    image: '/images/round-flashing.png',
    price: 149.99,
    originalPrice: 169.99,
    rating: 4.8,
    reviews: 42,
    category: 'Membranes',
    isNew: true,
    description: 'Advanced waterproof underlayment for maximum protection against water infiltration. Easy to install and highly durable.',
    variants: [
      {
        id: '2-1',
        name: 'Standard Roll',
        image: '/images/round-flashing.png',
        price: 149.99,
        originalPrice: 169.99,
        type: 'Standard',
        size: '36" x 66\'',
        description: 'Advanced waterproof underlayment for maximum protection against water infiltration. Standard roll size for most residential applications.'
      },
      {
        id: '2-2',
        name: 'Commercial Grade',
        image: '/images/round-flashing-commercial.png',
        price: 199.99,
        originalPrice: 229.99,
        type: 'Commercial',
        size: '48" x 100\'',
        description: 'Heavy-duty commercial grade waterproof membrane underlayment. Extra-wide roll for faster installation on large commercial projects.'
      },
      {
        id: '2-3',
        name: 'Self-Adhesive Premium',
        image: '/images/round-flashing-adhesive.png',
        price: 179.99,
        originalPrice: 199.99,
        type: 'Self-Adhesive',
        size: '36" x 66\'',
        description: 'Premium self-adhesive waterproof membrane underlayment. No additional fasteners required for installation, saving time and labor costs.'
      }
    ]
  },
  {
    id: 3,
    name: 'Professional Roof Drain',
    slug: 'professional-roof-drain',
    image: '/images/roof-drain.png',
    price: 129.99,
    rating: 4.7,
    reviews: 36,
    category: 'Drainage',
    isNew: false,
    description: 'Heavy-duty roof drain with high flow capacity. Corrosion-resistant materials ensure long-lasting performance.',
    variants: [
      {
        id: '3-1',
        name: 'Standard Aluminum',
        image: '/images/roof-drain.png',
        color: 'Silver',
        colorCode: '#C0C0C0',
        price: 129.99,
        material: 'Aluminum',
        size: '4"',
        description: 'Heavy-duty aluminum roof drain with high flow capacity. Corrosion-resistant materials ensure long-lasting performance.'
      },
      {
        id: '3-2',
        name: 'Large Capacity Stainless',
        image: '/images/roof-drain-large.png',
        color: 'Stainless',
        colorCode: '#808080',
        price: 159.99,
        material: 'Stainless Steel',
        size: '6"',
        description: 'Large capacity stainless steel roof drain for areas with heavy rainfall. Superior corrosion resistance and extended service life.'
      },
      {
        id: '3-3',
        name: 'Low-Profile Copper',
        image: '/images/roof-drain-copper.png',
        color: 'Copper',
        colorCode: '#B87333',
        price: 189.99,
        material: 'Copper',
        size: '4"',
        description: 'Low-profile copper roof drain with elegant finish. Perfect for visible applications where aesthetics matter without sacrificing performance.'
      }
    ]
  },
  {
    id: 4,
    name: 'Flashing Panel System',
    slug: 'flashing-panel-system',
    image: '/images/panel-flashing.png',
    price: 99.99,
    originalPrice: 119.99,
    rating: 4.3,
    reviews: 18,
    category: 'Flashing',
    isNew: true,
    description: 'Professional-grade flashing panel system for superior waterproofing. Easy to install and highly durable.',
    variants: [
      {
        id: '4-1',
        name: 'Standard Panel',
        image: '/images/panel-flashing.png',
        price: 99.99,
        originalPrice: 119.99,
        material: 'Aluminum',
        size: '24" x 36"',
        description: 'Professional-grade aluminum flashing panel system for superior waterproofing. Standard size for most residential applications.'
      },
      {
        id: '4-2',
        name: 'Extended Panel',
        image: '/images/panel-flashing-extended.png',
        price: 129.99,
        originalPrice: 149.99,
        material: 'Aluminum',
        size: '36" x 48"',
        description: 'Extended size aluminum flashing panel for larger areas. Provides more coverage with fewer seams for better waterproofing.'
      },
      {
        id: '4-3',
        name: 'Heavy-Duty Panel',
        image: '/images/panel-flashing-heavy.png',
        price: 149.99,
        originalPrice: 179.99,
        material: 'Galvanized Steel',
        size: '24" x 36"',
        description: 'Heavy-duty galvanized steel flashing panel for maximum durability. Ideal for areas with extreme weather conditions or high wind exposure.'
      }
    ]
  },
  {
    id: 5,
    name: 'Flat Panel Solution',
    slug: 'flat-panel-solution',
    image: '/images/flat-panel.png',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviews: 24,
    category: 'Panels',
    isNew: false,
    description: 'Advanced flat panel solution for modern roof designs. Weather-resistant and aesthetically pleasing.',
    variants: [
      {
        id: '5-1',
        name: 'Standard Flat Panel',
        image: '/images/flat-panel.png',
        color: 'Silver',
        colorCode: '#C0C0C0',
        price: 79.99,
        originalPrice: 99.99,
        material: 'Aluminum',
        size: '24" x 24"',
        description: 'Versatile aluminum flat panel solution for various roofing applications. Weather-resistant and easy to install.'
      },
      {
        id: '5-2',
        name: 'Premium Coated Panel',
        image: '/images/flat-panel-coated.png',
        color: 'Black',
        colorCode: '#333333',
        price: 89.99,
        originalPrice: 109.99,
        material: 'Coated Aluminum',
        size: '24" x 24"',
        description: 'Premium coated flat panel with enhanced UV protection and weather resistance. Sleek black finish for modern architectural designs.'
      },
      {
        id: '5-3',
        name: 'Insulated Panel',
        image: '/images/flat-panel-insulated.png',
        color: 'White',
        colorCode: '#FFFFFF',
        price: 99.99,
        originalPrice: 119.99,
        material: 'Insulated Composite',
        size: '24" x 24"',
        description: 'Insulated composite flat panel for improved energy efficiency. Helps reduce heating and cooling costs while providing excellent weather protection.'
      }
    ]
  },
  {
    id: 6,
    name: 'Advanced Vent System',
    slug: 'advanced-vent-system',
    image: '/images/roof-vent.png',
    price: 119.99,
    rating: 4.4,
    reviews: 22,
    category: 'Ventilation',
    isNew: true,
    description: 'Superior ventilation for enhanced roof performance. Prevents moisture buildup and extends roof lifespan.'
  }
];

// Define map container style
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

// Define center location (default)
const center = {
  lat: 39.8283,
  lng: -98.5795 // Center of US
};

// Define the location data
const locationData = [
  {
    id: 1,
    name: 'Fife, WA',
    address: '2505 Frank Albert Rd E, B112',
    city: 'Fife',
    state: 'WA',
    zip: '98424',
    position: { lat: 47.2372, lng: -122.3521 }
  },
  {
    id: 2,
    name: 'Woodland, WA',
    address: '1383 Down River Drive, Suite A',
    city: 'Woodland',
    state: 'WA',
    zip: '98674',
    position: { lat: 45.9047, lng: -122.7440 }
  },
  {
    id: 3,
    name: 'Santa Rosa, CA',
    address: '170 Todd Road',
    city: 'Santa Rosa',
    state: 'CA',
    zip: '95407',
    position: { lat: 38.3892, lng: -122.7141 }
  },
  {
    id: 4,
    name: 'South Gate, CA',
    address: '4553 Firestone Blvd.',
    city: 'South Gate',
    state: 'CA',
    zip: '90280',
    position: { lat: 33.9535, lng: -118.1696 }
  },
  {
    id: 5,
    name: 'North Salt Lake, UT',
    address: '175 River Bend Way #3',
    city: 'North Salt Lake',
    state: 'UT',
    zip: '84054',
    position: { lat: 40.8446, lng: -111.9056 }
  },
  {
    id: 6,
    name: 'Fort Worth, TX',
    address: '8600 South Freeway, Suite 340',
    city: 'Fort Worth',
    state: 'TX',
    zip: '76134',
    position: { lat: 32.7555, lng: -97.3308 }
  },
  {
    id: 7,
    name: 'Elmhurst, IL',
    address: '849 N. Church Ct.',
    city: 'Elmhurst',
    state: 'IL',
    zip: '60126',
    isNew: true,
    position: { lat: 41.9028, lng: -87.9405 }
  },
  {
    id: 8,
    name: 'Wilkes-Barre, PA',
    address: '600 Lasley Ave.',
    city: 'Wilkes-Barre',
    state: 'PA',
    zip: '18706',
    position: { lat: 41.2459, lng: -75.8813 }
  },
  {
    id: 9,
    name: 'Taylor, PA',
    address: '1151 Union St.',
    city: 'Taylor',
    state: 'PA',
    zip: '18517',
    position: { lat: 41.3892, lng: -75.7149 }
  },
  {
    id: 10,
    name: 'Piedmont, SC',
    address: '514 Matrix Parkway',
    city: 'Piedmont',
    state: 'SC',
    zip: '29673',
    position: { lat: 34.7029, lng: -82.4637 }
  }
];

const Hero = () => {
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_API_KEY' // Replace with your actual Google Maps API key
  });

  // State for selected location
  const [selectedLocation, setSelectedLocation] = useState<typeof locationData[0]>(locationData[0]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    locationData.forEach(({ position }) => bounds.extend(position));
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  // Handle map unmount
  const onUnmount = useCallback((map: google.maps.Map) => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = (location: typeof locationData[0]) => {
    setSelectedLocation(location);
  };

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
        
        <a href="/category/all" className={styles.ctaButton}>
          SHOP NOW
        </a>

        <div className={styles.featuredProductsHeader}>
          {/* <div className={styles.productCount}>
            {featuredProducts.length} products
          </div> */}
          <div className={styles.viewOptions}>
            <Link to="/category/all" className={styles.viewAllLink}>View All Products</Link>
            <div className={styles.viewToggle}>
              <button 
                className={`${styles.viewButton} ${styles.active}`} 
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <Link 
                to="/category/all?view=list" 
                className={styles.viewButton} 
                aria-label="List view"
              >
                <FiList />
              </Link>
            </div>
          </div>
        </div>
        
        <div className={styles.productGrid}>
          {featuredProducts.map(product => (
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
          ))}
        </div>
      </div>

      <div className={styles.storeLocations}>
        <h2>10 Convenient Locations Throughout the U.S</h2>
        <p>Visit us at any of our 10 locations across the United States</p>
        
        <div className={styles.mapLocationContainer}>
          {/* Google Map on the left side */}
          <div className={styles.mapWrapper}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={4}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {/* Render markers for each location */}
                {locationData.map((location) => (
                  <Marker
                    key={location.id}
                    position={location.position}
                    onClick={() => handleMarkerClick(location)}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className={styles.loadingMap}>Loading Map...</div>
            )}
          </div>
          
          {/* Location details on the right side */}
          <div className={styles.locationDetails}>
            <div className={styles.locationCard}>
              <h3>{selectedLocation.name}</h3>
              {selectedLocation.isNew && <span className={styles.newBadge}>NEW LOCATION</span>}
              <p>{selectedLocation.address}</p>
              <p>{selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip}</p>
              
              <div className={styles.contactSection}>
                <h4>Contact Information</h4>
                <p className={styles.contactPhone}>1-866-323-5274</p>
                <p className={styles.contactEmail}>Sales@FlashCo.com</p>
              </div>
              
              <div className={styles.directionsButton}>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.position.lat},${selectedLocation.position.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </div>
            </div>
            
            <div className={styles.otherLocations}>
              <h4>Other Locations</h4>
              <div className={styles.locationsList}>
                {locationData
                  .filter(loc => loc.id !== selectedLocation.id)
                  .slice(0, 3)
                  .map(location => (
                    <div 
                      key={location.id} 
                      className={styles.locationItem}
                      onClick={() => handleMarkerClick(location)}
                    >
                      <span>{location.name}</span>
                      <span>{location.city}, {location.state}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contactInfo}>
          <div className={styles.contactContent}>
            <span>SouthlandRoofing.com</span>
            <span className={styles.divider}>|</span>
            <span>1-866-323-5274</span>
            <span className={styles.divider}>|</span>
            <span>Sales@SouthlandRoofing.com</span>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <span>Mar. 2025</span>
            <span className={styles.divider}>|</span>
            <span>SouthlandRoofing.com | 1-866-323-5274 | Sales@SouthlandRoofing.com</span>
            <span className={styles.divider}>|</span>
            <span>Private & Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

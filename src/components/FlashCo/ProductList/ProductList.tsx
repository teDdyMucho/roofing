import React from 'react';
import styles from './ProductList.module.css';
import ProductGrid from '../ProductGrid/ProductGrid';
import { ProductListProps } from '../../../types/product';

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className={styles.productList}>
      <h1>Our Products</h1>
      <ProductGrid products={products} />
    </div>
  );
};

// export default ProductList;
//     'Chicago, IL',
//     'Houston, TX',
//     'Phoenix, AZ',
//     'Philadelphia, PA',
//     'San Antonio, TX',
//     'San Diego, CA',
//     'Dallas, TX',
//     'San Jose, CA'
//   ];

//   return (
//     <div className={styles.productListContainer}>
//       {/* Hero Section */}
//       <section className={styles.heroSection}>
//         <h1>Premium Roofing Solutions</h1>
//         <p>Discover our wide range of high-quality roofing products designed to protect and enhance your home. Built to last with industry-leading warranties.</p>
//       </section>

//       {/* Products Grid */}
//       <div className={styles.productsGrid}>
//         <ProductGrid products={products} />
//       </div>

//       {/* Location Section */}
//       <section className={styles.locationSection}>
//         <h2>Nationwide Coverage</h2>
//         <p>We serve customers across the United States with our premium roofing solutions</p>
        
//         <div className={styles.mapContainer}>
//           <img 
//             src="https://maps.googleapis.com/maps/api/staticmap?center=37.0902,-95.7129&zoom=4&size=800x400&maptype=roadmap&markers=color:red%7C40.7128,-74.0060%7C34.0522,-118.2437%7C41.8781,-87.6298%7C29.7604,-95.3698%7C33.4484,-112.0740%7C39.9526,-75.1652%7C29.4241,-98.4936%7C32.7157,-117.1611%7C32.7767,-96.7970%7C37.3382,-121.8863&key=YOUR_API_KEY" 
//             alt="US Map with Service Locations" 
//             className={styles.mapImage}
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=US+Map+with+Service+Locations';
//             }}
//           />
          
//           <div className={styles.locationList}>
//             {locations.map((location, index) => (
//               <div key={index} className={styles.locationItem}>
//                 <span className={styles.locationMarker}>📍</span>
//                 <span>{location}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

export default ProductList;

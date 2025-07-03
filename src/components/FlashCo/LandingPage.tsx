import React from 'react';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingContainer}>
      {/* Header */}
      <header className={styles.landingHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>FlashCo®</div>
          <div className={styles.tagline}>
            SAVING THE CONTRACTOR TIME SINCE 2000
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Background Image - Add your image to the public folder and update the path */}
        <div 
          className={styles.backgroundImage}
          style={{ 
            backgroundImage: 'url("/images/roofing-background.jpg")',
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Content Overlay */}
        <div className={styles.contentOverlay}>
          {/* Main Title */}
          <div className={styles.mainTitle}>
            <h1 className={styles.mainTitle}>
              PRODUCT GUIDE
            </h1>
            <h2 className={styles.mainTitle}>
              PVC SINGLE-PLY
            </h2>
            <h2 className={styles.mainTitle}>
              ROOFING SYSTEMS
            </h2>
          </div>
          
          {/* Product Grid */}
          <div className={styles.productGrid}>
            {[1, 2, 3, 4].map((item) => (
              <div 
                key={item}
                className={styles.productCard}
              >
                <div className={styles.productImage}>
                  {/* Replace with your product images */}
                  <div className={styles.productPlaceholder}>
                    Product {item}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.landingFooter}>
        <div className={styles.footerContent}>
          <p>© {new Date().getFullYear()} FlashCo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
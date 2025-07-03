import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiChevronLeft, FiChevronRight, FiShoppingCart, FiHeart } from 'react-icons/fi';
import styles from './QuickViewModal.module.css';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  isNew: boolean;
  isBestSeller?: boolean;
  description: string;
  subcategory?: string;
}

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Mock multiple images for the product
  const productImages = [
    product.image,
    '/images/products/product-placeholder-1.jpg',
    '/images/products/product-placeholder-2.jpg'
  ];
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex(prev => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex(prev => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Calculate discount percentage if there's an original price
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className={styles.star}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half-star" className={styles.star}>★</span>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-star-${i}`} className={styles.emptyStar}>★</span>);
    }
    
    return stars;
  };
  
  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close quick view">
          <FiX />
        </button>
        
        <div className={styles.modalBody}>
          <div className={styles.productImageSection}>
            <div className={styles.productImageContainer}>
              <img 
                src={productImages[currentImageIndex]} 
                alt={product.name} 
                className={styles.productImage} 
              />
              
              {productImages.length > 1 && (
                <>
                  <button 
                    className={`${styles.navButton} ${styles.prevButton}`}
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    className={`${styles.navButton} ${styles.nextButton}`}
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
              
              {product.isNew && <span className={styles.newBadge}>New</span>}
              {product.isBestSeller && <span className={styles.bestSellerBadge}>Best Seller</span>}
            </div>
            
            <div className={styles.thumbnailContainer}>
              {productImages.map((img, index) => (
                <button 
                  key={index}
                  className={`${styles.thumbnail} ${currentImageIndex === index ? styles.activeThumbnail : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.productDetails}>
            <h2 className={styles.productName}>{product.name}</h2>
            
            <div className={styles.productMeta}>
              <div className={styles.productRating}>
                <div className={styles.stars}>{renderStars()}</div>
                <span className={styles.reviewCount}>({product.reviews} reviews)</span>
              </div>
              
              <div className={styles.productCategory}>
                Category: <span>{product.category}</span>
                {product.subcategory && <> | {product.subcategory}</>}
              </div>
            </div>
            
            <div className={styles.productPricing}>
              <div className={styles.priceContainer}>
                <span className={styles.price}>${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                    <span className={styles.discount}>-{discountPercentage}%</span>
                  </>
                )}
              </div>
            </div>
            
            <p className={styles.productDescription}>{product.description}</p>
            
            <div className={styles.colorOptions}>
              <h3>Color Options:</h3>
              <div className={styles.colorSwatches}>
                <button className={`${styles.colorSwatch} ${styles.activeColor}`} style={{backgroundColor: '#333'}} aria-label="Black color option"></button>
                <button className={styles.colorSwatch} style={{backgroundColor: '#fff', border: '1px solid #ddd'}} aria-label="White color option"></button>
                <button className={styles.colorSwatch} style={{backgroundColor: '#ccc'}} aria-label="Gray color option"></button>
              </div>
            </div>
            
            <div className={styles.productActions}>
              <div className={styles.quantitySelector}>
                <button 
                  className={styles.quantityButton}
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  className={styles.quantityInput}
                  aria-label="Quantity"
                />
                <button 
                  className={styles.quantityButton}
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              
              <div className={styles.actionButtons}>
                <button className={styles.addToCartButton}>
                  <FiShoppingCart className={styles.buttonIcon} />
                  Add to Cart
                </button>
                
                <button 
                  className={`${styles.wishlistButton} ${isFavorite ? styles.active : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                  aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FiHeart />
                </button>
              </div>
            </div>
            
            <div className={styles.productFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🚚</span>
                <span className={styles.featureText}>Free Shipping</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>↩️</span>
                <span className={styles.featureText}>30-Day Returns</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🛡️</span>
                <span className={styles.featureText}>2-Year Warranty</span>
              </div>
            </div>
            
            <Link to={`/product/${product.id}`} className={styles.viewDetailsLink}>
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

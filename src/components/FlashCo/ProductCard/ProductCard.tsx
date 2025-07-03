import React, { useState } from 'react';
import { FiHeart, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

interface ProductProps {
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
  isCompared?: boolean;
  onCompareToggle?: () => void;
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  name,
  image,
  price,
  originalPrice,
  rating,
  reviews,
  category,
  isNew,
  isBestSeller,
  description,
  subcategory,
  isCompared = false,
  onCompareToggle
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <div className={styles.productCard}>
      {isNew && <span className={styles.newBadge}>New</span>}
      {isBestSeller && <span className={styles.bestSellerBadge}>Best Seller</span>}
      
      <div className={styles.productImageContainer}>
        <img src={image} alt={name} className={styles.productImage} />
        <button 
          className={`${styles.wishlistButton} ${isFavorite ? styles.active : ''}`} 
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
        >
          <FiHeart />
        </button>
        <div className={styles.imageNavigation}>
          <button className={styles.navButton} aria-label="Previous image">‹</button>
          <button className={styles.navButton} aria-label="Next image">›</button>
        </div>
        <div className={styles.imageDots}>
          <span className={`${styles.dot} ${styles.activeDot}`}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
      
      <div className={styles.productInfo}>
        <Link to={`/product/${id}`} className={styles.productLink}>
          <h3 className={styles.productName}>{name}</h3>
        </Link>
        
        {subcategory && (
          <div className={styles.productSubcategory}>{subcategory}</div>
        )}
        
        <p className={styles.productDescription}>{description}</p>
        
        <div className={styles.productRating}>
          <div className={styles.stars}>
            {'★'.repeat(Math.floor(rating))}
            {rating % 1 !== 0 && '☆'}
            {'☆'.repeat(5 - Math.ceil(rating))}
          </div>
          <span className={styles.reviewCount}>{rating} ({reviews.toLocaleString()} reviews)</span>
        </div>
        
        <div className={styles.productPricing}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>${price.toFixed(2)}</span>
            {originalPrice && (
              <span className={styles.originalPrice}>${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        <div className={styles.stockStatus}>
          <span className={styles.inStock}>In Stock</span>
        </div>
        
        <button className={styles.addToCartButton}>
          <span className={styles.cartIcon}>🛒</span>
          Add to Cart
        </button>
      </div>
      
      <div className={styles.colorOptions}>
        <button className={`${styles.colorOption} ${styles.activeColor}`} style={{backgroundColor: '#333'}} aria-label="Black color option"></button>
        <button className={styles.colorOption} style={{backgroundColor: '#fff', border: '1px solid #ddd'}} aria-label="White color option"></button>
        <button className={styles.colorOption} style={{backgroundColor: '#ccc'}} aria-label="Gray color option"></button>
      </div>
      
      {onCompareToggle && (
        <div className={styles.compareContainer}>
          <label className={styles.compareLabel}>
            <input 
              type="checkbox" 
              checked={isCompared} 
              onChange={(e) => {
                e.preventDefault();
                onCompareToggle();
              }} 
            />
            <span className={styles.compareText}>
              {isCompared ? (
                <>
                  <FiCheck className={styles.compareIcon} /> Added to Compare
                </>
              ) : (
                'Add to Compare'
              )}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

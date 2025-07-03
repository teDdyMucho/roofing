import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ProductCard.module.css';

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
  inStock?: boolean;
  material?: string;
  size?: string;
  type?: string;
}

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    category: string;
    subcategory?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    variants: ProductVariant[];
    defaultVariant?: number;
  };
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [variantIndex, setVariantIndex] = useState(product.defaultVariant || 0);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current variant
  const currentVariant = product.variants[variantIndex];

  // Handle swipe functionality
  const handleSwipe = (direction: 'left' | 'right') => {
    if (product.variants.length <= 1) return;

    setTransitioning(true);

    const currentIndex = variantIndex;
    let newIndex;

    if (direction === 'left') {
      newIndex = (currentIndex + 1) % product.variants.length;
    } else {
      newIndex = (currentIndex - 1 + product.variants.length) % product.variants.length;
    }

    setVariantIndex(newIndex);

    // Remove transitioning class after animation completes
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  // Touch handling for swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (product.variants.length <= 1) return;
    touchStartX = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (product.variants.length <= 1) return;
    touchEndX = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (product.variants.length <= 1) return;
    if (touchStartX - touchEndX > 75) {
      // Swiped left
      handleSwipe('left');
    } else if (touchEndX - touchStartX > 75) {
      // Swiped right
      handleSwipe('right');
    }
  };

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === containerRef.current) {
        if (e.key === 'ArrowLeft') {
          handleSwipe('right');
        } else if (e.key === 'ArrowRight') {
          handleSwipe('left');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [variantIndex]);

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  return (
    <div
      className={`${styles.productCard} ${transitioning ? styles.transitioning : ''} ${className || ''}`}
      ref={containerRef}
      tabIndex={0}
      aria-label={`${product.name} product card`}
    >
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <img
            src={currentVariant.image}
            alt={`${product.name} - ${currentVariant.name}`}
            className={styles.productImage}
          />

          {product.isNew && <span className={styles.badge}>New</span>}
          {product.isBestSeller && <span className={styles.bestSellerBadge}>Best Seller</span>}

          {product.variants.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                onClick={() => handleSwipe('right')}
                aria-label="Previous variant"
              >
                <ChevronLeft className={styles.navIcon} />
              </button>
              <button
                className={`${styles.navButton} ${styles.navButtonRight}`}
                onClick={() => handleSwipe('left')}
                aria-label="Next variant"
              >
                <ChevronRight className={styles.navIcon} />
              </button>
            </>
          )}

          <button
            className={styles.favoriteButton}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`${styles.heartIcon} ${isFavorite ? styles.favorited : ''}`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>

          {product.variants.length > 1 && (
            <div className={styles.variantDots}>
              {product.variants.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.variantDot} ${index === variantIndex ? styles.activeVariantDot : ''}`}
                  onClick={() => setVariantIndex(index)}
                  aria-label={`View variant ${index + 1} of ${product.variants.length}`}
                  aria-current={index === variantIndex ? "true" : "false"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.productInfo}>
        <div className={styles.productHeader}>
          <h3 className={styles.productName}>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {product.variants.length > 1 && product.variants.some(v => v.colorCode) && (
            <div className={styles.colorVariants}>
              {product.variants
                .filter((v, i, arr) =>
                  v.colorCode && arr.findIndex(item => item.colorCode === v.colorCode) === i
                )
                .map((variant, index) => (
                  <button
                    key={index}
                    className={`${styles.colorVariant} ${
                      currentVariant.colorCode === variant.colorCode ? styles.activeColorVariant : ''
                    }`}
                    style={{ backgroundColor: variant.colorCode || '#ccc' }}
                    onClick={() => {
                      const variantWithColor = product.variants.findIndex(v => v.colorCode === variant.colorCode);
                      if (variantWithColor !== -1) setVariantIndex(variantWithColor);
                    }}
                    aria-label={`Select ${variant.color || 'color variant'}`}
                    aria-current={currentVariant.colorCode === variant.colorCode ? "true" : "false"}
                  />
                ))}
            </div>
          )}
        </div>

        <p className={styles.variantName}>{currentVariant.name}</p>
        <p className={styles.productDescription}>
          {currentVariant.description}
        </p>

        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`${styles.star} ${i < 4 ? styles.filledStar : ''}`}
                fill={i < 4 ? "currentColor" : "none"}
                size={16}
              />
            ))}
          </div>
          <span className={styles.reviewCount}>24 reviews</span>
        </div>

        <div className={styles.priceContainer}>
          <div className={styles.prices}>
            <span className={styles.price}>${currentVariant.price.toFixed(2)}</span>
            {currentVariant.originalPrice && (
              <span className={styles.originalPrice}>
                ${currentVariant.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className={currentVariant.inStock !== false ? styles.inStock : styles.outOfStock}>
            {currentVariant.inStock !== false ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <button className={styles.addToCartButton}>
          <ShoppingCart className={styles.cartIcon} size={16} />
          Add to Cart
        </button>

        {/* <div className={styles.compareContainer}>
          <label className={styles.compareLabel}>
            <input
              type="checkbox"
              className={styles.compareCheckbox}
            />
            <span className={styles.compareText}>
              Compare
              <Check className={styles.compareIcon} size={16} />
            </span>
          </label>
        </div> */}

      </div>
    </div>
  );
};

export default ProductCard;

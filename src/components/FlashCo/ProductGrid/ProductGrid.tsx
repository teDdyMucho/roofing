import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react';
import styles from './ProductGrid.module.css';

interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  color: string;
  category: string;
}

interface Product {
  id: number;
  name: string;
  variants: ProductVariant[];
  rating?: number;
  reviews?: number;
  badge?: string;
  inStock?: boolean;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentVariants, setCurrentVariants] = useState<Record<number, number>>(
    products.reduce((acc, product) => ({
      ...acc,
      [product.id]: 0
    }), {})
  );

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const changeVariant = (productId: number, variantIndex: number) => {
    setCurrentVariants(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
  };

  const handleSwipe = (productId: number, direction: 'left' | 'right') => {
    const currentIndex = currentVariants[productId];
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const nextIndex = 
      direction === 'left'
        ? (currentIndex + 1) % product.variants.length
        : (currentIndex - 1 + product.variants.length) % product.variants.length;
    
    changeVariant(productId, nextIndex);
  };

  return (
    <div className={styles.productGrid}>
      {products.map((product) => {
        const currentVariantIndex = currentVariants[product.id] || 0;
        const variant = product.variants[currentVariantIndex];
        
        return (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.imageContainer}>
              <div 
                className={styles.imageWrapper}
                onTouchStart={(e) => {
                  if (product.variants.length <= 1) return;
                  const startX = e.touches[0].clientX;
                  const handleTouchEnd = (endEvent: TouchEvent) => {
                    const endX = endEvent.changedTouches[0].clientX;
                    const diff = startX - endX;
                    if (Math.abs(diff) > 50) {
                      handleSwipe(product.id, diff > 0 ? 'left' : 'right');
                    }
                    document.removeEventListener('touchend', handleTouchEnd);
                  };
                  document.addEventListener('touchend', handleTouchEnd);
                }}
              >
                <img
                  src={variant.image}
                  alt={`${product.name} - ${variant.name}`}
                  className={styles.productImage}
                  style={{ width: '100%', height: 'auto' }}
                />

                {product.variants.length > 1 && (
                  <>
                    <button 
                      className={`${styles.navButton} ${styles.navButtonLeft}`}
                      onClick={() => handleSwipe(product.id, 'right')}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      className={`${styles.navButton} ${styles.navButtonRight}`}
                      onClick={() => handleSwipe(product.id, 'left')}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                <button
                  className={styles.favoriteButton}
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart
                    className={`${styles.heartIcon} ${
                      favorites.includes(product.id) ? styles.favorited : ''
                    }`}
                  />
                </button>

                {product.badge && (
                  <span className={styles.badge}>
                    {product.badge}
                  </span>
                )}

                {product.variants.length > 1 && (
                  <div className={styles.variantDots}>
                    {product.variants.map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.variantDot} ${
                          index === currentVariantIndex ? styles.activeVariantDot : ''
                        }`}
                        onClick={() => changeVariant(product.id, index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.productInfo}>
              <div className={styles.productHeader}>
                <Link to={`/category/${variant.category || 'roof-flashing'}`}>
                  <h3 className={styles.productName}>
                    {product.name}
                  </h3>
                </Link>
                {product.variants.length > 1 && (
                  <div className={styles.colorVariants}>
                    {product.variants.map((v, index) => (
                      <button
                        key={index}
                        className={`${styles.colorVariant} ${
                          index === currentVariantIndex ? styles.activeColorVariant : ''
                        }`}
                        style={{ backgroundColor: v.color }}
                        onClick={() => changeVariant(product.id, index)}
                        title={v.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className={styles.variantName}>{variant.name}</p>
              <p className={styles.productDescription}>
                {variant.description}
              </p>

              {product.rating && product.reviews !== undefined && (
                <div className={styles.ratingContainer}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${styles.star} ${
                          i < Math.floor(product.rating || 0) ? styles.filledStar : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className={styles.reviewCount}>
                    {product.rating} ({product.reviews.toLocaleString()} reviews)
                  </span>
                </div>
              )}

              <div className={styles.priceContainer}>
                <div className={styles.prices}>
                  <span className={styles.price}>${variant.price}</span>
                  {variant.originalPrice && (
                    <span className={styles.originalPrice}>
                      ${variant.originalPrice}
                    </span>
                  )}
                </div>
                {product.inStock ? (
                  <span className={styles.inStock}>In Stock</span>
                ) : (
                  <span className={styles.outOfStock}>Out of Stock</span>
                )}
              </div>

              <button className={styles.addToCartButton}>
                <ShoppingCart className={styles.cartIcon} />
                Add to Cart
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;

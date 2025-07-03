import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import styles from './ProductDetail.module.css';

// Import the featured products data
import { featuredProducts } from '../../Hero/Hero';

// Define product categories for filtering
const productCategories = ['All', 'Flashing', 'Membranes', 'Drains', 'Fasteners', 'Sealants'];

interface ProductDetailProps {
  // You can add props if needed
}

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [relatedProducts, setRelatedProducts] = useState(featuredProducts);
  
  // Find the current product
  const product = featuredProducts.find(p => p.id === Number(id));
  
  // Filter related products based on selected category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setRelatedProducts(featuredProducts);
    } else {
      setRelatedProducts(featuredProducts.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory]);

  if (!product) {
    return (
      <div className={styles.productNotFound}>
        <h2>Product Not Found</h2>
        <Link to="/flashco" className={styles.backLink}>
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.breadcrumbs}>
        <Link to="/flashco">Home</Link> / 
        <Link to={`/category/${product.category.toLowerCase()}`}> {product.category}</Link> / 
        <span> {product.name}</span>
      </div>
      
      <div className={styles.productDetail}>
        <div className={styles.productImageGallery}>
          <div className={styles.mainImage}>
            <img src={product.image} alt={product.name} />
            {product.isNew && <span className={styles.newBadge}>New</span>}
          </div>
          <div className={styles.thumbnails}>
            <div className={`${styles.thumbnail} ${styles.activeThumbnail}`}>
              <img src={product.image} alt={product.name} />
            </div>
            <div className={styles.thumbnail}>
              <img src={product.image} alt={product.name} />
            </div>
            <div className={styles.thumbnail}>
              <img src={product.image} alt={product.name} />
            </div>
          </div>
        </div>
        
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          
          <div className={styles.productMeta}>
            <div className={styles.productCategory}>{product.category}</div>
            <div className={styles.productRating}>
              <div className={styles.stars}>
                {'★'.repeat(Math.floor(product.rating))}
                {product.rating % 1 !== 0 && '☆'}
                {'☆'.repeat(5 - Math.ceil(product.rating))}
              </div>
              <span className={styles.reviewCount}>{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>
          
          <div className={styles.productPricing}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
            )}
            {product.originalPrice && (
              <span className={styles.discount}>
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          
          <div className={styles.stockStatus}>
            <span className={styles.inStock}>In Stock</span>
            <span className={styles.stockCount}>12 items available</span>
          </div>
          
          <div className={styles.productDescription}>
            <h3>Description</h3>
            <p>{product.description}</p>
            <p>This premium quality {product.category.toLowerCase()} is designed for professional roofing applications, providing excellent durability and weather resistance. Engineered to meet the highest industry standards.</p>
          </div>
          
          <div className={styles.colorOptions}>
            <h3>Color Options</h3>
            <div className={styles.colorSelectors}>
              <button className={`${styles.colorOption} ${styles.activeColor}`} style={{backgroundColor: '#333'}} aria-label="Black color option"></button>
              <button className={styles.colorOption} style={{backgroundColor: '#fff', border: '1px solid #ddd'}} aria-label="White color option"></button>
              <button className={styles.colorOption} style={{backgroundColor: '#ccc'}} aria-label="Gray color option"></button>
            </div>
          </div>
          
          <div className={styles.quantitySelector}>
            <h3>Quantity</h3>
            <div className={styles.quantityControls}>
              <button className={styles.quantityButton}>-</button>
              <input type="number" min="1" value="1" className={styles.quantityInput} />
              <button className={styles.quantityButton}>+</button>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button className={styles.addToCartButton}>
              <span className={styles.cartIcon}>🛒</span>
              Add to Cart
            </button>
            <button className={styles.wishlistButton}>
              <FiHeart />
            </button>
          </div>
          
          <div className={styles.productFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🚚</span>
              <div className={styles.featureText}>
                <h4>Free Shipping</h4>
                <p>On orders over $100</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔄</span>
              <div className={styles.featureText}>
                <h4>30-Day Returns</h4>
                <p>Hassle-free returns</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🛡️</span>
              <div className={styles.featureText}>
                <h4>2-Year Warranty</h4>
                <p>Full coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.relatedProducts}>
        <h2>Related Products</h2>
        
        <div className={styles.categoryFilter}>
          {productCategories.map(category => (
            <button 
              key={category}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.activeCategory : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className={styles.productGrid}>
          {relatedProducts.map(relatedProduct => (
            <div key={relatedProduct.id} className={styles.relatedProductCard}>
              <Link to={`/product/${relatedProduct.id}`} className={styles.productLink}>
                <div className={styles.relatedProductImage}>
                  <img src={relatedProduct.image} alt={relatedProduct.name} />
                  {relatedProduct.isNew && <span className={styles.newBadge}>New</span>}
                </div>
                <div className={styles.relatedProductInfo}>
                  <h3 className={styles.relatedProductName}>{relatedProduct.name}</h3>
                  <div className={styles.relatedProductPrice}>
                    <span className={styles.price}>${relatedProduct.price.toFixed(2)}</span>
                    {relatedProduct.originalPrice && (
                      <span className={styles.originalPrice}>${relatedProduct.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

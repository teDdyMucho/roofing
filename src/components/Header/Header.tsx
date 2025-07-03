import React from 'react';
import { FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import styles from './Header.module.css';
import { FaHome } from 'react-icons/fa';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}><FaHome className="logo-icon" style={{marginBottom: '10px'}} /> Southland Roofing</div>
      {/* <div className={styles.logo}><img src="/images/flashCo-Logo.png" width="200" height="200" alt="FlashCo" /></div> */}
      <nav className={styles.nav}>
        <a href="#products">Products</a>
        <a href="#categories">Categories</a>
        <a href="#deals">Deals</a>
        <a href="#support">Support</a>
      </nav>
      <div className={styles.icons}>
        <FiUser className={styles.icon} />
        <FiHeart className={styles.icon} />
        <FiShoppingCart className={styles.icon} />
      </div>
    </header>
  );
};

export default Header;

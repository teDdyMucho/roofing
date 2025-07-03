import React from 'react';
import { FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Flashco</div>
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

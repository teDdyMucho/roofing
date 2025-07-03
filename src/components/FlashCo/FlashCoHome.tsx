import React from 'react';
import Header from '../Header/Header';
import Hero from '../Hero/Hero';
import styles from './FlashCoHome.module.css';

const FlashCoHome = () => {
  return (
    <div className={styles.container}>
      <Header />
      <Hero />
      {/* Add other sections here */}
    </div>
  );
};

export default FlashCoHome;

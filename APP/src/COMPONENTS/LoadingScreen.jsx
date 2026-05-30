import React from 'react';
import { motion } from 'framer-motion';
import styles from './LoadingScreen.module.css';

const LoadingScreen = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.content}>
        {/* Animated Logo */}
        <motion.div
          className={styles.logoContainer}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.img
            src="/skoolific-icon.png"
            alt="Skoolific"
            className={styles.logo}
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className={styles.brandName}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          SKOOLIFIC
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={styles.subtitle}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          SCHOOL MANAGEMENT SYSTEM
        </motion.p>

        {/* Modern Spinner */}
        <motion.div
          className={styles.pencil}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;

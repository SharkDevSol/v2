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

        {/* Pencil SVG Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className={styles.pencil}
          >
            {/* Pencil stroke line */}
            <defs>
              <linearGradient id="pencilGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle
              className={styles.pencilStroke}
              fill="none"
              stroke="url(#pencilGradient)"
              strokeWidth="2"
              strokeDasharray="439.82 439.82"
              strokeDashoffset="439.82"
              strokeLinecap="round"
              cx="100"
              cy="100"
              r="70"
              transform="rotate(-113, 100, 100)"
            />
            <g className={styles.pencilRotate} transform="translate(100, 100)">
              {/* Pencil body */}
              <g transform="translate(-10, -60)">
                {/* Eraser */}
                <rect
                  className={styles.pencilEraser}
                  x="6"
                  y="0"
                  width="8"
                  height="8"
                  rx="2"
                  fill="#f472b6"
                />
                {/* Metal band */}
                <rect x="5" y="8" width="10" height="4" fill="#94a3b8" rx="1" />
                {/* Body */}
                <polygon
                  points="5,12 15,12 15,52 5,52"
                  fill="#fbbf24"
                />
                <polygon
                  points="5,12 10,12 10,52 5,52"
                  fill="#f59e0b"
                />
                <polygon
                  points="10,12 15,12 15,52 10,52"
                  fill="#fcd34d"
                />
                {/* Pencil tip wood */}
                <polygon
                  points="5,52 15,52 12,60 8,60"
                  fill="#d4a574"
                />
                {/* Pencil point */}
                <polygon
                  className={styles.pencilPoint}
                  points="8,60 12,60 10,66"
                  fill="#374151"
                />
              </g>
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;

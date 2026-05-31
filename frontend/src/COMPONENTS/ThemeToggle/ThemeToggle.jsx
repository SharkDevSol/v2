import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

/**
 * ThemeToggle component - switches between dark and light mode
 * Uses the ThemeContext for state management
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Toggle size: 'sm' | 'md' | 'lg'
 */
const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  const buttonClasses = [
    styles.themeToggle,
    styles[size],
    isDarkMode ? styles.dark : styles.light,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      <span className={`${styles.iconWrapper} ${styles.sunIcon}`}>
        <Sun size={iconSize} />
      </span>
      <span className={`${styles.iconWrapper} ${styles.moonIcon}`}>
        <Moon size={iconSize} />
      </span>
      <span className={styles.slider} />
    </button>
  );
};

export default ThemeToggle;

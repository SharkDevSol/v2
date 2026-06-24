import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

/**
 * ThemeToggle component - Toggles between light and dark themes
 * @param {Object} props - Component props
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Size of the toggle button
 * @param {boolean} [props.showLabel=false] - Whether to show text label
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Theme toggle button
 */
const ThemeToggle = ({ size = 'medium', showLabel = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  const sizeClass = styles[`size-${size}`] || styles['size-medium'];
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  
  return (
    <button
      onClick={toggleTheme}
      className={`${styles.themeToggle} ${sizeClass} ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className={styles.icon} size={iconSize} />
      ) : (
        <Sun className={styles.icon} size={iconSize} />
      )}
      {showLabel && (
        <span className={styles.label}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

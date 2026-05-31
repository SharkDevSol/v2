import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * LoadingSpinner component for loading states
 * 
 * Features:
 * - Multiple sizes (small, medium, large)
 * - Configurable colors
 * - Full-screen overlay mode
 * - Optional loading message
 * - ARIA attributes for accessibility (aria-busy, aria-label)
 * - RTL layout support
 * 
 * @param {Object} props - Component props
 * @param {('small'|'medium'|'large')} props.size - Spinner size (default: 'medium')
 * @param {string} props.color - Spinner color (CSS color value or theme variable)
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullScreen - Show as full screen overlay (default: false)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Custom ARIA label for accessibility (default: 'Loading')
 */
const LoadingSpinner = ({ 
  size = 'medium',
  color,
  message,
  fullScreen = false,
  className = '',
  ariaLabel = 'Loading'
}) => {
  // Map size prop to CSS class names
  const sizeMap = {
    small: 'sm',
    medium: 'md',
    large: 'lg'
  };

  const spinnerClasses = [
    styles.spinner,
    styles[sizeMap[size]],
    className
  ].filter(Boolean).join(' ');

  const spinnerStyle = color ? { borderTopColor: color } : {};

  const content = (
    <div className={styles.spinnerWrapper} aria-busy="true" aria-live="polite">
      <div 
        className={spinnerClasses} 
        style={spinnerStyle}
        role="status" 
        aria-label={ariaLabel}
      >
        <span className={styles.srOnly}>{ariaLabel}...</span>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreenOverlay} role="dialog" aria-modal="true">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

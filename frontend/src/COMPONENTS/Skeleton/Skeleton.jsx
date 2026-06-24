import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Skeleton component for loading placeholders
 * 
 * Features:
 * - Multiple variants (text, circular, rectangular)
 * - Configurable dimensions
 * - Multiple skeleton elements
 * - Animation types (pulse, wave)
 * - ARIA attributes for accessibility (aria-busy, aria-label)
 * - RTL layout support
 * 
 * @param {Object} props - Component props
 * @param {('text'|'circular'|'rectangular')} props.variant - Skeleton variant (default: 'text')
 * @param {string|number} props.width - Width (CSS value)
 * @param {string|number} props.height - Height (CSS value)
 * @param {number} props.count - Number of skeleton items to render (default: 1)
 * @param {('pulse'|'wave'|'none')} props.animation - Animation type (default: 'wave')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Custom ARIA label for accessibility (default: 'Loading content')
 */
const Skeleton = ({ 
  variant = 'text',
  width,
  height,
  count = 1,
  animation = 'wave',
  className = '',
  ariaLabel = 'Loading content'
}) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    animation !== 'none' && styles[animation],
    className
  ].filter(Boolean).join(' ');

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  if (count > 1) {
    return (
      <div 
        className={styles.skeletonGroup}
        aria-busy="true"
        aria-live="polite"
        aria-label={ariaLabel}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index} 
            className={skeletonClasses} 
            style={style}
            role="status"
          >
            <span className={styles.srOnly}>{ariaLabel}...</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={skeletonClasses} 
      style={style}
      aria-busy="true"
      aria-live="polite"
      aria-label={ariaLabel}
      role="status"
    >
      <span className={styles.srOnly}>{ariaLabel}...</span>
    </div>
  );
};

export default Skeleton;

import React from 'react';
import styles from './Badge.module.css';

/**
 * Badge component for labels and status indicators
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (default, primary, secondary, success, warning, error, info)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {boolean} props.dot - Show as dot indicator
 * @param {boolean} props.outline - Outlined style
 * @param {React.ReactNode} props.icon - Icon element
 * @param {Function} props.onRemove - Remove handler (shows X button)
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({ 
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  outline = false,
  icon,
  onRemove,
  className = ''
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    dot && styles.dot,
    outline && styles.outline,
    className
  ].filter(Boolean).join(' ');

  if (dot) {
    return <span className={badgeClasses} />;
  }

  return (
    <span className={badgeClasses}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {onRemove && (
        <button 
          className={styles.removeButton}
          onClick={onRemove}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Badge;

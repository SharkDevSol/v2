import React from 'react';
import styles from './Card.module.css';

/**
 * Card component for content containers
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {React.ReactNode} props.actions - Action buttons/elements (headerAction)
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.variant - Card variant (default, outlined, elevated)
 * @param {string} props.padding - Padding size (none, sm, md, lg)
 * @param {boolean} props.hoverable - Enable hover effect
 * @param {boolean} props.bordered - Show border (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.role - ARIA role attribute
 * @param {string} props.ariaLabel - ARIA label for accessibility
 * @param {string} props.ariaLabelledBy - ARIA labelledby attribute
 * @param {string} props.ariaDescribedBy - ARIA describedby attribute
 */
const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  footer,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  bordered = true,
  className = '',
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ...props 
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hoverable && styles.hoverable,
    !bordered && styles.noBorder,
    className
  ].filter(Boolean).join(' ');

  // Build ARIA attributes
  const ariaAttributes = {
    ...(role && { role }),
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy }),
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
  };

  return (
    <div className={cardClasses} {...ariaAttributes} {...props}>
      {(title || subtitle || actions) && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      
      <div className={styles.content}>
        {children}
      </div>

      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

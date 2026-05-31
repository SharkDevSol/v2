import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageHeader.module.css';

/**
 * PageHeader component
 * Displays page title, subtitle, and action buttons
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Optional page subtitle
 * @param {ReactNode} props.actions - Optional action buttons or controls
 * @param {string} props.className - Additional CSS classes
 */
const PageHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  if (!title && !subtitle && !actions) {
    return null;
  }

  const headerClasses = [
    styles.pageHeader,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <div className={styles.headerContent}>
        {(title || subtitle) && (
          <div className={styles.headerText}>
            {title && (
              <h1 className={styles.title}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={styles.subtitle}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {actions && (
          <div className={styles.headerActions}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string
};

export default PageHeader;

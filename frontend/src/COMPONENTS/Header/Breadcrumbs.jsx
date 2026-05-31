import React from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Breadcrumbs.module.css';

/**
 * Breadcrumbs component for navigation trail
 * Shows the current page location in the hierarchy
 * 
 * @param {Object} props - Component props
 * @param {Array} props.breadcrumbs - Array of breadcrumb objects
 */
const Breadcrumbs = ({ breadcrumbs = [] }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (breadcrumbs.length === 0) {
    return null;
  }

  const handleClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className={styles.breadcrumbs} aria-label={t('common.breadcrumbs', 'Breadcrumbs')}>
      <ol className={styles.breadcrumbList}>
        {/* Home icon as first breadcrumb */}
        <li className={styles.breadcrumbItem}>
          <button
            className={styles.breadcrumbLink}
            onClick={() => handleClick('/')}
            aria-label={t('common.home', 'Home')}
          >
            <Home size={16} aria-hidden="true" />
          </button>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Separator */}
              <li className={styles.separator} aria-hidden="true">
                <ChevronRight size={16} />
              </li>

              {/* Breadcrumb item */}
              <li className={styles.breadcrumbItem}>
                {isLast ? (
                  <span className={styles.breadcrumbCurrent} aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    className={styles.breadcrumbLink}
                    onClick={() => handleClick(crumb.path)}
                    disabled={!crumb.path}
                  >
                    {crumb.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  )
};

export default Breadcrumbs;

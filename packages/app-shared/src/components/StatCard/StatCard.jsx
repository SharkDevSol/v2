import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

/**
 * StatCard Component
 * 
 * A card component for displaying statistics with an icon, title, value, and optional trend indicator.
 * Supports different metric types (number, percentage, currency), sizes, and RTL layout.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title/label of the statistic
 * @param {string|number} props.value - The main value to display
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} [props.variant='default'] - Color variant: 'default', 'primary', 'secondary', 'success', 'warning', 'error'
 * @param {string} [props.size='medium'] - Size variant: 'small', 'medium', 'large'
 * @param {string} [props.metricType='number'] - Type of metric: 'number', 'percentage', 'currency'
 * @param {string} [props.currency='$'] - Currency symbol when metricType is 'currency'
 * @param {Object} [props.trend] - Optional trend indicator
 * @param {number} props.trend.value - Trend percentage value (positive or negative)
 * @param {string} [props.trend.direction] - Trend direction: 'up' or 'down' (auto-detected from value if not provided)
 * @param {string} [props.trend.label] - Trend label (e.g., "vs last month")
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {boolean} [props.loading=false] - Show loading state
 * @param {Function} [props.onClick] - Optional click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.ariaLabel] - Custom ARIA label for accessibility
 */
const StatCard = ({
  title,
  value,
  icon,
  variant = 'default',
  size = 'medium',
  metricType = 'number',
  currency = '$',
  trend,
  subtitle,
  loading = false,
  onClick,
  className = '',
  ariaLabel
}) => {
  const isClickable = typeof onClick === 'function';
  
  // Determine trend direction
  const trendDirection = trend?.direction || (trend?.value > 0 ? 'up' : trend?.value < 0 ? 'down' : 'neutral');
  const trendIsPositive = trendDirection === 'up';
  const trendIsNegative = trendDirection === 'down';
  
  /**
   * Format the value based on metric type
   */
  const formatValue = (val) => {
    if (loading || val === null || val === undefined) return '—';
    
    switch (metricType) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        // Handle both string and number values
        const numVal = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
        return isNaN(numVal) ? val : `${currency}${numVal.toLocaleString()}`;
      case 'number':
      default:
        // Handle both string and number values
        const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
        return isNaN(num) ? val : num.toLocaleString();
    }
  };

  const cardClasses = [
    styles.statCard,
    styles[variant],
    styles[size],
    isClickable && styles.clickable,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (isClickable && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (isClickable && !loading && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };
  
  // Generate accessible label
  const accessibleLabel = ariaLabel || `${title}: ${formatValue(value)}${trend ? `, trend ${trendDirection} ${Math.abs(trend.value)}%` : ''}`;

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={accessibleLabel}
      aria-busy={loading}
    >
      {loading ? (
        <div className={styles.loadingState} aria-label="Loading statistics">
          <div className={styles.skeleton} aria-hidden="true" />
          <div className={styles.skeleton} aria-hidden="true" />
          <div className={styles.skeleton} aria-hidden="true" />
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.iconWrapper} aria-hidden="true">
              {icon}
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{title}</h3>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.value} aria-label={`Value: ${formatValue(value)}`}>
              {formatValue(value)}
            </div>
            
            {trend && (
              <div className={styles.trendWrapper}>
                <span
                  className={`${styles.trend} ${
                    trendIsPositive ? styles.trendUp : trendIsNegative ? styles.trendDown : styles.trendNeutral
                  }`}
                  aria-label={`Trend: ${trendDirection} ${Math.abs(trend.value)} percent`}
                >
                  {trendIsPositive && <TrendingUp size={16} aria-hidden="true" />}
                  {trendIsNegative && <TrendingDown size={16} aria-hidden="true" />}
                  <span>{Math.abs(trend.value)}%</span>
                </span>
                {trend.label && <span className={styles.trendLabel}>{trend.label}</span>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  metricType: PropTypes.oneOf(['number', 'percentage', 'currency']),
  currency: PropTypes.string,
  trend: PropTypes.shape({
    value: PropTypes.number.isRequired,
    direction: PropTypes.oneOf(['up', 'down']),
    label: PropTypes.string
  }),
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string
};

export default StatCard;

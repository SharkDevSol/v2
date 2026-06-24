import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '../Badge/Badge';
import styles from './MenuItem.module.css';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * MenuItem component for Sidebar
 * Supports nested menu items and badges
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - Menu item object
 * @param {boolean} props.active - Whether this item is active
 * @param {boolean} props.collapsed - Whether sidebar is collapsed
 * @param {Function} props.onNavigate - Callback when item is clicked
 */
const MenuItem = ({
  item,
  active = false,
  collapsed = false,
  onNavigate
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setExpanded(!expanded);
    } else {
      onNavigate(item.path, item.id);
    }
  };

  const handleChildClick = (childPath, childId) => {
    onNavigate(childPath, childId);
  };

  const itemClasses = [
    styles.menuItem,
    active && styles.active,
    collapsed && styles.collapsed
  ].filter(Boolean).join(' ');

  const labelClasses = [
    styles.menuLabel,
    collapsed && styles.hidden
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.menuItemWrapper}>
      <button
        className={itemClasses}
        onClick={handleClick}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
      >
        <span className={styles.menuIcon} aria-hidden="true">
          {item.icon}
        </span>
        
        <span className={labelClasses}>
          {item.label}
        </span>

        {!collapsed && item.badge > 0 && (
          <Badge
            variant="danger"
            size="small"
            className={styles.badge}
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}

        {!collapsed && hasChildren && (
          <span className={styles.expandIcon} aria-hidden="true">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </button>

      {/* Nested Menu Items */}
      {hasChildren && expanded && !collapsed && (
        <div className={styles.submenu} role="group">
          {item.children.map(child => (
            <button
              key={child.id}
              className={`${styles.submenuItem} ${active === child.id ? styles.active : ''}`}
              onClick={() => handleChildClick(child.path, child.id)}
              aria-current={active === child.id ? 'page' : undefined}
            >
              <span className={styles.submenuIcon} aria-hidden="true">
                {child.icon}
              </span>
              <span className={styles.submenuLabel}>
                {child.label}
              </span>
              {child.badge > 0 && (
                <Badge
                  variant="danger"
                  size="small"
                  className={styles.badge}
                >
                  {child.badge > 99 ? '99+' : child.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    path: PropTypes.string.isRequired,
    badge: PropTypes.number,
    children: PropTypes.array
  }).isRequired,
  active: PropTypes.bool,
  collapsed: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired
};

export default MenuItem;

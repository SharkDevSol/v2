import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from './Breadcrumbs';
import SearchBar from './SearchBar';
import NotificationCenter from './NotificationCenter';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import styles from './Header.module.css';
import { Bell, Moon, Sun } from 'lucide-react';

/**
 * Header component with navigation utilities
 * Provides search, notifications, and profile menu
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback function when search is triggered
 * @param {Array} props.notifications - Array of notification objects
 * @param {Function} props.onNotificationClick - Callback when a notification is clicked
 * @param {Object} props.user - User information object with name, role, and optional avatar
 * @param {Function} props.onLogout - Callback function for logout action
 * @param {Function} props.onProfileClick - Callback function when profile is clicked
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.pageTitle - Current page title
 * @param {string} props.pageSubtitle - Current page subtitle/welcome message
 * @param {Array} props.breadcrumbs - Array of breadcrumb objects
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {Function} props.onToggleDarkMode - Callback to toggle dark mode
 * @param {boolean} props.sidebarCollapsed - Whether sidebar is collapsed
 */
const Header = ({
  onSearch,
  notifications = [],
  onNotificationClick,
  user,
  onLogout,
  onProfileClick,
  className = '',
  pageTitle = 'Dashboard',
  pageSubtitle = '',
  breadcrumbs = [],
  isDarkMode = false,
  onToggleDarkMode,
  sidebarCollapsed = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at top
      // Hide header when scrolling down and past 100px
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const headerClasses = [
    styles.header,
    sidebarCollapsed && styles.collapsed,
    !isVisible && styles.hidden,
    className
  ].filter(Boolean).join(' ');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={headerClasses} role="banner">
      <div className={styles.headerContent}>
        {/* Left section: Page Title and Breadcrumbs */}
        <div className={styles.leftSection}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          )}
          <div className={styles.pageInfo}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            {pageSubtitle && (
              <p className={styles.pageSubtitle}>{pageSubtitle}</p>
            )}
          </div>
        </div>

        {/* Right section: Utilities */}
        <div className={styles.rightSection}>
          {/* Search */}
          {onSearch && (
            <div className={styles.searchWrapper}>
              <SearchBar onSearch={onSearch} />
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <NotificationCenter
            notifications={notifications}
            onNotificationClick={onNotificationClick}
          />

          {/* Profile Menu */}
          <ProfileMenu
            user={user}
            onLogout={onLogout}
            onProfileClick={onProfileClick}
          />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  onSearch: PropTypes.func,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['info', 'warning', 'error', 'success']).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.instanceOf(Date).isRequired,
      read: PropTypes.bool.isRequired
    })
  ),
  onNotificationClick: PropTypes.func,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func,
  className: PropTypes.string,
  pageTitle: PropTypes.string,
  pageSubtitle: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ),
  isDarkMode: PropTypes.bool,
  onToggleDarkMode: PropTypes.func,
  sidebarCollapsed: PropTypes.bool
};

export default Header;

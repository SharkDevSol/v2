import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import PageHeader from './PageHeader';
import Footer from './Footer';
import Skeleton from '../Skeleton/Skeleton';
import styles from './PageLayout.module.css';
import { AlertCircle } from 'lucide-react';

/**
 * PageLayout wrapper component
 * Provides consistent layout structure with Sidebar, Header, content area, and Footer
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Page content
 * @param {string} props.title - Optional page title
 * @param {string} props.subtitle - Optional page subtitle
 * @param {ReactNode} props.actions - Optional page actions
 * @param {Array} props.breadcrumbs - Optional breadcrumbs for Header
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Array} props.menuItems - Menu items for Sidebar
 * @param {string} props.activeMenuItem - Active menu item ID
 * @param {Function} props.onNavigate - Navigation callback
 * @param {Array} props.notifications - Notifications for Header
 * @param {Function} props.onNotificationClick - Notification click callback
 * @param {Object} props.user - User information for Header
 * @param {Function} props.onLogout - Logout callback
 * @param {Function} props.onProfileClick - Profile click callback
 * @param {Function} props.onSearch - Search callback
 * @param {string} props.userRole - User role for menu filtering
 * @param {string} props.className - Additional CSS classes
 */
const PageLayout = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  loading = false,
  error = null,
  menuItems = [],
  activeMenuItem = '',
  onNavigate,
  notifications = [],
  onNotificationClick,
  user,
  onLogout,
  onProfileClick,
  onSearch,
  userRole = 'admin',
  className = ''
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const layoutClasses = [
    styles.pageLayout,
    sidebarCollapsed && styles.sidebarCollapsed,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        menuItems={menuItems}
        activeItem={activeMenuItem}
        onNavigate={onNavigate}
        userRole={userRole}
        branding={{
          name: 'Skoolific',
          tagline: 'SCHOOL MANAGEMENT SYSTEM',
          logo: null
        }}
        showPremium={true}
        onPremiumClick={() => console.log('Premium upgrade clicked')}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Header */}
        <Header
          pageTitle={title || 'Dashboard'}
          pageSubtitle={subtitle || `Welcome back, ${user?.name || 'User'}! Here's what's happening today.`}
          onSearch={onSearch}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          unreadMessages={0}
          onMessagesClick={() => console.log('Messages clicked')}
          user={user}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
        />

        {/* Page Container */}
        <div className={styles.pageContainer}>
          {/* Page Header - Only show if we have actions, since title is now in Header */}
          {actions && (
            <PageHeader
              title={title}
              subtitle={subtitle}
              actions={actions}
            />
          )}

          {/* Content Area */}
          <main className={styles.contentArea} role="main">
            {loading ? (
              <div className={styles.loadingState}>
                <Skeleton variant="rectangular" height="200px" />
                <Skeleton variant="rectangular" height="150px" />
                <Skeleton variant="rectangular" height="150px" />
              </div>
            ) : error ? (
              <div className={styles.errorState} role="alert">
                <AlertCircle size={48} className={styles.errorIcon} />
                <h2 className={styles.errorTitle}>Something went wrong</h2>
                <p className={styles.errorMessage}>{error}</p>
              </div>
            ) : (
              children
            )}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      path: PropTypes.string.isRequired,
      badge: PropTypes.number,
      children: PropTypes.array,
      roles: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  activeMenuItem: PropTypes.string,
  onNavigate: PropTypes.func,
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
  }),
  onLogout: PropTypes.func,
  onProfileClick: PropTypes.func,
  onSearch: PropTypes.func,
  userRole: PropTypes.string,
  className: PropTypes.string
};

export default PageLayout;

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Badge from '../Badge/Badge';
import styles from './NotificationCenter.module.css';

/**
 * NotificationCenter component for displaying notifications
 * Shows a dropdown with notification list and unread count badge
 * 
 * @param {Object} props - Component props
 * @param {Array} props.notifications - Array of notification objects
 * @param {Function} props.onNotificationClick - Callback when a notification is clicked
 * @param {string} props.className - Additional CSS classes
 */
const NotificationCenter = ({ notifications = [], onNotificationClick, className = '' }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationCenterClasses = [
    styles.notificationCenter,
    className
  ].filter(Boolean).join(' ');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification.id);
    // Don't close dropdown automatically to allow multiple interactions
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle size={20} aria-hidden="true" />;
      case 'error':
        return <AlertCircle size={20} aria-hidden="true" />;
      case 'info':
      default:
        return <Info size={20} aria-hidden="true" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('common.justNow', 'Just now');
    if (minutes < 60) return t('common.minutesAgo', '{{count}} minutes ago', { count: minutes });
    if (hours < 24) return t('common.hoursAgo', '{{count}} hours ago', { count: hours });
    if (days < 7) return t('common.daysAgo', '{{count}} days ago', { count: days });
    return timestamp.toLocaleDateString();
  };

  return (
    <div className={notificationCenterClasses} ref={dropdownRef}>
      <button
        className={styles.notificationButton}
        onClick={toggleDropdown}
        aria-label={t('common.notifications', 'Notifications')}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <Badge
            variant="danger"
            count={unreadCount}
            maxCount={99}
            className={styles.badge}
          />
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>
              {t('common.notifications', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <span className={styles.unreadCount}>
                {t('common.unreadCount', '{{count}} unread', { count: unreadCount })}
              </span>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={48} aria-hidden="true" />
                <p>{t('common.noNotifications', 'No notifications')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  role="menuitem"
                  type="button"
                >
                  <div className={`${styles.notificationIcon} ${styles[notification.type]}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4 className={styles.notificationTitle}>{notification.title}</h4>
                      {!notification.read && (
                        <span className={styles.unreadDot} aria-label={t('common.unread', 'Unread')} />
                      )}
                    </div>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    <span className={styles.notificationTime}>
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className={styles.dropdownFooter}>
              <button
                className={styles.viewAllButton}
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page
                }}
                type="button"
              >
                {t('common.viewAll', 'View all notifications')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NotificationCenter.propTypes = {
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
  className: PropTypes.string
};

export default NotificationCenter;

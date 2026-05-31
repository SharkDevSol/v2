import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FiBell, 
  FiCalendar, 
  FiDollarSign, 
  FiCheckCircle,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';
import styles from './GuardianNotifications.module.css';

const GuardianNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, attendance, payment

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock notifications - replace with actual API call
      const mockNotifications = [
        {
          id: 1,
          type: 'attendance',
          title: 'Daily Attendance Report',
          message: 'Your ward Ahmed was present today with check-in at 7:45 AM',
          date: new Date().toISOString(),
          read: false,
          icon: 'calendar'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Monthly Payment Summary',
          message: 'Payment of ETB 2,500 received for January 2026. Thank you!',
          date: new Date(Date.now() - 86400000).toISOString(),
          read: false,
          icon: 'dollar'
        },
        {
          id: 3,
          type: 'attendance',
          title: 'Attendance Alert',
          message: 'Your ward Sara was marked late today at 8:15 AM',
          date: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          icon: 'alert'
        },
        {
          id: 4,
          type: 'payment',
          title: 'Payment Reminder',
          message: 'Outstanding balance of ETB 1,200 for February 2026',
          date: new Date(Date.now() - 259200000).toISOString(),
          read: true,
          icon: 'dollar'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'calendar':
        return <FiCalendar size={24} />;
      case 'dollar':
        return <FiDollarSign size={24} />;
      case 'alert':
        return <FiAlertCircle size={24} />;
      default:
        return <FiBell size={24} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerTop}>
          <div className={styles.titleSection}>
            <FiBell className={styles.headerIcon} />
            <h1>Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button 
              className={styles.markAllBtn}
              onClick={markAllAsRead}
            >
              <FiCheckCircle size={16} />
              Mark all as read
            </button>
          )}
        </div>
        
        {unreadCount > 0 && (
          <div className={styles.unreadBadge}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div 
        className={styles.filterTabs}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          <FiBell size={18} />
          All
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'attendance' ? styles.active : ''}`}
          onClick={() => setFilter('attendance')}
        >
          <FiCalendar size={18} />
          Attendance
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'payment' ? styles.active : ''}`}
          onClick={() => setFilter('payment')}
        >
          <FiDollarSign size={18} />
          Payments
        </button>
      </motion.div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <motion.div 
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiBell size={64} className={styles.emptyIcon} />
            <h3>No notifications</h3>
            <p>You're all caught up! Check back later for updates.</p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              className={`${styles.notificationCard} ${!notification.read ? styles.unread : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => markAsRead(notification.id)}
            >
              <div className={`${styles.iconContainer} ${styles[notification.type]}`}>
                {getIcon(notification.icon)}
              </div>
              
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h3>{notification.title}</h3>
                  {!notification.read && (
                    <span className={styles.unreadDot}></span>
                  )}
                </div>
                <p className={styles.notificationMessage}>
                  {notification.message}
                </p>
                <div className={styles.notificationFooter}>
                  <FiClock size={14} />
                  <span>{formatDate(notification.date)}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Card */}
      <motion.div 
        className={styles.infoCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3>📬 About Notifications</h3>
        <ul>
          <li>
            <FiCalendar size={16} />
            <span>Daily attendance reports sent at 4:00 PM</span>
          </li>
          <li>
            <FiDollarSign size={16} />
            <span>Monthly payment summaries on the 1st of each month</span>
          </li>
          <li>
            <FiBell size={16} />
            <span>Important alerts and reminders</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default GuardianNotifications;

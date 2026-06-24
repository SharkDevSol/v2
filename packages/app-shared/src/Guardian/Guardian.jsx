import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiUser, 
  FiCalendar,
  FiFileText,
  FiSearch,
  FiBell,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { FaUserShield } from 'react-icons/fa';
import styles from './Guardian.module.css';

const Guardian = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const path = location.pathname.split('/guardian/')[1] || '';
    setActiveTab(path);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navItems = [
    { path: '', icon: <FiHome size={20} />, label: 'Home' },
    { path: 'wards', icon: <FiUsers size={20} />, label: 'My Wards' },
    { path: 'attendance', icon: <FiCalendar size={20} />, label: 'Attendance' },
    { path: 'marks', icon: <FiFileText size={20} />, label: 'Marks' },
    { path: 'notifications', icon: <FiBell size={20} />, label: 'Notifications' },
    { path: 'messages', icon: <FiMessageSquare size={20} />, label: 'Messages' },
    { path: 'profile', icon: <FiUser size={20} />, label: 'Profile' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.appContainer}>
      {/* Top Navigation Bar */}
      <motion.header 
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <FaUserShield className={styles.logoIcon} />
            <h1 className={styles.logo}>Guardian Portal</h1>
          </div>
          
          <div className={styles.desktopNav}>
            {navItems.map((item) => (
              <Link 
                to={`/guardian/${item.path}`} 
                key={item.path}
                className={`${styles.navLink} ${activeTab === item.path ? styles.active : ''}`}
                onClick={() => setActiveTab(item.path)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.iconButton}>
              <FiSearch size={20} />
            </button>
            <button className={styles.iconButton}>
              <FiBell size={20} />
            </button>
            <button 
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => (
              <Link 
                to={`/guardian/${item.path}`} 
                key={`mobile-${item.path}`}
                className={`${styles.mobileNavItem} ${activeTab === item.path ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab(item.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <motion.nav 
        className={styles.bottomNav}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className={styles.navContainer}>
          {navItems.map((item) => (
            <Link 
              to={`/guardian/${item.path}`} 
              key={`bottom-${item.path}`}
              className={`${styles.navItem} ${activeTab === item.path ? styles.active : ''}`}
              onClick={() => setActiveTab(item.path)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.navIcon}>
                  {item.icon}
                </div>
                <span className={styles.navLabel}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.nav>
    </div>
  );
};

export default Guardian;

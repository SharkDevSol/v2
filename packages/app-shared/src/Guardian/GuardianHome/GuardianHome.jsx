import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiFileText, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from './GuardianHome.module.css';

const GuardianHome = () => {
  const stats = [
    { icon: <FiUsers />, label: 'My Wards', value: '2', color: '#28a745', link: '/guardian/wards' },
    { icon: <FiCalendar />, label: 'Attendance', value: '95%', color: '#007bff', link: '/guardian/attendance' },
    { icon: <FiFileText />, label: 'Marks', value: 'View', color: '#ff7b00', link: '/guardian/marks' },
    { icon: <FiMessageSquare />, label: 'Messages', value: '3 New', color: '#6f42c1', link: '/guardian/messages' }
  ];

  const recentActivities = [
    { title: 'New marks uploaded', subject: 'Mathematics - Grade 10', time: '2 hours ago' },
    { title: 'Attendance marked', subject: 'Present - Today', time: '5 hours ago' },
    { title: 'New message from teacher', subject: 'Parent-Teacher Meeting', time: '1 day ago' }
  ];

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.welcome}>
          <h1>Welcome Back, Guardian!</h1>
          <p>Monitor your wards' academic progress and stay connected</p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Link to={stat.link} key={index} className={styles.statCard}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ borderColor: stat.color }}
              >
                <div className={styles.statIcon} style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className={styles.recentSection}>
          <h2><FiTrendingUp /> Recent Activities</h2>
          <div className={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                className={styles.activityItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <h3>{activity.title}</h3>
                  <p>{activity.subject}</p>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuardianHome;

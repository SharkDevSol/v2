import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Finance/FinanceDashboard.module.css';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    openPositions: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/hr/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: 'Organization Structure',
      description: 'Dynamic role & department builder (No-code style)',
      icon: '🏢',
      color: '#2196F3',
      path: '/hr/organization'
    },
    {
      title: 'Recruitment (ATS)',
      description: 'Applicant Tracking System from CV to Offer Letter',
      icon: '👥',
      color: '#4CAF50',
      path: '/hr/recruitment'
    },
    {
      title: 'Attendance System',
      description: 'Biometric/RFID integration, shift rules, overtime',
      icon: '⏰',
      color: '#FF9800',
      path: '/hr/attendance'
    },
    {
      title: 'Leave Management',
      description: 'Leave requests, approvals, and balance tracking',
      icon: '🏖️',
      color: '#9C27B0',
      path: '/hr/leave'
    },
    {
      title: 'Payroll System',
      description: 'Automated payroll based on attendance & rules',
      icon: '💰',
      color: '#F44336',
      path: '/hr/payroll'
    },
    {
      title: 'Performance',
      description: 'Performance reviews and KPI tracking',
      icon: '📊',
      color: '#00BCD4',
      path: '/hr/performance'
    },
    {
      title: 'Training',
      description: 'Training programs and skill development',
      icon: '🎓',
      color: '#FF5722',
      path: '/hr/training'
    },
    {
      title: 'Reports',
      description: 'HR analytics and comprehensive reports',
      icon: '📈',
      color: '#607D8B',
      path: '/hr/reports'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>HR & Staff Management</h1>
        <p>Comprehensive human resource management system</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ borderLeftColor: '#2196F3' }}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3>Total Staff</h3>
                <p className={styles.statValue}>{stats.totalStaff}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#4CAF50' }}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <h3>Active Staff</h3>
                <p className={styles.statValue}>{stats.activeStaff}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#FF9800' }}>
              <div className={styles.statIcon}>📢</div>
              <div className={styles.statContent}>
                <h3>Open Positions</h3>
                <p className={styles.statValue}>{stats.openPositions}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#9C27B0' }}>
              <div className={styles.statIcon}>🏖️</div>
              <div className={styles.statContent}>
                <h3>Pending Leaves</h3>
                <p className={styles.statValue}>{stats.pendingLeaves}</p>
              </div>
            </div>
          </div>

          <div className={styles.modulesGrid}>
            {modules.map((module, index) => (
              <div 
                key={index} 
                className={styles.moduleCard}
                style={{ borderTopColor: module.color }}
                onClick={() => navigate(module.path)}
              >
                <div className={styles.moduleIcon}>{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <button className={styles.moduleButton}>Open Module</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HRDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Finance/FinanceDashboard.module.css';

const AssetDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeAssets: 0,
    maintenanceDue: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/assets/stats', {
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
      title: 'Asset Registry',
      description: 'Register and manage fixed assets with QR/Barcode tagging',
      icon: '🏷️',
      color: '#2196F3',
      path: '/assets/registry'
    },
    {
      title: 'Asset Assignment',
      description: 'Assign assets to staff members or locations',
      icon: '👤',
      color: '#4CAF50',
      path: '/assets/assignments'
    },
    {
      title: 'Maintenance',
      description: 'Track maintenance schedules and service history',
      icon: '🔧',
      color: '#FF9800',
      path: '/assets/maintenance'
    },
    {
      title: 'Depreciation',
      description: 'Calculate and track asset depreciation',
      icon: '📉',
      color: '#9C27B0',
      path: '/assets/depreciation'
    },
    {
      title: 'Disposal',
      description: 'Manage asset disposal and write-offs',
      icon: '🗑️',
      color: '#F44336',
      path: '/assets/disposal'
    },
    {
      title: 'Reports',
      description: 'View asset reports and analytics',
      icon: '📊',
      color: '#00BCD4',
      path: '/assets/reports'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Asset Management</h1>
        <p>Manage fixed assets, maintenance, and depreciation</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ borderLeftColor: '#2196F3' }}>
              <div className={styles.statIcon}>🏷️</div>
              <div className={styles.statContent}>
                <h3>Total Assets</h3>
                <p className={styles.statValue}>{stats.totalAssets}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#4CAF50' }}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <h3>Active Assets</h3>
                <p className={styles.statValue}>{stats.activeAssets}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#FF9800' }}>
              <div className={styles.statIcon}>🔧</div>
              <div className={styles.statContent}>
                <h3>Maintenance Due</h3>
                <p className={styles.statValue}>{stats.maintenanceDue}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#9C27B0' }}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3>Total Value</h3>
                <p className={styles.statValue}>${parseFloat(stats.totalValue || 0).toFixed(2)}</p>
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

export default AssetDashboard;

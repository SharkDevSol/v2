import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Finance/FinanceDashboard.module.css';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inventory/stats', {
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
      title: 'Item Master',
      description: 'Manage inventory items with batch tracking and valuation',
      icon: '📦',
      color: '#2196F3',
      path: '/inventory/items'
    },
    {
      title: 'Purchase Orders',
      description: 'Create and manage purchase orders from requests to delivery',
      icon: '🛒',
      color: '#4CAF50',
      path: '/inventory/purchase-orders'
    },
    {
      title: 'Stock Movements',
      description: 'Track stock transfers, adjustments, and consumption',
      icon: '📊',
      color: '#FF9800',
      path: '/inventory/movements'
    },
    {
      title: 'Suppliers',
      description: 'Manage supplier information and relationships',
      icon: '🏢',
      color: '#9C27B0',
      path: '/inventory/suppliers'
    },
    {
      title: 'Reports',
      description: 'View inventory reports and analytics',
      icon: '📈',
      color: '#F44336',
      path: '/inventory/reports'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inventory Management</h1>
        <p>Manage stock, procurement, and suppliers</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ borderLeftColor: '#2196F3' }}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statContent}>
                <h3>Total Items</h3>
                <p className={styles.statValue}>{stats.totalItems}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#F44336' }}>
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statContent}>
                <h3>Low Stock Items</h3>
                <p className={styles.statValue}>{stats.lowStockItems}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#FF9800' }}>
              <div className={styles.statIcon}>🛒</div>
              <div className={styles.statContent}>
                <h3>Pending Orders</h3>
                <p className={styles.statValue}>{stats.pendingOrders}</p>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeftColor: '#4CAF50' }}>
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

export default InventoryDashboard;

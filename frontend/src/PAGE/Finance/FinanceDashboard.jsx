import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FinanceDashboard.module.css';

const FinanceDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Fee Management',
      description: 'Configure fee structures',
      icon: '💰',
      path: '/finance/fee-management',
      color: '#2196F3'
    },
    {
      title: 'Fee Types',
      description: 'Manage fee categories',
      icon: '🏷️',
      path: '/finance/fee-types',
      color: '#00BCD4'
    },
    {
      title: 'Monthly Payments',
      description: 'Track monthly fee payments',
      icon: '📅',
      path: '/finance/monthly-payments',
      color: '#9C27B0'
    },
    {
      title: 'Expenses',
      description: 'Track and manage expenses',
      icon: '💸',
      path: '/finance/expenses',
      color: '#F44336'
    },
    {
      title: 'Expense Approval',
      description: 'Approve or reject expenses',
      icon: '✅',
      path: '/finance/expense-approval',
      color: '#FF5722'
    },
    {
      title: 'Budgets',
      description: 'Budget planning and tracking',
      icon: '📈',
      path: '/finance/budgets',
      color: '#00BCD4'
    },
    {
      title: 'Financial Reports',
      description: 'Comprehensive financial reports',
      icon: '📑',
      path: '/finance/reports',
      color: '#607D8B'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Finance Management</h1>
        <p>Comprehensive financial management system</p>
      </div>

      {/* Module Cards */}
      <div className={styles.modulesGrid}>
        {modules.map((module, index) => (
          <div
            key={index}
            className={styles.moduleCard}
            onClick={() => navigate(module.path)}
            style={{ borderTopColor: module.color }}
          >
            <div className={styles.moduleIcon}>{module.icon}</div>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <button className={styles.moduleButton}>Open Module</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinanceDashboard;

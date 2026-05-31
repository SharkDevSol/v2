/**
 * Sync Status Badge Component
 * 
 * A compact badge component that displays the current sync status
 * with color-coded indicators. Can be embedded in navigation bars,
 * headers, or any other UI element.
 * 
 * @module SyncStatusBadge
 */

import React, { useState, useEffect } from 'react';
import syncManager from '../services/SyncManager.js';
import styles from './SyncStatusBadge.module.css';

const SyncStatusBadge = ({ 
  size = 'medium', 
  showText = true, 
  showPending = true,
  onClick 
}) => {
  const [status, setStatus] = useState('offline');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Get initial status
    updateStatus();

    // Listen for status changes
    const handleStatusChange = () => {
      updateStatus();
    };

    syncManager.onStatusChange(handleStatusChange);

    // Listen for sync completion
    const handleSyncComplete = () => {
      updateStatus();
    };

    syncManager.onSyncComplete(handleSyncComplete);

    // Update status periodically
    const interval = setInterval(updateStatus, 3000);

    return () => {
      syncManager.offStatusChange(handleStatusChange);
      syncManager.offSyncComplete(handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  const updateStatus = () => {
    const stats = syncManager.getSyncStats();
    setStatus(stats.status);
    setPendingCount(stats.pendingCount);
    setIsSyncing(stats.isSyncing);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          color: '#dc3545',
          bgColor: '#f8d7da',
          icon: '⚠',
          text: 'Offline',
          pulse: true
        };
      case 'syncing':
        return {
          color: '#856404',
          bgColor: '#fff3cd',
          icon: '⟳',
          text: 'Syncing',
          pulse: false,
          spin: true
        };
      case 'synced':
        return {
          color: '#155724',
          bgColor: '#d4edda',
          icon: '✓',
          text: 'Synced',
          pulse: false
        };
      case 'error':
        return {
          color: '#721c24',
          bgColor: '#f8d7da',
          icon: '✕',
          text: 'Error',
          pulse: true
        };
      default:
        return {
          color: '#6c757d',
          bgColor: '#e2e3e5',
          icon: '?',
          text: 'Unknown',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e, { status, pendingCount, isSyncing });
    }
  };

  return (
    <div 
      className={`${styles.badge} ${styles[size]} ${config.pulse ? styles.pulse : ''} ${onClick ? styles.clickable : ''}`}
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color
      }}
      onClick={handleClick}
      title={`Status: ${config.text}${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
    >
      <span className={`${styles.icon} ${config.spin ? styles.spin : ''}`}>
        {config.icon}
      </span>
      
      {showText && (
        <span className={styles.text}>{config.text}</span>
      )}
      
      {showPending && pendingCount > 0 && (
        <span className={styles.pendingBadge}>{pendingCount}</span>
      )}
    </div>
  );
};

export default SyncStatusBadge;

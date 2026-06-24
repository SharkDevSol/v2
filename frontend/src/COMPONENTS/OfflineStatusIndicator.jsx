/**
 * Offline Status Indicator Component
 * 
 * This component displays the current online/offline status and sync state.
 * It shows a visual indicator with appropriate colors and icons based on
 * the connection and sync status.
 * 
 * @module OfflineStatusIndicator
 */

import React, { useState, useEffect } from 'react';
import syncManager from '../services/SyncManager.js';
import styles from './OfflineStatusIndicator.module.css';

const OfflineStatusIndicator = ({ position = 'top-right', compact = false }) => {
  const [status, setStatus] = useState('offline');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Get initial status
    updateStatus();

    // Listen for status changes
    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
      updateStatus();
    };

    syncManager.onStatusChange(handleStatusChange);

    // Listen for sync completion
    const handleSyncComplete = (results) => {
      updateStatus();
    };

    syncManager.onSyncComplete(handleSyncComplete);

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      syncManager.offStatusChange(handleStatusChange);
      syncManager.offSyncComplete(handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  const updateStatus = async () => {
    const stats = syncManager.getSyncStats();
    setStatus(stats.status);
    setIsOnline(stats.isOnline);
    setIsSyncing(stats.isSyncing);
    setPendingCount(stats.pendingCount);
    setLastSyncTime(stats.lastSyncTime);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          color: '#dc3545',
          icon: '⚠️',
          text: 'Offline',
          description: 'No internet connection'
        };
      case 'syncing':
        return {
          color: '#ffc107',
          icon: '🔄',
          text: 'Syncing',
          description: 'Syncing data with server'
        };
      case 'synced':
        return {
          color: '#28a745',
          icon: '✓',
          text: 'Online',
          description: 'All data synced'
        };
      case 'error':
        return {
          color: '#dc3545',
          icon: '⚠️',
          text: 'Sync Error',
          description: 'Failed to sync some data'
        };
      default:
        return {
          color: '#6c757d',
          icon: '?',
          text: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      await syncManager.manualSync();
    } catch (error) {
      console.error('[OfflineStatusIndicator] Manual sync failed:', error);
    }
  };

  const handleRetryFailed = async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      await syncManager.retryFailed();
    } catch (error) {
      console.error('[OfflineStatusIndicator] Retry failed:', error);
    }
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const syncTime = new Date(lastSyncTime);
    const diffMs = now - syncTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div 
        className={`${styles.indicator} ${styles.compact} ${styles[position]}`}
        style={{ backgroundColor: config.color }}
        title={config.description}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className={styles.icon}>{config.icon}</span>
        {pendingCount > 0 && (
          <span className={styles.badge}>{pendingCount}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.indicator} ${styles[position]}`}>
      <div 
        className={styles.statusBar}
        style={{ backgroundColor: config.color }}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className={styles.icon}>{config.icon}</span>
        <span className={styles.text}>{config.text}</span>
        {pendingCount > 0 && (
          <span className={styles.badge}>{pendingCount}</span>
        )}
        <button 
          className={styles.toggleButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {showDetails && (
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Status:</span>
            <span className={styles.value}>{config.description}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Connection:</span>
            <span className={styles.value}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {pendingCount > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Pending:</span>
              <span className={styles.value}>{pendingCount} items</span>
            </div>
          )}
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Last Sync:</span>
            <span className={styles.value}>{formatLastSyncTime()}</span>
          </div>

          <div className={styles.actions}>
            {isOnline && !isSyncing && (
              <button 
                className={styles.actionButton}
                onClick={handleManualSync}
              >
                Sync Now
              </button>
            )}
            
            {status === 'error' && isOnline && !isSyncing && (
              <button 
                className={styles.actionButton}
                onClick={handleRetryFailed}
              >
                Retry Failed
              </button>
            )}
            
            {isSyncing && (
              <div className={styles.syncingIndicator}>
                <span className={styles.spinner}>⟳</span>
                <span>Syncing...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;

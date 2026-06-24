/**
 * Offline Mode Banner Component
 * 
 * A prominent banner that appears at the top of the application when
 * the device is offline. Provides clear feedback about offline status
 * and pending sync operations.
 * 
 * @module OfflineModeBanner
 */

import React, { useState, useEffect } from 'react';
import syncManager from '../services/SyncManager.js';
import styles from './OfflineModeBanner.module.css';

const OfflineModeBanner = ({ 
  position = 'top',
  dismissible = false,
  showPendingCount = true,
  showRetryButton = true
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState('offline');
  const [pendingCount, setPendingCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Get initial status
    updateStatus();

    // Listen for status changes
    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
      updateStatus();
      
      // Reset dismissed state when coming back online
      if (newStatus === 'synced') {
        setIsDismissed(false);
      }
    };

    syncManager.onStatusChange(handleStatusChange);

    // Listen for sync completion
    const handleSyncComplete = () => {
      updateStatus();
      setIsRetrying(false);
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

  const updateStatus = () => {
    const stats = syncManager.getSyncStats();
    setStatus(stats.status);
    setIsOnline(stats.isOnline);
    setPendingCount(stats.pendingCount);
  };

  const handleRetry = async () => {
    if (!isOnline || isRetrying) return;
    
    setIsRetrying(true);
    
    try {
      await syncManager.retryFailed();
    } catch (error) {
      console.error('[OfflineModeBanner] Retry failed:', error);
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't show banner if online and synced
  if (isOnline && status === 'synced') {
    return null;
  }

  // Don't show if dismissed (only for dismissible banners)
  if (dismissible && isDismissed) {
    return null;
  }

  const getBannerConfig = () => {
    if (!isOnline) {
      return {
        type: 'offline',
        icon: '⚠️',
        title: 'You are offline',
        message: 'Changes will be saved locally and synced when connection is restored.',
        color: '#dc3545',
        bgColor: '#f8d7da'
      };
    }

    if (status === 'syncing') {
      return {
        type: 'syncing',
        icon: '🔄',
        title: 'Syncing data',
        message: 'Synchronizing your changes with the server...',
        color: '#856404',
        bgColor: '#fff3cd'
      };
    }

    if (status === 'error') {
      return {
        type: 'error',
        icon: '⚠️',
        title: 'Sync error',
        message: 'Some changes could not be synced. Please try again.',
        color: '#721c24',
        bgColor: '#f8d7da'
      };
    }

    return null;
  };

  const config = getBannerConfig();

  if (!config) return null;

  return (
    <div 
      className={`${styles.banner} ${styles[position]} ${styles[config.type]}`}
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      <div className={styles.content}>
        <span className={styles.icon}>{config.icon}</span>
        
        <div className={styles.textContent}>
          <div className={styles.title}>{config.title}</div>
          <div className={styles.message}>{config.message}</div>
        </div>

        {showPendingCount && pendingCount > 0 && (
          <div className={styles.pendingInfo}>
            <span className={styles.pendingCount}>{pendingCount}</span>
            <span className={styles.pendingLabel}>
              {pendingCount === 1 ? 'item pending' : 'items pending'}
            </span>
          </div>
        )}

        <div className={styles.actions}>
          {showRetryButton && config.type === 'error' && isOnline && (
            <button 
              className={styles.retryButton}
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}

          {dismissible && (
            <button 
              className={styles.dismissButton}
              onClick={handleDismiss}
              title="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {config.type === 'syncing' && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      )}
    </div>
  );
};

export default OfflineModeBanner;

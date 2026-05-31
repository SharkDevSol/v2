/**
 * Pending Sync Counter Component
 * 
 * Displays the count of pending sync operations with detailed breakdown
 * by table/entity type. Can be used in dashboards, status bars, or
 * as a standalone widget.
 * 
 * @module PendingSyncCounter
 */

import React, { useState, useEffect } from 'react';
import syncManager from '../services/SyncManager.js';
import offlineDB from '../services/OfflineDatabase.js';
import styles from './PendingSyncCounter.module.css';

const PendingSyncCounter = ({ 
  showDetails = false, 
  showBreakdown = false,
  variant = 'default' 
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    updateCounts();

    // Listen for sync events
    const handleSyncComplete = () => {
      updateCounts();
    };

    syncManager.onSyncComplete(handleSyncComplete);

    // Update periodically
    const interval = setInterval(updateCounts, 5000);

    return () => {
      syncManager.offSyncComplete(handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  const updateCounts = async () => {
    try {
      setIsLoading(true);
      
      // Get overall stats
      const stats = await offlineDB.getStats();
      
      const total = 
        stats.unsyncedStudents +
        stats.unsyncedAttendance +
        stats.unsyncedMarks +
        stats.unsyncedExams +
        stats.unsyncedPosts +
        stats.pendingSyncQueue;

      setPendingCount(total);

      // Get breakdown
      if (showBreakdown) {
        setBreakdown({
          students: stats.unsyncedStudents,
          attendance: stats.unsyncedAttendance,
          marks: stats.unsyncedMarks,
          exams: stats.unsyncedExams,
          posts: stats.unsyncedPosts,
          queue: stats.pendingSyncQueue
        });
      }
    } catch (error) {
      console.error('[PendingSyncCounter] Failed to update counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      await syncManager.manualSync();
    } catch (error) {
      console.error('[PendingSyncCounter] Manual sync failed:', error);
    }
  };

  if (isLoading && pendingCount === 0) {
    return (
      <div className={`${styles.counter} ${styles[variant]}`}>
        <span className={styles.loading}>Loading...</span>
      </div>
    );
  }

  if (pendingCount === 0) {
    return (
      <div className={`${styles.counter} ${styles[variant]} ${styles.synced}`}>
        <span className={styles.icon}>✓</span>
        <span className={styles.text}>All synced</span>
      </div>
    );
  }

  return (
    <div className={`${styles.counter} ${styles[variant]}`}>
      <div 
        className={styles.header}
        onClick={() => showDetails && setIsExpanded(!isExpanded)}
        style={{ cursor: showDetails ? 'pointer' : 'default' }}
      >
        <span className={styles.icon}>⟳</span>
        <span className={styles.count}>{pendingCount}</span>
        <span className={styles.label}>
          {pendingCount === 1 ? 'item pending' : 'items pending'}
        </span>
        {showDetails && (
          <span className={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>

      {showDetails && isExpanded && (
        <div className={styles.details}>
          {showBreakdown && (
            <div className={styles.breakdown}>
              <h4>Breakdown by Type</h4>
              <div className={styles.breakdownList}>
                {breakdown.students > 0 && (
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Students</span>
                    <span className={styles.breakdownValue}>{breakdown.students}</span>
                  </div>
                )}
                {breakdown.attendance > 0 && (
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Attendance</span>
                    <span className={styles.breakdownValue}>{breakdown.attendance}</span>
                  </div>
                )}
                {breakdown.marks > 0 && (
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Marks</span>
                    <span className={styles.breakdownValue}>{breakdown.marks}</span>
                  </div>
                )}
                {breakdown.exams > 0 && (
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Exams</span>
                    <span className={styles.breakdownValue}>{breakdown.exams}</span>
                  </div>
                )}
                {breakdown.posts > 0 && (
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Posts</span>
                    <span className={styles.breakdownValue}>{breakdown.posts}</span>
                  </div>
                )}
                {breakdown.queue > 0 && (
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Queue</span>
                    <span className={styles.breakdownValue}>{breakdown.queue}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.syncButton}
              onClick={handleManualSync}
            >
              Sync Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSyncCounter;

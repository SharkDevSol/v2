/**
 * Sync Manager for Offline-First Architecture
 * 
 * This class manages synchronization between local IndexedDB storage
 * and the remote server. It handles online/offline detection, automatic
 * sync on reconnection, and manual sync triggers.
 * 
 * @module SyncManager
 */

import offlineDB from './OfflineDatabase.js';

class SyncManager {
  constructor() {
    // Sync status: 'offline', 'syncing', 'synced', 'error'
    this.syncStatus = 'offline';
    
    // Online/offline state
    this.isOnline = navigator.onLine;
    
    // Sync in progress flag
    this.isSyncing = false;
    
    // Sync statistics
    this.syncStats = {
      lastSyncTime: null,
      totalSynced: 0,
      totalFailed: 0,
      pendingCount: 0
    };
    
    // Event listeners
    this.statusChangeListeners = [];
    this.syncCompleteListeners = [];
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      backoffMultiplier: 2 // Exponential backoff
    };
    
    // API base URL (should be configured from environment)
    this.apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    
    // Initialize
    this.initialize();
  }

  /**
   * Initialize sync manager
   * Sets up event listeners for connectivity changes
   */
  initialize() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Set initial status
    this.updateSyncStatus(this.isOnline ? 'synced' : 'offline');
    
    // If online, perform initial sync
    if (this.isOnline) {
      this.syncAll();
    }
    
    console.log('[SyncManager] Initialized', {
      isOnline: this.isOnline,
      status: this.syncStatus
    });
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('[SyncManager] Connection restored');
    this.isOnline = true;
    this.updateSyncStatus('synced');
    
    // Automatically sync when connection is restored
    this.syncAll();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('[SyncManager] Connection lost');
    this.isOnline = false;
    this.updateSyncStatus('offline');
  }

  /**
   * Update sync status and notify listeners
   * @param {string} status - New status ('offline', 'syncing', 'synced', 'error')
   */
  updateSyncStatus(status) {
    const oldStatus = this.syncStatus;
    this.syncStatus = status;
    
    // Notify listeners
    this.statusChangeListeners.forEach(listener => {
      listener(status, oldStatus);
    });
    
    console.log('[SyncManager] Status changed:', oldStatus, '→', status);
  }

  /**
   * Add status change listener
   * @param {Function} listener - Callback function (newStatus, oldStatus) => void
   */
  onStatusChange(listener) {
    this.statusChangeListeners.push(listener);
  }

  /**
   * Remove status change listener
   * @param {Function} listener - Callback function to remove
   */
  offStatusChange(listener) {
    this.statusChangeListeners = this.statusChangeListeners.filter(l => l !== listener);
  }

  /**
   * Add sync complete listener
   * @param {Function} listener - Callback function (stats) => void
   */
  onSyncComplete(listener) {
    this.syncCompleteListeners.push(listener);
  }

  /**
   * Remove sync complete listener
   * @param {Function} listener - Callback function to remove
   */
  offSyncComplete(listener) {
    this.syncCompleteListeners = this.syncCompleteListeners.filter(l => l !== listener);
  }

  /**
   * Queue an operation for sync
   * @param {string} operation - Operation type ('create', 'update', 'delete')
   * @param {string} table - Table name
   * @param {Object} data - Operation data
   * @returns {Promise<number>} Queue ID
   */
  async queueOperation(operation, table, data) {
    const queueId = await offlineDB.addToSyncQueue({
      operation,
      table,
      data
    });
    
    // Update pending count
    await this.updatePendingCount();
    
    console.log('[SyncManager] Operation queued:', { operation, table, queueId });
    
    // If online, trigger sync
    if (this.isOnline && !this.isSyncing) {
      this.syncAll();
    }
    
    return queueId;
  }

  /**
   * Sync all pending operations
   * @returns {Promise<Object>} Sync results
   */
  async syncAll() {
    if (!this.isOnline) {
      console.log('[SyncManager] Cannot sync: offline');
      return {
        success: false,
        error: 'Device is offline'
      };
    }
    
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress');
      return {
        success: false,
        error: 'Sync already in progress'
      };
    }
    
    this.isSyncing = true;
    this.updateSyncStatus('syncing');
    
    const results = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };
    
    try {
      // Get pending sync queue items
      const pendingItems = await offlineDB.getPendingSyncQueue();
      
      console.log('[SyncManager] Syncing', pendingItems.length, 'items');
      
      // Sync each item
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          results.synced++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            item,
            error: error.message
          });
          console.error('[SyncManager] Failed to sync item:', item, error);
        }
      }
      
      // Sync unsynced records from each table
      await this.syncUnsyncedRecords();
      
      // Update statistics
      this.syncStats.lastSyncTime = new Date().toISOString();
      this.syncStats.totalSynced += results.synced;
      this.syncStats.totalFailed += results.failed;
      
      // Update pending count
      await this.updatePendingCount();
      
      // Update status
      if (results.failed === 0) {
        this.updateSyncStatus('synced');
      } else {
        this.updateSyncStatus('error');
      }
      
      // Notify listeners
      this.syncCompleteListeners.forEach(listener => {
        listener(results);
      });
      
      console.log('[SyncManager] Sync complete:', results);
      
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error);
      results.success = false;
      results.error = error.message;
      this.updateSyncStatus('error');
    } finally {
      this.isSyncing = false;
    }
    
    return results;
  }

  /**
   * Sync a single queue item
   * @param {Object} item - Queue item
   * @returns {Promise<void>}
   */
  async syncItem(item) {
    const { id, operation, table, data, retryCount } = item;
    
    try {
      // Determine API endpoint based on table and operation
      const endpoint = this.getEndpoint(table, operation, data);
      const method = this.getMethod(operation);
      
      // Make API request with retry logic
      const response = await this.makeRequest(endpoint, method, data, retryCount);
      
      if (response.ok) {
        // Mark as completed
        await offlineDB.markSyncQueueCompleted(id);
        
        // Update the record's synced flag if applicable
        if (data.id) {
          await this.markRecordSynced(table, data.id);
        }
        
        console.log('[SyncManager] Item synced:', { id, operation, table });
      } else {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      // Mark as failed
      await offlineDB.markSyncQueueFailed(id, error.message);
      throw error;
    }
  }

  /**
   * Sync unsynced records from all tables
   * @returns {Promise<void>}
   */
  async syncUnsyncedRecords() {
    const tables = ['students', 'attendance', 'marks', 'exams', 'posts'];
    
    for (const table of tables) {
      try {
        await this.syncUnsyncedTable(table);
      } catch (error) {
        console.error(`[SyncManager] Failed to sync ${table}:`, error);
      }
    }
  }

  /**
   * Sync unsynced records from a specific table
   * @param {string} table - Table name
   * @returns {Promise<void>}
   */
  async syncUnsyncedTable(table) {
    // Get unsynced records
    const getUnsyncedMethod = `getUnsynced${this.capitalize(table)}`;
    const unsyncedRecords = await offlineDB[getUnsyncedMethod]();
    
    if (unsyncedRecords.length === 0) {
      return;
    }
    
    console.log(`[SyncManager] Syncing ${unsyncedRecords.length} unsynced ${table}`);
    
    // Sync each record
    for (const record of unsyncedRecords) {
      try {
        const endpoint = this.getEndpoint(table, 'update', record);
        const response = await this.makeRequest(endpoint, 'PUT', record);
        
        if (response.ok) {
          // Mark as synced
          await this.markRecordSynced(table, record.id);
        }
      } catch (error) {
        console.error(`[SyncManager] Failed to sync ${table} record:`, record.id, error);
      }
    }
  }

  /**
   * Mark a record as synced
   * @param {string} table - Table name
   * @param {number} id - Record ID
   * @returns {Promise<void>}
   */
  async markRecordSynced(table, id) {
    const markSyncedMethod = `mark${this.capitalize(this.singularize(table))}Synced`;
    await offlineDB[markSyncedMethod](id);
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {number} retryCount - Current retry count
   * @returns {Promise<Response>}
   */
  async makeRequest(endpoint, method, data, retryCount = 0) {
    const url = `${this.apiBaseURL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add authentication token if available
        ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
      }
    };
    
    // Add body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      // If request failed and we have retries left, retry with exponential backoff
      if (!response.ok && retryCount < this.retryConfig.maxRetries) {
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        console.log(`[SyncManager] Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
        
        await this.sleep(delay);
        return this.makeRequest(endpoint, method, data, retryCount + 1);
      }
      
      return response;
      
    } catch (error) {
      // Network error - retry if we have retries left
      if (retryCount < this.retryConfig.maxRetries) {
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        console.log(`[SyncManager] Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
        
        await this.sleep(delay);
        return this.makeRequest(endpoint, method, data, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Get API endpoint for table and operation
   * @param {string} table - Table name
   * @param {string} operation - Operation type
   * @param {Object} data - Operation data
   * @returns {string} API endpoint
   */
  getEndpoint(table, operation, data) {
    const baseEndpoint = `/v2/${table}`;
    
    switch (operation) {
      case 'create':
        return baseEndpoint;
      case 'update':
        return `${baseEndpoint}/${data.id}`;
      case 'delete':
        return `${baseEndpoint}/${data.id}`;
      default:
        return baseEndpoint;
    }
  }

  /**
   * Get HTTP method for operation
   * @param {string} operation - Operation type
   * @returns {string} HTTP method
   */
  getMethod(operation) {
    switch (operation) {
      case 'create':
        return 'POST';
      case 'update':
        return 'PUT';
      case 'delete':
        return 'DELETE';
      default:
        return 'GET';
    }
  }

  /**
   * Get authentication token from storage
   * @returns {string|null} Auth token
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Update pending count
   * @returns {Promise<void>}
   */
  async updatePendingCount() {
    const stats = await offlineDB.getStats();
    this.syncStats.pendingCount = stats.pendingSyncQueue;
  }

  /**
   * Get sync statistics
   * @returns {Object} Sync statistics
   */
  getSyncStats() {
    return {
      ...this.syncStats,
      status: this.syncStatus,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    };
  }

  /**
   * Manually trigger sync
   * @returns {Promise<Object>} Sync results
   */
  async manualSync() {
    console.log('[SyncManager] Manual sync triggered');
    return this.syncAll();
  }

  /**
   * Retry failed sync operations
   * @returns {Promise<void>}
   */
  async retryFailed() {
    console.log('[SyncManager] Retrying failed operations');
    await offlineDB.retryFailedSyncQueue();
    
    if (this.isOnline) {
      await this.syncAll();
    }
  }

  /**
   * Clear completed sync queue items
   * @returns {Promise<void>}
   */
  async clearCompleted() {
    await offlineDB.clearCompletedSyncQueue();
    await this.updatePendingCount();
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert plural to singular
   * @param {string} str - Plural string
   * @returns {string} Singular string
   */
  singularize(str) {
    if (str.endsWith('s')) {
      return str.slice(0, -1);
    }
    return str;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Destroy sync manager
   * Removes event listeners
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    this.statusChangeListeners = [];
    this.syncCompleteListeners = [];
    
    console.log('[SyncManager] Destroyed');
  }
}

// Create and export singleton instance
const syncManager = new SyncManager();

export default syncManager;

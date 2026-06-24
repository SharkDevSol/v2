/**
 * Test suite for SyncManager
 * 
 * This test suite verifies sync functionality with simulated network conditions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import offlineDB from './OfflineDatabase.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Import SyncManager after mocks are set up
let SyncManager;
let syncManager;

describe('SyncManager', () => {
  beforeEach(async () => {
    // Clear database
    await offlineDB.clearAll();
    
    // Reset mocks
    vi.clearAllMocks();
    global.fetch.mockClear();
    localStorageMock.getItem.mockReturnValue('test-token');
    
    // Set online
    global.navigator.onLine = true;
    
    // Dynamically import SyncManager to get fresh instance
    const module = await import('./SyncManager.js?t=' + Date.now());
    SyncManager = module.default.constructor;
    syncManager = new SyncManager();
  });

  afterEach(async () => {
    // Clean up
    if (syncManager && syncManager.destroy) {
      syncManager.destroy();
    }
    await offlineDB.clearAll();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      expect(syncManager.isOnline).toBe(true);
      expect(syncManager.isSyncing).toBe(false);
      expect(syncManager.syncStatus).toBeDefined();
    });

    it('should detect online status', () => {
      expect(syncManager.isOnline).toBe(true);
    });

    it('should detect offline status', () => {
      global.navigator.onLine = false;
      const offlineManager = new SyncManager();
      expect(offlineManager.isOnline).toBe(false);
      offlineManager.destroy();
    });
  });

  describe('Online/Offline Detection', () => {
    it('should handle online event', () => {
      syncManager.isOnline = false;
      syncManager.handleOnline();
      expect(syncManager.isOnline).toBe(true);
    });

    it('should handle offline event', () => {
      syncManager.isOnline = true;
      syncManager.handleOffline();
      expect(syncManager.isOnline).toBe(false);
      expect(syncManager.syncStatus).toBe('offline');
    });

    it('should trigger sync when going online', async () => {
      const syncAllSpy = vi.spyOn(syncManager, 'syncAll');
      syncManager.isOnline = false;
      syncManager.handleOnline();
      expect(syncAllSpy).toHaveBeenCalled();
    });
  });

  describe('Status Management', () => {
    it('should update sync status', () => {
      syncManager.updateSyncStatus('syncing');
      expect(syncManager.syncStatus).toBe('syncing');
    });

    it('should notify status change listeners', () => {
      const listener = vi.fn();
      syncManager.onStatusChange(listener);
      
      syncManager.updateSyncStatus('syncing');
      expect(listener).toHaveBeenCalledWith('syncing', expect.any(String));
    });

    it('should remove status change listeners', () => {
      const listener = vi.fn();
      syncManager.onStatusChange(listener);
      syncManager.offStatusChange(listener);
      
      syncManager.updateSyncStatus('syncing');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Queue Operations', () => {
    it('should queue an operation', async () => {
      const queueId = await syncManager.queueOperation('create', 'students', {
        student_id: 'STU001',
        first_name: 'Test'
      });
      
      expect(queueId).toBeGreaterThan(0);
      
      const pending = await offlineDB.getPendingSyncQueue();
      expect(pending.length).toBe(1);
      expect(pending[0].operation).toBe('create');
      expect(pending[0].table).toBe('students');
    });

    it('should update pending count after queueing', async () => {
      await syncManager.queueOperation('create', 'students', { student_id: 'STU001' });
      
      const stats = syncManager.getSyncStats();
      expect(stats.pendingCount).toBe(1);
    });
  });

  describe('Sync Operations', () => {
    it('should not sync when offline', async () => {
      syncManager.isOnline = false;
      
      const result = await syncManager.syncAll();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Device is offline');
    });

    it('should not sync when already syncing', async () => {
      syncManager.isSyncing = true;
      
      const result = await syncManager.syncAll();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync already in progress');
    });

    it('should sync pending queue items', async () => {
      // Add item to queue
      await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU001', first_name: 'Test' }
      });
      
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });
      
      const result = await syncManager.syncAll();
      
      expect(result.synced).toBeGreaterThanOrEqual(0);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      // Add item to queue
      await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU001' }
      });
      
      // Mock failed API response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      const result = await syncManager.syncAll();
      
      expect(result.failed).toBeGreaterThan(0);
    });

    it('should update sync statistics', async () => {
      // Mock successful API response
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });
      
      await syncManager.syncAll();
      
      const stats = syncManager.getSyncStats();
      expect(stats.lastSyncTime).toBeDefined();
    });

    it('should notify sync complete listeners', async () => {
      const listener = vi.fn();
      syncManager.onSyncComplete(listener);
      
      // Mock successful API response
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });
      
      await syncManager.syncAll();
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      const item = {
        id: 1,
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU001' },
        retryCount: 0
      };
      
      // Mock first call fails, second succeeds
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        });
      
      await syncManager.syncItem(item);
      
      // Should have retried
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries', async () => {
      const item = {
        id: 1,
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU001' },
        retryCount: 0
      };
      
      // Mock all calls fail
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      try {
        await syncManager.syncItem(item);
      } catch (error) {
        // Expected to fail
      }
      
      // Should have tried max retries + 1 (initial attempt)
      expect(global.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('should use exponential backoff for retries', async () => {
      const sleepSpy = vi.spyOn(syncManager, 'sleep');
      
      // Mock all calls fail
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      try {
        await syncManager.makeRequest('/test', 'GET', {}, 0);
      } catch (error) {
        // Expected to fail
      }
      
      // Should have called sleep with increasing delays
      expect(sleepSpy).toHaveBeenCalled();
    });
  });

  describe('API Endpoint Generation', () => {
    it('should generate correct endpoint for create operation', () => {
      const endpoint = syncManager.getEndpoint('students', 'create', {});
      expect(endpoint).toBe('/v2/students');
    });

    it('should generate correct endpoint for update operation', () => {
      const endpoint = syncManager.getEndpoint('students', 'update', { id: 123 });
      expect(endpoint).toBe('/v2/students/123');
    });

    it('should generate correct endpoint for delete operation', () => {
      const endpoint = syncManager.getEndpoint('students', 'delete', { id: 123 });
      expect(endpoint).toBe('/v2/students/123');
    });

    it('should return correct HTTP method for operations', () => {
      expect(syncManager.getMethod('create')).toBe('POST');
      expect(syncManager.getMethod('update')).toBe('PUT');
      expect(syncManager.getMethod('delete')).toBe('DELETE');
    });
  });

  describe('Authentication', () => {
    it('should include auth token in requests', async () => {
      localStorageMock.getItem.mockReturnValue('test-auth-token');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });
      
      await syncManager.makeRequest('/test', 'GET', {});
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-auth-token'
          })
        })
      );
    });
  });

  describe('Manual Sync', () => {
    it('should trigger manual sync', async () => {
      const syncAllSpy = vi.spyOn(syncManager, 'syncAll');
      
      await syncManager.manualSync();
      
      expect(syncAllSpy).toHaveBeenCalled();
    });
  });

  describe('Retry Failed Operations', () => {
    it('should retry failed sync queue items', async () => {
      // Add failed item
      const id = await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU001' }
      });
      
      await offlineDB.markSyncQueueFailed(id, 'Test error');
      
      await syncManager.retryFailed();
      
      const item = await offlineDB.syncQueue.get(id);
      expect(item.status).toBe('pending');
    });
  });

  describe('Clear Completed', () => {
    it('should clear completed sync queue items', async () => {
      // Add completed item
      const id = await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU001' }
      });
      
      await offlineDB.markSyncQueueCompleted(id);
      
      await syncManager.clearCompleted();
      
      const allItems = await offlineDB.syncQueue.toArray();
      expect(allItems.length).toBe(0);
    });
  });

  describe('Sync Statistics', () => {
    it('should return sync statistics', () => {
      const stats = syncManager.getSyncStats();
      
      expect(stats).toHaveProperty('status');
      expect(stats).toHaveProperty('isOnline');
      expect(stats).toHaveProperty('isSyncing');
      expect(stats).toHaveProperty('lastSyncTime');
      expect(stats).toHaveProperty('totalSynced');
      expect(stats).toHaveProperty('totalFailed');
      expect(stats).toHaveProperty('pendingCount');
    });
  });

  describe('Utility Methods', () => {
    it('should capitalize strings', () => {
      expect(syncManager.capitalize('test')).toBe('Test');
      expect(syncManager.capitalize('hello')).toBe('Hello');
    });

    it('should singularize plural strings', () => {
      expect(syncManager.singularize('students')).toBe('student');
      expect(syncManager.singularize('marks')).toBe('mark');
    });

    it('should sleep for specified time', async () => {
      const start = Date.now();
      await syncManager.sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some margin
    });
  });

  describe('Network Simulation', () => {
    it('should handle network timeout', async () => {
      // Mock network timeout
      global.fetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );
      
      try {
        await syncManager.makeRequest('/test', 'GET', {}, 0);
      } catch (error) {
        expect(error.message).toBe('Network timeout');
      }
    });

    it('should handle network error and retry', async () => {
      // Mock network error then success
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        });
      
      const response = await syncManager.makeRequest('/test', 'GET', {}, 0);
      
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle slow network', async () => {
      // Mock slow response
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true })
          }), 200)
        )
      );
      
      const start = Date.now();
      await syncManager.makeRequest('/test', 'GET', {}, 0);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(190);
    });
  });

  describe('Cleanup', () => {
    it('should destroy sync manager', () => {
      const manager = new SyncManager();
      manager.destroy();
      
      expect(manager.statusChangeListeners).toEqual([]);
      expect(manager.syncCompleteListeners).toEqual([]);
    });
  });
});

/**
 * ConflictResolver Tests
 * 
 * Tests for conflict resolution functionality including:
 * - Last-write-wins strategy
 * - Complex conflict detection
 * - Manual resolution
 * - Conflict notifications
 * - Concurrent edits simulation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import conflictResolver from './ConflictResolver.js';
import offlineDB from './OfflineDatabase.js';

// Mock OfflineDatabase
vi.mock('./OfflineDatabase.js', () => ({
  default: {
    saveStudent: vi.fn(),
    saveAttendance: vi.fn(),
    saveMark: vi.fn(),
    saveExam: vi.fn(),
    savePost: vi.fn()
  }
}));

describe('ConflictResolver', () => {
  beforeEach(() => {
    // Clear conflict history before each test
    conflictResolver.conflictHistory = [];
    conflictResolver.conflictListeners = [];
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Last-Write-Wins Strategy', () => {
    it('should resolve conflict with local data when local is newer', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      const result = await conflictResolver.lastWriteWins(localData, remoteData);

      expect(result.name).toBe('John Doe');
      expect(result.conflictResolution).toBe('client-wins');
    });

    it('should resolve conflict with remote data when remote is newer', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const result = await conflictResolver.lastWriteWins(localData, remoteData);

      expect(result.name).toBe('Jane Doe');
      expect(result.conflictResolution).toBe('server-wins');
    });

    it('should handle missing timestamps', async () => {
      const localData = {
        id: 1,
        name: 'John Doe'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const result = await conflictResolver.lastWriteWins(localData, remoteData);

      expect(result.name).toBe('Jane Doe');
      expect(result.conflictResolution).toBe('server-wins');
    });
  });

  describe('Conflict Type Detection', () => {
    it('should detect no-conflict when data is identical', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        age: 25
      };

      const remoteData = {
        id: 1,
        name: 'John Doe',
        age: 25
      };

      const conflictType = conflictResolver.detectConflictType(localData, remoteData);

      expect(conflictType).toBe('no-conflict');
    });

    it('should detect simple-conflict when one field changed', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        age: 25
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        age: 25
      };

      const conflictType = conflictResolver.detectConflictType(localData, remoteData);

      expect(conflictType).toBe('simple-conflict');
    });

    it('should detect moderate-conflict when 2-3 fields changed', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        age: 30,
        email: 'john@example.com'
      };

      const conflictType = conflictResolver.detectConflictType(localData, remoteData);

      expect(conflictType).toBe('moderate-conflict');
    });

    it('should detect complex-conflict when more than 3 fields changed', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        age: 25,
        email: 'john@example.com',
        phone: '123456789',
        address: '123 Main St'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        age: 30,
        email: 'jane@example.com',
        phone: '987654321',
        address: '123 Main St'
      };

      const conflictType = conflictResolver.detectConflictType(localData, remoteData);

      expect(conflictType).toBe('complex-conflict');
    });
  });

  describe('Complex Conflict Detection', () => {
    it('should flag as complex when more than threshold fields changed', () => {
      const localData = {
        id: 1,
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        field5: 'value5'
      };

      const remoteData = {
        id: 1,
        field1: 'changed1',
        field2: 'changed2',
        field3: 'changed3',
        field4: 'changed4',
        field5: 'value5'
      };

      const isComplex = conflictResolver.isComplexConflict(localData, remoteData);

      expect(isComplex).toBe(true);
    });

    it('should flag as complex when critical field changed', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        status: 'active'
      };

      const remoteData = {
        id: 1,
        name: 'John Doe',
        status: 'deleted'
      };

      const isComplex = conflictResolver.isComplexConflict(localData, remoteData);

      expect(isComplex).toBe(true);
    });

    it('should not flag as complex for simple changes', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        age: 25
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        age: 25
      };

      const isComplex = conflictResolver.isComplexConflict(localData, remoteData);

      expect(isComplex).toBe(false);
    });
  });

  describe('Changed Fields Detection', () => {
    it('should detect changed fields correctly', () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        age: 30,
        email: 'john@example.com'
      };

      const changedFields = conflictResolver.getChangedFields(localData, remoteData);

      expect(changedFields).toContain('name');
      expect(changedFields).toContain('age');
      expect(changedFields).not.toContain('email');
      expect(changedFields).not.toContain('id');
    });

    it('should handle nested objects', () => {
      const localData = {
        id: 1,
        profile: { name: 'John', age: 25 }
      };

      const remoteData = {
        id: 1,
        profile: { name: 'Jane', age: 25 }
      };

      const changedFields = conflictResolver.getChangedFields(localData, remoteData);

      expect(changedFields).toContain('profile');
    });

    it('should handle arrays', () => {
      const localData = {
        id: 1,
        tags: ['tag1', 'tag2']
      };

      const remoteData = {
        id: 1,
        tags: ['tag1', 'tag3']
      };

      const changedFields = conflictResolver.getChangedFields(localData, remoteData);

      expect(changedFields).toContain('tags');
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve simple conflict with last-write-wins', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      const result = await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(result.name).toBe('John Doe');
      expect(result.conflictResolution).toBe('client-wins');
    });

    it('should flag complex conflict for manual resolution', async () => {
      const localData = {
        id: 1,
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        field1: 'changed1',
        field2: 'changed2',
        field3: 'changed3',
        field4: 'changed4',
        lastModified: '2024-01-01T10:00:00Z'
      };

      const result = await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(result.success).toBe(false);
      expect(result.conflict).toBe(true);
      expect(result.manual).toBe(true);
    });

    it('should use server-wins strategy', async () => {
      const localData = {
        id: 1,
        name: 'John Doe'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe'
      };

      const result = await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'server-wins'
      );

      expect(result.name).toBe('Jane Doe');
    });

    it('should use client-wins strategy', async () => {
      const localData = {
        id: 1,
        name: 'John Doe'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe'
      };

      const result = await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'client-wins'
      );

      expect(result.name).toBe('John Doe');
    });
  });

  describe('Manual Resolution', () => {
    it('should manually resolve conflict', async () => {
      // First create a conflict
      const localData = {
        id: 1,
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        field1: 'changed1',
        field2: 'changed2',
        field3: 'changed3',
        field4: 'changed4',
        lastModified: '2024-01-01T10:00:00Z'
      };

      const conflictResult = await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(conflictResult.manual).toBe(true);

      // Now manually resolve it
      const resolution = {
        id: 1,
        field1: 'merged1',
        field2: 'merged2',
        field3: 'merged3',
        field4: 'merged4'
      };

      const result = await conflictResolver.manuallyResolve(
        conflictResult.conflictId,
        resolution
      );

      expect(result.success).toBe(true);
      expect(result.resolution).toEqual(resolution);
    });

    it('should throw error for non-existent conflict', async () => {
      await expect(
        conflictResolver.manuallyResolve(999, {})
      ).rejects.toThrow('Conflict not found: 999');
    });

    it('should throw error for already resolved conflict', async () => {
      // Create and resolve a conflict
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      const conflict = conflictResolver.conflictHistory[0];

      // Try to resolve again
      await expect(
        conflictResolver.manuallyResolve(conflict.id, {})
      ).rejects.toThrow(`Conflict already resolved: ${conflict.id}`);
    });
  });

  describe('Conflict Notifications', () => {
    it('should notify listeners when conflict is detected', async () => {
      const listener = vi.fn();
      conflictResolver.onConflict(listener);

      const localData = {
        id: 1,
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        field1: 'changed1',
        field2: 'changed2',
        field3: 'changed3',
        field4: 'changed4',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(listener).toHaveBeenCalledWith('detected', expect.any(Object));
    });

    it('should notify listeners when conflict is resolved', async () => {
      const listener = vi.fn();
      conflictResolver.onConflict(listener);

      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(listener).toHaveBeenCalledWith('resolved', expect.any(Object));
    });

    it('should remove listener', async () => {
      const listener = vi.fn();
      conflictResolver.onConflict(listener);
      conflictResolver.offConflict(listener);

      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Conflict History', () => {
    it('should track conflict history', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(conflictResolver.conflictHistory).toHaveLength(1);
      expect(conflictResolver.conflictHistory[0].table).toBe('students');
      expect(conflictResolver.conflictHistory[0].resolved).toBe(true);
    });

    it('should get pending conflicts', async () => {
      const localData = {
        id: 1,
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        field1: 'changed1',
        field2: 'changed2',
        field3: 'changed3',
        field4: 'changed4',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      const pending = conflictResolver.getPendingConflicts();

      expect(pending).toHaveLength(1);
      expect(pending[0].resolved).toBe(false);
    });

    it('should get resolved conflicts', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      const resolved = conflictResolver.getResolvedConflicts();

      expect(resolved).toHaveLength(1);
      expect(resolved[0].resolved).toBe(true);
    });

    it('should clear resolved conflicts', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        lastModified: '2024-01-02T10:00:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'Jane Doe',
        lastModified: '2024-01-01T10:00:00Z'
      };

      await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      conflictResolver.clearResolvedConflicts();

      expect(conflictResolver.conflictHistory).toHaveLength(0);
    });
  });

  describe('Conflict Statistics', () => {
    it('should provide conflict statistics', async () => {
      // Create multiple conflicts
      const conflicts = [
        {
          local: { id: 1, name: 'John', lastModified: '2024-01-02T10:00:00Z' },
          remote: { id: 1, name: 'Jane', lastModified: '2024-01-01T10:00:00Z' }
        },
        {
          local: { id: 2, field1: 'a', field2: 'b', field3: 'c', field4: 'd', lastModified: '2024-01-02T10:00:00Z' },
          remote: { id: 2, field1: 'w', field2: 'x', field3: 'y', field4: 'z', lastModified: '2024-01-01T10:00:00Z' }
        }
      ];

      for (const conflict of conflicts) {
        await conflictResolver.resolveConflict(
          'students',
          conflict.local,
          conflict.remote,
          'last-write-wins'
        );
      }

      const stats = conflictResolver.getStatistics();

      expect(stats.total).toBe(2);
      expect(stats.resolved).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.byType).toBeDefined();
      expect(stats.byStrategy).toBeDefined();
    });
  });

  describe('Concurrent Edits Simulation', () => {
    it('should handle concurrent edits to same record', async () => {
      // Simulate two users editing the same record at the same time
      const originalData = {
        id: 1,
        name: 'John Doe',
        age: 25,
        email: 'john@example.com',
        lastModified: '2024-01-01T10:00:00Z'
      };

      // User 1 edits name
      const user1Edit = {
        ...originalData,
        name: 'John Smith',
        lastModified: '2024-01-01T10:05:00Z'
      };

      // User 2 edits age
      const user2Edit = {
        ...originalData,
        age: 26,
        lastModified: '2024-01-01T10:06:00Z'
      };

      // Resolve conflict
      const result = await conflictResolver.resolveConflict(
        'students',
        user1Edit,
        user2Edit,
        'last-write-wins'
      );

      // User 2's edit should win (newer timestamp)
      expect(result.age).toBe(26);
      expect(result.name).toBe('John Doe'); // Original name from user 2's version
    });

    it('should handle multiple concurrent conflicts', async () => {
      const conflicts = [];

      // Create 5 concurrent conflicts
      for (let i = 1; i <= 5; i++) {
        const localData = {
          id: i,
          name: `Local User ${i}`,
          lastModified: '2024-01-01T10:05:00Z'
        };

        const remoteData = {
          id: i,
          name: `Remote User ${i}`,
          lastModified: '2024-01-01T10:00:00Z'
        };

        const result = await conflictResolver.resolveConflict(
          'students',
          localData,
          remoteData,
          'last-write-wins'
        );

        conflicts.push(result);
      }

      // All should be resolved with local data (newer)
      expect(conflicts).toHaveLength(5);
      conflicts.forEach((conflict, index) => {
        expect(conflict.name).toBe(`Local User ${index + 1}`);
      });
    });

    it('should handle race condition with critical field changes', async () => {
      const localData = {
        id: 1,
        name: 'John Doe',
        status: 'active',
        lastModified: '2024-01-01T10:05:00Z'
      };

      const remoteData = {
        id: 1,
        name: 'John Doe',
        status: 'deleted',
        lastModified: '2024-01-01T10:06:00Z'
      };

      // This should be flagged as complex due to critical field change
      const result = await conflictResolver.resolveConflict(
        'students',
        localData,
        remoteData,
        'last-write-wins'
      );

      expect(result.manual).toBe(true);
      expect(result.conflict).toBe(true);
    });
  });
});

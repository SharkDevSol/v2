/**
 * Conflict Resolver for Offline-First Architecture
 * 
 * This class handles conflicts that occur when local and remote data
 * have been modified independently. It implements last-write-wins strategy
 * for simple conflicts and flags complex conflicts for manual resolution.
 * 
 * @module ConflictResolver
 */

import offlineDB from './OfflineDatabase.js';

class ConflictResolver {
  constructor() {
    // Conflict resolution strategies
    this.strategies = {
      LAST_WRITE_WINS: 'last-write-wins',
      MANUAL: 'manual',
      SERVER_WINS: 'server-wins',
      CLIENT_WINS: 'client-wins'
    };
    
    // Default strategy
    this.defaultStrategy = this.strategies.LAST_WRITE_WINS;
    
    // Conflict listeners
    this.conflictListeners = [];
    
    // Conflict history
    this.conflictHistory = [];
    
    // Complex conflict threshold
    this.complexConflictThreshold = 3; // Number of fields changed
  }

  /**
   * Resolve conflict between local and remote data
   * @param {string} table - Table name
   * @param {Object} localData - Local data
   * @param {Object} remoteData - Remote data
   * @param {string} strategy - Resolution strategy
   * @returns {Promise<Object>} Resolved data
   */
  async resolveConflict(table, localData, remoteData, strategy = this.defaultStrategy) {
    console.log('[ConflictResolver] Resolving conflict:', {
      table,
      strategy,
      localId: localData.id,
      remoteId: remoteData.id
    });
    
    // Detect conflict type
    const conflictType = this.detectConflictType(localData, remoteData);
    
    // Check if conflict is complex
    const isComplex = this.isComplexConflict(localData, remoteData);
    
    // Create conflict record
    const conflict = {
      id: Date.now(),
      table,
      localData,
      remoteData,
      conflictType,
      isComplex,
      strategy,
      timestamp: new Date().toISOString(),
      resolved: false,
      resolution: null
    };
    
    // If complex, flag for manual resolution
    if (isComplex && strategy === this.strategies.LAST_WRITE_WINS) {
      return this.flagForManualResolution(conflict);
    }
    
    // Resolve based on strategy
    let resolvedData;
    switch (strategy) {
      case this.strategies.LAST_WRITE_WINS:
        resolvedData = await this.lastWriteWins(localData, remoteData);
        break;
      case this.strategies.SERVER_WINS:
        resolvedData = remoteData;
        break;
      case this.strategies.CLIENT_WINS:
        resolvedData = localData;
        break;
      case this.strategies.MANUAL:
        return this.flagForManualResolution(conflict);
      default:
        resolvedData = await this.lastWriteWins(localData, remoteData);
    }
    
    // Update conflict record
    conflict.resolved = true;
    conflict.resolution = resolvedData;
    
    // Add to history
    this.conflictHistory.push(conflict);
    
    // Notify listeners
    this.notifyConflictResolved(conflict);
    
    return resolvedData;
  }

  /**
   * Last-write-wins strategy
   * @param {Object} localData - Local data
   * @param {Object} remoteData - Remote data
   * @returns {Promise<Object>} Resolved data
   */
  async lastWriteWins(localData, remoteData) {
    // Compare timestamps
    const localTime = new Date(localData.lastModified || localData.updated_at || 0).getTime();
    const remoteTime = new Date(remoteData.lastModified || remoteData.updated_at || 0).getTime();
    
    console.log('[ConflictResolver] Last-write-wins:', {
      localTime,
      remoteTime,
      winner: localTime > remoteTime ? 'local' : 'remote'
    });
    
    // Return the most recent version
    if (localTime > remoteTime) {
      return {
        ...localData,
        conflictResolution: 'client-wins',
        resolvedAt: new Date().toISOString()
      };
    } else {
      return {
        ...remoteData,
        conflictResolution: 'server-wins',
        resolvedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Detect conflict type
   * @param {Object} localData - Local data
   * @param {Object} remoteData - Remote data
   * @returns {string} Conflict type
   */
  detectConflictType(localData, remoteData) {
    // Get changed fields
    const changedFields = this.getChangedFields(localData, remoteData);
    
    if (changedFields.length === 0) {
      return 'no-conflict';
    } else if (changedFields.length === 1) {
      return 'simple-conflict';
    } else if (changedFields.length <= this.complexConflictThreshold) {
      return 'moderate-conflict';
    } else {
      return 'complex-conflict';
    }
  }

  /**
   * Check if conflict is complex
   * @param {Object} localData - Local data
   * @param {Object} remoteData - Remote data
   * @returns {boolean} True if complex
   */
  isComplexConflict(localData, remoteData) {
    const changedFields = this.getChangedFields(localData, remoteData);
    
    // Complex if more than threshold fields changed
    if (changedFields.length > this.complexConflictThreshold) {
      return true;
    }
    
    // Complex if critical fields changed
    const criticalFields = ['status', 'deleted', 'archived'];
    const criticalChanges = changedFields.filter(field => 
      criticalFields.includes(field)
    );
    
    if (criticalChanges.length > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Get changed fields between local and remote data
   * @param {Object} localData - Local data
   * @param {Object} remoteData - Remote data
   * @returns {Array<string>} Changed field names
   */
  getChangedFields(localData, remoteData) {
    const changedFields = [];
    
    // Get all keys from both objects
    const allKeys = new Set([
      ...Object.keys(localData),
      ...Object.keys(remoteData)
    ]);
    
    // Ignore metadata fields
    const ignoreFields = ['id', 'synced', 'lastModified', 'updated_at', 'created_at'];
    
    // Compare each field
    for (const key of allKeys) {
      if (ignoreFields.includes(key)) continue;
      
      const localValue = localData[key];
      const remoteValue = remoteData[key];
      
      // Deep comparison for objects and arrays
      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  }

  /**
   * Flag conflict for manual resolution
   * @param {Object} conflict - Conflict record
   * @returns {Object} Conflict response
   */
  flagForManualResolution(conflict) {
    console.log('[ConflictResolver] Flagging for manual resolution:', conflict.id);
    
    // Add to conflict history
    this.conflictHistory.push(conflict);
    
    // Notify listeners
    this.notifyConflictDetected(conflict);
    
    return {
      success: false,
      conflict: true,
      manual: true,
      message: 'Conflict requires manual resolution',
      conflictId: conflict.id,
      conflictData: {
        local: conflict.localData,
        remote: conflict.remoteData,
        changedFields: this.getChangedFields(conflict.localData, conflict.remoteData)
      }
    };
  }

  /**
   * Manually resolve conflict
   * @param {number} conflictId - Conflict ID
   * @param {Object} resolution - Resolved data
   * @returns {Promise<Object>} Resolution result
   */
  async manuallyResolve(conflictId, resolution) {
    const conflict = this.conflictHistory.find(c => c.id === conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }
    
    if (conflict.resolved) {
      throw new Error(`Conflict already resolved: ${conflictId}`);
    }
    
    console.log('[ConflictResolver] Manually resolving conflict:', conflictId);
    
    // Update conflict record
    conflict.resolved = true;
    conflict.resolution = resolution;
    conflict.strategy = this.strategies.MANUAL;
    conflict.resolvedAt = new Date().toISOString();
    
    // Save resolution to database
    await this.saveResolution(conflict.table, resolution);
    
    // Notify listeners
    this.notifyConflictResolved(conflict);
    
    return {
      success: true,
      conflictId,
      resolution
    };
  }

  /**
   * Save resolution to database
   * @param {string} table - Table name
   * @param {Object} data - Resolved data
   * @returns {Promise<void>}
   */
  async saveResolution(table, data) {
    const saveMethod = `save${this.capitalize(this.singularize(table))}`;
    
    if (offlineDB[saveMethod]) {
      await offlineDB[saveMethod]({
        ...data,
        synced: 1, // Mark as synced
        lastModified: new Date().toISOString()
      });
    }
  }

  /**
   * Get pending conflicts
   * @returns {Array<Object>} Pending conflicts
   */
  getPendingConflicts() {
    return this.conflictHistory.filter(c => !c.resolved);
  }

  /**
   * Get resolved conflicts
   * @returns {Array<Object>} Resolved conflicts
   */
  getResolvedConflicts() {
    return this.conflictHistory.filter(c => c.resolved);
  }

  /**
   * Get conflict by ID
   * @param {number} conflictId - Conflict ID
   * @returns {Object|null} Conflict record
   */
  getConflict(conflictId) {
    return this.conflictHistory.find(c => c.id === conflictId) || null;
  }

  /**
   * Clear resolved conflicts
   * @returns {void}
   */
  clearResolvedConflicts() {
    this.conflictHistory = this.conflictHistory.filter(c => !c.resolved);
  }

  /**
   * Add conflict listener
   * @param {Function} listener - Listener function
   */
  onConflict(listener) {
    this.conflictListeners.push(listener);
  }

  /**
   * Remove conflict listener
   * @param {Function} listener - Listener function
   */
  offConflict(listener) {
    this.conflictListeners = this.conflictListeners.filter(l => l !== listener);
  }

  /**
   * Notify conflict detected
   * @param {Object} conflict - Conflict record
   */
  notifyConflictDetected(conflict) {
    this.conflictListeners.forEach(listener => {
      listener('detected', conflict);
    });
  }

  /**
   * Notify conflict resolved
   * @param {Object} conflict - Conflict record
   */
  notifyConflictResolved(conflict) {
    this.conflictListeners.forEach(listener => {
      listener('resolved', conflict);
    });
  }

  /**
   * Get conflict statistics
   * @returns {Object} Conflict statistics
   */
  getStatistics() {
    const total = this.conflictHistory.length;
    const resolved = this.conflictHistory.filter(c => c.resolved).length;
    const pending = total - resolved;
    
    const byType = {};
    this.conflictHistory.forEach(c => {
      byType[c.conflictType] = (byType[c.conflictType] || 0) + 1;
    });
    
    const byStrategy = {};
    this.conflictHistory.filter(c => c.resolved).forEach(c => {
      byStrategy[c.strategy] = (byStrategy[c.strategy] || 0) + 1;
    });
    
    return {
      total,
      resolved,
      pending,
      byType,
      byStrategy
    };
  }

  /**
   * Capitalize first letter
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
}

// Create and export singleton instance
const conflictResolver = new ConflictResolver();

export default conflictResolver;

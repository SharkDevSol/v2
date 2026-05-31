/**
 * Offline-Aware API Client
 * 
 * This class wraps all API calls and provides offline-first functionality.
 * When offline, operations are queued and optimistic responses are returned.
 * When online, operations are sent to the server immediately.
 * 
 * @module OfflineAwareAPIClient
 */

import offlineDB from './OfflineDatabase.js';
import syncManager from './SyncManager.js';

class OfflineAwareAPIClient {
  constructor() {
    // API base URL
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    
    // Request timeout (30 seconds)
    this.timeout = 30000;
    
    // Optimistic response mode
    this.optimisticMode = true;
    
    // Request interceptors
    this.requestInterceptors = [];
    
    // Response interceptors
    this.responseInterceptors = [];
  }

  /**
   * Make an API request with offline awareness
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      headers = {},
      offline = true, // Enable offline mode
      optimistic = this.optimisticMode, // Return optimistic response when offline
      cache = false // Cache response
    } = options;

    // Check if online
    const isOnline = navigator.onLine;

    // If offline and method is not GET, queue operation
    if (!isOnline && offline && method !== 'GET') {
      return this.handleOfflineRequest(endpoint, method, data, optimistic);
    }

    // If online, make actual request
    try {
      const response = await this.makeOnlineRequest(endpoint, method, data, headers);
      
      // Cache response if requested
      if (cache && method === 'GET') {
        await this.cacheResponse(endpoint, response);
      }
      
      return response;
      
    } catch (error) {
      // Network error - handle as offline
      if (this.isNetworkError(error) && offline && method !== 'GET') {
        console.warn('[OfflineAwareAPIClient] Network error, handling offline:', error.message);
        return this.handleOfflineRequest(endpoint, method, data, optimistic);
      }
      
      // Try to return cached response for GET requests
      if (cache && method === 'GET') {
        const cachedResponse = await this.getCachedResponse(endpoint);
        if (cachedResponse) {
          console.log('[OfflineAwareAPIClient] Returning cached response');
          return cachedResponse;
        }
      }
      
      throw error;
    }
  }

  /**
   * Handle offline request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {boolean} optimistic - Return optimistic response
   * @returns {Promise<Object>} Optimistic response
   */
  async handleOfflineRequest(endpoint, method, data, optimistic) {
    console.log('[OfflineAwareAPIClient] Handling offline request:', method, endpoint);
    
    // Determine operation type
    const operation = this.getOperationType(method);
    
    // Determine table name from endpoint
    const table = this.getTableFromEndpoint(endpoint);
    
    // Save to local database
    const localId = await this.saveToLocalDatabase(table, operation, data);
    
    // Queue operation for sync
    await syncManager.queueOperation(operation, table, {
      ...data,
      id: localId
    });
    
    // Return optimistic response
    if (optimistic) {
      return this.createOptimisticResponse(operation, data, localId);
    }
    
    // Return pending response
    return {
      success: true,
      pending: true,
      message: 'Operation queued for sync',
      data: {
        ...data,
        id: localId
      }
    };
  }

  /**
   * Make online request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async makeOnlineRequest(endpoint, method, data, headers) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Apply request interceptors
    let requestConfig = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers
      }
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      requestConfig.body = JSON.stringify(data);
    }
    
    // Apply interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Apply response interceptors
      let responseData = await response.json();
      for (const interceptor of this.responseInterceptors) {
        responseData = await interceptor(responseData, response);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return responseData;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Save data to local database
   * @param {string} table - Table name
   * @param {string} operation - Operation type
   * @param {Object} data - Data to save
   * @returns {Promise<number>} Local ID
   */
  async saveToLocalDatabase(table, operation, data) {
    const saveMethod = `save${this.capitalize(this.singularize(table))}`;
    
    if (offlineDB[saveMethod]) {
      return await offlineDB[saveMethod](data);
    }
    
    console.warn(`[OfflineAwareAPIClient] No save method for table: ${table}`);
    return null;
  }

  /**
   * Create optimistic response
   * @param {string} operation - Operation type
   * @param {Object} data - Request data
   * @param {number} localId - Local ID
   * @returns {Object} Optimistic response
   */
  createOptimisticResponse(operation, data, localId) {
    const response = {
      success: true,
      optimistic: true,
      message: `${operation} operation will be synced when online`,
      data: {
        ...data,
        id: localId,
        synced: false
      }
    };
    
    return response;
  }

  /**
   * Get operation type from HTTP method
   * @param {string} method - HTTP method
   * @returns {string} Operation type
   */
  getOperationType(method) {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'read';
    }
  }

  /**
   * Get table name from endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} Table name
   */
  getTableFromEndpoint(endpoint) {
    // Extract table name from endpoint
    // e.g., /api/v2/students/123 -> students
    const parts = endpoint.split('/').filter(p => p);
    
    // Find the resource name (usually after 'v2' or 'api')
    const resourceIndex = parts.findIndex(p => p === 'v2' || p === 'api');
    if (resourceIndex >= 0 && resourceIndex < parts.length - 1) {
      return parts[resourceIndex + 1];
    }
    
    // Fallback to first part
    return parts[0] || 'unknown';
  }

  /**
   * Check if error is a network error
   * @param {Error} error - Error object
   * @returns {boolean} True if network error
   */
  isNetworkError(error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed') ||
      error.message.includes('Request timeout') ||
      error.name === 'TypeError'
    );
  }

  /**
   * Get authentication headers
   * @returns {Object} Auth headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }

  /**
   * Cache response
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Response data
   * @returns {Promise<void>}
   */
  async cacheResponse(endpoint, data) {
    try {
      const cacheKey = `api_cache_${endpoint}`;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[OfflineAwareAPIClient] Failed to cache response:', error);
    }
  }

  /**
   * Get cached response
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object|null>} Cached response or null
   */
  async getCachedResponse(endpoint) {
    try {
      const cacheKey = `api_cache_${endpoint}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid (1 hour)
        const cacheAge = Date.now() - timestamp;
        if (cacheAge < 3600000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('[OfflineAwareAPIClient] Failed to get cached response:', error);
    }
    
    return null;
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Interceptor function
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} interceptor - Interceptor function
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
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

  // ==================== CONVENIENCE METHODS ====================

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      data
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      data
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      data
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Create and export singleton instance
const apiClient = new OfflineAwareAPIClient();

export default apiClient;

/**
 * Centralized API Configuration - Frontend
 * 
 * This file provides a single source of truth for all API endpoints and base URLs
 * for the frontend application. It mirrors the backend configuration structure
 * and supports multiple environments through Vite environment variables.
 * 
 * Usage:
 *   import { getBaseURL, getEndpoint, API_ENDPOINTS } from '@/config/api.config';
 *   
 *   // Get base URL for current environment
 *   const baseURL = getBaseURL();
 *   
 *   // Get full endpoint URL
 *   const loginURL = getEndpoint('AUTH.LOGIN');
 *   
 *   // Make API call with Axios
 *   axios.post(loginURL, credentials);
 */

// ===========================================
// ENVIRONMENT CONFIGURATION
// ===========================================

const ENV = import.meta.env.MODE || 'development';

/**
 * Base URLs for different environments
 * Uses Vite environment variables (VITE_* prefix)
 * 
 * Supports both VITE_BACKEND_URL (new) and VITE_API_URL (legacy) for backward compatibility
 */
const BASE_URLS = {
  development: {
    backend: import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5052',
    frontend: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'
  },
  production: {
    backend: import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://almarkaz.skoolific.com',
    frontend: import.meta.env.VITE_FRONTEND_URL || 'https://almarkaz.skoolific.com'
  },
  test: {
    backend: import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5052',
    frontend: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'
  }
};

// ===========================================
// API ENDPOINTS CONFIGURATION
// ===========================================

/**
 * Centralized API endpoints
 * Organized by module for easy navigation
 * Mirrors backend configuration structure
 */
export const API_ENDPOINTS = {
  // Health & System
  HEALTH: {
    CHECK: '/api/health',
    STATUS: '/api/health/status'
  },

  // Authentication & Authorization (V2 - Multi-branch)
  AUTH: {
    // V2 Endpoints (with branch code)
    LOGIN: '/api/v2/branches/login',
    VALIDATE_BRANCH: '/api/v2/branches/validate',
    REFRESH_TOKEN: '/api/v2/auth/refresh',
    LOGOUT: '/api/v2/auth/logout',
    
    // V1 Endpoints (legacy - for backward compatibility)
    ADMIN_LOGIN: '/api/admin/login',
    STAFF_LOGIN: '/api/staff/login',
    STUDENT_LOGIN: '/api/students/login'
  },

  // Admin Management
  ADMIN: {
    BASE: '/api/admin',
    PROFILE: '/api/admin/profile',
    SUB_ACCOUNTS: '/api/admin/sub-accounts',
    SUB_ACCOUNT_BY_ID: (id) => `/api/admin/sub-accounts/${id}`,
    PERMISSIONS: '/api/admin/permissions'
  },

  // Student Management
  STUDENTS: {
    BASE: '/api/students',
    LIST: '/api/student-list',
    BY_ID: (id) => `/api/students/${id}`,
    REGISTER: '/api/students/register',
    UPDATE: (id) => `/api/students/${id}`,
    DELETE: (id) => `/api/students/${id}`,
    SEARCH: '/api/students/search',
    BY_CLASS: (classId) => `/api/students/class/${classId}`,
    ACTIVITIES: '/api/student-activities'
  },

  // Staff Management
  STAFF: {
    BASE: '/api/staff',
    BY_ID: (id) => `/api/staff/${id}`,
    REGISTER: '/api/staff/register',
    UPDATE: (id) => `/api/staff/${id}`,
    DELETE: (id) => `/api/staff/${id}`,
    SEARCH: '/api/staff/search',
    FAULTS: '/api/staff/faults'
  },

  // Guardian Management
  GUARDIANS: {
    BASE: '/api/guardian-list',
    BY_ID: (id) => `/api/guardian-list/${id}`,
    ATTENDANCE: '/api/guardian-attendance',
    STUDENT_ATTENDANCE: '/api/guardian-student-attendance',
    PAYMENTS: '/api/guardian-payments',
    NOTIFICATIONS: '/api/guardian-notifications'
  },

  // Attendance Management
  ATTENDANCE: {
    // Student Attendance
    STUDENT: {
      BASE: '/api/attendance',
      VIEW: '/api/view-attendance',
      MARK: '/api/attendance/mark',
      BY_CLASS: (classId) => `/api/attendance/class/${classId}`,
      BY_DATE: '/api/attendance/date',
      SETTINGS: '/api/student-attendance',
      ACADEMIC: '/api/academic/student-attendance'
    },
    
    // Staff Attendance
    STAFF: {
      BASE: '/api/staff-attendance',
      MARK: '/api/staff-attendance/mark',
      VIEW: '/api/staff-attendance/view',
      LOG: '/api/staff-attendance/log',
      ADMIN: '/api/admin-attendance'
    },
    
    // Machine Attendance
    MACHINE: {
      BASE: '/api/machine-attendance',
      WEBHOOK: '/api/machine-webhook',
      USB_IMPORT: '/api/usb-attendance',
      MAPPING: '/api/staff/machine-mapping'
    }
  },

  // Academic Management
  ACADEMIC: {
    // Mark Lists
    MARK_LIST: {
      BASE: '/api/mark-list',
      BY_ID: (id) => `/api/mark-list/${id}`,
      CREATE: '/api/mark-list/create',
      UPDATE: (id) => `/api/mark-list/${id}`,
      DELETE: (id) => `/api/mark-list/${id}`,
      BY_CLASS: (classId) => `/api/mark-list/class/${classId}`
    },
    
    // Evaluations
    EVALUATIONS: {
      BASE: '/api/evaluations',
      BOOK: '/api/evaluation-book',
      BY_ID: (id) => `/api/evaluations/${id}`
    },
    
    // Schedule
    SCHEDULE: {
      BASE: '/api/schedule',
      BY_CLASS: (classId) => `/api/schedule/class/${classId}`,
      BY_TEACHER: (teacherId) => `/api/schedule/teacher/${teacherId}`
    },
    
    // Class Teacher
    CLASS_TEACHER: {
      BASE: '/api/class-teacher',
      BY_CLASS: (classId) => `/api/class-teacher/class/${classId}`
    }
  },

  // Finance Management
  FINANCE: {
    // Accounts
    ACCOUNTS: {
      BASE: '/api/finance/accounts',
      BY_ID: (id) => `/api/finance/accounts/${id}`,
      BALANCE: (id) => `/api/finance/accounts/${id}/balance`
    },
    
    // Fee Management
    FEES: {
      BASE: '/api/simple-fees',
      STRUCTURES: '/api/finance/fee-structures',
      PAYMENTS: '/api/fee-payments',
      DISCOUNTS: '/api/finance/discounts',
      SCHOLARSHIPS: '/api/finance/scholarships',
      LATE_FEES: '/api/finance/late-fee-rules',
      LATE_FEE_APPLICATION: '/api/finance/late-fee-application'
    },
    
    // Invoices
    INVOICES: {
      BASE: '/api/finance/invoices',
      SIMPLE: '/api/finance/simple-invoices',
      PROGRESSIVE: '/api/finance/progressive-invoices',
      BY_ID: (id) => `/api/finance/invoices/${id}`,
      BY_STUDENT: (studentId) => `/api/finance/invoices/student/${studentId}`
    },
    
    // Payments
    PAYMENTS: {
      BASE: '/api/finance/payments',
      MONTHLY: '/api/finance/monthly-payments',
      MONTHLY_VIEW: '/api/finance/monthly-payments-view',
      BY_ID: (id) => `/api/finance/payments/${id}`,
      BY_STUDENT: (studentId) => `/api/finance/payments/student/${studentId}`
    },
    
    // Expenses & Budgets
    EXPENSES: {
      BASE: '/api/finance/expenses',
      BY_ID: (id) => `/api/finance/expenses/${id}`,
      APPROVAL: '/api/finance/expenses/approval'
    },
    
    BUDGETS: {
      BASE: '/api/finance/budgets',
      BY_ID: (id) => `/api/finance/budgets/${id}`
    },
    
    // Class Students
    CLASS_STUDENTS: '/api/finance/class-students'
  },

  // HR Management
  HR: {
    BASE: '/api/hr',
    SHIFT_SETTINGS: '/api/hr/shift-settings',
    ATTENDANCE_TIME_SETTINGS: '/api/hr/attendance-time-settings',
    SALARY: {
      BASE: '/api/hr/salary',
      BY_STAFF: (staffId) => `/api/hr/salary/staff/${staffId}`,
      GENERATE: '/api/hr/salary/generate',
      APPROVE: '/api/hr/salary/approve'
    },
    LEAVE: {
      BASE: '/api/hr/leave',
      REQUEST: '/api/hr/leave/request',
      APPROVE: '/api/hr/leave/approve'
    }
  },

  // Inventory Management
  INVENTORY: {
    BASE: '/api/inventory',
    ITEMS: '/api/inventory/items',
    CATEGORIES: '/api/inventory/categories',
    TRANSACTIONS: '/api/inventory/transactions'
  },

  // Asset Management
  ASSETS: {
    BASE: '/api/assets',
    BY_ID: (id) => `/api/assets/${id}`,
    CATEGORIES: '/api/assets/categories',
    MAINTENANCE: '/api/assets/maintenance'
  },

  // Communication
  COMMUNICATION: {
    // Posts
    POSTS: {
      BASE: '/api/posts',
      BY_ID: (id) => `/api/posts/${id}`,
      CREATE: '/api/posts/create',
      UPDATE: (id) => `/api/posts/${id}`,
      DELETE: (id) => `/api/posts/${id}`
    },
    
    // Chat
    CHAT: {
      BASE: '/api/chats',
      CONVERSATIONS: '/api/chats/conversations',
      MESSAGES: (conversationId) => `/api/chats/conversations/${conversationId}/messages`,
      SEND: '/api/chats/send'
    },
    
    // Class Communication
    CLASS_COMMUNICATION: {
      BASE: '/api/class-communication',
      BY_CLASS: (classId) => `/api/class-communication/class/${classId}`
    }
  },

  // Faults Management
  FAULTS: {
    STUDENT: '/api/faults',
    STAFF: '/api/staff/faults',
    BY_ID: (id) => `/api/faults/${id}`
  },

  // Reports
  REPORTS: {
    BASE: '/api/reports',
    FINANCE: '/api/reports/finance',
    INVENTORY: '/api/reports/inventory',
    HR: '/api/reports/hr',
    ASSETS: '/api/reports/assets',
    ATTENDANCE: '/api/reports/attendance',
    ACADEMIC: '/api/reports/academic'
  },

  // Dashboard
  DASHBOARD: {
    BASE: '/api/dashboard',
    STATS: '/api/dashboard/stats',
    RECENT_FAULTS: '/api/dashboard/recent-faults',
    TOP_OFFENDERS: '/api/dashboard/top-offenders',
    ATTENDANCE_SUMMARY: '/api/dashboard/attendance-summary'
  },

  // School Setup
  SCHOOL_SETUP: {
    BASE: '/api/school-setup',
    TASKS: '/api/tasks',
    TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
    TASK6: '/api/task6'
  },

  // Settings
  SETTINGS: {
    BASE: '/api/settings',
    GENERAL: '/api/settings/general',
    BRANDING: '/api/settings/branding',
    LANGUAGE: '/api/settings/language',
    PASSWORD: '/api/settings/password',
    SHIFT: '/api/settings/shift'
  },

  // Device User Management
  DEVICE_USERS: {
    BASE: '/api/device-users',
    BUFFER: '/api/device-users/buffer',
    MAPPING: '/api/device-users/mapping',
    SYNC: '/api/device-users/sync'
  }
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get the base URL for the current environment
 * 
 * @param {string} service - Service name ('backend' or 'frontend')
 * @param {string} environment - Environment name (optional, defaults to MODE)
 * @returns {string} Base URL
 * 
 * @example
 * const baseURL = getBaseURL(); // Returns backend URL for current environment
 * const frontendURL = getBaseURL('frontend'); // Returns frontend URL
 * const prodURL = getBaseURL('backend', 'production'); // Returns production backend URL
 */
export function getBaseURL(service = 'backend', environment = ENV) {
  const env = environment || 'development';
  const urls = BASE_URLS[env] || BASE_URLS.development;
  return urls[service] || urls.backend;
}

/**
 * Get a full endpoint URL by combining base URL with endpoint path
 * 
 * @param {string} endpointPath - Endpoint path (can use dot notation for nested paths)
 * @param {object} params - Optional parameters for dynamic endpoints
 * @param {string} environment - Environment name (optional)
 * @returns {string} Full endpoint URL
 * 
 * @example
 * // Simple endpoint
 * const loginURL = getEndpoint('AUTH.LOGIN');
 * // Returns: http://localhost:5052/api/v2/auth/login
 * 
 * // Dynamic endpoint with parameter
 * const studentURL = getEndpoint('STUDENTS.BY_ID', { id: 123 });
 * // Returns: http://localhost:5052/api/students/123
 * 
 * // Nested endpoint
 * const markListURL = getEndpoint('ACADEMIC.MARK_LIST.CREATE');
 * // Returns: http://localhost:5052/api/mark-list/create
 */
export function getEndpoint(endpointPath, params = {}, environment = ENV) {
  const baseURL = getBaseURL('backend', environment);
  
  // Navigate through nested object using dot notation
  const pathParts = endpointPath.split('.');
  let endpoint = API_ENDPOINTS;
  
  for (const part of pathParts) {
    if (endpoint[part] === undefined) {
      console.warn(`Warning: Endpoint path "${endpointPath}" not found in API_ENDPOINTS`);
      return baseURL;
    }
    endpoint = endpoint[part];
  }
  
  // If endpoint is a function, call it with params
  if (typeof endpoint === 'function') {
    // Extract the first parameter value (for simple cases like BY_ID)
    const paramValue = params.id || params[Object.keys(params)[0]];
    endpoint = endpoint(paramValue);
  }
  
  return `${baseURL}${endpoint}`;
}

/**
 * Get an endpoint path without the base URL
 * Useful for Axios instances with baseURL already configured
 * 
 * @param {string} endpointPath - Endpoint path (can use dot notation)
 * @param {object} params - Optional parameters for dynamic endpoints
 * @returns {string} Endpoint path only
 * 
 * @example
 * const path = getEndpointPath('AUTH.LOGIN');
 * // Returns: /api/v2/auth/login
 * 
 * // Use with Axios instance
 * const api = axios.create({ baseURL: getBaseURL() });
 * api.post(getEndpointPath('AUTH.LOGIN'), credentials);
 */
export function getEndpointPath(endpointPath, params = {}) {
  const pathParts = endpointPath.split('.');
  let endpoint = API_ENDPOINTS;
  
  for (const part of pathParts) {
    if (endpoint[part] === undefined) {
      console.warn(`Warning: Endpoint path "${endpointPath}" not found in API_ENDPOINTS`);
      return '/';
    }
    endpoint = endpoint[part];
  }
  
  if (typeof endpoint === 'function') {
    const paramValue = params.id || params[Object.keys(params)[0]];
    endpoint = endpoint(paramValue);
  }
  
  return endpoint;
}

/**
 * Check if an endpoint exists in the configuration
 * 
 * @param {string} endpointPath - Endpoint path to check
 * @returns {boolean} True if endpoint exists
 * 
 * @example
 * if (hasEndpoint('AUTH.LOGIN')) {
 *   // Endpoint exists
 * }
 */
export function hasEndpoint(endpointPath) {
  const pathParts = endpointPath.split('.');
  let endpoint = API_ENDPOINTS;
  
  for (const part of pathParts) {
    if (endpoint[part] === undefined) {
      return false;
    }
    endpoint = endpoint[part];
  }
  
  return true;
}

/**
 * Get all endpoints for a specific module
 * 
 * @param {string} moduleName - Module name (e.g., 'AUTH', 'STUDENTS')
 * @returns {object} Object containing all endpoints for the module
 * 
 * @example
 * const authEndpoints = getModuleEndpoints('AUTH');
 * // Returns: { LOGIN: '/api/v2/auth/login', VALIDATE_BRANCH: '/api/v2/branches/validate', ... }
 */
export function getModuleEndpoints(moduleName) {
  return API_ENDPOINTS[moduleName] || {};
}

// ===========================================
// FRONTEND-SPECIFIC HELPERS
// ===========================================

/**
 * Build a full URL with query parameters
 * 
 * @param {string} endpointPath - Endpoint path
 * @param {object} pathParams - Parameters for dynamic endpoints (e.g., { id: 123 })
 * @param {object} queryParams - Query string parameters (e.g., { page: 1, limit: 10 })
 * @returns {string} Full URL with query parameters
 * 
 * @example
 * const url = buildURL('STUDENTS.LIST', {}, { page: 1, limit: 10, search: 'John' });
 * // Returns: http://localhost:5052/api/student-list?page=1&limit=10&search=John
 */
export function buildURL(endpointPath, pathParams = {}, queryParams = {}) {
  const baseUrl = getEndpoint(endpointPath, pathParams);
  
  const queryString = Object.keys(queryParams)
    .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Create request configuration object for Axios
 * Includes common headers and authentication
 * 
 * @param {object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} options.data - Request body data
 * @param {object} options.params - Query parameters
 * @param {object} options.headers - Additional headers
 * @param {boolean} options.auth - Include authentication token (default: true)
 * @returns {object} Axios request configuration
 * 
 * @example
 * const config = createRequestConfig({
 *   method: 'POST',
 *   data: { username, password },
 *   auth: false
 * });
 * axios.post(getEndpoint('AUTH.LOGIN'), config.data, config);
 */
export function createRequestConfig(options = {}) {
  const {
    method = 'GET',
    data = null,
    params = null,
    headers = {},
    auth = true
  } = options;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  // Add authentication token if required
  if (auth) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Add branch code if available
  const branchCode = localStorage.getItem('branchCode') || sessionStorage.getItem('branchCode');
  if (branchCode) {
    config.headers['X-Branch-Code'] = branchCode;
  }
  
  if (data) config.data = data;
  if (params) config.params = params;
  
  return config;
}

/**
 * Handle API errors consistently across the application
 * 
 * @param {Error} error - Error object from Axios
 * @returns {object} Standardized error object
 * 
 * @example
 * try {
 *   const response = await axios.get(getEndpoint('STUDENTS.LIST'));
 * } catch (error) {
 *   const errorInfo = handleAPIError(error);
 *   console.error(errorInfo.message);
 * }
 */
export function handleAPIError(error) {
  if (error.response) {
    // Server responded with error status
    return {
      status: error.response.status,
      message: error.response.data?.message || 'Server error occurred',
      data: error.response.data,
      type: 'server_error'
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      status: 0,
      message: 'No response from server. Please check your connection.',
      data: null,
      type: 'network_error'
    };
  } else {
    // Error in request setup
    return {
      status: 0,
      message: error.message || 'Request failed',
      data: null,
      type: 'request_error'
    };
  }
}

/**
 * Check if the application is running in development mode
 * 
 * @returns {boolean} True if in development mode
 */
export function isDevelopment() {
  return ENV === 'development';
}

/**
 * Check if the application is running in production mode
 * 
 * @returns {boolean} True if in production mode
 */
export function isProduction() {
  return ENV === 'production';
}

/**
 * Get current environment name
 * 
 * @returns {string} Environment name
 */
export function getEnvironment() {
  return ENV;
}

// ===========================================
// DEFAULT EXPORT
// ===========================================

/**
 * Default export with all configuration and helpers
 */
export default {
  ENV,
  BASE_URLS,
  API_ENDPOINTS,
  
  // Core helpers
  getBaseURL,
  getEndpoint,
  getEndpointPath,
  hasEndpoint,
  getModuleEndpoints,
  
  // Frontend-specific helpers
  buildURL,
  createRequestConfig,
  handleAPIError,
  isDevelopment,
  isProduction,
  getEnvironment
};

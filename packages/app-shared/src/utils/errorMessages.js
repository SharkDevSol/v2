/**
 * Standardized error message utility
 * Provides consistent error messages across all components
 */

/**
 * Format an API error into a user-friendly message
 * @param {Error} error - The caught error object
 * @param {string} fallback - Fallback message if error can't be parsed
 * @returns {string} User-friendly error message
 */
export function formatAPIError(error, fallback = 'An unexpected error occurred') {
  if (!error) return fallback;
  
  // Network error (no response from server)
  if (!error.response && error.request) {
    return 'Network error: Unable to reach the server. Please check your connection.';
  }
  
  // Server responded with an error
  if (error.response) {
    const { status, data } = error.response;
    const serverMsg = data?.error || data?.message || data?.details || '';
    
    switch (status) {
      case 400:
        return `Invalid input: ${serverMsg || 'Please check your data and try again.'}`;
      case 401:
        return 'Authentication failed: Your session may have expired. Please log in again.';
      case 403:
        return serverMsg || 'Access denied: You do not have permission to perform this action.';
      case 404:
        return serverMsg || 'Not found: The requested resource was not found.';
      case 409:
        return serverMsg || 'Conflict: This item already exists.';
      case 422:
        return `Validation error: ${serverMsg || 'Please check your input.'}`;
      case 429:
        return 'Rate limit exceeded: Please wait a moment before trying again.';
      case 500:
        return `Server error: ${serverMsg || 'An internal server error occurred. Please try again.'}`;
      case 502:
        return 'Server temporarily unavailable: The server is restarting. Please try again in a moment.';
      case 503:
        return 'Service unavailable: The server is under maintenance. Please try again later.';
      default:
        return serverMsg || `Error (${status}): ${fallback}`;
    }
  }
  
  // JavaScript/client-side error
  if (error.message) {
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Network error: Unable to reach the server. Please check your connection.';
    }
    return error.message;
  }
  
  return fallback;
}

/**
 * Format a form validation error message
 * @param {string} fieldName - The field that has the error
 * @param {string} reason - Why the field is invalid
 * @returns {string} Formatted error message
 */
export function formatFieldError(fieldName, reason) {
  return `"${fieldName}" ${reason}`;
}

/**
 * Format a success message
 * @param {string} action - What action was completed
 * @returns {string} Success message
 */
export function formatSuccess(action) {
  return `${action} completed successfully.`;
}

export default { formatAPIError, formatFieldError, formatSuccess };

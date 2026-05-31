import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 * @param {Object} options - Configuration options
 * @param {string} options.position - Default toast position
 * @param {number} options.duration - Default auto-dismiss duration
 * @param {boolean} options.showCloseButton - Default close button visibility
 * @returns {Object} Toast management functions and state
 */
export const useToast = (options = {}) => {
  const {
    position = 'top-right',
    duration = 5000,
    showCloseButton = true
  } = options;

  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification
   * @param {Object} toastOptions - Toast configuration
   * @returns {string} Toast ID
   */
  const addToast = useCallback((toastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = {
      id,
      message: toastOptions.message,
      type: toastOptions.type || 'info',
      duration: toastOptions.duration !== undefined ? toastOptions.duration : duration,
      showCloseButton: toastOptions.showCloseButton !== undefined ? toastOptions.showCloseButton : showCloseButton,
      position: toastOptions.position || position
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, [duration, showCloseButton, position]);

  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Remove all toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Show a success toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const success = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'success' });
  }, [addToast]);

  /**
   * Show an error toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const error = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'error' });
  }, [addToast]);

  /**
   * Show a warning toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const warning = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'warning' });
  }, [addToast]);

  /**
   * Show an info toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {string} Toast ID
   */
  const info = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'info' });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    position
  };
};

export default useToast;

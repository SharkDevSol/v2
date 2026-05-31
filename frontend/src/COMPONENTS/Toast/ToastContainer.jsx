import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import styles from './Toast.module.css';

/**
 * ToastContainer component for managing multiple toasts
 * @param {Object} props - Component props
 * @param {Array} props.toasts - Array of toast objects
 * @param {Function} props.onRemove - Remove toast handler
 * @param {string} props.position - Toast position (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
 */
const ToastContainer = ({ toasts, onRemove, position = 'top-right' }) => {
  // Guard against undefined or null toasts
  if (!toasts || toasts.length === 0) return null;

  const containerClasses = [
    styles.toastContainer,
    styles[`container-${position}`]
  ].filter(Boolean).join(' ');

  return createPortal(
    <div className={containerClasses} aria-live="assertive" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          showCloseButton={toast.showCloseButton}
          position={position}
          onClose={onRemove}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;

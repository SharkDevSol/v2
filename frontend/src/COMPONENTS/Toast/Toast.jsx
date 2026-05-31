import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

/**
 * Individual Toast notification component
 * @param {Object} props - Component props
 * @param {string} props.id - Unique toast identifier
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {number} props.duration - Auto-close duration in ms (0 = no auto-close)
 * @param {boolean} props.showCloseButton - Show close button
 * @param {string} props.position - Toast position (for animation direction)
 * @param {Function} props.onClose - Close handler
 */
const Toast = ({ 
  id,
  message,
  type = 'info',
  duration = 5000,
  showCloseButton = true,
  position = 'top-right',
  onClose
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  };

  const toastClasses = [
    styles.toast,
    styles[type],
    isExiting ? styles.exiting : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={toastClasses} 
      role="alert" 
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={styles.icon}>
        {icons[type]}
      </div>
      <div className={styles.message}>
        {message}
      </div>
      {showCloseButton && (
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;

import React from 'react';
import { useToast } from './useToast';
import ToastContainer from './ToastContainer';
import styles from './ToastExample.module.css';

/**
 * Toast Example Component
 * Demonstrates all Toast notification features
 */
const ToastExample = () => {
  const toast = useToast({
    position: 'top-right',
    duration: 5000,
    showCloseButton: true
  });

  const [selectedPosition, setSelectedPosition] = React.useState('top-right');
  const [selectedDuration, setSelectedDuration] = React.useState(5000);

  const positions = [
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center'
  ];

  const handleShowToast = (type) => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred. Please try again.',
      warning: 'Please review your input before proceeding.',
      info: 'New updates are available.'
    };

    toast[type](messages[type], {
      position: selectedPosition,
      duration: selectedDuration
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Toast Notification Demo</h1>
        <p>Test all Toast notification features</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="position">Position:</label>
          <select
            id="position"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className={styles.select}
          >
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="duration">Duration:</label>
          <select
            id="duration"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(Number(e.target.value))}
            className={styles.select}
          >
            <option value={2000}>2 seconds</option>
            <option value={3000}>3 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={7000}>7 seconds</option>
            <option value={0}>No auto-dismiss</option>
          </select>
        </div>
      </div>

      <div className={styles.buttonGrid}>
        <button
          onClick={() => handleShowToast('success')}
          className={`${styles.button} ${styles.success}`}
        >
          Show Success Toast
        </button>

        <button
          onClick={() => handleShowToast('error')}
          className={`${styles.button} ${styles.error}`}
        >
          Show Error Toast
        </button>

        <button
          onClick={() => handleShowToast('warning')}
          className={`${styles.button} ${styles.warning}`}
        >
          Show Warning Toast
        </button>

        <button
          onClick={() => handleShowToast('info')}
          className={`${styles.button} ${styles.info}`}
        >
          Show Info Toast
        </button>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => {
            toast.success('Toast 1');
            setTimeout(() => toast.info('Toast 2'), 200);
            setTimeout(() => toast.warning('Toast 3'), 400);
            setTimeout(() => toast.error('Toast 4'), 600);
          }}
          className={`${styles.button} ${styles.secondary}`}
        >
          Show Multiple Toasts
        </button>

        <button
          onClick={() => toast.clearToasts()}
          className={`${styles.button} ${styles.danger}`}
        >
          Clear All Toasts
        </button>
      </div>

      <div className={styles.info}>
        <h3>Features:</h3>
        <ul>
          <li>✅ 4 variants: success, error, warning, info</li>
          <li>✅ 6 position options</li>
          <li>✅ Configurable auto-dismiss duration</li>
          <li>✅ Manual close button</li>
          <li>✅ Multiple toast stacking</li>
          <li>✅ Smooth animations</li>
          <li>✅ Full accessibility (ARIA)</li>
          <li>✅ RTL layout support</li>
          <li>✅ Light/dark mode support</li>
        </ul>
      </div>

      <ToastContainer
        toasts={toast.toasts}
        onRemove={toast.removeToast}
        position={selectedPosition}
      />
    </div>
  );
};

export default ToastExample;

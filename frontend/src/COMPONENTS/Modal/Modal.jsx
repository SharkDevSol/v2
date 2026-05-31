import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

/**
 * Modal component for dialogs with comprehensive accessibility support
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @param {string} [props.size='medium'] - Modal size: 'small', 'medium', 'large', 'full'
 * @param {boolean} [props.showCloseButton=true] - Show close button in header
 * @param {boolean} [props.closeOnOverlayClick=true] - Close modal when clicking backdrop
 * @param {boolean} [props.closeOnEscape=true] - Close modal when pressing Escape key
 * @param {string} [props.className] - Additional CSS classes for modal container
 * @param {string} [props.ariaLabel] - Accessible label for the modal
 * @param {string} [props.ariaDescribedBy] - ID of element describing the modal
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  ariaLabel,
  ariaDescribedBy
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when modal opens
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  const modalClasses = [
    styles.modal,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return createPortal(
    <div 
      className={styles.overlay} 
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div 
        ref={modalRef}
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabel ? undefined : "modal-title"}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-testid="modal-container"
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          {showCloseButton && (
            <button 
              className={styles.closeButton} 
              onClick={onClose}
              aria-label="Close modal"
              data-testid="modal-close-button"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className={styles.body} data-testid="modal-body">
          {children}
        </div>

        {footer && (
          <div className={styles.footer} data-testid="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

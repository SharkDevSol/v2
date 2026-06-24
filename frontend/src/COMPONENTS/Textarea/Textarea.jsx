import React, { forwardRef, useEffect, useRef } from 'react';
import styles from './Textarea.module.css';

/**
 * Reusable Textarea component with auto-resize, validation states, and accessibility support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Textarea label text
 * @param {string} props.value - Textarea value (controlled)
 * @param {function} props.onChange - Change handler function
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.error] - Error message (shows error state)
 * @param {string} [props.success] - Success message (shows success state)
 * @param {string} [props.warning] - Warning message (shows warning state)
 * @param {string} [props.helperText] - Helper text below textarea
 * @param {boolean} [props.required] - Required field indicator
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.readOnly] - Read-only state
 * @param {number} [props.rows=4] - Initial number of rows
 * @param {number} [props.maxLength] - Maximum character length
 * @param {boolean} [props.showCount=false] - Show character count
 * @param {boolean} [props.autoResize=false] - Enable auto-resize functionality
 * @param {('none'|'vertical'|'horizontal'|'both')} [props.resize='vertical'] - Resize behavior
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Textarea ID for accessibility
 * @param {string} [props.name] - Textarea name attribute
 * @param {string} [props.ariaLabel] - ARIA label for accessibility
 * @param {string} [props.ariaDescribedBy] - ARIA described-by for accessibility
 */
const Textarea = forwardRef(({ 
  label,
  value = '',
  onChange,
  placeholder,
  error,
  success,
  warning,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  rows = 4,
  maxLength,
  showCount = false,
  autoResize = false,
  resize = 'vertical',
  className = '',
  id,
  name,
  ariaLabel,
  ariaDescribedBy,
  ...props 
}, ref) => {
  const internalRef = useRef(null);
  const textareaRef = ref || internalRef;

  // Generate unique IDs for accessibility
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;

  // Determine validation state
  const validationState = error ? 'error' : success ? 'success' : warning ? 'warning' : null;
  const validationMessage = error || success || warning;

  const characterCount = value?.length || 0;
  const showCounter = showCount || maxLength;

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize, textareaRef]);

  // Handle change event
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  // Build textarea classes
  const textareaClasses = [
    styles.textarea,
    autoResize ? styles.autoResize : styles[`resize-${resize}`],
    className
  ].filter(Boolean).join(' ');

  // Build ARIA attributes
  const ariaAttributes = {
    'aria-label': ariaLabel || label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': ariaDescribedBy || (validationMessage || helperText ? `${helperTextId} ${errorId}` : undefined),
    'aria-disabled': disabled,
    'aria-readonly': readOnly,
  };

  return (
    <div className={`${styles.textareaGroup} ${className}`} dir="auto">
      {label && (
        <label 
          htmlFor={textareaId}
          className={styles.label}
        >
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}
      
      <div 
        className={`
          ${styles.textareaWrapper} 
          ${validationState ? styles[validationState] : ''}
          ${disabled ? styles.disabled : ''}
          ${readOnly ? styles.readOnly : ''}
        `}
      >
        <textarea
          ref={textareaRef}
          id={textareaId}
          name={name}
          className={textareaClasses}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          maxLength={maxLength}
          {...ariaAttributes}
          {...props}
        />
      </div>
      
      <div className={styles.footer}>
        <div className={styles.helperTextWrapper}>
          {helperText && !validationMessage && (
            <span 
              id={helperTextId}
              className={styles.helperText}
              role="note"
            >
              {helperText}
            </span>
          )}
          
          {validationMessage && (
            <span 
              id={errorId}
              className={`${styles.validationMessage} ${styles[`${validationState}Text`]}`}
              role={error ? 'alert' : 'status'}
              aria-live={error ? 'assertive' : 'polite'}
            >
              {validationMessage}
            </span>
          )}
        </div>
        
        {showCounter && (
          <span className={styles.counter} aria-live="polite" aria-atomic="true">
            {characterCount}
            {maxLength && ` / ${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

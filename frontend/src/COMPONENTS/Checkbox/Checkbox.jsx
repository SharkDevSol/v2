import React, { forwardRef, useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import styles from './Checkbox.module.css';

/**
 * Checkbox component with full accessibility support
 * @param {Object} props - Component props
 * @param {string} props.label - Checkbox label
 * @param {string} props.description - Optional description text below the label
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler (receives boolean value)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.indeterminate - Indeterminate state
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {string} props.size - Checkbox size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Input ID for label association
 * @param {string} props.ariaLabel - ARIA label for accessibility
 * @param {string} props.ariaDescribedBy - ARIA described by for accessibility
 * @param {boolean} props.required - Required field indicator
 */
const Checkbox = forwardRef(({ 
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  error,
  helperText,
  size = 'md',
  className = '',
  id,
  ariaLabel,
  ariaDescribedBy,
  required = false,
  ...props 
}, ref) => {
  const internalRef = useRef(null);
  const checkboxRef = ref || internalRef;
  
  // Generate unique ID if not provided
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const helperTextId = (error || helperText) ? `${checkboxId}-helper` : undefined;
  
  // Handle indeterminate state (can't be set via HTML attribute)
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, checkboxRef]);

  const checkboxClasses = [
    styles.checkboxWrapper,
    styles[size],
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const boxClasses = [
    styles.checkboxBox,
    checked && styles.checked,
    indeterminate && styles.indeterminate,
    error && styles.error
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  // Build aria-describedby string
  const ariaDescribedByValue = [
    ariaDescribedBy,
    descriptionId,
    helperTextId
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.checkboxGroup}>
      <label className={checkboxClasses} htmlFor={checkboxId}>
        <input
          type="checkbox"
          id={checkboxId}
          className={styles.checkboxInput}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          ref={checkboxRef}
          aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
          aria-describedby={ariaDescribedByValue}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required ? 'true' : 'false'}
          {...props}
        />
        <span className={boxClasses} aria-hidden="true">
          {indeterminate ? (
            <Minus size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} />
          ) : checked ? (
            <Check size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} />
          ) : null}
        </span>
        {label && (
          <span className={styles.labelWrapper}>
            <span className={styles.label}>
              {label}
              {required && <span className={styles.required} aria-label="required">*</span>}
            </span>
            {description && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
      
      {(error || helperText) && (
        <span 
          id={helperTextId}
          className={`${styles.helperText} ${error ? styles.errorText : ''}`}
          role={error ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

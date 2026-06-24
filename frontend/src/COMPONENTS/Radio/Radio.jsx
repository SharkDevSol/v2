import React, { forwardRef } from 'react';
import styles from './Radio.module.css';

/**
 * Radio button component with full accessibility support
 * @param {Object} props - Component props
 * @param {string} props.label - Radio label
 * @param {string} props.description - Optional description text below the label
 * @param {string} props.value - Radio value
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.name - Radio group name
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {string} props.size - Radio size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Input ID for label association
 * @param {string} props.ariaLabel - ARIA label for accessibility
 * @param {string} props.ariaDescribedBy - ARIA described by for accessibility
 * @param {boolean} props.required - Required field indicator
 */
const Radio = forwardRef(({ 
  label,
  description,
  value,
  checked = false,
  onChange,
  disabled = false,
  name,
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
  // Generate unique ID if not provided
  const radioId = id || `radio-${value}-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${radioId}-description` : undefined;
  const helperTextId = (error || helperText) ? `${radioId}-helper` : undefined;

  const radioClasses = [
    styles.radioWrapper,
    styles[size],
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const circleClasses = [
    styles.radioCircle,
    checked && styles.checked,
    error && styles.error
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  // Build aria-describedby string
  const ariaDescribedByValue = [
    ariaDescribedBy,
    descriptionId,
    helperTextId
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.radioGroup}>
      <label className={radioClasses} htmlFor={radioId}>
        <input
          type="radio"
          id={radioId}
          className={styles.radioInput}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          name={name}
          ref={ref}
          aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
          aria-describedby={ariaDescribedByValue}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required ? 'true' : 'false'}
          {...props}
        />
        <span className={circleClasses} aria-hidden="true">
          {checked && <span className={styles.radioDot} />}
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

Radio.displayName = 'Radio';

export default Radio;

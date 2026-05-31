import React from 'react';
import Radio from './Radio';
import styles from './RadioGroup.module.css';

/**
 * RadioGroup component for managing multiple radio buttons
 * @param {Object} props - Component props
 * @param {string} props.name - Radio group name (required for grouping)
 * @param {Array} props.options - Array of radio options
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Change handler (receives selected value)
 * @param {boolean} props.disabled - Disabled state for all radios
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {string} props.layout - Layout direction ('vertical' or 'horizontal')
 * @param {string} props.label - Group label
 * @param {string} props.description - Group description
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.size - Radio size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const RadioGroup = ({ 
  name,
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  layout = 'vertical',
  label,
  description,
  required = false,
  size = 'md',
  className = '',
  ...props 
}) => {
  // Generate unique ID for the group
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${groupId}-description` : undefined;
  const helperTextId = (error || helperText) ? `${groupId}-helper` : undefined;

  const groupClasses = [
    styles.radioGroup,
    styles[layout],
    className
  ].filter(Boolean).join(' ');

  const handleChange = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
  };

  // Build aria-describedby string
  const ariaDescribedByValue = [
    descriptionId,
    helperTextId
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.radioGroupWrapper}>
      {label && (
        <div className={styles.labelWrapper}>
          <label className={styles.groupLabel} id={groupId}>
            {label}
            {required && <span className={styles.required} aria-label="required">*</span>}
          </label>
          {description && (
            <span id={descriptionId} className={styles.groupDescription}>
              {description}
            </span>
          )}
        </div>
      )}
      
      <div 
        className={groupClasses}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-describedby={ariaDescribedByValue}
        aria-required={required ? 'true' : 'false'}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={disabled || option.disabled}
            size={size}
          />
        ))}
      </div>
      
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
};

export default RadioGroup;

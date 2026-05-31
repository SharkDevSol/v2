/**
 * ValidatedSelect Component
 * Reusable select component with built-in validation
 */
import React from 'react';
import styles from './ValidatedInput.module.css';

const ValidatedSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
  icon = null,
  helpText = '',
  options = [],
  placeholder = 'Select an option',
  ...props
}) => {
  const showError = touched && error;

  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`${styles.input} ${showError ? styles.inputError : ''}`}
        aria-invalid={showError}
        aria-describedby={showError ? `${name}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option 
            key={index} 
            value={typeof option === 'object' ? option.value : option}
          >
            {typeof option === 'object' ? option.label : option}
          </option>
        ))}
      </select>
      
      {helpText && !showError && (
        <span className={styles.helpText}>{helpText}</span>
      )}
      
      {showError && (
        <span id={`${name}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default ValidatedSelect;

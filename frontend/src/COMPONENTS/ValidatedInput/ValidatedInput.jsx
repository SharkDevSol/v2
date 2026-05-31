/**
 * ValidatedInput Component
 * Reusable input component with built-in validation
 */
import React from 'react';
import styles from './ValidatedInput.module.css';

const ValidatedInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder = '',
  disabled = false,
  className = '',
  icon = null,
  helpText = '',
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
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${showError ? styles.inputError : ''}`}
        aria-invalid={showError}
        aria-describedby={showError ? `${name}-error` : undefined}
        {...props}
      />
      
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

export default ValidatedInput;

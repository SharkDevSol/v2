/**
 * ValidatedTextarea Component
 * Reusable textarea component with built-in validation
 */
import React from 'react';
import styles from './ValidatedInput.module.css';

const ValidatedTextarea = ({
  label,
  name,
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
  rows = 4,
  maxLength,
  ...props
}) => {
  const showError = touched && error;
  const characterCount = value ? value.length : 0;

  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`${styles.input} ${showError ? styles.inputError : ''}`}
        aria-invalid={showError}
        aria-describedby={showError ? `${name}-error` : undefined}
        style={{ resize: 'vertical', minHeight: '100px' }}
        {...props}
      />
      
      {maxLength && (
        <div className={styles.characterCount}>
          {characterCount} / {maxLength}
        </div>
      )}
      
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

export default ValidatedTextarea;

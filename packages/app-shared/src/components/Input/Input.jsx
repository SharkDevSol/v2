import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

/**
 * Reusable Input component with variants, validation states, and accessibility support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {('text'|'email'|'password'|'number'|'tel'|'url'|'date')} props.type - Input type variant
 * @param {string} [props.label] - Input label text
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} props.value - Input value (controlled)
 * @param {function} props.onChange - Change handler function
 * @param {string} [props.error] - Error message (shows error state)
 * @param {string} [props.success] - Success message (shows success state)
 * @param {string} [props.warning] - Warning message (shows warning state)
 * @param {string} [props.helperText] - Helper text below input
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.readOnly] - Read-only state
 * @param {boolean} [props.required] - Required field indicator
 * @param {React.ReactNode} [props.prefixIcon] - Icon to display at the start
 * @param {React.ReactNode} [props.suffixIcon] - Icon to display at the end
 * @param {number} [props.maxLength] - Maximum character length
 * @param {string} [props.autoComplete] - Autocomplete attribute
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Input ID for accessibility
 * @param {string} [props.name] - Input name attribute
 * @param {string} [props.ariaLabel] - ARIA label for accessibility
 * @param {string} [props.ariaDescribedBy] - ARIA described-by for accessibility
 */
const Input = forwardRef(({ 
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  warning,
  helperText,
  disabled = false,
  readOnly = false,
  required = false,
  prefixIcon,
  suffixIcon,
  maxLength,
  autoComplete,
  className = '',
  id,
  name,
  ariaLabel,
  ariaDescribedBy,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Generate unique IDs for accessibility
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  
  // Determine validation state
  const validationState = error ? 'error' : success ? 'success' : warning ? 'warning' : null;
  const validationMessage = error || success || warning;
  
  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Determine actual input type (handle password visibility)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Handle change event
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };
  
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
    <div className={`${styles.inputGroup} ${className}`} dir="auto">
      {label && (
        <label 
          htmlFor={inputId}
          className={styles.label}
        >
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}
      
      <div 
        className={`
          ${styles.inputWrapper} 
          ${validationState ? styles[validationState] : ''} 
          ${prefixIcon ? styles.hasPrefix : ''} 
          ${suffixIcon || type === 'password' ? styles.hasSuffix : ''}
          ${disabled ? styles.disabled : ''}
          ${readOnly ? styles.readOnly : ''}
        `}
      >
        {prefixIcon && (
          <span className={styles.prefixIcon} aria-hidden="true">
            {prefixIcon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={styles.input}
          {...ariaAttributes}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.suffixIcon}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        
        {suffixIcon && type !== 'password' && (
          <span className={styles.suffixIcon} aria-hidden="true">
            {suffixIcon}
          </span>
        )}
      </div>
      
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
  );
});

Input.displayName = 'Input';

export default Input;

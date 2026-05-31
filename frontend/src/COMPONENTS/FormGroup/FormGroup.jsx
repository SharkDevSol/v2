import React from 'react';
import styles from './FormGroup.module.css';

/**
 * FormGroup component - Wrapper for form fields with label, error, and help text
 * Provides consistent layout and styling for form elements
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Label text for the form field
 * @param {React.ReactNode} props.children - Form field element(s) to wrap
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.helperText] - Helper text to display below the field
 * @param {boolean} [props.required] - Whether the field is required (adds asterisk to label)
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - ID for the form group (used for aria-describedby)
 * @param {boolean} [props.inline] - Display label and field inline (horizontal layout)
 * @param {string} [props.labelWidth] - Width of label in inline mode (e.g., '150px', '30%')
 * @param {React.ReactNode} [props.labelIcon] - Optional icon to display next to label
 * @param {string} [props.htmlFor] - ID of the input element this label is for
 */
const FormGroup = ({ 
  label,
  children,
  error,
  helperText,
  required = false,
  className = '',
  id,
  inline = false,
  labelWidth,
  labelIcon,
  htmlFor,
  ...props 
}) => {
  // Generate unique IDs for accessibility
  const groupId = id || `form-group-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = `${groupId}-helper`;
  const errorId = `${groupId}-error`;
  
  // Build class names
  const groupClasses = [
    styles.formGroup,
    inline && styles.inline,
    error && styles.hasError,
    className
  ].filter(Boolean).join(' ');

  // Build label style for inline mode
  const labelStyle = inline && labelWidth ? { width: labelWidth, minWidth: labelWidth } : undefined;

  return (
    <div 
      className={groupClasses} 
      id={groupId}
      dir="auto"
      {...props}
    >
      {label && (
        <label 
          className={styles.label}
          htmlFor={htmlFor}
          style={labelStyle}
        >
          {labelIcon && (
            <span className={styles.labelIcon} aria-hidden="true">
              {labelIcon}
            </span>
          )}
          <span className={styles.labelText}>
            {label}
            {required && (
              <span className={styles.required} aria-label="required">*</span>
            )}
          </span>
        </label>
      )}
      
      <div className={styles.fieldWrapper}>
        {/* Clone children and add aria-describedby if needed */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            const ariaDescribedBy = [
              child.props['aria-describedby'],
              error ? errorId : null,
              helperText ? helperTextId : null
            ].filter(Boolean).join(' ') || undefined;

            return React.cloneElement(child, {
              'aria-describedby': ariaDescribedBy,
              'aria-invalid': error ? 'true' : child.props['aria-invalid'],
              'aria-required': required ? 'true' : child.props['aria-required']
            });
          }
          return child;
        })}
        
        {/* Error message */}
        {error && (
          <span 
            id={errorId}
            className={`${styles.message} ${styles.errorMessage}`}
            role="alert"
            aria-live="polite"
          >
            {error}
          </span>
        )}
        
        {/* Helper text (only show if no error) */}
        {!error && helperText && (
          <span 
            id={helperTextId}
            className={`${styles.message} ${styles.helperMessage}`}
          >
            {helperText}
          </span>
        )}
      </div>
    </div>
  );
};

FormGroup.displayName = 'FormGroup';

export default FormGroup;

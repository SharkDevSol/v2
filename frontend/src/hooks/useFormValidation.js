/**
 * React Hook for Form Validation
 * Provides real-time validation with state management
 */
import { useState } from 'react';
import { validateField, validateForm, hasErrors } from '../utils/validation';

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} - Form state and handlers
 */
export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (event) => {
    const value = event.target ? event.target.value : event;
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate on change if field was touched
    if (touched[field] && validationSchema[field]) {
      const error = validateField(value, validationSchema[field]);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    if (validationSchema[field]) {
      const error = validateField(values[field], validationSchema[field]);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateAll = () => {
    const newErrors = validateForm(values, validationSchema);
    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
    setErrors
  };
};

export default useFormValidation;

/**
 * Client-Side Validation Utility
 * Provides comprehensive validation functions for all form inputs
 */

/**
 * Validation Rules
 */
export const ValidationRules = {
  // Required field validation
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  // Email validation
  email: (value) => {
    if (!value) return true; // Allow empty if not required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Phone number validation (Ethiopian format)
  phone: (value) => {
    if (!value) return true;
    // Ethiopian phone: +251 or 0 followed by 9 digits
    const phoneRegex = /^(\+251|0)?[97]\d{8}$/;
    return phoneRegex.test(value.replace(/[\s-]/g, ''));
  },

  // Minimum length validation
  minLength: (min) => (value) => {
    if (!value) return true;
    return value.toString().length >= min;
  },

  // Maximum length validation
  maxLength: (max) => (value) => {
    if (!value) return true;
    return value.toString().length <= max;
  },

  // Numeric validation
  numeric: (value) => {
    if (!value) return true;
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // Integer validation
  integer: (value) => {
    if (!value) return true;
    return Number.isInteger(Number(value));
  },

  // Positive number validation
  positive: (value) => {
    if (!value) return true;
    return parseFloat(value) > 0;
  },

  // Non-negative number validation
  nonNegative: (value) => {
    if (!value) return true;
    return parseFloat(value) >= 0;
  },

  // Range validation
  range: (min, max) => (value) => {
    if (!value) return true;
    const num = parseFloat(value);
    return num >= min && num <= max;
  },

  // URL validation
  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // Date validation
  date: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  // Future date validation
  futureDate: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date > new Date();
  },

  // Past date validation
  pastDate: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date < new Date();
  },

  // Password strength validation
  password: (value) => {
    if (!value) return true;
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(value);
  },

  // Username validation (alphanumeric and underscore)
  username: (value) => {
    if (!value) return true;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(value);
  },

  // Alphanumeric validation
  alphanumeric: (value) => {
    if (!value) return true;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(value);
  },

  // Alpha only validation
  alpha: (value) => {
    if (!value) return true;
    const alphaRegex = /^[a-zA-Z\s]+$/;
    return alphaRegex.test(value);
  },

  // Match validation (for password confirmation)
  match: (compareValue) => (value) => {
    return value === compareValue;
  },

  // File size validation (in MB)
  fileSize: (maxSizeMB) => (file) => {
    if (!file) return true;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // File type validation
  fileType: (allowedTypes) => (file) => {
    if (!file) return true;
    return allowedTypes.includes(file.type);
  },

  // Branch code validation (first letter + last 2 chars)
  branchCode: (value) => {
    if (!value) return true;
    const branchCodeRegex = /^[a-zA-Z][a-zA-Z0-9]{2}$/;
    return branchCodeRegex.test(value);
  },

  // Ethiopian calendar date validation
  ethiopianDate: (value) => {
    if (!value) return true;
    // Basic validation for Ethiopian date format
    const parts = value.split('/');
    if (parts.length !== 3) return false;
    const [month, day, year] = parts.map(Number);
    return month >= 1 && month <= 13 && day >= 1 && day <= 30 && year > 0;
  },

  // Grade validation (0-100)
  grade: (value) => {
    if (!value) return true;
    const num = parseFloat(value);
    return num >= 0 && num <= 100;
  },

  // Percentage validation (0-100)
  percentage: (value) => {
    if (!value) return true;
    const num = parseFloat(value);
    return num >= 0 && num <= 100;
  },

  // Custom regex validation
  regex: (pattern) => (value) => {
    if (!value) return true;
    return pattern.test(value);
  }
};

/**
 * Error Messages
 */
export const ErrorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid Ethiopian phone number',
  minLength: (min) => `Minimum length is ${min} characters`,
  maxLength: (max) => `Maximum length is ${max} characters`,
  numeric: 'Please enter a valid number',
  integer: 'Please enter a whole number',
  positive: 'Please enter a positive number',
  nonNegative: 'Please enter a non-negative number',
  range: (min, max) => `Value must be between ${min} and ${max}`,
  url: 'Please enter a valid URL',
  date: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  username: 'Username must be 3-20 characters (letters, numbers, underscore only)',
  alphanumeric: 'Only letters and numbers are allowed',
  alpha: 'Only letters are allowed',
  match: 'Values do not match',
  fileSize: (maxSizeMB) => `File size must not exceed ${maxSizeMB}MB`,
  fileType: (types) => `Allowed file types: ${types.join(', ')}`,
  branchCode: 'Invalid branch code format',
  ethiopianDate: 'Invalid Ethiopian date format',
  grade: 'Grade must be between 0 and 100',
  percentage: 'Percentage must be between 0 and 100'
};

/**
 * Validate a single field
 * @param {*} value - Field value
 * @param {Array} rules - Array of validation rules
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (value, rules) => {
  for (const rule of rules) {
    if (typeof rule === 'function') {
      if (!rule(value)) {
        return 'Invalid value';
      }
    } else if (typeof rule === 'object') {
      const { validator, message } = rule;
      if (!validator(value)) {
        return message;
      }
    }
  }
  return null;
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} - Object with field errors
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(validationSchema)) {
    const value = formData[field];
    const error = validateField(value, rules);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
};

/**
 * Check if form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  login: {
    branchCode: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.branchCode, message: ErrorMessages.branchCode }
    ],
    username: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(3), message: ErrorMessages.minLength(3) }
    ],
    password: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(6), message: ErrorMessages.minLength(6) }
    ]
  },

  student: {
    name: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(2), message: ErrorMessages.minLength(2) }
    ],
    email: [
      { validator: ValidationRules.email, message: ErrorMessages.email }
    ],
    phone: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.phone, message: ErrorMessages.phone }
    ],
    dateOfBirth: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.pastDate, message: ErrorMessages.pastDate }
    ]
  },

  staff: {
    name: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(2), message: ErrorMessages.minLength(2) }
    ],
    email: [
      { validator: ValidationRules.email, message: ErrorMessages.email }
    ],
    phone: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.phone, message: ErrorMessages.phone }
    ],
    staffType: [
      { validator: ValidationRules.required, message: ErrorMessages.required }
    ]
  },

  payment: {
    amount: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.positive, message: ErrorMessages.positive }
    ],
    paymentMethod: [
      { validator: ValidationRules.required, message: ErrorMessages.required }
    ],
    reference: [
      { validator: ValidationRules.minLength(3), message: ErrorMessages.minLength(3) }
    ]
  },

  exam: {
    title: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(3), message: ErrorMessages.minLength(3) }
    ],
    subject: [
      { validator: ValidationRules.required, message: ErrorMessages.required }
    ],
    class: [
      { validator: ValidationRules.required, message: ErrorMessages.required }
    ],
    totalMarks: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.positive, message: ErrorMessages.positive }
    ]
  },

  marks: {
    marks: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.grade, message: ErrorMessages.grade }
    ]
  },

  post: {
    title: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(3), message: ErrorMessages.minLength(3) }
    ],
    content: [
      { validator: ValidationRules.required, message: ErrorMessages.required },
      { validator: ValidationRules.minLength(10), message: ErrorMessages.minLength(10) }
    ]
  }
};

export default {
  ValidationRules,
  ErrorMessages,
  validateField,
  validateForm,
  hasErrors,
  sanitizeInput,
  CommonSchemas
};

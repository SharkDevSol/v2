# Client-Side Validation Guide

This guide explains how to implement client-side validation for all forms in the Skoolific V2 application.

## Table of Contents
1. [Overview](#overview)
2. [Validation Utility](#validation-utility)
3. [Validated Components](#validated-components)
4. [Implementation Examples](#implementation-examples)
5. [Common Validation Schemas](#common-validation-schemas)
6. [Best Practices](#best-practices)

## Overview

The validation system provides:
- **Comprehensive validation rules** for all common input types
- **Reusable validated components** with built-in error display
- **Real-time validation** with user-friendly error messages
- **Accessibility support** with ARIA attributes
- **XSS protection** through input sanitization

## Validation Utility

### Location
`APP/src/utils/validation.js`

### Available Validation Rules

```javascript
import { ValidationRules, ErrorMessages } from '../utils/validation';

// Required field
ValidationRules.required(value)

// Email validation
ValidationRules.email(value)

// Phone number (Ethiopian format)
ValidationRules.phone(value)

// Length validation
ValidationRules.minLength(min)(value)
ValidationRules.maxLength(max)(value)

// Numeric validation
ValidationRules.numeric(value)
ValidationRules.integer(value)
ValidationRules.positive(value)
ValidationRules.nonNegative(value)
ValidationRules.range(min, max)(value)

// Date validation
ValidationRules.date(value)
ValidationRules.futureDate(value)
ValidationRules.pastDate(value)

// Password & Username
ValidationRules.password(value)  // 8+ chars, uppercase, lowercase, number
ValidationRules.username(value)  // 3-20 chars, alphanumeric + underscore

// Text validation
ValidationRules.alphanumeric(value)
ValidationRules.alpha(value)

// Custom validation
ValidationRules.regex(pattern)(value)
ValidationRules.match(compareValue)(value)

// File validation
ValidationRules.fileSize(maxSizeMB)(file)
ValidationRules.fileType(allowedTypes)(file)

// Domain-specific
ValidationRules.branchCode(value)
ValidationRules.ethiopianDate(value)
ValidationRules.grade(value)  // 0-100
ValidationRules.percentage(value)  // 0-100
```

## Validated Components

### Location
`APP/src/COMPONENTS/ValidatedInput/`

### Available Components

#### 1. ValidatedInput
```javascript
import { ValidatedInput } from '../COMPONENTS/ValidatedInput';

<ValidatedInput
  label="Username"
  name="username"
  type="text"
  value={values.username}
  onChange={handleChange('username')}
  onBlur={handleBlur('username')}
  error={errors.username}
  touched={touched.username}
  required={true}
  placeholder="Enter username"
  icon={<FiUser />}
  helpText="3-20 characters, letters, numbers, underscore only"
/>
```

#### 2. ValidatedTextarea
```javascript
import { ValidatedTextarea } from '../COMPONENTS/ValidatedInput';

<ValidatedTextarea
  label="Description"
  name="description"
  value={values.description}
  onChange={handleChange('description')}
  onBlur={handleBlur('description')}
  error={errors.description}
  touched={touched.description}
  required={true}
  rows={4}
  maxLength={500}
  helpText="Provide a detailed description"
/>
```

#### 3. ValidatedSelect
```javascript
import { ValidatedSelect } from '../COMPONENTS/ValidatedInput';

<ValidatedSelect
  label="Class"
  name="class"
  value={values.class}
  onChange={handleChange('class')}
  onBlur={handleBlur('class')}
  error={errors.class}
  touched={touched.class}
  required={true}
  options={[
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' }
  ]}
  placeholder="Select a class"
/>
```

## Implementation Examples

### Example 1: Simple Form with Manual Validation

```javascript
import React, { useState } from 'react';
import { ValidationRules, ErrorMessages } from '../utils/validation';
import { ValidatedInput } from '../COMPONENTS/ValidatedInput';

const LoginForm = () => {
  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    let error = '';
    const value = values[field];
    
    if (!ValidationRules.required(value)) {
      error = ErrorMessages.required;
    } else if (field === 'username' && !ValidationRules.minLength(3)(value)) {
      error = ErrorMessages.minLength(3);
    } else if (field === 'password' && !ValidationRules.minLength(6)(value)) {
      error = ErrorMessages.minLength(6);
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all as touched
    setTouched({ username: true, password: true });
    
    // Validate all fields
    const newErrors = {};
    
    if (!ValidationRules.required(values.username)) {
      newErrors.username = ErrorMessages.required;
    } else if (!ValidationRules.minLength(3)(values.username)) {
      newErrors.username = ErrorMessages.minLength(3);
    }
    
    if (!ValidationRules.required(values.password)) {
      newErrors.password = ErrorMessages.required;
    } else if (!ValidationRules.minLength(6)(values.password)) {
      newErrors.password = ErrorMessages.minLength(6);
    }
    
    setErrors(newErrors);
    
    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      // Submit form
      console.log('Form submitted:', values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        label="Username"
        name="username"
        value={values.username}
        onChange={handleChange('username')}
        onBlur={handleBlur('username')}
        error={errors.username}
        touched={touched.username}
        required
      />
      
      <ValidatedInput
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        error={errors.password}
        touched={touched.password}
        required
      />
      
      <button type="submit">Login</button>
    </form>
  );
};
```

### Example 2: Using the useFormValidation Hook

```javascript
import React from 'react';
import { useFormValidation, ValidationRules, ErrorMessages, CommonSchemas } from '../utils/validation';
import { ValidatedInput } from '../COMPONENTS/ValidatedInput';

const StudentForm = () => {
  const validationSchema = {
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
    ]
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset
  } = useFormValidation(
    { name: '', email: '', phone: '' },
    validationSchema
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateAll()) {
      // Form is valid, submit
      console.log('Form submitted:', values);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        label="Student Name"
        name="name"
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={errors.name}
        touched={touched.name}
        required
      />
      
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={errors.email}
        touched={touched.email}
      />
      
      <ValidatedInput
        label="Phone Number"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={handleChange('phone')}
        onBlur={handleBlur('phone')}
        error={errors.phone}
        touched={touched.phone}
        required
        helpText="Ethiopian phone format: +251 or 0 followed by 9 digits"
      />
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Example 3: Using Common Schemas

```javascript
import { CommonSchemas, validateForm, hasErrors } from '../utils/validation';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    reference: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate using common schema
    const errors = validateForm(formData, CommonSchemas.payment);
    
    if (!hasErrors(errors)) {
      // Submit form
      console.log('Payment submitted:', formData);
    } else {
      console.log('Validation errors:', errors);
    }
  };

  // ... rest of component
};
```

## Common Validation Schemas

Pre-defined schemas are available in `CommonSchemas`:

- `CommonSchemas.login` - Branch code, username, password
- `CommonSchemas.student` - Name, email, phone, date of birth
- `CommonSchemas.staff` - Name, email, phone, staff type
- `CommonSchemas.payment` - Amount, payment method, reference
- `CommonSchemas.exam` - Title, subject, class, total marks
- `CommonSchemas.marks` - Marks (0-100)
- `CommonSchemas.post` - Title, content

## Best Practices

### 1. Always Validate on Submit
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Mark all fields as touched
  setTouched({ field1: true, field2: true });
  
  // Validate all fields
  const errors = validateForm(values, schema);
  
  if (!hasErrors(errors)) {
    // Submit
  }
};
```

### 2. Provide Real-Time Feedback
```javascript
// Validate on blur for better UX
const handleBlur = (field) => () => {
  setTouched(prev => ({ ...prev, [field]: true }));
  validateField(values[field], schema[field]);
};
```

### 3. Clear Errors on Change
```javascript
const handleChange = (field) => (e) => {
  setValues(prev => ({ ...prev, [field]: e.target.value }));
  
  // Clear error when user starts typing
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

### 4. Use Appropriate Input Types
```javascript
// Use type="email" for email fields
<ValidatedInput type="email" ... />

// Use type="tel" for phone fields
<ValidatedInput type="tel" ... />

// Use type="number" for numeric fields
<ValidatedInput type="number" ... />
```

### 5. Sanitize User Input
```javascript
import { sanitizeInput } from '../utils/validation';

const handleSubmit = (values) => {
  const sanitizedValues = {
    ...values,
    name: sanitizeInput(values.name),
    description: sanitizeInput(values.description)
  };
  
  // Submit sanitized values
};
```

### 6. Provide Helpful Error Messages
```javascript
// Custom error messages
const schema = {
  age: [
    { 
      validator: ValidationRules.range(5, 18), 
      message: 'Student age must be between 5 and 18 years' 
    }
  ]
};
```

### 7. Use Help Text for Guidance
```javascript
<ValidatedInput
  label="Phone Number"
  name="phone"
  helpText="Format: +251912345678 or 0912345678"
  ...
/>
```

### 8. Disable Submit While Loading
```javascript
<button 
  type="submit" 
  disabled={isLoading || hasErrors(errors)}
>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>
```

## Forms That Need Validation

The following forms should be updated with client-side validation:

### Authentication
- [x] Login form (Admin, Staff, Student, Guardian)
- [ ] Password change form
- [ ] Username change form

### Student Management
- [ ] Student registration form
- [ ] Student edit form
- [ ] Student search/filter form

### Staff Management
- [ ] Staff registration form
- [ ] Staff edit form
- [ ] Staff assignment form

### Finance
- [ ] Payment form
- [ ] Fee structure form
- [ ] Expense form
- [ ] Budget form

### Academic
- [ ] Mark entry form
- [ ] Exam creation form
- [ ] Assignment creation form
- [ ] Evaluation form

### Communication
- [ ] Post creation form
- [ ] Message form
- [ ] Report form

### Settings
- [ ] School configuration form
- [ ] Branch configuration form
- [ ] User preferences form

## Testing Validation

### Manual Testing Checklist
- [ ] Required fields show error when empty
- [ ] Email validation works correctly
- [ ] Phone validation accepts Ethiopian format
- [ ] Numeric fields only accept numbers
- [ ] Min/max length validation works
- [ ] Error messages are clear and helpful
- [ ] Errors clear when user starts typing
- [ ] Form cannot be submitted with errors
- [ ] Accessibility: Screen readers announce errors
- [ ] Keyboard navigation works properly

### Automated Testing Example
```javascript
import { ValidationRules } from '../utils/validation';

describe('Validation Rules', () => {
  test('required validation', () => {
    expect(ValidationRules.required('')).toBe(false);
    expect(ValidationRules.required('value')).toBe(true);
  });

  test('email validation', () => {
    expect(ValidationRules.email('invalid')).toBe(false);
    expect(ValidationRules.email('test@example.com')).toBe(true);
  });

  test('phone validation (Ethiopian)', () => {
    expect(ValidationRules.phone('0912345678')).toBe(true);
    expect(ValidationRules.phone('+251912345678')).toBe(true);
    expect(ValidationRules.phone('123')).toBe(false);
  });
});
```

## Support

For questions or issues with validation:
1. Check this guide first
2. Review the validation utility source code
3. Check existing form implementations for examples
4. Contact the development team

---

**Last Updated:** 2025-01-08
**Version:** 1.0.0

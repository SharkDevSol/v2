/**
 * Validation Utility Tests
 */
import { describe, it, expect } from 'vitest';
import {
  ValidationRules,
  ErrorMessages,
  validateField,
  validateForm,
  hasErrors,
  sanitizeInput
} from '../validation';

describe('ValidationRules', () => {
  describe('required', () => {
    it('should return false for empty string', () => {
      expect(ValidationRules.required('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(ValidationRules.required('   ')).toBe(false);
    });

    it('should return false for null', () => {
      expect(ValidationRules.required(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(ValidationRules.required(undefined)).toBe(false);
    });

    it('should return true for non-empty string', () => {
      expect(ValidationRules.required('value')).toBe(true);
    });

    it('should return true for number', () => {
      expect(ValidationRules.required(0)).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(ValidationRules.required([])).toBe(false);
    });

    it('should return true for non-empty array', () => {
      expect(ValidationRules.required([1, 2])).toBe(true);
    });
  });

  describe('email', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.email('')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(ValidationRules.email('invalid')).toBe(false);
      expect(ValidationRules.email('test@')).toBe(false);
      expect(ValidationRules.email('@example.com')).toBe(false);
    });

    it('should return true for valid email', () => {
      expect(ValidationRules.email('test@example.com')).toBe(true);
      expect(ValidationRules.email('user.name@domain.co.uk')).toBe(true);
    });
  });

  describe('phone', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.phone('')).toBe(true);
    });

    it('should return true for valid Ethiopian phone', () => {
      expect(ValidationRules.phone('0912345678')).toBe(true);
      expect(ValidationRules.phone('0712345678')).toBe(true);
      expect(ValidationRules.phone('+251912345678')).toBe(true);
    });

    it('should return true for phone with spaces/dashes', () => {
      expect(ValidationRules.phone('091-234-5678')).toBe(true);
      expect(ValidationRules.phone('091 234 5678')).toBe(true);
    });

    it('should return false for invalid phone', () => {
      expect(ValidationRules.phone('123')).toBe(false);
      expect(ValidationRules.phone('0812345678')).toBe(false); // Wrong prefix
    });
  });

  describe('minLength', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.minLength(5)('')).toBe(true);
    });

    it('should return false for short string', () => {
      expect(ValidationRules.minLength(5)('abc')).toBe(false);
    });

    it('should return true for string meeting minimum', () => {
      expect(ValidationRules.minLength(5)('abcde')).toBe(true);
      expect(ValidationRules.minLength(5)('abcdef')).toBe(true);
    });
  });

  describe('maxLength', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.maxLength(5)('')).toBe(true);
    });

    it('should return true for string within limit', () => {
      expect(ValidationRules.maxLength(5)('abc')).toBe(true);
      expect(ValidationRules.maxLength(5)('abcde')).toBe(true);
    });

    it('should return false for string exceeding limit', () => {
      expect(ValidationRules.maxLength(5)('abcdef')).toBe(false);
    });
  });

  describe('numeric', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.numeric('')).toBe(true);
    });

    it('should return true for valid numbers', () => {
      expect(ValidationRules.numeric('123')).toBe(true);
      expect(ValidationRules.numeric('123.45')).toBe(true);
      expect(ValidationRules.numeric('-123')).toBe(true);
    });

    it('should return false for non-numeric', () => {
      expect(ValidationRules.numeric('abc')).toBe(false);
      expect(ValidationRules.numeric('12abc')).toBe(false);
    });
  });

  describe('integer', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.integer('')).toBe(true);
    });

    it('should return true for integers', () => {
      expect(ValidationRules.integer('123')).toBe(true);
      expect(ValidationRules.integer('-123')).toBe(true);
    });

    it('should return false for decimals', () => {
      expect(ValidationRules.integer('123.45')).toBe(false);
    });
  });

  describe('positive', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.positive('')).toBe(true);
    });

    it('should return true for positive numbers', () => {
      expect(ValidationRules.positive('123')).toBe(true);
      expect(ValidationRules.positive('0.1')).toBe(true);
    });

    it('should return false for zero and negative', () => {
      expect(ValidationRules.positive('0')).toBe(false);
      expect(ValidationRules.positive('-123')).toBe(false);
    });
  });

  describe('nonNegative', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.nonNegative('')).toBe(true);
    });

    it('should return true for zero and positive', () => {
      expect(ValidationRules.nonNegative('0')).toBe(true);
      expect(ValidationRules.nonNegative('123')).toBe(true);
    });

    it('should return false for negative', () => {
      expect(ValidationRules.nonNegative('-123')).toBe(false);
    });
  });

  describe('range', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.range(0, 100)('')).toBe(true);
    });

    it('should return true for value in range', () => {
      expect(ValidationRules.range(0, 100)('50')).toBe(true);
      expect(ValidationRules.range(0, 100)('0')).toBe(true);
      expect(ValidationRules.range(0, 100)('100')).toBe(true);
    });

    it('should return false for value out of range', () => {
      expect(ValidationRules.range(0, 100)('-1')).toBe(false);
      expect(ValidationRules.range(0, 100)('101')).toBe(false);
    });
  });

  describe('password', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.password('')).toBe(true);
    });

    it('should return true for strong password', () => {
      expect(ValidationRules.password('Password123')).toBe(true);
      expect(ValidationRules.password('MyP@ssw0rd')).toBe(true);
    });

    it('should return false for weak password', () => {
      expect(ValidationRules.password('password')).toBe(false); // No uppercase, no number
      expect(ValidationRules.password('PASSWORD')).toBe(false); // No lowercase, no number
      expect(ValidationRules.password('Pass123')).toBe(false); // Too short
    });
  });

  describe('username', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.username('')).toBe(true);
    });

    it('should return true for valid username', () => {
      expect(ValidationRules.username('user123')).toBe(true);
      expect(ValidationRules.username('user_name')).toBe(true);
      expect(ValidationRules.username('User123')).toBe(true);
    });

    it('should return false for invalid username', () => {
      expect(ValidationRules.username('ab')).toBe(false); // Too short
      expect(ValidationRules.username('user-name')).toBe(false); // Contains dash
      expect(ValidationRules.username('user name')).toBe(false); // Contains space
    });
  });

  describe('grade', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.grade('')).toBe(true);
    });

    it('should return true for valid grade', () => {
      expect(ValidationRules.grade('0')).toBe(true);
      expect(ValidationRules.grade('50')).toBe(true);
      expect(ValidationRules.grade('100')).toBe(true);
    });

    it('should return false for invalid grade', () => {
      expect(ValidationRules.grade('-1')).toBe(false);
      expect(ValidationRules.grade('101')).toBe(false);
    });
  });

  describe('branchCode', () => {
    it('should return true for empty value', () => {
      expect(ValidationRules.branchCode('')).toBe(true);
    });

    it('should return true for valid branch code', () => {
      expect(ValidationRules.branchCode('ib3')).toBe(true);
      expect(ValidationRules.branchCode('A12')).toBe(true);
    });

    it('should return false for invalid branch code', () => {
      expect(ValidationRules.branchCode('ab')).toBe(false); // Too short
      expect(ValidationRules.branchCode('abcd')).toBe(false); // Too long
      expect(ValidationRules.branchCode('1bc')).toBe(false); // Starts with number
    });
  });
});

describe('validateField', () => {
  it('should return null for valid field', () => {
    const rules = [
      { validator: ValidationRules.required, message: 'Required' },
      { validator: ValidationRules.minLength(3), message: 'Min 3 chars' }
    ];
    expect(validateField('test', rules)).toBeNull();
  });

  it('should return error message for invalid field', () => {
    const rules = [
      { validator: ValidationRules.required, message: 'Required' }
    ];
    expect(validateField('', rules)).toBe('Required');
  });
});

describe('validateForm', () => {
  it('should return empty object for valid form', () => {
    const formData = {
      username: 'testuser',
      email: 'test@example.com'
    };
    const schema = {
      username: [
        { validator: ValidationRules.required, message: 'Required' }
      ],
      email: [
        { validator: ValidationRules.email, message: 'Invalid email' }
      ]
    };
    const errors = validateForm(formData, schema);
    expect(errors).toEqual({});
  });

  it('should return errors for invalid form', () => {
    const formData = {
      username: '',
      email: 'invalid'
    };
    const schema = {
      username: [
        { validator: ValidationRules.required, message: 'Required' }
      ],
      email: [
        { validator: ValidationRules.email, message: 'Invalid email' }
      ]
    };
    const errors = validateForm(formData, schema);
    expect(errors.username).toBe('Required');
    expect(errors.email).toBe('Invalid email');
  });
});

describe('hasErrors', () => {
  it('should return false for empty errors object', () => {
    expect(hasErrors({})).toBe(false);
  });

  it('should return true for non-empty errors object', () => {
    expect(hasErrors({ username: 'Required' })).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('should return non-string values unchanged', () => {
    expect(sanitizeInput(123)).toBe(123);
    expect(sanitizeInput(null)).toBe(null);
  });

  it('should escape HTML characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  });

  it('should escape special characters', () => {
    expect(sanitizeInput('Test & "quotes" <tag>')).toBe(
      'Test &amp; &quot;quotes&quot; &lt;tag&gt;'
    );
  });
});

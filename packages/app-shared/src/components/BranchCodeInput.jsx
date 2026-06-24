import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGitBranch, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import styles from './BranchCodeInput.module.css';

/**
 * BranchCodeInput Component
 * 
 * Reusable component for branch code input with validation
 * Used across all login pages (Admin, Staff, Student, Guardian)
 * 
 * Props:
 * - value: Current branch code value
 * - onChange: Callback when branch code changes
 * - onValidate: Callback when validation completes (receives { valid, branchCode, databaseName })
 * - disabled: Whether input is disabled
 * - autoValidate: Whether to validate on blur (default: true)
 * - showClearButton: Whether to show clear button (default: true)
 */
const BranchCodeInput = ({ 
  value, 
  onChange, 
  onValidate, 
  disabled = false,
  autoValidate = true,
  showClearButton = true
}) => {
  const [validationStatus, setValidationStatus] = useState(null); // null, 'validating', 'valid', 'invalid'
  const [validationMessage, setValidationMessage] = useState('');
  const [databaseName, setDatabaseName] = useState('');

  // Reset validation when value changes
  useEffect(() => {
    if (value.length === 0) {
      setValidationStatus(null);
      setValidationMessage('');
      setDatabaseName('');
    }
  }, [value]);

  // Validate branch code format (3 uppercase letters)
  const isValidFormat = (code) => {
    return /^[A-Z]{3}$/.test(code);
  };

  // Validate branch code with backend
  const validateBranchCode = async (code) => {
    if (!code || code.length === 0) {
      setValidationStatus(null);
      setValidationMessage('');
      return;
    }

    // Check format first
    if (!isValidFormat(code)) {
      setValidationStatus('invalid');
      setValidationMessage('Branch code must be 3 uppercase letters (e.g., MAI, AMA, SOL)');
      if (onValidate) {
        onValidate({ valid: false, branchCode: code, error: 'Invalid format' });
      }
      return;
    }

    setValidationStatus('validating');
    setValidationMessage('Validating branch code...');

    try {
      const response = await fetch('/api/v2/branches/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchCode: code }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setValidationStatus('valid');
        setValidationMessage(`✓ Valid branch: ${data.databaseName}`);
        setDatabaseName(data.databaseName);
        if (onValidate) {
          onValidate({ 
            valid: true, 
            branchCode: code, 
            databaseName: data.databaseName 
          });
        }
      } else {
        setValidationStatus('invalid');
        setValidationMessage(data.message || 'Branch code not found');
        if (onValidate) {
          onValidate({ 
            valid: false, 
            branchCode: code, 
            error: data.message 
          });
        }
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessage('Failed to validate branch code. Please try again.');
      if (onValidate) {
        onValidate({ 
          valid: false, 
          branchCode: code, 
          error: 'Network error' 
        });
      }
    }
  };

  // Handle input change
  const handleChange = (e) => {
    let newValue = e.target.value.toUpperCase().trim();
    
    // Limit to 3 characters
    if (newValue.length > 3) {
      newValue = newValue.slice(0, 3);
    }

    onChange(newValue);
  };

  // Handle blur (validate if autoValidate is true)
  const handleBlur = () => {
    if (autoValidate && value.length > 0) {
      validateBranchCode(value);
    }
  };

  // Handle manual validation (Enter key)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateBranchCode(value);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    onChange('');
    setValidationStatus(null);
    setValidationMessage('');
    setDatabaseName('');
    localStorage.removeItem('branchCode');
    if (onValidate) {
      onValidate({ valid: false, branchCode: '', cleared: true });
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <FiLoader className={styles.iconSpinner} />;
      case 'valid':
        return <FiCheck className={styles.iconValid} />;
      case 'invalid':
        return <FiX className={styles.iconInvalid} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.inputGroup}>
      <label htmlFor="branchCode" className={styles.label}>
        <FiGitBranch style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Branch Code
        <span className={styles.required}>*</span>
      </label>
      
      <div className={styles.inputWrapper}>
        <input
          type="text"
          id="branchCode"
          name="branchCode"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          className={`${styles.input} ${
            validationStatus === 'valid' ? styles.inputValid : 
            validationStatus === 'invalid' ? styles.inputInvalid : ''
          }`}
          placeholder="e.g., MAI, AMA, SOL"
          disabled={disabled}
          maxLength={3}
          autoComplete="off"
          spellCheck="false"
        />
        
        {validationStatus && (
          <div className={styles.statusIcon}>
            {getStatusIcon()}
          </div>
        )}
      </div>
      
      {validationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${styles.validationMessage} ${
            validationStatus === 'valid' ? styles.messageValid : 
            validationStatus === 'invalid' ? styles.messageInvalid : 
            styles.messageInfo
          }`}
        >
          {validationMessage}
        </motion.div>
      )}
      
      <div className={styles.hint}>
        Enter your 3-letter branch code (e.g., MAI for Main Branch)
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            disabled={disabled}
          >
            Clear saved branch code
          </button>
        )}
      </div>
    </div>
  );
};

export default BranchCodeInput;

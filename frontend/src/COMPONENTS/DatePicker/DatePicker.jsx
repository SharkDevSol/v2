import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import Calendar from './Calendar';
import styles from './DatePicker.module.css';
import { gregorianToEthiopian, ethiopianToGregorian } from '../../utils/ethiopianCalendar';

/**
 * DatePicker component with Ethiopian calendar support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Input label text
 * @param {Date|null} props.value - Selected date value (Gregorian Date object)
 * @param {function} props.onChange - Change handler function (receives Date object)
 * @param {Date} [props.minDate] - Minimum selectable date
 * @param {Date} [props.maxDate] - Maximum selectable date
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {('gregorian'|'ethiopian')} [props.calendarType='gregorian'] - Calendar type
 * @param {string} [props.format] - Date format string
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.required] - Required field indicator
 * @param {string} [props.id] - Input ID for accessibility
 * @param {string} [props.name] - Input name attribute
 */
const DatePicker = forwardRef(({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error,
  calendarType = 'gregorian',
  format,
  placeholder = 'Select date',
  className = '',
  required = false,
  id,
  name,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Generate unique IDs for accessibility
  const inputId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    if (calendarType === 'ethiopian') {
      const ethDate = gregorianToEthiopian(date);
      return `${ethDate.day}/${ethDate.month}/${ethDate.year}`;
    } else {
      // Gregorian format: DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(formatDate(value));
  }, [value, calendarType]);

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle input click to open calendar
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Handle clear button
  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange(null);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.focus();
    } else if (e.key === 'Enter' && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`${styles.datePickerGroup} ${className}`} ref={containerRef} dir="auto">
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}

      <div
        className={`
          ${styles.inputWrapper}
          ${error ? styles.error : ''}
          ${disabled ? styles.disabled : ''}
          ${isOpen ? styles.focused : ''}
        `}
      >
        <div className={styles.prefixIcon} aria-hidden="true">
          <CalendarIcon size={18} />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={inputValue}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          required={required}
          className={styles.input}
          aria-label={label || 'Date picker'}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          {...props}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear date"
            tabIndex={-1}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.calendarPopup} role="dialog" aria-label="Calendar">
          <Calendar
            selectedDate={value}
            onSelectDate={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            calendarType={calendarType}
          />
        </div>
      )}

      {error && (
        <span
          id={errorId}
          className={styles.errorMessage}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </span>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

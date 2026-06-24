/**
 * useEthiopianCalendar Hook
 * 
 * React hook for Ethiopian calendar functionality in the frontend.
 * Provides easy access to Ethiopian calendar conversion and formatting.
 * 
 * @module useEthiopianCalendar
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  formatEthiopianDate,
  getEthiopianMonthName,
  getCurrentEthiopianMonth,
  getCurrentEthiopianMonthRange,
  getGregorianRangeForEthiopianMonth
} from '../utils/ethiopianCalendar';

/**
 * Custom React hook for Ethiopian calendar operations
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.locale - Language locale ('en' or 'am')
 * @param {boolean} options.autoUpdate - Whether to auto-update current date
 * @param {number} options.updateInterval - Update interval in milliseconds (default: 60000 = 1 minute)
 * @returns {Object} Ethiopian calendar utilities and state
 */
export function useEthiopianCalendar(options = {}) {
  const {
    locale = 'en',
    autoUpdate = false,
    updateInterval = 60000 // 1 minute
  } = options;

  // State for current Ethiopian date
  const [currentEthiopianDate, setCurrentEthiopianDate] = useState(() => 
    getCurrentEthiopianMonth()
  );

  // Auto-update current date if enabled
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      setCurrentEthiopianDate(getCurrentEthiopianMonth());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval]);

  // Convert Gregorian date to Ethiopian
  const toEthiopian = useCallback((gregorianDate) => {
    return gregorianToEthiopian(gregorianDate);
  }, []);

  // Convert Ethiopian date to Gregorian
  const toGregorian = useCallback((year, month, day) => {
    return ethiopianToGregorian(year, month, day);
  }, []);

  // Format Ethiopian date
  const format = useCallback((ethDate, customLocale) => {
    const monthNames = {
      en: [
        'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
        'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
      ],
      am: [
        'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
        'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
      ]
    };

    const selectedLocale = customLocale || locale;
    const months = monthNames[selectedLocale] || monthNames.en;
    return `${months[ethDate.month - 1]} ${ethDate.day}, ${ethDate.year}`;
  }, [locale]);

  // Get month name
  const getMonthName = useCallback((monthNumber, customLocale) => {
    return getEthiopianMonthName(monthNumber);
  }, []);

  // Get current Ethiopian month range
  const getCurrentMonthRange = useCallback(() => {
    return getCurrentEthiopianMonthRange();
  }, []);

  // Get Gregorian range for Ethiopian month
  const getMonthRange = useCallback((year, month) => {
    return getGregorianRangeForEthiopianMonth(year, month);
  }, []);

  // Get academic year string
  const getAcademicYear = useCallback((year) => {
    return `${year}/${year + 1}`;
  }, []);

  // Get all month names
  const monthNames = useMemo(() => {
    const names = {
      en: [
        'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
        'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
      ],
      am: [
        'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
        'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
      ]
    };
    return names[locale] || names.en;
  }, [locale]);

  // Get current date info
  const current = useMemo(() => ({
    year: currentEthiopianDate.year,
    month: currentEthiopianDate.month,
    day: currentEthiopianDate.day,
    monthName: currentEthiopianDate.monthName,
    formatted: format(currentEthiopianDate),
    academicYear: getAcademicYear(currentEthiopianDate.year)
  }), [currentEthiopianDate, format, getAcademicYear]);

  return {
    // Current date info
    current,
    currentEthiopianDate,

    // Conversion functions
    toEthiopian,
    toGregorian,

    // Formatting functions
    format,
    getMonthName,

    // Range functions
    getCurrentMonthRange,
    getMonthRange,

    // Utility functions
    getAcademicYear,

    // Constants
    monthNames,
    locale
  };
}

/**
 * Hook for Ethiopian date picker
 * Provides state management for date selection
 * 
 * @param {Object} initialDate - Initial Ethiopian date {year, month, day}
 * @returns {Object} Date picker state and handlers
 */
export function useEthiopianDatePicker(initialDate) {
  const [selectedDate, setSelectedDate] = useState(initialDate || {
    year: new Date().getFullYear() - 7,
    month: 1,
    day: 1
  });

  const { toGregorian, format } = useEthiopianCalendar();

  const setYear = useCallback((year) => {
    setSelectedDate(prev => ({ ...prev, year }));
  }, []);

  const setMonth = useCallback((month) => {
    setSelectedDate(prev => ({ ...prev, month }));
  }, []);

  const setDay = useCallback((day) => {
    setSelectedDate(prev => ({ ...prev, day }));
  }, []);

  const setDate = useCallback((year, month, day) => {
    setSelectedDate({ year, month, day });
  }, []);

  const gregorianDate = useMemo(() => {
    return toGregorian(selectedDate.year, selectedDate.month, selectedDate.day);
  }, [selectedDate, toGregorian]);

  const formattedDate = useMemo(() => {
    return format(selectedDate);
  }, [selectedDate, format]);

  return {
    selectedDate,
    setYear,
    setMonth,
    setDay,
    setDate,
    gregorianDate,
    formattedDate
  };
}

/**
 * Hook for Ethiopian month selector
 * Provides state management for month/year selection
 * 
 * @param {number} initialYear - Initial Ethiopian year
 * @param {number} initialMonth - Initial Ethiopian month
 * @returns {Object} Month selector state and handlers
 */
export function useEthiopianMonthSelector(initialYear, initialMonth) {
  const currentEth = getCurrentEthiopianMonth();
  
  const [year, setYear] = useState(initialYear || currentEth.year);
  const [month, setMonth] = useState(initialMonth || currentEth.month);

  const { getMonthRange, getMonthName, monthNames } = useEthiopianCalendar();

  const monthRange = useMemo(() => {
    return getMonthRange(year, month);
  }, [year, month, getMonthRange]);

  const monthName = useMemo(() => {
    return getMonthName(month);
  }, [month, getMonthName]);

  const nextMonth = useCallback(() => {
    if (month === 13) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  }, [month]);

  const previousMonth = useCallback(() => {
    if (month === 1) {
      setMonth(13);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }, [month]);

  const goToToday = useCallback(() => {
    const current = getCurrentEthiopianMonth();
    setYear(current.year);
    setMonth(current.month);
  }, []);

  return {
    year,
    month,
    setYear,
    setMonth,
    monthRange,
    monthName,
    monthNames,
    nextMonth,
    previousMonth,
    goToToday
  };
}

/**
 * Hook for Ethiopian academic year
 * Provides academic year information and utilities
 * 
 * @returns {Object} Academic year info and utilities
 */
export function useEthiopianAcademicYear() {
  const { current, getAcademicYear } = useEthiopianCalendar();

  const academicYear = useMemo(() => {
    return getAcademicYear(current.year);
  }, [current.year, getAcademicYear]);

  const nextAcademicYear = useMemo(() => {
    return getAcademicYear(current.year + 1);
  }, [current.year, getAcademicYear]);

  const previousAcademicYear = useMemo(() => {
    return getAcademicYear(current.year - 1);
  }, [current.year, getAcademicYear]);

  return {
    currentYear: current.year,
    academicYear,
    nextAcademicYear,
    previousAcademicYear,
    getAcademicYear
  };
}

export default useEthiopianCalendar;

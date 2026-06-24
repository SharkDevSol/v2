import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Calendar.module.css';
import { gregorianToEthiopian, ethiopianToGregorian } from '../../utils/ethiopianCalendar';

/**
 * Calendar component for date selection
 * Supports both Gregorian and Ethiopian calendars
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Date|null} props.selectedDate - Currently selected date
 * @param {function} props.onSelectDate - Date selection handler
 * @param {Date} [props.minDate] - Minimum selectable date
 * @param {Date} [props.maxDate] - Maximum selectable date
 * @param {('gregorian'|'ethiopian')} [props.calendarType='gregorian'] - Calendar type
 */
const Calendar = ({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  calendarType = 'gregorian'
}) => {
  // Initialize current view month/year
  const [viewDate, setViewDate] = useState(() => {
    const date = selectedDate || new Date();
    if (calendarType === 'ethiopian') {
      const ethDate = gregorianToEthiopian(date);
      return { year: ethDate.year, month: ethDate.month };
    } else {
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }
  });

  // Ethiopian month names
  const ethiopianMonths = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
  ];

  // Gregorian month names
  const gregorianMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get month name
  const getMonthName = () => {
    if (calendarType === 'ethiopian') {
      return ethiopianMonths[viewDate.month - 1];
    } else {
      return gregorianMonths[viewDate.month - 1];
    }
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    if (calendarType === 'ethiopian') {
      if (viewDate.month === 1) {
        setViewDate({ year: viewDate.year - 1, month: 13 });
      } else {
        setViewDate({ ...viewDate, month: viewDate.month - 1 });
      }
    } else {
      if (viewDate.month === 1) {
        setViewDate({ year: viewDate.year - 1, month: 12 });
      } else {
        setViewDate({ ...viewDate, month: viewDate.month - 1 });
      }
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (calendarType === 'ethiopian') {
      if (viewDate.month === 13) {
        setViewDate({ year: viewDate.year + 1, month: 1 });
      } else {
        setViewDate({ ...viewDate, month: viewDate.month + 1 });
      }
    } else {
      if (viewDate.month === 12) {
        setViewDate({ year: viewDate.year + 1, month: 1 });
      } else {
        setViewDate({ ...viewDate, month: viewDate.month + 1 });
      }
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (calendarType === 'ethiopian') {
      return generateEthiopianCalendarDays();
    } else {
      return generateGregorianCalendarDays();
    }
  }, [viewDate, calendarType]);

  // Generate Gregorian calendar days
  function generateGregorianCalendarDays() {
    const days = [];
    const firstDay = new Date(viewDate.year, viewDate.month - 1, 1);
    const lastDay = new Date(viewDate.year, viewDate.month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.year, viewDate.month - 1, day);
      days.push({ day, date });
    }

    return days;
  }

  // Generate Ethiopian calendar days
  function generateEthiopianCalendarDays() {
    const days = [];
    const daysInMonth = viewDate.month === 13 ? 5 : 30; // Pagume has 5 days, others have 30

    // Get the first day of the Ethiopian month in Gregorian
    const firstDayGregorian = ethiopianToGregorian(viewDate.year, viewDate.month, 1);
    const startDayOfWeek = firstDayGregorian.getDay();

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = ethiopianToGregorian(viewDate.year, viewDate.month, day);
      days.push({ day, date });
    }

    return days;
  }

  // Check if date is selected
  const isSelected = (date) => {
    if (!selectedDate || !date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is disabled
  const isDisabled = (date) => {
    if (!date) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (!isDisabled(date)) {
      onSelectDate(date);
    }
  };

  // Handle today button
  const handleToday = () => {
    const today = new Date();
    if (calendarType === 'ethiopian') {
      const ethDate = gregorianToEthiopian(today);
      setViewDate({ year: ethDate.year, month: ethDate.month });
    } else {
      setViewDate({ year: today.getFullYear(), month: today.getMonth() + 1 });
    }
    onSelectDate(today);
  };

  return (
    <div className={styles.calendar}>
      {/* Header with month/year navigation */}
      <div className={styles.header}>
        <button
          type="button"
          onClick={handlePreviousMonth}
          className={styles.navButton}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <div className={styles.monthYear}>
          {getMonthName()} {viewDate.year}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className={styles.navButton}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day names header */}
      <div className={styles.dayNames}>
        {dayNames.map((day) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.daysGrid}>
        {calendarDays.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => item.date && handleDateClick(item.date)}
            disabled={!item.date || isDisabled(item.date)}
            className={`
              ${styles.dayCell}
              ${isSelected(item.date) ? styles.selected : ''}
              ${isToday(item.date) ? styles.today : ''}
              ${isDisabled(item.date) ? styles.disabled : ''}
            `}
            aria-label={item.date ? item.date.toDateString() : undefined}
          >
            {item.day}
          </button>
        ))}
      </div>

      {/* Footer with today button */}
      <div className={styles.footer}>
        <button
          type="button"
          onClick={handleToday}
          className={styles.todayButton}
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default Calendar;

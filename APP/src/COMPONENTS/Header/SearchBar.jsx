import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, X, ArrowRight, FileText, Users, DollarSign, Package, Settings, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './SearchBar.module.css';

/**
 * Modern SearchBar with instant dropdown results & keyboard navigation
 */
const SearchBar = ({ onSearch, placeholder, className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Searchable pages dictionary
  const searchablePages = useMemo(() => [
    { title: t('dashboard', 'Dashboard'), path: '/', category: 'Overview', icon: FileText },
    { title: t('students.title', 'Students'), path: '/list-student', category: 'Lists', icon: Users },
    { title: t('staff', 'Staff Members'), path: '/list-staff', category: 'Lists', icon: Users },
    { title: t('guardians', 'Guardians'), path: '/list-guardian', category: 'Lists', icon: Users },
    { title: t('registerStudent', 'Register Student'), path: '/create-register-student', category: 'Registration', icon: Users },
    { title: t('registerStaff', 'Register Staff'), path: '/create-register-staff', category: 'Registration', icon: Users },
    { title: t('nav.monthlyPayments', 'Monthly Payments'), path: '/finance/monthly-payments', category: 'Finance', icon: DollarSign },
    { title: t('nav.feeManagement', 'Fee Management'), path: '/finance/fee-management', category: 'Finance', icon: DollarSign },
    { title: t('nav.studentExemption', 'Student Exemption'), path: '/finance/student-exemption', category: 'Finance', icon: Award },
    { title: t('nav.financialReports', 'Financial Reports'), path: '/finance/reports', category: 'Finance', icon: FileText },
    { title: t('nav.paymentSettings', 'Payment Settings'), path: '/finance/monthly-payment-settings', category: 'Finance', icon: Settings },
    { title: t('nav.inventory', 'Inventory & Stock'), path: '/inventory', category: 'Inventory', icon: Package },
    { title: t('nav.items', 'Inventory Items'), path: '/inventory/items', category: 'Inventory', icon: Package },
    { title: t('nav.hr', 'HR Dashboard'), path: '/hr', category: 'HR', icon: Users },
    { title: t('nav.salary', 'Salary Management'), path: '/hr/salary', category: 'HR', icon: DollarSign },
    { title: t('nav.teacherAttendance', 'Teacher Attendance'), path: '/hr/attendance', category: 'HR', icon: Calendar },
    { title: t('nav.leaveManagement', 'Leave Management'), path: '/hr/leave', category: 'HR', icon: Calendar },
    { title: t('nav.studentAttendanceSystem', 'Student Attendance'), path: '/student-attendance-system', category: 'Academic', icon: Calendar },
    { title: t('markLists', 'Mark Lists'), path: '/mark-list-view', category: 'Academic', icon: FileText },
    { title: t('reportCard', 'Report Cards'), path: '/report-card', category: 'Academic', icon: Award },
    { title: t('schedule', 'Schedule / Timetable'), path: '/schedule', category: 'Academic', icon: Calendar },
    { title: t('post', 'Posts Feed'), path: '/post', category: 'Communication', icon: FileText },
    { title: t('settings', 'System Settings'), path: '/settings', category: 'Settings', icon: Settings },
    { title: t('subAccounts', 'Admin Sub-Accounts'), path: '/admin-sub-accounts', category: 'Settings', icon: Users },
    { title: t('backup', 'Data Backup & Restore'), path: '/backup', category: 'Settings', icon: Settings }
  ], [t]);

  // Filtered results based on search query
  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchablePages.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [searchQuery, searchablePages]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const handleSelectPage = (path) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchQuery.trim()) {
          onSearch?.(searchQuery);
          setIsOpen(false);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectPage(results[selectedIndex].path);
      } else if (searchQuery.trim()) {
        onSearch?.(searchQuery);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const searchBarClasses = [
    styles.searchBar,
    isOpen && styles.focused,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.searchContainer} ref={dropdownRef}>
      <div className={searchBarClasses}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder={placeholder || t('common.searchPlaceholder', 'Search pages, actions...')}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label={t('common.search', 'Search')}
        />
        {searchQuery ? (
          <button 
            type="button" 
            className={styles.clearBtn} 
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className={styles.shortcut}>⌘ K</kbd>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={styles.searchDropdown} role="listbox">
          <div className={styles.dropdownHeader}>
            <span>{t('common.quickNavigation', 'Quick Navigation')}</span>
            <span className={styles.resultCount}>{results.length} found</span>
          </div>
          {results.map((item, index) => {
            const Icon = item.icon || FileText;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.path}
                type="button"
                className={`${styles.resultItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelectPage(item.path)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={isSelected}
              >
                <div className={styles.resultIconWrap}>
                  <Icon size={16} />
                </div>
                <div className={styles.resultText}>
                  <span className={styles.resultTitle}>{item.title}</span>
                  <span className={styles.resultCategory}>{item.category}</span>
                </div>
                <ArrowRight size={14} className={styles.resultArrow} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default SearchBar;

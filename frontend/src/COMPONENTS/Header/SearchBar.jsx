import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './SearchBar.module.css';

/**
 * SearchBar component for global search functionality
 * Provides a search input with icon
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback function when search is triggered
 * @param {string} props.placeholder - Placeholder text for search input
 * @param {string} props.className - Additional CSS classes
 */
const SearchBar = ({ onSearch, placeholder, className = '' }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const searchBarClasses = [
    styles.searchBar,
    className
  ].filter(Boolean).join(' ');

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Trigger search on every keystroke for live search
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  return (
    <form className={searchBarClasses} onSubmit={handleSubmit}>
      <Search size={18} className={styles.searchIcon} aria-hidden="true" />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder || t('common.searchPlaceholder', 'Search anything...')}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-label={t('common.search', 'Search')}
      />
      <kbd className={styles.shortcut}>⌘ K</kbd>
    </form>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default SearchBar;

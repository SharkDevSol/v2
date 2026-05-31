import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider component that manages dark/light mode state
 * Persists theme preference in localStorage and respects system preference
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  /**
   * Apply theme to the document
   */
  const applyTheme = useCallback((dark) => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, []);

  /**
   * Toggle between dark and light mode
   */
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  /**
   * Set a specific theme mode
   * @param {'dark' | 'light'} mode - Theme mode to set
   */
  const setTheme = useCallback((mode) => {
    const dark = mode === 'dark';
    setIsDarkMode(dark);
    localStorage.setItem('theme', mode);
    applyTheme(dark);
  }, [applyTheme]);

  // Apply theme on mount and listen for system preference changes
  useEffect(() => {
    applyTheme(isDarkMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    theme: isDarkMode ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @returns {Object} Theme context value with isDarkMode, toggleTheme, setTheme, theme
 * @throws {Error} If used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;

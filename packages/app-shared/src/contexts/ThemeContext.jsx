import React, { createContext, useContext, useState, useEffect } from 'react';
import { recordThemeSwitchMs } from '../utils/performance';

const ThemeContext = createContext();

/**
 * ThemeProvider component that manages theme state (light/dark mode)
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });
  
  useEffect(() => {
    const start = performance.now();
    // Apply theme as a class (used by theme.css `.dark` selectors)
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    // Also apply theme as a data attribute (used by component CSS
    // `[data-theme="dark"]` selectors such as Sidebar, Header, SearchBar, etc.)
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    requestAnimationFrame(() => {
      recordThemeSwitchMs(performance.now() - start);
    });
  }, [theme]);
  
  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  /**
   * Set theme explicitly
   * @param {string} newTheme - 'light' or 'dark'
   */
  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };
  
  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @returns {Object} Theme context value
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

import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider - Light mode only (dark mode removed)
 */
export const ThemeProvider = ({ children }) => {
  const value = {
    isDarkMode: false,
    toggleTheme: () => {},
    setTheme: () => {},
    theme: 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { isDarkMode: false, toggleTheme: () => {}, setTheme: () => {}, theme: 'light' };
  }
  return context;
};

export default ThemeContext;

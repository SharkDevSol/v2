/**
 * Theme System Usage Examples
 * 
 * This file demonstrates how to use the theme configuration
 * in your components and styles.
 */

import { getTheme, themeConfig } from './theme';

// ============================================
// Example 1: Getting Theme Configuration
// ============================================

// Get light theme
const lightTheme = getTheme('light');
console.log('Light theme primary color:', lightTheme.colors.primary);

// Get dark theme
const darkTheme = getTheme('dark');
console.log('Dark theme primary color:', darkTheme.colors.primary);

// Get theme based on user preference
const userPreference = localStorage.getItem('theme') || 'light';
const currentTheme = getTheme(userPreference);

// ============================================
// Example 2: Using Theme in React Component
// ============================================

/**
 * Example: Theme-aware Button Component
 */
function ThemedButton({ children, variant = 'primary' }) {
  // In a real implementation, you'd get the theme from context
  const theme = getTheme('light');
  
  const buttonStyle = {
    backgroundColor: theme.colors[variant],
    color: theme.colors.textInverse,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    border: 'none',
    cursor: 'pointer',
  };
  
  return <button style={buttonStyle}>{children}</button>;
}

// ============================================
// Example 3: Applying Theme to Document
// ============================================

/**
 * Apply theme CSS variables to document root
 */
function applyThemeToDocument(mode = 'light') {
  const theme = getTheme(mode);
  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });
  
  // Apply typography variables
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
  
  // Apply spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  // Apply border radius variables
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  // Add theme class to body
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(mode);
}

// ============================================
// Example 4: Theme Toggle Hook
// ============================================

/**
 * Custom hook for theme management
 */
function useTheme() {
  const [mode, setMode] = React.useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  const theme = getTheme(mode);
  
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
    
    // Apply theme class to body
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newMode);
  };
  
  const setThemeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('theme', newMode);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newMode);
  };
  
  return {
    mode,
    theme,
    toggleTheme,
    setThemeMode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
}

// ============================================
// Example 5: CSS-in-JS with Theme
// ============================================

/**
 * Generate styles using theme configuration
 */
function generateButtonStyles(theme, variant = 'primary') {
  return {
    base: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      fontFamily: theme.typography.fontFamily,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 150ms ease-in-out',
    },
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textInverse,
    },
    secondary: {
      backgroundColor: theme.colors.backgroundSecondary,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
    },
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.textInverse,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.textInverse,
    },
  };
}

// Usage
const theme = getTheme('light');
const buttonStyles = generateButtonStyles(theme);
const primaryButtonStyle = { ...buttonStyles.base, ...buttonStyles.primary };

// ============================================
// Example 6: Responsive Breakpoints
// ============================================

/**
 * Check if current viewport matches breakpoint
 */
function useBreakpoint() {
  const theme = getTheme();
  
  const [breakpoint, setBreakpoint] = React.useState(() => {
    const width = window.innerWidth;
    if (width < parseInt(theme.breakpoints.tablet)) return 'mobile';
    if (width < parseInt(theme.breakpoints.desktop)) return 'tablet';
    return 'desktop';
  });
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < parseInt(theme.breakpoints.tablet)) {
        setBreakpoint('mobile');
      } else if (width < parseInt(theme.breakpoints.desktop)) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}

// ============================================
// Example 7: Theme Context Provider
// ============================================

/**
 * Theme Context for React application
 */
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [mode, setMode] = React.useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  const theme = getTheme(mode);
  
  React.useEffect(() => {
    // Apply theme class to body on mount and when mode changes
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(mode);
  }, [mode]);
  
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };
  
  const setThemeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };
  
  const value = {
    mode,
    theme,
    toggleTheme,
    setThemeMode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useThemeContext() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

// ============================================
// Example 8: CSS Module with Theme Variables
// ============================================

/**
 * Example CSS Module using theme variables
 * 
 * File: Button.module.css
 */
const cssModuleExample = `
.button {
  /* Use CSS variables from global.css */
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.button.success {
  background-color: var(--color-success);
}

.button.danger {
  background-color: var(--color-danger);
}

.button.disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
}
`;

// ============================================
// Example 9: Dynamic Theme Customization
// ============================================

/**
 * Create custom theme by extending base theme
 */
function createCustomTheme(baseMode = 'light', overrides = {}) {
  const baseTheme = getTheme(baseMode);
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors,
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
    },
    spacing: {
      ...baseTheme.spacing,
      ...overrides.spacing,
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...overrides.borderRadius,
    },
  };
}

// Usage: Create a custom theme with different primary color
const customTheme = createCustomTheme('light', {
  colors: {
    primary: '#ff6b6b',
    primaryHover: '#ff5252',
    primaryActive: '#ff3838',
  },
});

// ============================================
// Example 10: Accessibility Helpers
// ============================================

/**
 * Check if color combination meets WCAG AA contrast ratio
 */
function meetsContrastRatio(foreground, background, level = 'AA') {
  // This is a simplified example
  // In production, use a proper contrast ratio calculation library
  const requiredRatio = level === 'AAA' ? 7 : 4.5;
  
  // Calculate contrast ratio (simplified)
  // In real implementation, convert hex to RGB and calculate luminance
  return true; // Placeholder
}

/**
 * Get accessible text color for background
 */
function getAccessibleTextColor(backgroundColor, theme) {
  // Simplified logic - in production, calculate actual contrast
  const isDarkBackground = backgroundColor.includes('111827') || 
                          backgroundColor.includes('1f2937');
  
  return isDarkBackground ? theme.colors.text : theme.colors.textInverse;
}

// Export examples for documentation
export {
  ThemedButton,
  applyThemeToDocument,
  useTheme,
  generateButtonStyles,
  useBreakpoint,
  ThemeProvider,
  useThemeContext,
  createCustomTheme,
  meetsContrastRatio,
  getAccessibleTextColor,
};

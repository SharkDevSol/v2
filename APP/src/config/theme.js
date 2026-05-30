/**
 * Theme Configuration for Skoolific V2
 * 
 * This file defines the complete theme configuration including colors,
 * typography, spacing, border radius, and breakpoints for both light
 * and dark modes.
 * 
 * @module config/theme
 */

/**
 * Light theme configuration
 * @type {ThemeConfig}
 */
export const lightTheme = {
  mode: 'light',
  colors: {
    // Primary colors
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    primaryActive: '#6d28d9',
    primaryLight: '#f5f3ff',
    
    // Semantic colors
    success: '#22c55e',
    successLight: '#f0fdf4',
    successDark: '#15803d',
    
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    warningDark: '#b45309',
    
    danger: '#ef4444',
    dangerLight: '#fef2f2',
    dangerDark: '#b91c1c',
    
    info: '#3b82f6',
    infoLight: '#eff6ff',
    infoDark: '#1d4ed8',
    
    // Neutral colors
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    
    border: '#e5e7eb',
    borderSecondary: '#d1d5db',
    borderFocus: '#8b5cf6',
    
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textDisabled: '#d1d5db',
    textInverse: '#ffffff',
    
    // Shadows
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    shadow2xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    shadowInner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontFamilyAmharic: "'Noto Sans Ethiopic', 'Nyala', 'Ethiopia Jiret', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
  },
};

/**
 * Default theme
 */
export const defaultTheme = lightTheme;

/**
 * Get theme
 * @returns {ThemeConfig} Theme configuration
 */
export const getTheme = () => {
  return lightTheme;
};

/**
 * Theme configuration object
 */
export const themeConfig = {
  light: lightTheme,
  default: defaultTheme,
  getTheme,
};

export default themeConfig;

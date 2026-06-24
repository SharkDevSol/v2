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
 * Dark theme configuration
 * @type {ThemeConfig}
 */
export const darkTheme = {
  mode: 'dark',
  colors: {
    // Primary colors
    primary: '#a78bfa',
    primaryHover: '#c4b5fd',
    primaryActive: '#8b5cf6',
    primaryLight: 'rgba(139, 92, 246, 0.2)',

    // Semantic colors
    success: '#4ade80',
    successLight: 'rgba(74, 222, 128, 0.15)',
    successDark: '#22c55e',

    warning: '#fbbf24',
    warningLight: 'rgba(251, 191, 36, 0.15)',
    warningDark: '#f59e0b',

    danger: '#f87171',
    dangerLight: 'rgba(248, 113, 113, 0.15)',
    dangerDark: '#ef4444',

    info: '#60a5fa',
    infoLight: 'rgba(96, 165, 250, 0.15)',
    infoDark: '#3b82f6',

    // Neutral colors
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    surface: 'rgba(30, 41, 59, 0.8)',
    surfaceElevated: 'rgba(51, 65, 85, 0.9)',

    border: 'rgba(139, 92, 246, 0.2)',
    borderSecondary: 'rgba(139, 92, 246, 0.12)',
    borderFocus: '#a78bfa',

    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textDisabled: '#475569',
    textInverse: '#0f172a',

    // Shadows
    shadowSm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    shadowMd: '0 4px 16px rgba(0, 0, 0, 0.4)',
    shadowLg: '0 10px 32px rgba(0, 0, 0, 0.5)',
    shadowXl: '0 20px 48px rgba(0, 0, 0, 0.6)',
    shadow2xl: '0 32px 64px rgba(0, 0, 0, 0.7)',
    shadowInner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  breakpoints: lightTheme.breakpoints,
};

/**
 * Get theme by mode
 * @param {'light' | 'dark'} mode - Theme mode
 * @returns {ThemeConfig} Theme configuration
 */
export const getTheme = (mode = 'light') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Theme configuration object
 */
export const themeConfig = {
  light: lightTheme,
  dark: darkTheme,
  default: defaultTheme,
  getTheme,
};

export default themeConfig;

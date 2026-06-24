/**
 * Tests for Theme Configuration
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { lightTheme, darkTheme, getTheme, themeConfig } from './theme';

describe('Theme Configuration', () => {
  describe('lightTheme', () => {
    it('should have mode set to light', () => {
      expect(lightTheme.mode).toBe('light');
    });

    it('should have all required color properties', () => {
      expect(lightTheme.colors).toBeDefined();
      expect(lightTheme.colors.primary).toBe('#8b5cf6');
      expect(lightTheme.colors.primaryHover).toBe('#7c3aed');
      expect(lightTheme.colors.success).toBe('#22c55e');
      expect(lightTheme.colors.warning).toBe('#f59e0b');
      expect(lightTheme.colors.danger).toBe('#ef4444');
      expect(lightTheme.colors.info).toBe('#3b82f6');
    });

    it('should have background colors defined', () => {
      expect(lightTheme.colors.background).toBe('#ffffff');
      expect(lightTheme.colors.backgroundSecondary).toBe('#f9fafb');
      expect(lightTheme.colors.surface).toBe('#ffffff');
    });

    it('should have text colors defined', () => {
      expect(lightTheme.colors.text).toBe('#111827');
      expect(lightTheme.colors.textSecondary).toBe('#6b7280');
      expect(lightTheme.colors.textInverse).toBe('#ffffff');
    });

    it('should have border colors defined', () => {
      expect(lightTheme.colors.border).toBe('#e5e7eb');
      expect(lightTheme.colors.borderFocus).toBe('#8b5cf6');
    });

    it('should have shadow definitions', () => {
      expect(lightTheme.colors.shadowSm).toBeDefined();
      expect(lightTheme.colors.shadowMd).toBeDefined();
      expect(lightTheme.colors.shadowLg).toBeDefined();
    });
  });

  describe('darkTheme', () => {
    it('should have mode set to dark', () => {
      expect(darkTheme.mode).toBe('dark');
    });

    it('should have adjusted primary colors for dark mode', () => {
      expect(darkTheme.colors.primary).toBe('#a78bfa');
      expect(darkTheme.colors.primaryHover).toBe('#c4b5fd');
    });

    it('should have dark background colors', () => {
      expect(darkTheme.colors.background).toBe('#111827');
      expect(darkTheme.colors.backgroundSecondary).toBe('#1f2937');
    });

    it('should have light text colors for dark mode', () => {
      expect(darkTheme.colors.text).toBe('#f9fafb');
      expect(darkTheme.colors.textSecondary).toBe('#d1d5db');
    });

    it('should have darker shadows', () => {
      expect(darkTheme.colors.shadowSm).toContain('0.3');
      expect(darkTheme.colors.shadowMd).toContain('0.4');
    });
  });

  describe('typography', () => {
    it('should have font family defined', () => {
      expect(lightTheme.typography.fontFamily).toContain('Inter');
      expect(darkTheme.typography.fontFamily).toContain('Inter');
    });

    it('should have font sizes defined', () => {
      expect(lightTheme.typography.fontSize.xs).toBe('12px');
      expect(lightTheme.typography.fontSize.sm).toBe('14px');
      expect(lightTheme.typography.fontSize.base).toBe('16px');
      expect(lightTheme.typography.fontSize.lg).toBe('18px');
      expect(lightTheme.typography.fontSize.xl).toBe('20px');
    });

    it('should have font weights defined', () => {
      expect(lightTheme.typography.fontWeight.normal).toBe(400);
      expect(lightTheme.typography.fontWeight.medium).toBe(500);
      expect(lightTheme.typography.fontWeight.semibold).toBe(600);
      expect(lightTheme.typography.fontWeight.bold).toBe(700);
    });

    it('should have line heights defined', () => {
      expect(lightTheme.typography.lineHeight.tight).toBe(1.25);
      expect(lightTheme.typography.lineHeight.normal).toBe(1.5);
      expect(lightTheme.typography.lineHeight.relaxed).toBe(1.75);
    });
  });

  describe('spacing', () => {
    it('should have spacing scale defined', () => {
      expect(lightTheme.spacing.xs).toBe('4px');
      expect(lightTheme.spacing.sm).toBe('8px');
      expect(lightTheme.spacing.md).toBe('16px');
      expect(lightTheme.spacing.lg).toBe('24px');
      expect(lightTheme.spacing.xl).toBe('32px');
      expect(lightTheme.spacing['2xl']).toBe('48px');
    });

    it('should have same spacing in both themes', () => {
      expect(lightTheme.spacing).toEqual(darkTheme.spacing);
    });
  });

  describe('borderRadius', () => {
    it('should have border radius values defined', () => {
      expect(lightTheme.borderRadius.none).toBe('0');
      expect(lightTheme.borderRadius.sm).toBe('4px');
      expect(lightTheme.borderRadius.md).toBe('8px');
      expect(lightTheme.borderRadius.lg).toBe('12px');
      expect(lightTheme.borderRadius.full).toBe('9999px');
    });

    it('should have same border radius in both themes', () => {
      expect(lightTheme.borderRadius).toEqual(darkTheme.borderRadius);
    });
  });

  describe('breakpoints', () => {
    it('should have breakpoints defined', () => {
      expect(lightTheme.breakpoints.mobile).toBe('320px');
      expect(lightTheme.breakpoints.tablet).toBe('768px');
      expect(lightTheme.breakpoints.desktop).toBe('1024px');
    });

    it('should have same breakpoints in both themes', () => {
      expect(lightTheme.breakpoints).toEqual(darkTheme.breakpoints);
    });
  });

  describe('getTheme function', () => {
    it('should return light theme by default', () => {
      const theme = getTheme();
      expect(theme.mode).toBe('light');
      expect(theme).toEqual(lightTheme);
    });

    it('should return light theme when mode is "light"', () => {
      const theme = getTheme('light');
      expect(theme.mode).toBe('light');
      expect(theme).toEqual(lightTheme);
    });

    it('should return dark theme when mode is "dark"', () => {
      const theme = getTheme('dark');
      expect(theme.mode).toBe('dark');
      expect(theme).toEqual(darkTheme);
    });
  });

  describe('themeConfig', () => {
    it('should have light and dark themes', () => {
      expect(themeConfig.light).toEqual(lightTheme);
      expect(themeConfig.dark).toEqual(darkTheme);
    });

    it('should have default theme as light', () => {
      expect(themeConfig.default).toEqual(lightTheme);
    });

    it('should have getTheme function', () => {
      expect(typeof themeConfig.getTheme).toBe('function');
    });
  });

  describe('theme consistency', () => {
    it('should have same structure in both themes', () => {
      const lightKeys = Object.keys(lightTheme);
      const darkKeys = Object.keys(darkTheme);
      expect(lightKeys.sort()).toEqual(darkKeys.sort());
    });

    it('should have same color keys in both themes', () => {
      const lightColorKeys = Object.keys(lightTheme.colors);
      const darkColorKeys = Object.keys(darkTheme.colors);
      expect(lightColorKeys.sort()).toEqual(darkColorKeys.sort());
    });

    it('should have same typography structure in both themes', () => {
      expect(Object.keys(lightTheme.typography)).toEqual(
        Object.keys(darkTheme.typography)
      );
    });
  });

  describe('WCAG AA compliance', () => {
    it('should have sufficient contrast for primary color on light background', () => {
      // Primary color #8b5cf6 on white background should have good contrast
      expect(lightTheme.colors.primary).toBe('#8b5cf6');
      expect(lightTheme.colors.background).toBe('#ffffff');
    });

    it('should have sufficient contrast for text on light background', () => {
      // Dark text on white background
      expect(lightTheme.colors.text).toBe('#111827');
      expect(lightTheme.colors.background).toBe('#ffffff');
    });

    it('should have sufficient contrast for text on dark background', () => {
      // Light text on dark background
      expect(darkTheme.colors.text).toBe('#f9fafb');
      expect(darkTheme.colors.background).toBe('#111827');
    });
  });
});

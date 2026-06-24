/**
 * ThemeContext Tests
 * 
 * Tests for theme switching functionality between light and dark modes.
 * Verifies ThemeContext and ThemeProvider work correctly.
 * Tests theme persistence in localStorage.
 * Tests CSS variables update correctly.
 * Tests system preference detection.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Mock component to test theme context
const TestComponent = () => {
  const { theme, toggleTheme, setTheme, isDark, isLight } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-dark">{isDark ? 'true' : 'false'}</div>
      <div data-testid="is-light">{isLight ? 'true' : 'false'}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light-button">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark-button">
        Set Dark
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear document classes
    document.documentElement.classList.remove('light', 'dark');
    
    // Mock matchMedia for system preference detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  describe('Initialization', () => {
    test('should default to light theme when no localStorage or system preference', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-light')).toHaveTextContent('true');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    test('should use localStorage theme if available', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    });

    test('should detect system dark mode preference when no localStorage', () => {
      // Mock system preference for dark mode
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should prioritize localStorage over system preference', () => {
      localStorage.setItem('theme', 'light');
      
      // Mock system preference for dark mode
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should use localStorage value (light) instead of system preference (dark)
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('Theme Switching', () => {
    test('should toggle from light to dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Toggle theme
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    });

    test('should toggle from dark to light', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Toggle theme
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-light')).toHaveTextContent('true');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    test('should toggle multiple times correctly', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle-button').click();
      });
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Toggle back to light
      act(() => {
        screen.getByTestId('toggle-button').click();
      });
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Toggle to dark again
      act(() => {
        screen.getByTestId('toggle-button').click();
      });
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should set theme explicitly to light', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Set to light explicitly
      act(() => {
        screen.getByTestId('set-light-button').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    test('should set theme explicitly to dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Set to dark explicitly
      act(() => {
        screen.getByTestId('set-dark-button').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should ignore invalid theme values', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('light');

      // Try to set invalid theme
      act(() => {
        result.current.setTheme('invalid');
      });

      // Should remain light
      expect(result.current.theme).toBe('light');
    });
  });

  describe('LocalStorage Persistence', () => {
    test('should save theme to localStorage when changed', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially should be light
      expect(localStorage.getItem('theme')).toBe('light');

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      // Should be saved to localStorage
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should persist theme across component remounts', () => {
      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Unmount component
      unmount();

      // Remount component
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should still be dark
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    test('should update localStorage when theme is set explicitly', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set to dark explicitly
      act(() => {
        screen.getByTestId('set-dark-button').click();
      });

      expect(localStorage.getItem('theme')).toBe('dark');

      // Set to light explicitly
      act(() => {
        screen.getByTestId('set-light-button').click();
      });

      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('CSS Variables Update', () => {
    test('should apply light class to document element', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('should apply dark class to document element', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    test('should update document classes when theme changes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially light
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      // Should now be dark
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    test('should remove old theme class when switching', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      // Verify only dark class is present
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.length).toBe(1);

      // Toggle back to light
      act(() => {
        screen.getByTestId('toggle-button').click();
      });

      // Verify only light class is present
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.length).toBe(1);
    });
  });

  describe('Hook Error Handling', () => {
    test('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within ThemeProvider');

      console.error = originalError;
    });
  });

  describe('Context Value', () => {
    test('should provide correct context values for light theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isLight).toBe(true);
      expect(result.current.isDark).toBe(false);
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });

    test('should provide correct context values for dark theme', () => {
      localStorage.setItem('theme', 'dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });
  });

  describe('Multiple Components', () => {
    test('should share theme state across multiple components', () => {
      const Component1 = () => {
        const { theme } = useTheme();
        return <div data-testid="component1-theme">{theme}</div>;
      };

      const Component2 = () => {
        const { theme, toggleTheme } = useTheme();
        return (
          <div>
            <div data-testid="component2-theme">{theme}</div>
            <button onClick={toggleTheme} data-testid="component2-toggle">
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <Component1 />
          <Component2 />
        </ThemeProvider>
      );

      // Both components should show light initially
      expect(screen.getByTestId('component1-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('component2-theme')).toHaveTextContent('light');

      // Toggle from component2
      act(() => {
        screen.getByTestId('component2-toggle').click();
      });

      // Both components should update to dark
      expect(screen.getByTestId('component1-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('component2-theme')).toHaveTextContent('dark');
    });
  });
});

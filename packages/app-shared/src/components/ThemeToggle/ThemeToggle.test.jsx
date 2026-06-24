/**
 * ThemeToggle Component Tests
 * 
 * Tests for the ThemeToggle button component.
 * Verifies correct icon display, click handling, accessibility, and prop variations.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  describe('Rendering', () => {
    test('should render toggle button', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('should display Moon icon in light mode', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    test('should display Sun icon in dark mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });
  });

  describe('Size Prop', () => {
    test('should apply small size class', () => {
      render(
        <ThemeProvider>
          <ThemeToggle size="small" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('size-small');
    });

    test('should apply medium size class by default', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('size-medium');
    });

    test('should apply large size class', () => {
      render(
        <ThemeProvider>
          <ThemeToggle size="large" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('size-large');
    });
  });

  describe('ShowLabel Prop', () => {
    test('should not show label by default', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toBe('');
    });

    test('should show "Dark" label in light mode when showLabel is true', () => {
      render(
        <ThemeProvider>
          <ThemeToggle showLabel={true} />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toBe('Dark');
    });

    test('should show "Light" label in dark mode when showLabel is true', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle showLabel={true} />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toBe('Light');
    });

    test('should update label when theme changes', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle showLabel={true} />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Initially light mode - shows "Dark"
      expect(button.textContent).toBe('Dark');

      // Click to toggle to dark mode
      await user.click(button);

      // Now dark mode - shows "Light"
      expect(button.textContent).toBe('Light');
    });
  });

  describe('ClassName Prop', () => {
    test('should apply custom className', () => {
      render(
        <ThemeProvider>
          <ThemeToggle className="custom-class" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    test('should preserve default classes when custom className is added', () => {
      render(
        <ThemeProvider>
          <ThemeToggle className="custom-class" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('themeToggle');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Interaction', () => {
    test('should toggle theme when clicked', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Initially light mode
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      expect(document.documentElement.classList.contains('light')).toBe(true);

      // Click to toggle to dark
      await user.click(button);

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('should toggle back and forth multiple times', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Click 1: light -> dark
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Click 2: dark -> light
      await user.click(button);
      expect(document.documentElement.classList.contains('light')).toBe(true);

      // Click 3: light -> dark
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('should update localStorage when toggled', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Initially light
      expect(localStorage.getItem('theme')).toBe('light');

      // Toggle to dark
      await user.click(button);
      expect(localStorage.getItem('theme')).toBe('dark');

      // Toggle back to light
      await user.click(button);
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('Accessibility', () => {
    test('should have proper aria-label for light mode', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    test('should have proper aria-label for dark mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    test('should have proper title attribute for light mode', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    test('should have proper title attribute for dark mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });

    test('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Tab to focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to toggle
      await user.keyboard('{Enter}');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Press Space to toggle back
      await user.keyboard(' ');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    test('should be focusable', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Icon Display', () => {
    test('should update icon when theme changes externally', async () => {
      const user = userEvent.setup();

      // Component that can change theme externally
      const TestWrapper = () => {
        const { setTheme } = useTheme();
        return (
          <div>
            <ThemeToggle />
            <button onClick={() => setTheme('dark')} data-testid="external-dark">
              Set Dark
            </button>
            <button onClick={() => setTheme('light')} data-testid="external-light">
              Set Light
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestWrapper />
        </ThemeProvider>
      );

      const toggleButton = screen.getByRole('button', { name: /Switch to/i });

      // Initially light mode (Moon icon)
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');

      // Change to dark externally
      await user.click(screen.getByTestId('external-dark'));
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light mode');

      // Change to light externally
      await user.click(screen.getByTestId('external-light'));
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
  });

  describe('Multiple ThemeToggle Instances', () => {
    test('should synchronize multiple toggle buttons', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <div>
            <ThemeToggle />
            <ThemeToggle />
          </div>
        </ThemeProvider>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Both should show light mode initially
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      });

      // Click first button
      await user.click(buttons[0]);

      // Both should update to dark mode
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      });

      // Click second button
      await user.click(buttons[1]);

      // Both should update back to light mode
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      });
    });

    test('should synchronize buttons with different props', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <div>
            <ThemeToggle size="small" />
            <ThemeToggle size="large" showLabel={true} />
          </div>
        </ThemeProvider>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Click first button
      await user.click(buttons[0]);

      // Both should update to dark mode
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      });

      // Second button should show label
      expect(buttons[1].textContent).toBe('Light');
    });
  });

  describe('CSS Classes', () => {
    test('should apply themeToggle CSS class', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('themeToggle');
    });
  });

  describe('Integration with ThemeContext', () => {
    test('should reflect initial theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('should persist theme changes to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Toggle to dark
      await user.click(button);
      expect(localStorage.getItem('theme')).toBe('dark');

      // Toggle to light
      await user.click(button);
      expect(localStorage.getItem('theme')).toBe('light');
    });

    test('should update document classes when toggled', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Initially light
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Toggle to dark
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);

      // Toggle back to light
      await user.click(button);
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Prop Combinations', () => {
    test('should work with all props combined', () => {
      render(
        <ThemeProvider>
          <ThemeToggle size="large" showLabel={true} className="custom" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('size-large');
      expect(button.className).toContain('custom');
      expect(button.textContent).toBe('Dark');
    });

    test('should handle size and showLabel together', () => {
      render(
        <ThemeProvider>
          <ThemeToggle size="small" showLabel={true} />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('size-small');
      expect(button.textContent).toBe('Dark');
    });
  });
});

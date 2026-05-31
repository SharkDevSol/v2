/**
 * Button Component Tests
 * 
 * Tests for Button component rendering in light and dark themes.
 * Verifies all Button variants, sizes, states, and theme-aware styling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Button from './Button';

// Helper function to render Button with ThemeProvider
const renderWithTheme = (ui, theme = 'light') => {
  // Set initial theme in localStorage
  localStorage.setItem('theme', theme);
  
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

// Helper function to get computed styles
const getComputedStyles = (element) => {
  return window.getComputedStyle(element);
};

describe('Button Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rendering in Light Mode', () => {
    it('should render button with default props in light mode', () => {
      renderWithTheme(<Button>Click Me</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should render primary variant in light mode', () => {
      renderWithTheme(<Button variant="primary">Primary</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /primary/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('primary');
    });

    it('should render secondary variant in light mode', () => {
      renderWithTheme(<Button variant="secondary">Secondary</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('secondary');
    });

    it('should render outline variant in light mode', () => {
      renderWithTheme(<Button variant="outline">Outline</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('outline');
    });

    it('should render ghost variant in light mode', () => {
      renderWithTheme(<Button variant="ghost">Ghost</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('ghost');
    });

    it('should render danger variant in light mode', () => {
      renderWithTheme(<Button variant="danger">Danger</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /danger/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('danger');
    });
  });

  describe('Rendering in Dark Mode', () => {
    it('should render button with default props in dark mode', () => {
      renderWithTheme(<Button>Click Me</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should render primary variant in dark mode', () => {
      renderWithTheme(<Button variant="primary">Primary</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /primary/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('primary');
    });

    it('should render secondary variant in dark mode', () => {
      renderWithTheme(<Button variant="secondary">Secondary</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('secondary');
    });

    it('should render outline variant in dark mode', () => {
      renderWithTheme(<Button variant="outline">Outline</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('outline');
    });

    it('should render ghost variant in dark mode', () => {
      renderWithTheme(<Button variant="ghost">Ghost</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('ghost');
    });

    it('should render danger variant in dark mode', () => {
      renderWithTheme(<Button variant="danger">Danger</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /danger/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('danger');
    });
  });

  describe('Button Sizes', () => {
    it('should render small size button in light mode', () => {
      renderWithTheme(<Button size="sm">Small</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('sm');
    });

    it('should render medium size button in light mode', () => {
      renderWithTheme(<Button size="md">Medium</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /medium/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('md');
    });

    it('should render large size button in light mode', () => {
      renderWithTheme(<Button size="lg">Large</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('lg');
    });

    it('should render small size button in dark mode', () => {
      renderWithTheme(<Button size="sm">Small</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('sm');
    });

    it('should render medium size button in dark mode', () => {
      renderWithTheme(<Button size="md">Medium</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /medium/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('md');
    });

    it('should render large size button in dark mode', () => {
      renderWithTheme(<Button size="lg">Large</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('lg');
    });
  });

  describe('Button States', () => {
    describe('Disabled State', () => {
      it('should render disabled button in light mode', () => {
        renderWithTheme(<Button disabled>Disabled</Button>, 'light');
        
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
        expect(button.className).toContain('disabled');
      });

      it('should render disabled button in dark mode', () => {
        renderWithTheme(<Button disabled>Disabled</Button>, 'dark');
        
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
        expect(button.className).toContain('disabled');
      });

      it('should not trigger onClick when disabled in light mode', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        
        renderWithTheme(<Button disabled onClick={handleClick}>Disabled</Button>, 'light');
        
        const button = screen.getByRole('button', { name: /disabled/i });
        await user.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should not trigger onClick when disabled in dark mode', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        
        renderWithTheme(<Button disabled onClick={handleClick}>Disabled</Button>, 'dark');
        
        const button = screen.getByRole('button', { name: /disabled/i });
        await user.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
      });
    });

    describe('Loading State', () => {
      it('should render loading button with spinner in light mode', () => {
        renderWithTheme(<Button loading>Loading</Button>, 'light');
        
        const button = screen.getByRole('button', { name: /loading/i });
        expect(button).toBeDisabled();
        expect(button.className).toContain('loading');
        
        // Check for spinner element (it's a span child of the button)
        const spans = button.querySelectorAll('span');
        const hasSpinner = Array.from(spans).some(span => 
          span.className.includes('spinner')
        );
        expect(hasSpinner).toBe(true);
      });

      it('should render loading button with spinner in dark mode', () => {
        renderWithTheme(<Button loading>Loading</Button>, 'dark');
        
        const button = screen.getByRole('button', { name: /loading/i });
        expect(button).toBeDisabled();
        expect(button.className).toContain('loading');
        
        // Check for spinner element (it's a span child of the button)
        const spans = button.querySelectorAll('span');
        const hasSpinner = Array.from(spans).some(span => 
          span.className.includes('spinner')
        );
        expect(hasSpinner).toBe(true);
      });

      it('should not trigger onClick when loading in light mode', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        
        renderWithTheme(<Button loading onClick={handleClick}>Loading</Button>, 'light');
        
        const button = screen.getByRole('button', { name: /loading/i });
        await user.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should not trigger onClick when loading in dark mode', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        
        renderWithTheme(<Button loading onClick={handleClick}>Loading</Button>, 'dark');
        
        const button = screen.getByRole('button', { name: /loading/i });
        await user.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
      });

      it('should hide icon when loading in light mode', () => {
        const icon = <span data-testid="test-icon">★</span>;
        renderWithTheme(<Button loading icon={icon}>Loading</Button>, 'light');
        
        const button = screen.getByRole('button', { name: /loading/i });
        const spans = button.querySelectorAll('span');
        const hasSpinner = Array.from(spans).some(span => 
          span.className.includes('spinner')
        );
        
        expect(hasSpinner).toBe(true);
        expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      });

      it('should hide icon when loading in dark mode', () => {
        const icon = <span data-testid="test-icon">★</span>;
        renderWithTheme(<Button loading icon={icon}>Loading</Button>, 'dark');
        
        const button = screen.getByRole('button', { name: /loading/i });
        const spans = button.querySelectorAll('span');
        const hasSpinner = Array.from(spans).some(span => 
          span.className.includes('spinner')
        );
        
        expect(hasSpinner).toBe(true);
        expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Button with Icons', () => {
    it('should render button with icon in light mode', () => {
      const icon = <span data-testid="test-icon">★</span>;
      renderWithTheme(<Button icon={icon}>With Icon</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /with icon/i });
      const iconElement = screen.getByTestId('test-icon');
      
      expect(button).toBeInTheDocument();
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveTextContent('★');
    });

    it('should render button with icon in dark mode', () => {
      const icon = <span data-testid="test-icon">★</span>;
      renderWithTheme(<Button icon={icon}>With Icon</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /with icon/i });
      const iconElement = screen.getByTestId('test-icon');
      
      expect(button).toBeInTheDocument();
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveTextContent('★');
    });

    it('should render icon for all variants in light mode', () => {
      const icon = <span data-testid="test-icon">★</span>;
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
      
      variants.forEach((variant) => {
        const { unmount } = renderWithTheme(
          <Button variant={variant} icon={icon}>{variant}</Button>,
          'light'
        );
        
        const iconElement = screen.getByTestId('test-icon');
        expect(iconElement).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should render icon for all variants in dark mode', () => {
      const icon = <span data-testid="test-icon">★</span>;
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
      
      variants.forEach((variant) => {
        const { unmount } = renderWithTheme(
          <Button variant={variant} icon={icon}>{variant}</Button>,
          'dark'
        );
        
        const iconElement = screen.getByTestId('test-icon');
        expect(iconElement).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Button Interactions', () => {
    it('should trigger onClick when clicked in light mode', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick when clicked in dark mode', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks in light mode', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple clicks in dark mode', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Button Types', () => {
    it('should render button type="button" by default in light mode', () => {
      renderWithTheme(<Button>Button</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /button/i });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render button type="submit" in light mode', () => {
      renderWithTheme(<Button type="submit">Submit</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render button type="reset" in light mode', () => {
      renderWithTheme(<Button type="reset">Reset</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /reset/i });
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('should render button type="button" by default in dark mode', () => {
      renderWithTheme(<Button>Button</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /button/i });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render button type="submit" in dark mode', () => {
      renderWithTheme(<Button type="submit">Submit</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render button type="reset" in dark mode', () => {
      renderWithTheme(<Button type="reset">Reset</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /reset/i });
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className in light mode', () => {
      renderWithTheme(<Button className="custom-class">Custom</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /custom/i });
      expect(button.className).toContain('custom-class');
    });

    it('should apply custom className in dark mode', () => {
      renderWithTheme(<Button className="custom-class">Custom</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /custom/i });
      expect(button.className).toContain('custom-class');
    });

    it('should preserve default classes when custom className is added in light mode', () => {
      renderWithTheme(
        <Button variant="primary" size="lg" className="custom-class">Custom</Button>,
        'light'
      );
      
      const button = screen.getByRole('button', { name: /custom/i });
      expect(button.className).toContain('button');
      expect(button.className).toContain('primary');
      expect(button.className).toContain('lg');
      expect(button.className).toContain('custom-class');
    });

    it('should preserve default classes when custom className is added in dark mode', () => {
      renderWithTheme(
        <Button variant="primary" size="lg" className="custom-class">Custom</Button>,
        'dark'
      );
      
      const button = screen.getByRole('button', { name: /custom/i });
      expect(button.className).toContain('button');
      expect(button.className).toContain('primary');
      expect(button.className).toContain('lg');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Theme-Aware Styling', () => {
    it('should apply theme class to document in light mode', () => {
      renderWithTheme(<Button>Test</Button>, 'light');
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should apply theme class to document in dark mode', () => {
      renderWithTheme(<Button>Test</Button>, 'dark');
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should render all variants correctly in light mode', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
      
      variants.forEach((variant) => {
        const { unmount } = renderWithTheme(
          <Button variant={variant}>{variant}</Button>,
          'light'
        );
        
        const button = screen.getByRole('button', { name: new RegExp(variant, 'i') });
        expect(button).toBeInTheDocument();
        expect(button.className).toContain(variant);
        
        unmount();
      });
    });

    it('should render all variants correctly in dark mode', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
      
      variants.forEach((variant) => {
        const { unmount } = renderWithTheme(
          <Button variant={variant}>{variant}</Button>,
          'dark'
        );
        
        const button = screen.getByRole('button', { name: new RegExp(variant, 'i') });
        expect(button).toBeInTheDocument();
        expect(button.className).toContain(variant);
        
        unmount();
      });
    });

    it('should render all sizes correctly in light mode', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach((size) => {
        const { unmount } = renderWithTheme(
          <Button size={size}>{size}</Button>,
          'light'
        );
        
        const button = screen.getByRole('button', { name: new RegExp(size, 'i') });
        expect(button).toBeInTheDocument();
        expect(button.className).toContain(size);
        
        unmount();
      });
    });

    it('should render all sizes correctly in dark mode', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach((size) => {
        const { unmount } = renderWithTheme(
          <Button size={size}>{size}</Button>,
          'dark'
        );
        
        const button = screen.getByRole('button', { name: new RegExp(size, 'i') });
        expect(button).toBeInTheDocument();
        expect(button.className).toContain(size);
        
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible in light mode', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Accessible</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /accessible/i });
      button.focus();
      
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible in dark mode', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(<Button onClick={handleClick}>Accessible</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /accessible/i });
      button.focus();
      
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not be focusable when disabled in light mode', () => {
      renderWithTheme(<Button disabled>Disabled</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
    });

    it('should not be focusable when disabled in dark mode', () => {
      renderWithTheme(<Button disabled>Disabled</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Combined Props', () => {
    it('should handle multiple props correctly in light mode', () => {
      const handleClick = vi.fn();
      const icon = <span data-testid="test-icon">★</span>;
      
      renderWithTheme(
        <Button
          variant="primary"
          size="lg"
          icon={icon}
          onClick={handleClick}
          className="custom-class"
        >
          Combined
        </Button>,
        'light'
      );
      
      const button = screen.getByRole('button', { name: /combined/i });
      const iconElement = screen.getByTestId('test-icon');
      
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('primary');
      expect(button.className).toContain('lg');
      expect(button.className).toContain('custom-class');
      expect(iconElement).toBeInTheDocument();
    });

    it('should handle multiple props correctly in dark mode', () => {
      const handleClick = vi.fn();
      const icon = <span data-testid="test-icon">★</span>;
      
      renderWithTheme(
        <Button
          variant="secondary"
          size="sm"
          icon={icon}
          onClick={handleClick}
          className="custom-class"
        >
          Combined
        </Button>,
        'dark'
      );
      
      const button = screen.getByRole('button', { name: /combined/i });
      const iconElement = screen.getByTestId('test-icon');
      
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('secondary');
      expect(button.className).toContain('sm');
      expect(button.className).toContain('custom-class');
      expect(iconElement).toBeInTheDocument();
    });

    it('should prioritize disabled over loading in light mode', () => {
      renderWithTheme(<Button disabled loading>Both States</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /both states/i });
      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled');
      expect(button.className).toContain('loading');
    });

    it('should prioritize disabled over loading in dark mode', () => {
      renderWithTheme(<Button disabled loading>Both States</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /both states/i });
      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled');
      expect(button.className).toContain('loading');
    });
  });
});

/**
 * Button Component - New Variants Tests
 * 
 * Tests for the newly added success and warning variants,
 * and the new size names (small, medium, large).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Button from './Button';

// Helper function to render Button with ThemeProvider
const renderWithTheme = (ui, theme = 'light') => {
  localStorage.setItem('theme', theme);
  
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Button Component - New Variants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Success Variant', () => {
    it('should render success variant in light mode', () => {
      renderWithTheme(<Button variant="success">Success</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /success/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('success');
    });

    it('should render success variant in dark mode', () => {
      renderWithTheme(<Button variant="success">Success</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /success/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('success');
    });
  });

  describe('Warning Variant', () => {
    it('should render warning variant in light mode', () => {
      renderWithTheme(<Button variant="warning">Warning</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /warning/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('warning');
    });

    it('should render warning variant in dark mode', () => {
      renderWithTheme(<Button variant="warning">Warning</Button>, 'dark');
      
      const button = screen.getByRole('button', { name: /warning/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('warning');
    });
  });

  describe('New Size Names', () => {
    it('should render small size button', () => {
      renderWithTheme(<Button size="small">Small</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('small');
    });

    it('should render medium size button', () => {
      renderWithTheme(<Button size="medium">Medium</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /medium/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('medium');
    });

    it('should render large size button', () => {
      renderWithTheme(<Button size="large">Large</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('large');
    });
  });

  describe('Icon Position', () => {
    it('should render icon on the left by default', () => {
      const icon = <span data-testid="test-icon">★</span>;
      renderWithTheme(<Button icon={icon}>With Icon</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /with icon/i });
      const iconElement = screen.getByTestId('test-icon');
      
      expect(button).toBeInTheDocument();
      expect(iconElement).toBeInTheDocument();
      
      // Icon should come before the label in the DOM
      const children = Array.from(button.children);
      const iconIndex = children.findIndex(child => child.contains(iconElement));
      const labelIndex = children.findIndex(child => child.textContent === 'With Icon');
      
      expect(iconIndex).toBeLessThan(labelIndex);
    });

    it('should render icon on the right when iconPosition is "right"', () => {
      const icon = <span data-testid="test-icon">★</span>;
      renderWithTheme(<Button icon={icon} iconPosition="right">With Icon</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /with icon/i });
      const iconElement = screen.getByTestId('test-icon');
      
      expect(button).toBeInTheDocument();
      expect(iconElement).toBeInTheDocument();
      
      // Icon should come after the label in the DOM
      const children = Array.from(button.children);
      const iconIndex = children.findIndex(child => child.contains(iconElement));
      const labelIndex = children.findIndex(child => child.textContent === 'With Icon');
      
      expect(iconIndex).toBeGreaterThan(labelIndex);
    });
  });

  describe('Full Width', () => {
    it('should render full width button', () => {
      renderWithTheme(<Button fullWidth>Full Width</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /full width/i });
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('fullWidth');
    });
  });

  describe('ARIA Label', () => {
    it('should apply aria-label attribute', () => {
      renderWithTheme(<Button ariaLabel="Custom ARIA Label">Button</Button>, 'light');
      
      const button = screen.getByRole('button', { name: /custom aria label/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Custom ARIA Label');
    });
  });

  describe('All Variants Rendering', () => {
    it('should render all variants correctly', () => {
      const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'];
      
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
  });
});

/**
 * LoadingSpinner Component Tests
 * 
 * Tests for LoadingSpinner component rendering and functionality.
 * Verifies all sizes, colors, states, and accessibility features.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('should render spinner with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render spinner with custom aria label', () => {
      render(<LoadingSpinner ariaLabel="Loading data" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading data');
    });

    it('should have aria-busy attribute', () => {
      const { container } = render(<LoadingSpinner />);
      
      const wrapper = container.querySelector('[aria-busy="true"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have aria-live attribute', () => {
      const { container } = render(<LoadingSpinner />);
      
      const wrapper = container.querySelector('[aria-live="polite"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render screen reader text', () => {
      render(<LoadingSpinner ariaLabel="Loading content" />);
      
      const srText = screen.getByText('Loading content...');
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size spinner', () => {
      const { container } = render(<LoadingSpinner size="small" />);
      
      const spinner = container.querySelector('.sm');
      expect(spinner).toBeInTheDocument();
    });

    it('should render medium size spinner (default)', () => {
      const { container } = render(<LoadingSpinner size="medium" />);
      
      const spinner = container.querySelector('.md');
      expect(spinner).toBeInTheDocument();
    });

    it('should render large size spinner', () => {
      const { container } = render(<LoadingSpinner size="large" />);
      
      const spinner = container.querySelector('.lg');
      expect(spinner).toBeInTheDocument();
    });

    it('should default to medium size when no size prop provided', () => {
      const { container } = render(<LoadingSpinner />);
      
      const spinner = container.querySelector('.md');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('should apply custom color to spinner', () => {
      const { container } = render(<LoadingSpinner color="#ff0000" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveStyle({ borderTopColor: '#ff0000' });
    });

    it('should apply CSS variable as color', () => {
      const { container } = render(<LoadingSpinner color="var(--color-primary)" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveStyle({ borderTopColor: 'var(--color-primary)' });
    });

    it('should use default color when no color prop provided', () => {
      const { container } = render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).not.toHaveStyle({ borderTopColor: expect.anything() });
    });
  });

  describe('Loading Message', () => {
    it('should render loading message when provided', () => {
      render(<LoadingSpinner message="Loading data..." />);
      
      const message = screen.getByText('Loading data...');
      expect(message).toBeInTheDocument();
    });

    it('should not render message when not provided', () => {
      const { container } = render(<LoadingSpinner />);
      
      const message = container.querySelector('.message');
      expect(message).not.toBeInTheDocument();
    });

    it('should render message with different sizes', () => {
      const sizes = ['small', 'medium', 'large'];
      
      sizes.forEach((size) => {
        const { unmount } = render(
          <LoadingSpinner size={size} message="Loading..." />
        );
        
        const message = screen.getByText('Loading...');
        expect(message).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Full Screen Mode', () => {
    it('should render full screen overlay when fullScreen is true', () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      
      const overlay = container.querySelector('.fullScreenOverlay');
      expect(overlay).toBeInTheDocument();
    });

    it('should not render overlay when fullScreen is false', () => {
      const { container } = render(<LoadingSpinner fullScreen={false} />);
      
      const overlay = container.querySelector('.fullScreenOverlay');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should have dialog role when in full screen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      
      const overlay = container.querySelector('[role="dialog"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should have aria-modal attribute when in full screen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      
      const overlay = container.querySelector('[aria-modal="true"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should render message in full screen mode', () => {
      render(<LoadingSpinner fullScreen message="Loading application..." />);
      
      const message = screen.getByText('Loading application...');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to spinner', () => {
      const { container } = render(<LoadingSpinner className="custom-spinner" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner.className).toContain('custom-spinner');
    });

    it('should preserve default classes when custom className is added', () => {
      const { container } = render(
        <LoadingSpinner size="large" className="custom-spinner" />
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner.className).toContain('spinner');
      expect(spinner.className).toContain('lg');
      expect(spinner.className).toContain('custom-spinner');
    });
  });

  describe('Combined Props', () => {
    it('should handle all props together', () => {
      const { container } = render(
        <LoadingSpinner
          size="large"
          color="#00ff00"
          message="Loading..."
          ariaLabel="Loading content"
          className="custom-class"
        />
      );
      
      const spinner = screen.getByRole('status');
      const message = screen.getByText('Loading...');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading content');
      expect(spinner).toHaveStyle({ borderTopColor: '#00ff00' });
      expect(spinner.className).toContain('lg');
      expect(spinner.className).toContain('custom-class');
      expect(message).toBeInTheDocument();
    });

    it('should handle full screen with all props', () => {
      const { container } = render(
        <LoadingSpinner
          fullScreen
          size="large"
          color="#ff00ff"
          message="Loading application..."
          ariaLabel="Loading app"
        />
      );
      
      const overlay = container.querySelector('.fullScreenOverlay');
      const spinner = screen.getByRole('status');
      const message = screen.getByText('Loading application...');
      
      expect(overlay).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading app');
      expect(spinner).toHaveStyle({ borderTopColor: '#ff00ff' });
      expect(message).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for screen readers', () => {
      const { container } = render(<LoadingSpinner ariaLabel="Loading data" />);
      
      const wrapper = container.querySelector('[aria-busy="true"]');
      const spinner = screen.getByRole('status');
      
      expect(wrapper).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading data');
    });

    it('should announce loading state to screen readers', () => {
      const { container } = render(<LoadingSpinner />);
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should have screen reader only text', () => {
      render(<LoadingSpinner ariaLabel="Loading" />);
      
      const srText = screen.getByText('Loading...');
      expect(srText).toBeInTheDocument();
      expect(srText.className).toContain('srOnly');
    });

    it('should be accessible in full screen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen ariaLabel="Loading" />);
      
      const dialog = container.querySelector('[role="dialog"]');
      const modal = container.querySelector('[aria-modal="true"]');
      const spinner = screen.getByRole('status');
      
      expect(dialog).toBeInTheDocument();
      expect(modal).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('RTL Support', () => {
    it('should support RTL layout', () => {
      const { container } = render(
        <div dir="rtl">
          <LoadingSpinner />
        </div>
      );
      
      const wrapper = container.querySelector('[dir="rtl"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render correctly in RTL with message', () => {
      const { container } = render(
        <div dir="rtl">
          <LoadingSpinner message="جاري التحميل..." />
        </div>
      );
      
      const message = screen.getByText('جاري التحميل...');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have spinner element with animation class', () => {
      const { container } = render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner.className).toContain('spinner');
    });

    it('should animate in all sizes', () => {
      const sizes = ['small', 'medium', 'large'];
      
      sizes.forEach((size) => {
        const { container, unmount } = render(<LoadingSpinner size={size} />);
        
        const spinner = screen.getByRole('status');
        expect(spinner.className).toContain('spinner');
        
        unmount();
      });
    });
  });
});

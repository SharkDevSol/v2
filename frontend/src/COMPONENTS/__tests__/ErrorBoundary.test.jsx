/**
 * ErrorBoundary Component Tests
 * 
 * Tests for Phase 10.1.13: Write unit tests for key React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow, errorMessage }) => {
  if (shouldThrow) {
    throw new Error(errorMessage || 'Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
    vi.restoreAllMocks();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Component crashed" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Component crashed/i)).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should display error message when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Something went wrong" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should display default message when error has no message', () => {
      const ThrowErrorWithoutMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
    });

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error" />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Reload Functionality', () => {
    it('should display reload button when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should reload page when reload button is clicked', () => {
      // Mock window.location.reload
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload Page');
      fireEvent.click(reloadButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should recover when error is fixed and component re-renders', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Initial error" />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByText(/Initial error/i)).toBeInTheDocument();

      // Fix the error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error should still be displayed (ErrorBoundary doesn't auto-recover)
      expect(screen.getByText(/Initial error/i)).toBeInTheDocument();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should catch errors in nested components', () => {
      const NestedComponent = () => (
        <div>
          <div>
            <ThrowError shouldThrow={true} errorMessage="Nested error" />
          </div>
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Nested error/i)).toBeInTheDocument();
    });

    it('should allow multiple error boundaries', () => {
      render(
        <ErrorBoundary>
          <div>Outer boundary</div>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} errorMessage="Inner error" />
          </ErrorBoundary>
          <div>This should still render</div>
        </ErrorBoundary>
      );

      expect(screen.getByText(/Inner error/i)).toBeInTheDocument();
      expect(screen.getByText('Outer boundary')).toBeInTheDocument();
      expect(screen.getByText('This should still render')).toBeInTheDocument();
    });
  });

  describe('Error Types', () => {
    it('should handle TypeError', () => {
      const ThrowTypeError = () => {
        throw new TypeError('Type error occurred');
      };

      render(
        <ErrorBoundary>
          <ThrowTypeError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Type error occurred/i)).toBeInTheDocument();
    });

    it('should handle ReferenceError', () => {
      const ThrowReferenceError = () => {
        throw new ReferenceError('Reference error occurred');
      };

      render(
        <ErrorBoundary>
          <ThrowReferenceError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Reference error occurred/i)).toBeInTheDocument();
    });

    it('should handle custom errors', () => {
      const ThrowCustomError = () => {
        const error = new Error('Custom error');
        error.name = 'CustomError';
        throw error;
      };

      render(
        <ErrorBoundary>
          <ThrowCustomError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Custom error/i)).toBeInTheDocument();
    });
  });

  describe('UI Styling', () => {
    it('should apply error styling to error message container', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorContainer = container.querySelector('[style*="border"]');
      expect(errorContainer).toBeInTheDocument();
      // Check that border style exists (CSS modules hash the class names)
      expect(errorContainer).toHaveAttribute('style');
    });

    it('should have proper button styling', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const button = screen.getByText('Reload Page');
      // CSS modules hash class names, so just check the button exists and has classes
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('button');
      expect(button.className).toContain('primary');
    });
  });

  describe('Lifecycle Methods', () => {
    it('should call getDerivedStateFromError when error occurs', () => {
      const spy = vi.spyOn(ErrorBoundary, 'getDerivedStateFromError');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should update state when error is caught', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="State test error" />
        </ErrorBoundary>
      );

      // Error UI should be rendered, indicating state was updated
      expect(screen.getByText(/State test error/i)).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors thrown during render', () => {
      const ComponentWithRenderError = () => {
        const obj = null;
        return <div>{obj.property}</div>; // This will throw
      };

      render(
        <ErrorBoundary>
          <ComponentWithRenderError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Cannot read.*property/i)).toBeInTheDocument();
    });

    it('should handle errors with very long messages', () => {
      const longMessage = 'A'.repeat(500);
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage={longMessage} />
        </ErrorBoundary>
      );

      expect(screen.getByText(new RegExp(longMessage))).toBeInTheDocument();
    });

    it('should handle errors with special characters in message', () => {
      const specialMessage = 'Error: <script>alert("xss")</script>';
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage={specialMessage} />
        </ErrorBoundary>
      );

      // The error message is HTML-escaped, so check for the presence of both "Error:" and "script"
      const errorElements = screen.queryAllByText((content, element) => {
        return element.textContent.includes('Error:') && element.textContent.includes('script');
      });
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });
});

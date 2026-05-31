/**
 * Toast Component Tests
 * 
 * Tests for Toast notification component rendering in light and dark themes.
 * Verifies all Toast variants, positions, auto-dismiss, animations, and accessibility.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Toast from './Toast';
import ToastContainer from './ToastContainer';
import { useToast } from './useToast';
import { act } from 'react';

// Helper function to render Toast with ThemeProvider
const renderWithTheme = (ui, theme = 'light') => {
  // Set initial theme in localStorage
  localStorage.setItem('theme', theme);
  
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering in Light Mode', () => {
    it('should render toast with default props in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Test message');
    });

    it('should render success toast in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Success message" type="success" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Success message');
    });

    it('should render error toast in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Error message" type="error" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Error message');
    });

    it('should render warning toast in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Warning message" type="warning" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Warning message');
    });

    it('should render info toast in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Info message" type="info" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Info message');
    });
  });

  describe('Rendering in Dark Mode', () => {
    it('should render toast with default props in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Test message');
    });

    it('should render success toast in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Success message" type="success" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Success message');
    });

    it('should render error toast in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Error message" type="error" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Error message');
    });

    it('should render warning toast in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Warning message" type="warning" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Warning message');
    });

    it('should render info toast in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Info message" type="info" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Info message');
    });
  });

  describe('Close Button', () => {
    it('should render close button by default in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'light'
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render close button by default in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'dark'
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" showCloseButton={false} onClose={onClose} />,
        'light'
      );
      
      const closeButton = screen.queryByRole('button', { name: /close notification/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" showCloseButton={false} onClose={onClose} />,
        'dark'
      );
      
      const closeButton = screen.queryByRole('button', { name: /close notification/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked in light mode', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const onClose = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Toast id="1" message="Test message" duration={0} onClose={onClose} />,
        'light'
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);
      
      // Wait for exit animation
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledWith('1');
      }, { timeout: 1000 });
      
      vi.useFakeTimers(); // Restore fake timers
    });

    it('should call onClose when close button is clicked in dark mode', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const onClose = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Toast id="1" message="Test message" duration={0} onClose={onClose} />,
        'dark'
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);
      
      // Wait for exit animation
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledWith('1');
      }, { timeout: 1000 });
      
      vi.useFakeTimers(); // Restore fake timers
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after duration in light mode', () => {
      const onClose = vi.fn();
      
      renderWithTheme(
        <Toast id="1" message="Test message" duration={3000} onClose={onClose} />,
        'light'
      );
      
      expect(onClose).not.toHaveBeenCalled();
      
      // Fast-forward time by 3000ms + 300ms for exit animation
      act(() => {
        vi.advanceTimersByTime(3300);
      });
      
      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('should auto-dismiss after duration in dark mode', () => {
      const onClose = vi.fn();
      
      renderWithTheme(
        <Toast id="1" message="Test message" duration={3000} onClose={onClose} />,
        'dark'
      );
      
      expect(onClose).not.toHaveBeenCalled();
      
      // Fast-forward time by 3000ms + 300ms for exit animation
      act(() => {
        vi.advanceTimersByTime(3300);
      });
      
      expect(onClose).toHaveBeenCalledWith('1');
    });

    it('should not auto-dismiss when duration is 0 in light mode', () => {
      const onClose = vi.fn();
      
      renderWithTheme(
        <Toast id="1" message="Test message" duration={0} onClose={onClose} />,
        'light'
      );
      
      // Fast-forward time significantly
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not auto-dismiss when duration is 0 in dark mode', () => {
      const onClose = vi.fn();
      
      renderWithTheme(
        <Toast id="1" message="Test message" duration={0} onClose={onClose} />,
        'dark'
      );
      
      // Fast-forward time significantly
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
    });

    it('should have role="alert" in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
    });

    it('should have aria-live="assertive" in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-live="assertive" in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-atomic="true" in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have aria-atomic="true" in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have accessible close button label in light mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'light'
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });

    it('should have accessible close button label in dark mode', () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Toast id="1" message="Test message" onClose={onClose} />,
        'dark'
      );
      
      const closeButton = screen.getByRole('button', { name: /close notification/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });
  });

  describe('Icons', () => {
    it('should render success icon for success type in light mode', () => {
      const onClose = vi.fn();
      const { container } = renderWithTheme(
        <Toast id="1" message="Success" type="success" onClose={onClose} />,
        'light'
      );
      
      // Check for icon container
      const iconContainer = container.querySelector('[class*="icon"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render error icon for error type in light mode', () => {
      const onClose = vi.fn();
      const { container } = renderWithTheme(
        <Toast id="1" message="Error" type="error" onClose={onClose} />,
        'light'
      );
      
      // Check for icon container
      const iconContainer = container.querySelector('[class*="icon"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render warning icon for warning type in light mode', () => {
      const onClose = vi.fn();
      const { container } = renderWithTheme(
        <Toast id="1" message="Warning" type="warning" onClose={onClose} />,
        'light'
      );
      
      // Check for icon container
      const iconContainer = container.querySelector('[class*="icon"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render info icon for info type in light mode', () => {
      const onClose = vi.fn();
      const { container } = renderWithTheme(
        <Toast id="1" message="Info" type="info" onClose={onClose} />,
        'light'
      );
      
      // Check for icon container
      const iconContainer = container.querySelector('[class*="icon"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});

describe('ToastContainer Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render nothing when toasts array is empty in light mode', () => {
      const onRemove = vi.fn();
      const { container } = renderWithTheme(
        <ToastContainer toasts={[]} onRemove={onRemove} />,
        'light'
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when toasts array is empty in dark mode', () => {
      const onRemove = vi.fn();
      const { container } = renderWithTheme(
        <ToastContainer toasts={[]} onRemove={onRemove} />,
        'dark'
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render single toast in light mode', () => {
      const onRemove = vi.fn();
      const toasts = [
        { id: '1', message: 'Test message', type: 'info', duration: 5000, showCloseButton: true }
      ];
      
      renderWithTheme(
        <ToastContainer toasts={toasts} onRemove={onRemove} position="top-right" />,
        'light'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Test message');
    });

    it('should render single toast in dark mode', () => {
      const onRemove = vi.fn();
      const toasts = [
        { id: '1', message: 'Test message', type: 'info', duration: 5000, showCloseButton: true }
      ];
      
      renderWithTheme(
        <ToastContainer toasts={toasts} onRemove={onRemove} position="top-right" />,
        'dark'
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Test message');
    });

    it('should render multiple toasts in light mode', () => {
      const onRemove = vi.fn();
      const toasts = [
        { id: '1', message: 'First message', type: 'info', duration: 5000, showCloseButton: true },
        { id: '2', message: 'Second message', type: 'success', duration: 5000, showCloseButton: true },
        { id: '3', message: 'Third message', type: 'error', duration: 5000, showCloseButton: true }
      ];
      
      renderWithTheme(
        <ToastContainer toasts={toasts} onRemove={onRemove} position="top-right" />,
        'light'
      );
      
      const toastElements = screen.getAllByRole('alert');
      expect(toastElements).toHaveLength(3);
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText('Third message')).toBeInTheDocument();
    });

    it('should render multiple toasts in dark mode', () => {
      const onRemove = vi.fn();
      const toasts = [
        { id: '1', message: 'First message', type: 'info', duration: 5000, showCloseButton: true },
        { id: '2', message: 'Second message', type: 'success', duration: 5000, showCloseButton: true },
        { id: '3', message: 'Third message', type: 'error', duration: 5000, showCloseButton: true }
      ];
      
      renderWithTheme(
        <ToastContainer toasts={toasts} onRemove={onRemove} position="top-right" />,
        'dark'
      );
      
      const toastElements = screen.getAllByRole('alert');
      expect(toastElements).toHaveLength(3);
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText('Third message')).toBeInTheDocument();
    });
  });

  describe('Positions', () => {
    const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];
    
    positions.forEach((position) => {
      it(`should render with ${position} position in light mode`, () => {
        const onRemove = vi.fn();
        const toasts = [
          { id: '1', message: 'Test message', type: 'info', duration: 5000, showCloseButton: true }
        ];
        
        renderWithTheme(
          <ToastContainer toasts={toasts} onRemove={onRemove} position={position} />,
          'light'
        );
        
        // ToastContainer uses portal to document.body
        const toastContainer = document.body.querySelector('[class*="toastContainer"]');
        expect(toastContainer).toBeInTheDocument();
        expect(toastContainer.className).toContain(`container-${position}`);
      });

      it(`should render with ${position} position in dark mode`, () => {
        const onRemove = vi.fn();
        const toasts = [
          { id: '1', message: 'Test message', type: 'info', duration: 5000, showCloseButton: true }
        ];
        
        renderWithTheme(
          <ToastContainer toasts={toasts} onRemove={onRemove} position={position} />,
          'dark'
        );
        
        // ToastContainer uses portal to document.body
        const toastContainer = document.body.querySelector('[class*="toastContainer"]');
        expect(toastContainer).toBeInTheDocument();
        expect(toastContainer.className).toContain(`container-${position}`);
      });
    });
  });
});

describe('useToast Hook', () => {
  // Test component to use the hook
  const TestComponent = ({ onToastsChange }) => {
    const toast = useToast();
    
    // Expose toasts to parent for testing
    React.useEffect(() => {
      if (onToastsChange) {
        onToastsChange(toast.toasts);
      }
    }, [toast.toasts, onToastsChange]);
    
    return (
      <div>
        <button onClick={() => toast.success('Success message')}>Success</button>
        <button onClick={() => toast.error('Error message')}>Error</button>
        <button onClick={() => toast.warning('Warning message')}>Warning</button>
        <button onClick={() => toast.info('Info message')}>Info</button>
        <button onClick={() => toast.clearToasts()}>Clear</button>
        <ToastContainer 
          toasts={toast.toasts} 
          onRemove={toast.removeToast}
          position={toast.position}
        />
      </div>
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should add success toast', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(<TestComponent />, 'light');
    
    const successButton = screen.getByRole('button', { name: /success/i });
    await user.click(successButton);
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('should add error toast', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(<TestComponent />, 'light');
    
    const errorButton = screen.getByRole('button', { name: /error/i });
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('should add warning toast', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(<TestComponent />, 'light');
    
    const warningButton = screen.getByRole('button', { name: /warning/i });
    await user.click(warningButton);
    
    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });

  it('should add info toast', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(<TestComponent />, 'light');
    
    const infoButton = screen.getByRole('button', { name: /info/i });
    await user.click(infoButton);
    
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  it('should clear all toasts', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(<TestComponent />, 'light');
    
    // Add multiple toasts
    const successButton = screen.getByRole('button', { name: /success/i });
    const errorButton = screen.getByRole('button', { name: /error/i });
    
    await user.click(successButton);
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    // Clear all toasts
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  it('should add multiple toasts', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(<TestComponent />, 'light');
    
    const successButton = screen.getByRole('button', { name: /success/i });
    const errorButton = screen.getByRole('button', { name: /error/i });
    const warningButton = screen.getByRole('button', { name: /warning/i });
    
    await user.click(successButton);
    await user.click(errorButton);
    await user.click(warningButton);
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
    
    const toasts = screen.getAllByRole('alert');
    expect(toasts).toHaveLength(3);
  });
});

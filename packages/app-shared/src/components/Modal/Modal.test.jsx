import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';
import styles from './Modal.module.css';

describe('Modal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  describe('Light Mode', () => {
    beforeEach(() => {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    });

    test('renders modal when isOpen is true in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    test('does not render modal when isOpen is false in light mode', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    test('renders close button by default in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
    });

    test('hides close button when showCloseButton is false in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" showCloseButton={false}>
          Content
        </Modal>
      );

      expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument();
    });

    test('renders footer when provided in light mode', () => {
      const footer = <button>Footer Button</button>;
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" footer={footer}>
          Content
        </Modal>
      );

      expect(screen.getByText('Footer Button')).toBeInTheDocument();
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    });

    test('applies size classes correctly in light mode', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" size="small">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-container')).toHaveClass(styles.small);

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" size="medium">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-container')).toHaveClass(styles.medium);

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" size="large">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-container')).toHaveClass(styles.large);

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" size="full">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-container')).toHaveClass(styles.full);
    });

    test('calls onClose when close button is clicked in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when overlay is clicked in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-overlay'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not close when overlay is clicked if closeOnOverlayClick is false in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnOverlayClick={false}>
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-overlay'));
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('calls onClose when Escape key is pressed in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not close when Escape is pressed if closeOnEscape is false in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnEscape={false}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('locks body scroll when modal is open in light mode', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('unset');
    });

    test('applies custom className in light mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" className="custom-modal">
          Content
        </Modal>
      );

      expect(screen.getByTestId('modal-container')).toHaveClass('custom-modal');
    });

    test('applies ARIA attributes correctly in light mode', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={mockOnClose} 
          title="Test Modal"
          ariaLabel="Custom Modal Label"
          ariaDescribedBy="modal-description"
        >
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-label', 'Custom Modal Label');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    });

    afterEach(() => {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    });

    test('renders modal when isOpen is true in dark mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    test('does not render modal when isOpen is false in dark mode', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    test('renders close button by default in dark mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
    });

    test('renders footer when provided in dark mode', () => {
      const footer = <button>Footer Button</button>;
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" footer={footer}>
          Content
        </Modal>
      );

      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    test('applies size classes correctly in dark mode', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" size="small">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-container')).toHaveClass(styles.small);

      rerender(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" size="large">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-container')).toHaveClass(styles.large);
    });

    test('calls onClose when close button is clicked in dark mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when overlay is clicked in dark mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      fireEvent.click(screen.getByTestId('modal-overlay'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when Escape key is pressed in dark mode', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('locks body scroll when modal is open in dark mode', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('unset');
    });

    test('applies ARIA attributes correctly in dark mode', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={mockOnClose} 
          title="Test Modal"
          ariaLabel="Custom Modal Label"
        >
          Content
        </Modal>
      );

      const modal = screen.getByTestId('modal-container');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-label', 'Custom Modal Label');
    });
  });

  describe('Theme Switching', () => {
    test('maintains functionality when switching from light to dark mode', () => {
      document.documentElement.removeAttribute('data-theme');
      
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();

      // Switch to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      rerender(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
    });

    test('maintains functionality when switching from dark to light mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();

      // Switch to light mode
      document.documentElement.removeAttribute('data-theme');
      rerender(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          Content
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    test('focuses first focusable element when modal opens', async () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      );

      // The close button is the first focusable element in the modal
      await waitFor(() => {
        expect(screen.getByTestId('modal-close-button')).toHaveFocus();
      });
    });

    test('traps focus within modal', async () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <button data-testid="first-button">First</button>
          <button data-testid="second-button">Second</button>
        </Modal>
      );

      const firstButton = screen.getByTestId('first-button');
      const secondButton = screen.getByTestId('second-button');
      const closeButton = screen.getByTestId('modal-close-button');

      // Close button gets focus first (it's the first focusable element)
      await waitFor(() => {
        expect(closeButton).toHaveFocus();
      });

      // Tab forward to first button in body
      await userEvent.tab();
      expect(firstButton).toHaveFocus();

      // Tab to second button
      await userEvent.tab();
      expect(secondButton).toHaveFocus();

      // Tab should wrap back to close button
      await userEvent.tab();
      expect(closeButton).toHaveFocus();

      // Shift+Tab should go backwards to second button
      await userEvent.tab({ shift: true });
      expect(secondButton).toHaveFocus();
    });
  });
});

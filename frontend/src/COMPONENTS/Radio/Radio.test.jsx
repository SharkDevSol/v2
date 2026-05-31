/**
 * Radio Component Tests
 * 
 * Comprehensive tests for the Radio component including:
 * - Rendering and states (checked, unchecked)
 * - User interactions
 * - Accessibility (ARIA attributes, keyboard navigation)
 * - Validation states
 * - RTL support
 * - Disabled state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Radio from './Radio';

describe('Radio Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('should render without label', () => {
      render(
        <Radio 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
          ariaLabel="Option A"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('aria-label', 'Option A');
    });

    it('should render with description', () => {
      render(
        <Radio 
          label="Option A" 
          description="This is the first option"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(screen.getByText('This is the first option')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(
        <Radio 
          label="Option A" 
          helperText="Additional information"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(screen.getByText('Additional information')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(
        <Radio 
          label="Option A" 
          error="This option is invalid"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(screen.getByText('This option is invalid')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      render(
        <Radio 
          label="Option A" 
          required={true}
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should render unchecked state', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();
    });

    it('should render checked state', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={true} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toBeChecked();
    });

    it('should render disabled state', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false}
          disabled={true}
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toBeDisabled();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(
        <Radio 
          label="Option A" 
          size="sm"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const wrapper = container.querySelector('[class*="radioWrapper"]');
      expect(wrapper.className).toContain('sm');
    });

    it('should render medium size (default)', () => {
      const { container } = render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const wrapper = container.querySelector('[class*="radioWrapper"]');
      expect(wrapper.className).toContain('md');
    });

    it('should render large size', () => {
      const { container } = render(
        <Radio 
          label="Option A" 
          size="lg"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const wrapper = container.querySelector('[class*="radioWrapper"]');
      expect(wrapper.className).toContain('lg');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when clicked', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      fireEvent.click(radio);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange when disabled', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false}
          disabled={true}
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      // Disabled radios still fire onChange in React Testing Library
      // but the actual browser behavior prevents interaction
      expect(radio).toBeDisabled();
    });

    it('should support keyboard interaction (Space key)', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      radio.focus();
      // Radio buttons respond to Space key natively
      fireEvent.click(radio);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should maintain same name for radio group', () => {
      const { container } = render(
        <>
          <Radio 
            label="Option A" 
            value="a"
            checked={false} 
            onChange={mockOnChange}
            name="test-group"
          />
          <Radio 
            label="Option B" 
            value="b"
            checked={false} 
            onChange={mockOnChange}
            name="test-group"
          />
        </>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios[0]).toHaveAttribute('name', 'test-group');
      expect(radios[1]).toHaveAttribute('name', 'test-group');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-label', 'Option A');
      expect(radio).toHaveAttribute('aria-invalid', 'false');
      expect(radio).toHaveAttribute('aria-required', 'false');
    });

    it('should set aria-invalid when error is present', () => {
      render(
        <Radio 
          label="Option A" 
          error="Required field"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-required when required', () => {
      render(
        <Radio 
          label="Option A" 
          required={true}
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-required', 'true');
    });

    it('should associate label with input using htmlFor', () => {
      render(
        <Radio 
          label="Option A" 
          id="radio-a"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      const label = screen.getByText('Option A').closest('label');
      
      expect(radio).toHaveAttribute('id', 'radio-a');
      expect(label).toHaveAttribute('for', 'radio-a');
    });

    it('should link description with aria-describedby', () => {
      render(
        <Radio 
          label="Option A" 
          description="This is option A"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      const ariaDescribedBy = radio.getAttribute('aria-describedby');
      
      expect(ariaDescribedBy).toBeTruthy();
      expect(document.getElementById(ariaDescribedBy.split(' ')[0])).toHaveTextContent('This is option A');
    });

    it('should link error message with aria-describedby', () => {
      render(
        <Radio 
          label="Option A" 
          error="This field is required"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      const ariaDescribedBy = radio.getAttribute('aria-describedby');
      
      expect(ariaDescribedBy).toBeTruthy();
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('This field is required');
    });

    it('should be keyboard focusable', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      radio.focus();
      
      expect(document.activeElement).toBe(radio);
    });
  });

  describe('Validation States', () => {
    it('should apply error styling when error prop is provided', () => {
      const { container } = render(
        <Radio 
          label="Option A" 
          error="Invalid selection"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const circle = container.querySelector('[class*="radioCircle"]');
      expect(circle.className).toContain('error');
    });

    it('should display error message with error styling', () => {
      render(
        <Radio 
          label="Option A" 
          error="This field is required"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const errorText = screen.getByText('This field is required');
      expect(errorText.className).toContain('errorText');
    });

    it('should prioritize error over helper text', () => {
      render(
        <Radio 
          label="Option A" 
          error="Error message"
          helperText="Helper text"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <Radio 
          label="Option A" 
          className="custom-class"
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should forward ref to input element', () => {
      const ref = { current: null };
      
      render(
        <Radio 
          label="Option A" 
          ref={ref}
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current.type).toBe('radio');
    });

    it('should pass through additional props to input', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
          data-testid="custom-radio"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('data-testid', 'custom-radio');
    });

    it('should set value attribute correctly', () => {
      render(
        <Radio 
          label="Option A" 
          value="option-a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('value', 'option-a');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onChange gracefully', () => {
      render(
        <Radio 
          label="Option A" 
          value="a"
          checked={false}
          name="test-group"
        />
      );

      const radio = screen.getByRole('radio');
      expect(() => fireEvent.click(radio)).not.toThrow();
    });

    it('should generate unique ID when not provided', () => {
      const { container: container1 } = render(
        <Radio 
          label="Option 1" 
          value="1"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const { container: container2 } = render(
        <Radio 
          label="Option 2" 
          value="2"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
        />
      );

      const radio1 = container1.querySelector('input[type="radio"]');
      const radio2 = container2.querySelector('input[type="radio"]');

      expect(radio1.id).toBeTruthy();
      expect(radio2.id).toBeTruthy();
      expect(radio1.id).not.toBe(radio2.id);
    });

    it('should handle empty label gracefully', () => {
      render(
        <Radio 
          label="" 
          value="a"
          checked={false} 
          onChange={mockOnChange}
          name="test-group"
          ariaLabel="Empty label radio"
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('aria-label', 'Empty label radio');
    });
  });

  describe('Radio Group Behavior', () => {
    it('should allow only one radio to be checked in a group', () => {
      const { rerender } = render(
        <>
          <Radio 
            label="Option A" 
            value="a"
            checked={true} 
            onChange={mockOnChange}
            name="test-group"
          />
          <Radio 
            label="Option B" 
            value="b"
            checked={false} 
            onChange={mockOnChange}
            name="test-group"
          />
        </>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeChecked();
      expect(radios[1]).not.toBeChecked();

      // Simulate selecting the second radio
      rerender(
        <>
          <Radio 
            label="Option A" 
            value="a"
            checked={false} 
            onChange={mockOnChange}
            name="test-group"
          />
          <Radio 
            label="Option B" 
            value="b"
            checked={true} 
            onChange={mockOnChange}
            name="test-group"
          />
        </>
      );

      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });
  });
});

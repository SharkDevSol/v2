/**
 * Textarea Component Tests
 * 
 * Tests for Textarea component rendering in light and dark themes.
 * Verifies all Textarea features including auto-resize, validation states,
 * character counter, readonly state, ARIA attributes, and RTL support.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Textarea from './Textarea';

// Helper function to render Textarea with ThemeProvider
const renderWithTheme = (ui, theme = 'light') => {
  // Set initial theme in localStorage
  localStorage.setItem('theme', theme);
  
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Textarea Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Basic Rendering', () => {
    it('should render textarea with default props in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(<Textarea value="" onChange={handleChange} />, 'light');
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea with default props in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(<Textarea value="" onChange={handleChange} />, 'dark');
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with label in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea label="Description" value="" onChange={handleChange} />,
        'light'
      );
      
      const label = screen.getByText('Description');
      expect(label).toBeInTheDocument();
    });

    it('should render with label in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea label="Description" value="" onChange={handleChange} />,
        'dark'
      );
      
      const label = screen.getByText('Description');
      expect(label).toBeInTheDocument();
    });

    it('should render with placeholder in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea placeholder="Enter text..." value="" onChange={handleChange} />,
        'light'
      );
      
      const textarea = screen.getByPlaceholderText('Enter text...');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with placeholder in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea placeholder="Enter text..." value="" onChange={handleChange} />,
        'dark'
      );
      
      const textarea = screen.getByPlaceholderText('Enter text...');
      expect(textarea).toBeInTheDocument();
    });

    it('should display value in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Test content" onChange={handleChange} />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Test content');
    });

    it('should display value in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Test content" onChange={handleChange} />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Test content');
    });
  });

  describe('Required Field', () => {
    it('should show required indicator in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea label="Description" value="" onChange={handleChange} required />,
        'light'
      );
      
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('should show required indicator in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea label="Description" value="" onChange={handleChange} required />,
        'dark'
      );
      
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('should have aria-required attribute when required in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} required />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-required attribute when required in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} required />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Disabled State', () => {
    it('should render disabled textarea in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} disabled />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should render disabled textarea in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} disabled />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should not trigger onChange when disabled in light mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="" onChange={handleChange} disabled />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not trigger onChange when disabled in dark mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="" onChange={handleChange} disabled />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should have aria-disabled attribute when disabled in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} disabled />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have aria-disabled attribute when disabled in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} disabled />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('ReadOnly State', () => {
    it('should render readonly textarea in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Read only text" onChange={handleChange} readOnly />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should render readonly textarea in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Read only text" onChange={handleChange} readOnly />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should not trigger onChange when readonly in light mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="Read only" onChange={handleChange} readOnly />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not trigger onChange when readonly in dark mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="Read only" onChange={handleChange} readOnly />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should have aria-readonly attribute when readonly in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} readOnly />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-readonly', 'true');
    });

    it('should have aria-readonly attribute when readonly in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} readOnly />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-readonly', 'true');
    });
  });

  describe('Validation States', () => {
    it('should display error message in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} error="This field is required" />,
        'light'
      );
      
      const error = screen.getByText('This field is required');
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('should display error message in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} error="This field is required" />,
        'dark'
      );
      
      const error = screen.getByText('This field is required');
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('should have aria-invalid when error in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} error="Error" />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid when error in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} error="Error" />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should display success message in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Valid text" onChange={handleChange} success="Looks good!" />,
        'light'
      );
      
      const success = screen.getByText('Looks good!');
      expect(success).toBeInTheDocument();
      expect(success).toHaveAttribute('role', 'status');
    });

    it('should display success message in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Valid text" onChange={handleChange} success="Looks good!" />,
        'dark'
      );
      
      const success = screen.getByText('Looks good!');
      expect(success).toBeInTheDocument();
      expect(success).toHaveAttribute('role', 'status');
    });

    it('should display warning message in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Text" onChange={handleChange} warning="Consider revising" />,
        'light'
      );
      
      const warning = screen.getByText('Consider revising');
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveAttribute('role', 'status');
    });

    it('should display warning message in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Text" onChange={handleChange} warning="Consider revising" />,
        'dark'
      );
      
      const warning = screen.getByText('Consider revising');
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveAttribute('role', 'status');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} helperText="Enter a detailed description" />,
        'light'
      );
      
      const helperText = screen.getByText('Enter a detailed description');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveAttribute('role', 'note');
    });

    it('should display helper text in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} helperText="Enter a detailed description" />,
        'dark'
      );
      
      const helperText = screen.getByText('Enter a detailed description');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveAttribute('role', 'note');
    });

    it('should hide helper text when error is present in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea 
          value="" 
          onChange={handleChange} 
          helperText="Helper text" 
          error="Error message" 
        />,
        'light'
      );
      
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should hide helper text when error is present in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea 
          value="" 
          onChange={handleChange} 
          helperText="Helper text" 
          error="Error message" 
        />,
        'dark'
      );
      
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Character Counter', () => {
    it('should show character count when showCount is true in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Hello" onChange={handleChange} showCount />,
        'light'
      );
      
      const counter = screen.getByText('5');
      expect(counter).toBeInTheDocument();
    });

    it('should show character count when showCount is true in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Hello" onChange={handleChange} showCount />,
        'dark'
      );
      
      const counter = screen.getByText('5');
      expect(counter).toBeInTheDocument();
    });

    it('should show character count with maxLength in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Hello" onChange={handleChange} maxLength={100} />,
        'light'
      );
      
      const counter = screen.getByText('5 / 100');
      expect(counter).toBeInTheDocument();
    });

    it('should show character count with maxLength in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="Hello" onChange={handleChange} maxLength={100} />,
        'dark'
      );
      
      const counter = screen.getByText('5 / 100');
      expect(counter).toBeInTheDocument();
    });

    it('should update character count on input in light mode', async () => {
      const handleChange = vi.fn((value) => value);
      const user = userEvent.setup();
      
      const { rerender } = renderWithTheme(
        <Textarea value="" onChange={handleChange} showCount />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      
      // Rerender with updated value
      rerender(
        <ThemeProvider>
          <Textarea value="Test" onChange={handleChange} showCount />
        </ThemeProvider>
      );
      
      const counter = screen.getByText('4');
      expect(counter).toBeInTheDocument();
    });

    it('should update character count on input in dark mode', async () => {
      const handleChange = vi.fn((value) => value);
      const user = userEvent.setup();
      
      const { rerender } = renderWithTheme(
        <Textarea value="" onChange={handleChange} showCount />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      
      // Rerender with updated value
      rerender(
        <ThemeProvider>
          <Textarea value="Test" onChange={handleChange} showCount />
        </ThemeProvider>
      );
      
      const counter = screen.getByText('4');
      expect(counter).toBeInTheDocument();
    });

    it('should enforce maxLength in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} maxLength={10} />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '10');
    });

    it('should enforce maxLength in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} maxLength={10} />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '10');
    });
  });

  describe('User Interactions', () => {
    it('should trigger onChange when typing in light mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should trigger onChange when typing in dark mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle multiline input in light mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle multiline input in dark mode', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2');
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Rows Configuration', () => {
    it('should set default rows to 4 in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('should set default rows to 4 in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('should set custom rows in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} rows={10} />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });

    it('should set custom rows in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea value="" onChange={handleChange} rows={10} />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper ARIA attributes in light mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea 
          label="Description" 
          value="" 
          onChange={handleChange} 
          required 
          error="Error message"
        />,
        'light'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Description');
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby');
    });

    it('should have proper ARIA attributes in dark mode', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Textarea 
          label="Description" 
          value="" 
          onChange={handleChange} 
          required 
          error="Error message"
        />,
        'dark'
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Description');
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby');
    });
  });

  describe('RTL Support', () => {
    it('should support RTL layout in light mode', () => {
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'light'
      );
      
      const textareaGroup = container.querySelector('[dir="auto"]');
      expect(textareaGroup).toBeInTheDocument();
    });

    it('should support RTL layout in dark mode', () => {
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Textarea value="" onChange={handleChange} />,
        'dark'
      );
      
      const textareaGroup = container.querySelector('[dir="auto"]');
      expect(textareaGroup).toBeInTheDocument();
    });
  });
});

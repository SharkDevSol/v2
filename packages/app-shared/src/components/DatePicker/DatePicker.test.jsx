import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePicker from './DatePicker';

describe('DatePicker Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render with label', () => {
      render(
        <DatePicker
          label="Select Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Select Date')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <DatePicker
          placeholder="Choose a date"
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText('Choose a date')).toBeInTheDocument();
    });

    it('should render with required indicator', () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          error="Date is required"
        />
      );

      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('should open calendar when input is clicked', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should display selected date in input', () => {
      const selectedDate = new Date(2024, 0, 15); // Jan 15, 2024

      render(
        <DatePicker
          label="Date"
          value={selectedDate}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input.value).toBe('15/01/2024');
    });

    it('should call onChange when date is selected', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      // Wait for calendar to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click on a date (find first enabled day button)
      const dayButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent && !btn.disabled && /^\d+$/.test(btn.textContent)
      );
      
      if (dayButtons.length > 0) {
        await userEvent.click(dayButtons[0]);
        expect(mockOnChange).toHaveBeenCalled();
      }
    });

    it('should close calendar after date selection', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click on a date
      const dayButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent && !btn.disabled && /^\d+$/.test(btn.textContent)
      );
      
      if (dayButtons.length > 0) {
        await userEvent.click(dayButtons[0]);
        
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Clear Functionality', () => {
    it('should show clear button when date is selected', () => {
      const selectedDate = new Date(2024, 0, 15);

      render(
        <DatePicker
          label="Date"
          value={selectedDate}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Clear date')).toBeInTheDocument();
    });

    it('should not show clear button when no date is selected', () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByLabelText('Clear date')).not.toBeInTheDocument();
    });

    it('should call onChange with null when clear button is clicked', async () => {
      const selectedDate = new Date(2024, 0, 15);

      render(
        <DatePicker
          label="Date"
          value={selectedDate}
          onChange={mockOnChange}
        />
      );

      const clearButton = screen.getByLabelText('Clear date');
      await userEvent.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Disabled State', () => {
    it('should not open calendar when disabled', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          disabled
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not show clear button when disabled', () => {
      const selectedDate = new Date(2024, 0, 15);

      render(
        <DatePicker
          label="Date"
          value={selectedDate}
          onChange={mockOnChange}
          disabled
        />
      );

      expect(screen.queryByLabelText('Clear date')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open calendar when Enter is pressed', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      input.focus();
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should close calendar when Escape is pressed', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Ethiopian Calendar', () => {
    it('should display Ethiopian date format when calendarType is ethiopian', () => {
      const selectedDate = new Date(2024, 0, 15); // Jan 15, 2024

      render(
        <DatePicker
          label="Date"
          value={selectedDate}
          onChange={mockOnChange}
          calendarType="ethiopian"
        />
      );

      const input = screen.getByRole('textbox');
      // Ethiopian date format: day/month/year
      expect(input.value).toMatch(/^\d+\/\d+\/\d+$/);
    });

    it('should render Ethiopian calendar when opened', async () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          calendarType="ethiopian"
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.click(input);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        // Check for Ethiopian month names
        const ethiopianMonths = ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'];
        const hasEthiopianMonth = ethiopianMonths.some(month => 
          dialog.textContent.includes(month)
        );
        expect(hasEthiopianMonth).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          required
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should have aria-invalid when error is present', () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          error="Date is required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with input', () => {
      render(
        <DatePicker
          label="Date"
          value={null}
          onChange={mockOnChange}
          error="Date is required"
        />
      );

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Date is required');
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});

/**
 * BranchCodeInput Component Tests
 * 
 * Tests for Phase 10.1.13: Write unit tests for key React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BranchCodeInput from '../BranchCodeInput';

// Mock fetch
global.fetch = vi.fn();

describe('BranchCodeInput', () => {
  const mockOnChange = vi.fn();
  const mockOnValidate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label and input', () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      expect(screen.getByLabelText(/Branch Code/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i)).toBeInTheDocument();
    });

    it('should display required asterisk', () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display hint text', () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      expect(screen.getByText(/Enter your 3-letter branch code/i)).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should call onChange when user types', async () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.change(input, { target: { value: 'M' } });

      expect(mockOnChange).toHaveBeenCalledWith('M');
    });

    it('should convert input to uppercase', async () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.change(input, { target: { value: 'mai' } });

      expect(mockOnChange).toHaveBeenCalledWith('MAI');
    });

    it('should limit input to 3 characters', async () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      
      // Type 4 characters
      fireEvent.change(input, { target: { value: 'MAIN' } });
      
      // Should only accept first 3
      expect(mockOnChange).toHaveBeenCalledWith('MAI');
    });

    it('should trim whitespace', async () => {
      render(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange} 
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.change(input, { target: { value: ' MAI ' } });

      // Should trim spaces
      expect(mockOnChange).toHaveBeenCalledWith('MAI');
    });
  });

  describe('Validation', () => {
    it('should validate on blur when autoValidate is true', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, databaseName: 'main_branch' })
      });

      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          autoValidate={true}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v2/branches/validate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ branchCode: 'MAI' })
          })
        );
      });
    });

    it('should not validate on blur when autoValidate is false', async () => {
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          autoValidate={false}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should validate on Enter key press', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, databaseName: 'main_branch' })
      });

      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should show validation error for invalid format', async () => {
      render(
        <BranchCodeInput 
          value="AB" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Branch code must be 3 uppercase letters/i)).toBeInTheDocument();
      });

      expect(mockOnValidate).toHaveBeenCalledWith({
        valid: false,
        branchCode: 'AB',
        error: 'Invalid format'
      });
    });

    it('should show success message for valid branch code', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, databaseName: 'main_branch' })
      });

      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/✓ Valid branch: main_branch/i)).toBeInTheDocument();
      });

      expect(mockOnValidate).toHaveBeenCalledWith({
        valid: true,
        branchCode: 'MAI',
        databaseName: 'main_branch'
      });
    });

    it('should show error message for invalid branch code', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ valid: false, message: 'Branch code not found' })
      });

      render(
        <BranchCodeInput 
          value="XYZ" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Branch code not found/i)).toBeInTheDocument();
      });

      expect(mockOnValidate).toHaveBeenCalledWith({
        valid: false,
        branchCode: 'XYZ',
        error: 'Branch code not found'
      });
    });

    it('should handle network errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Failed to validate branch code/i)).toBeInTheDocument();
      });

      expect(mockOnValidate).toHaveBeenCalledWith({
        valid: false,
        branchCode: 'MAI',
        error: 'Network error'
      });
    });
  });

  describe('Clear Functionality', () => {
    it('should show clear button when value is not empty and showClearButton is true', () => {
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          showClearButton={true}
        />
      );

      expect(screen.getByText(/Clear saved branch code/i)).toBeInTheDocument();
    });

    it('should not show clear button when showClearButton is false', () => {
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          showClearButton={false}
        />
      );

      expect(screen.queryByText(/Clear saved branch code/i)).not.toBeInTheDocument();
    });

    it('should clear value and validation when clear button is clicked', async () => {
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          showClearButton={true}
        />
      );

      const clearButton = screen.getByText(/Clear saved branch code/i);
      fireEvent.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(mockOnValidate).toHaveBeenCalledWith({
        valid: false,
        branchCode: '',
        cleared: true
      });
    });

    it('should remove branchCode from localStorage when cleared', async () => {
      localStorage.setItem('branchCode', 'MAI');
      
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          showClearButton={true}
        />
      );

      const clearButton = screen.getByText(/Clear saved branch code/i);
      fireEvent.click(clearButton);

      expect(localStorage.getItem('branchCode')).toBeNull();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      expect(input).toBeDisabled();
    });

    it('should disable clear button when disabled prop is true', () => {
      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
          disabled={true}
          showClearButton={true}
        />
      );

      const clearButton = screen.getByText(/Clear saved branch code/i);
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Validation Status Icons', () => {
    it('should show loading icon while validating', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ valid: true, databaseName: 'main_branch' })
        }), 100))
      );

      render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText(/e.g., MAI, AMA, SOL/i);
      fireEvent.blur(input);

      // Should show validating message
      await waitFor(() => {
        expect(screen.getByText(/Validating branch code.../i)).toBeInTheDocument();
      });
    });

    it('should reset validation status when value changes to empty', () => {
      const { rerender } = render(
        <BranchCodeInput 
          value="MAI" 
          onChange={mockOnChange}
        />
      );

      // Change to empty value
      rerender(
        <BranchCodeInput 
          value="" 
          onChange={mockOnChange}
        />
      );

      // Validation message should not be visible
      expect(screen.queryByText(/✓ Valid branch/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Branch code not found/i)).not.toBeInTheDocument();
    });
  });
});

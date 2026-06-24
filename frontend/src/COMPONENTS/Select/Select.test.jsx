import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';

describe('Select Component', () => {
  const mockOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  const mockGroupedOptions = [
    {
      group: 'Group A',
      options: [
        { value: 'a1', label: 'A Option 1' },
        { value: 'a2', label: 'A Option 2' },
      ],
    },
    {
      group: 'Group B',
      options: [
        { value: 'b1', label: 'B Option 1' },
        { value: 'b2', label: 'B Option 2' },
      ],
    },
  ];

  const mockFlatOptionsWithGroups = [
    { value: '1', label: 'Option 1', group: 'Group A' },
    { value: '2', label: 'Option 2', group: 'Group A' },
    { value: '3', label: 'Option 3', group: 'Group B' },
  ];

  describe('Basic Rendering', () => {
    it('renders with label', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Test Select')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('displays placeholder when no value selected', () => {
      render(
        <Select
          placeholder="Choose an option"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('displays selected option label', () => {
      render(
        <Select
          options={mockOptions}
          value="2"
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(
        <Select
          label="Required Field"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Single Select Mode', () => {
    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('selects option and closes dropdown', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const option = screen.getByText('Option 2');
      await user.click(option);

      expect(handleChange).toHaveBeenCalledWith('2');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Select
            options={mockOptions}
            value=""
            onChange={vi.fn()}
          />
          <button>Outside Button</button>
        </div>
      );

      const selectButton = screen.getByRole('button', { name: /select/i });
      await user.click(selectButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const outsideButton = screen.getByText('Outside Button');
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multi-Select Mode', () => {
    it('allows multiple selections', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value={[]}
          onChange={handleChange}
          multiple
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(handleChange).toHaveBeenCalledWith(['1']);

      const option2 = screen.getByText('Option 2');
      await user.click(option2);

      expect(handleChange).toHaveBeenCalledWith(['2']);
    });

    it('deselects option when clicked again', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value={['1', '2']}
          onChange={handleChange}
          multiple
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(handleChange).toHaveBeenCalledWith(['2']);
    });

    it('displays multiple selected values', () => {
      render(
        <Select
          options={mockOptions}
          value={['1', '2']}
          onChange={vi.fn()}
          multiple
        />
      );

      expect(screen.getByText('Option 1, Option 2')).toBeInTheDocument();
    });

    it('keeps dropdown open in multi-select mode', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value={[]}
          onChange={vi.fn()}
          multiple
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('shows search input when searchable', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          searchable
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('filters options based on search term', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          searchable
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, '2');

      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });

    it('shows "No options found" when search has no results', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          searchable
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'xyz');

      expect(screen.getByText('No options found')).toBeInTheDocument();
    });
  });

  describe('Grouped Options', () => {
    it('renders grouped options with labels', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockGroupedOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.getByText('Group B')).toBeInTheDocument();
      expect(screen.getByText('A Option 1')).toBeInTheDocument();
      expect(screen.getByText('B Option 1')).toBeInTheDocument();
    });

    it('handles flat options with group property', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockFlatOptionsWithGroups}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.getByText('Group B')).toBeInTheDocument();
    });

    it('filters grouped options correctly', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockGroupedOptions}
          value=""
          onChange={vi.fn()}
          searchable
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'A Option 1');

      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.getByText('A Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Group B')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables the select button', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          disabled
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          disabled
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('disables individual options', async () => {
      const user = userEvent.setup();
      const optionsWithDisabled = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2', disabled: true },
        { value: '3', label: 'Option 3' },
      ];

      const handleChange = vi.fn();
      render(
        <Select
          options={optionsWithDisabled}
          value=""
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const disabledOption = screen.getByText('Option 2');
      await user.click(disabledOption);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Validation States', () => {
    it('displays error message', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('displays helper text', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          helperText="Choose one option"
        />
      );

      expect(screen.getByText('Choose one option')).toBeInTheDocument();
    });

    it('prioritizes error over helper text', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          error="Error message"
          helperText="Helper text"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Verify focused state is applied (visual feedback)
      const options = screen.getAllByRole('option');
      expect(options[1].className).toContain('focused');
    });

    it('selects option with Enter key', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Clear Functionality', () => {
    it('shows clear icon when value is selected', () => {
      render(
        <Select
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
        />
      );

      const clearIcon = screen.getByLabelText('Clear selection');
      expect(clearIcon).toBeInTheDocument();
    });

    it('clears single selection', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value="1"
          onChange={handleChange}
        />
      );

      const clearIcon = screen.getByLabelText('Clear selection');
      await user.click(clearIcon);

      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('clears multiple selections', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value={['1', '2']}
          onChange={handleChange}
          multiple
        />
      );

      const clearIcon = screen.getByLabelText('Clear selection');
      await user.click(clearIcon);

      expect(handleChange).toHaveBeenCalledWith([]);
    });

    it('does not show clear icon when disabled', () => {
      render(
        <Select
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
          disabled
        />
      );

      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          required
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-required', 'true');
    });

    it('updates aria-expanded when opened', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with aria-describedby', () => {
      render(
        <Select
          id="test-select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const button = screen.getByRole('button');
      const errorId = button.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });

    it('marks options as selected with aria-selected', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value="2"
          onChange={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const options = screen.getAllByRole('option');
      const selectedOption = options.find(opt => opt.getAttribute('aria-selected') === 'true');
      expect(selectedOption).toHaveTextContent('Option 2');
    });
  });

  describe('RTL Support', () => {
    it('applies dir="auto" attribute', () => {
      const { container } = render(
        <Select
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      const selectGroup = container.firstChild;
      expect(selectGroup).toHaveAttribute('dir', 'auto');
    });
  });
});

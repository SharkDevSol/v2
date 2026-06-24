import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
import { Mail, Search } from 'lucide-react';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders input with label', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders input without label', () => {
      render(
        <Input
          placeholder="Enter text"
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(
        <Input
          placeholder="Enter your email"
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      render(
        <Input
          label="Username"
          value="john_doe"
          onChange={() => {}}
        />
      );
      
      expect(screen.getByDisplayValue('john_doe')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(
        <Input
          label="Name"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(
        <Input
          type="email"
          label="Email"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(
        <Input
          type="password"
          label="Password"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input', () => {
      render(
        <Input
          type="number"
          label="Age"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Age');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders tel input', () => {
      render(
        <Input
          type="tel"
          label="Phone"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Phone');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      render(
        <Input
          type="url"
          label="Website"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Website');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders date input', () => {
      render(
        <Input
          type="date"
          label="Birth Date"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Birth Date');
      expect(input).toHaveAttribute('type', 'date');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('shows password toggle button for password input', () => {
      render(
        <Input
          type="password"
          label="Password"
          value="secret123"
          onChange={() => {}}
        />
      );
      
      expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    });

    it('toggles password visibility when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Input
          type="password"
          label="Password"
          value="secret123"
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Password');
      const toggleButton = screen.getByLabelText('Show password');
      
      // Initially password is hidden
      expect(input).toHaveAttribute('type', 'password');
      
      // Click to show password
      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
      
      // Click to hide password again
      await user.click(screen.getByLabelText('Hide password'));
      expect(input).toHaveAttribute('type', 'password');
    });

    it('does not show toggle button for non-password inputs', () => {
      render(
        <Input
          type="text"
          label="Username"
          value="john"
          onChange={() => {}}
        />
      );
      
      expect(screen.queryByLabelText('Show password')).not.toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <Input
          label="Name"
          value=""
          onChange={handleChange}
        />
      );
      
      const input = screen.getByLabelText('Name');
      await user.type(input, 'John');
      
      expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
      expect(handleChange).toHaveBeenLastCalledWith('n', expect.any(Object));
    });

    it('updates value when controlled', () => {
      const { rerender } = render(
        <Input
          label="Name"
          value="John"
          onChange={() => {}}
        />
      );
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      
      rerender(
        <Input
          label="Name"
          value="Jane"
          onChange={() => {}}
        />
      );
      
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });

    it('respects maxLength attribute', () => {
      render(
        <Input
          label="Code"
          value=""
          onChange={() => {}}
          maxLength={5}
        />
      );
      
      const input = screen.getByLabelText('Code');
      expect(input).toHaveAttribute('maxLength', '5');
    });
  });

  describe('Validation States', () => {
    it('displays error message', () => {
      render(
        <Input
          label="Email"
          value="invalid"
          onChange={() => {}}
          error="Please enter a valid email"
        />
      );
      
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays success message', () => {
      render(
        <Input
          label="Email"
          value="valid@example.com"
          onChange={() => {}}
          success="Email is valid"
        />
      );
      
      expect(screen.getByText('Email is valid')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays warning message', () => {
      render(
        <Input
          label="Password"
          value="weak"
          onChange={() => {}}
          warning="Password is weak"
        />
      );
      
      expect(screen.getByText('Password is weak')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('prioritizes error over success and warning', () => {
      render(
        <Input
          label="Email"
          value="test"
          onChange={() => {}}
          error="Error message"
          success="Success message"
          warning="Warning message"
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      expect(screen.queryByText('Warning message')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('displays helper text', () => {
      render(
        <Input
          label="Password"
          value=""
          onChange={() => {}}
          helperText="Must be at least 8 characters"
        />
      );
      
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('hides helper text when validation message is present', () => {
      render(
        <Input
          label="Email"
          value="invalid"
          onChange={() => {}}
          helperText="Enter your email address"
          error="Invalid email"
        />
      );
      
      expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders prefix icon', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
          prefixIcon={<Mail data-testid="mail-icon" />}
        />
      );
      
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('renders suffix icon', () => {
      render(
        <Input
          label="Search"
          value=""
          onChange={() => {}}
          suffixIcon={<Search data-testid="search-icon" />}
        />
      );
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('renders both prefix and suffix icons', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
          prefixIcon={<Mail data-testid="mail-icon" />}
          suffixIcon={<Search data-testid="search-icon" />}
        />
      );
      
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('password toggle takes precedence over suffix icon', () => {
      render(
        <Input
          type="password"
          label="Password"
          value="secret"
          onChange={() => {}}
          suffixIcon={<Search data-testid="search-icon" />}
        />
      );
      
      expect(screen.getByLabelText('Show password')).toBeInTheDocument();
      expect(screen.queryByTestId('search-icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(
        <Input
          label="Name"
          value="John"
          onChange={() => {}}
          disabled
        />
      );
      
      const input = screen.getByLabelText('Name');
      expect(input).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <Input
          label="Name"
          value=""
          onChange={handleChange}
          disabled
        />
      );
      
      const input = screen.getByLabelText('Name');
      await user.type(input, 'John');
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disables password toggle button when input is disabled', () => {
      render(
        <Input
          type="password"
          label="Password"
          value="secret"
          onChange={() => {}}
          disabled
        />
      );
      
      const toggleButton = screen.getByLabelText('Show password');
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Read-only State', () => {
    it('renders read-only input', () => {
      render(
        <Input
          label="Name"
          value="John"
          onChange={() => {}}
          readOnly
        />
      );
      
      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('readonly');
    });

    it('does not call onChange when read-only', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <Input
          label="Name"
          value="John"
          onChange={handleChange}
          readOnly
        />
      );
      
      const input = screen.getByLabelText('Name');
      await user.type(input, 'Doe');
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Required Field', () => {
    it('shows required indicator', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
          required
        />
      );
      
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('sets required attribute on input', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
          required
        />
      );
      
      const input = screen.getByLabelText('Email');
      expect(input).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
          required
          error="Invalid email"
        />
      );
      
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('associates label with input', () => {
      render(
        <Input
          label="Username"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('uses custom aria-label when provided', () => {
      render(
        <Input
          value=""
          onChange={() => {}}
          ariaLabel="Search for products"
        />
      );
      
      const input = screen.getByLabelText('Search for products');
      expect(input).toBeInTheDocument();
    });

    it('sets aria-describedby for helper text', () => {
      render(
        <Input
          label="Password"
          value=""
          onChange={() => {}}
          helperText="Must be at least 8 characters"
        />
      );
      
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <Input
          label="Email"
          value="invalid"
          onChange={() => {}}
          error="Invalid email"
        />
      );
      
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when no error', () => {
      render(
        <Input
          label="Email"
          value="valid@example.com"
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('AutoComplete', () => {
    it('sets autocomplete attribute', () => {
      render(
        <Input
          label="Email"
          value=""
          onChange={() => {}}
          autoComplete="email"
        />
      );
      
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Custom Props', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null };
      
      render(
        <Input
          ref={ref}
          label="Name"
          value=""
          onChange={() => {}}
        />
      );
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('applies custom className', () => {
      const { container } = render(
        <Input
          label="Name"
          value=""
          onChange={() => {}}
          className="custom-class"
        />
      );
      
      const inputGroup = container.querySelector('.custom-class');
      expect(inputGroup).toBeInTheDocument();
    });

    it('sets custom id', () => {
      render(
        <Input
          id="custom-id"
          label="Name"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('sets name attribute', () => {
      render(
        <Input
          name="username"
          label="Username"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('name', 'username');
    });
  });

  describe('RTL Support', () => {
    it('applies dir="auto" to input group', () => {
      const { container } = render(
        <Input
          label="Name"
          value=""
          onChange={() => {}}
        />
      );
      
      const inputGroup = container.querySelector('[dir="auto"]');
      expect(inputGroup).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(
        <Input
          label="Name"
          value=""
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Name');
      expect(input).toHaveValue('');
    });

    it('handles undefined value', () => {
      render(
        <Input
          label="Name"
          value={undefined}
          onChange={() => {}}
        />
      );
      
      const input = screen.getByLabelText('Name');
      expect(input).toHaveValue('');
    });

    it('handles null onChange', () => {
      render(
        <Input
          label="Name"
          value="John"
          onChange={null}
        />
      );
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });
  });
});

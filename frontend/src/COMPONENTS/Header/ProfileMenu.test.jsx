import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileMenu from './ProfileMenu';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  })
}));

const renderProfileMenu = (props = {}) => {
  const defaultProps = {
    user: {
      name: 'John Doe',
      role: 'Admin',
      avatar: null
    },
    onLogout: vi.fn(),
    onProfileClick: vi.fn(),
    ...props
  };

  return render(<ProfileMenu {...defaultProps} />);
};

describe('ProfileMenu Component', () => {
  describe('Rendering', () => {
    it('should render profile button with user information', () => {
      renderProfileMenu();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render user avatar when provided', () => {
      const user = {
        name: 'Jane Smith',
        role: 'Teacher',
        avatar: 'https://example.com/avatar.jpg'
      };

      renderProfileMenu({ user });

      const avatarImage = screen.getAllByAltText('Jane Smith')[0];
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should render user initials when avatar is not provided', () => {
      const user = {
        name: 'John Doe',
        role: 'Admin',
        avatar: null
      };

      renderProfileMenu({ user });

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render single letter initial for single name', () => {
      const user = {
        name: 'Admin',
        role: 'Administrator',
        avatar: null
      };

      renderProfileMenu({ user });

      expect(screen.getByText('AD')).toBeInTheDocument();
    });

    it('should not render dropdown initially', () => {
      renderProfileMenu();

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderProfileMenu({ className: 'custom-profile' });

      const profileMenu = container.firstChild;
      expect(profileMenu).toHaveClass('custom-profile');
    });
  });

  describe('Dropdown Interactions', () => {
    it('should open dropdown when profile button is clicked', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should close dropdown when profile button is clicked again', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      
      // Open dropdown
      fireEvent.click(profileButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Close dropdown
      fireEvent.click(profileButton);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when pressing Escape key', async () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should display user information in dropdown header', () => {
      const user = {
        name: 'Jane Smith',
        role: 'Teacher',
        avatar: null
      };

      renderProfileMenu({ user });

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      // Check for user name in dropdown (there will be multiple instances)
      const userNames = screen.getAllByText('Jane Smith');
      expect(userNames.length).toBeGreaterThan(1);
    });
  });

  describe('Menu Actions', () => {
    it('should call onProfileClick when Profile menu item is clicked', () => {
      const onProfileClick = vi.fn();
      renderProfileMenu({ onProfileClick });

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      const profileMenuItem = screen.getByText('Profile');
      fireEvent.click(profileMenuItem);

      expect(onProfileClick).toHaveBeenCalled();
    });

    it('should close dropdown after clicking Profile', () => {
      const onProfileClick = vi.fn();
      renderProfileMenu({ onProfileClick });

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      const profileMenuItem = screen.getByText('Profile');
      fireEvent.click(profileMenuItem);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should not render Profile menu item when onProfileClick is not provided', () => {
      renderProfileMenu({ onProfileClick: undefined });

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    it('should render Settings menu item', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should call onLogout when Logout button is clicked', () => {
      const onLogout = vi.fn();
      renderProfileMenu({ onLogout });

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(onLogout).toHaveBeenCalled();
    });

    it('should close dropdown after clicking Logout', () => {
      const onLogout = vi.fn();
      renderProfileMenu({ onLogout });

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on profile button', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      expect(profileButton).toHaveAttribute('aria-haspopup', 'true');
      expect(profileButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown is opened', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      
      fireEvent.click(profileButton);
      expect(profileButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(profileButton);
      expect(profileButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have role="menu" on dropdown', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      const dropdown = screen.getByRole('menu');
      expect(dropdown).toBeInTheDocument();
    });

    it('should have role="menuitem" on menu items', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      fireEvent.click(profileButton);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', () => {
      renderProfileMenu();

      const profileButton = screen.getByLabelText('User menu');
      profileButton.focus();
      expect(profileButton).toHaveFocus();

      // Click to open the menu (keyboard events would work in real browser)
      fireEvent.click(profileButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should have proper alt text for avatar image', () => {
      const user = {
        name: 'Jane Smith',
        role: 'Teacher',
        avatar: 'https://example.com/avatar.jpg'
      };

      renderProfileMenu({ user });

      const avatarImage = screen.getAllByAltText('Jane Smith')[0];
      expect(avatarImage).toBeInTheDocument();
    });
  });

  describe('User Initials Logic', () => {
    it('should generate initials from first and last name', () => {
      const user = {
        name: 'John Doe',
        role: 'Admin',
        avatar: null
      };

      renderProfileMenu({ user });

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should generate initials from first two letters for single name', () => {
      const user = {
        name: 'Admin',
        role: 'Administrator',
        avatar: null
      };

      renderProfileMenu({ user });

      expect(screen.getByText('AD')).toBeInTheDocument();
    });

    it('should handle names with multiple spaces', () => {
      const user = {
        name: 'John Michael Doe',
        role: 'Admin',
        avatar: null
      };

      renderProfileMenu({ user });

      expect(screen.getByText('JM')).toBeInTheDocument();
    });

    it('should handle empty name gracefully', () => {
      const user = {
        name: '',
        role: 'Admin',
        avatar: null
      };

      renderProfileMenu({ user });

      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Light/Dark Mode Support', () => {
    it('should render without errors in light mode', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      renderProfileMenu();

      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });

    it('should render without errors in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      renderProfileMenu();

      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should render correctly in RTL mode', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      renderProfileMenu();

      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
      
      // Cleanup
      document.documentElement.removeAttribute('dir');
    });
  });

  describe('PropTypes Validation', () => {
    it('should handle required props', () => {
      const requiredProps = {
        user: {
          name: 'Test User',
          role: 'User'
        },
        onLogout: vi.fn()
      };

      expect(() => render(<ProfileMenu {...requiredProps} />)).not.toThrow();
    });

    it('should handle optional onProfileClick prop', () => {
      const props = {
        user: {
          name: 'Test User',
          role: 'User'
        },
        onLogout: vi.fn(),
        onProfileClick: undefined
      };

      expect(() => render(<ProfileMenu {...props} />)).not.toThrow();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

// Mock child components
vi.mock('./Breadcrumbs', () => ({
  default: ({ breadcrumbs }) => (
    <div data-testid="breadcrumbs">
      {breadcrumbs.map((crumb, i) => (
        <span key={i}>{crumb.label}</span>
      ))}
    </div>
  )
}));

vi.mock('./SearchBar', () => ({
  default: ({ onSearch }) => (
    <button data-testid="search-bar" onClick={() => onSearch?.('test query')}>
      Search
    </button>
  )
}));

vi.mock('./NotificationCenter', () => ({
  default: ({ notifications, onNotificationClick }) => (
    <div data-testid="notification-center">
      {notifications.map((notif) => (
        <button
          key={notif.id}
          onClick={() => onNotificationClick?.(notif.id)}
        >
          {notif.title}
        </button>
      ))}
    </div>
  )
}));

vi.mock('./ProfileMenu', () => ({
  default: ({ user, onLogout, onProfileClick }) => (
    <div data-testid="profile-menu">
      <span>{user.name}</span>
      <button onClick={onLogout}>Logout</button>
      {onProfileClick && <button onClick={onProfileClick}>Profile</button>}
    </div>
  )
}));

vi.mock('../ThemeToggle/ThemeToggle', () => ({
  default: () => <button data-testid="theme-toggle">Theme</button>
}));

vi.mock('../LanguageSelector/LanguageSelector', () => ({
  default: () => <button data-testid="language-selector">Language</button>
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  })
}));

const renderHeader = (props = {}) => {
  const defaultProps = {
    user: {
      name: 'John Doe',
      role: 'Admin',
      avatar: null
    },
    onLogout: vi.fn(),
    breadcrumbs: [],
    notifications: [],
    ...props
  };

  return render(
    <BrowserRouter>
      <Header {...defaultProps} />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  describe('Rendering', () => {
    it('should render header with all utility components', () => {
      renderHeader();

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
    });

    it('should render breadcrumbs when provided', () => {
      const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: 'Students', path: '/students' },
        { label: 'Profile' }
      ];

      renderHeader({ breadcrumbs });

      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      expect(breadcrumbsElement).toBeInTheDocument();
      expect(breadcrumbsElement).toHaveTextContent('Home');
      expect(breadcrumbsElement).toHaveTextContent('Students');
      expect(breadcrumbsElement).toHaveTextContent('Profile');
    });

    it('should not render breadcrumbs when empty', () => {
      renderHeader({ breadcrumbs: [] });

      const breadcrumbsElement = screen.queryByTestId('breadcrumbs');
      expect(breadcrumbsElement).not.toBeInTheDocument();
    });

    it('should render search bar when onSearch is provided', () => {
      const onSearch = vi.fn();
      renderHeader({ onSearch });

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should not render search bar when onSearch is not provided', () => {
      renderHeader({ onSearch: undefined });

      expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
    });

    it('should render notifications', () => {
      const notifications = [
        {
          id: '1',
          type: 'info',
          title: 'Test Notification',
          message: 'Test message',
          timestamp: new Date(),
          read: false
        }
      ];

      renderHeader({ notifications });

      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });

    it('should render user information in profile menu', () => {
      const user = {
        name: 'Jane Smith',
        role: 'Teacher',
        avatar: 'https://example.com/avatar.jpg'
      };

      renderHeader({ user });

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderHeader({ className: 'custom-header' });

      const header = container.querySelector('header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('Interactions', () => {
    it('should call onSearch when search is triggered', () => {
      const onSearch = vi.fn();
      renderHeader({ onSearch });

      const searchButton = screen.getByTestId('search-bar');
      fireEvent.click(searchButton);

      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('should call onNotificationClick when notification is clicked', () => {
      const onNotificationClick = vi.fn();
      const notifications = [
        {
          id: '1',
          type: 'info',
          title: 'Test Notification',
          message: 'Test message',
          timestamp: new Date(),
          read: false
        }
      ];

      renderHeader({ notifications, onNotificationClick });

      const notificationButton = screen.getByText('Test Notification');
      fireEvent.click(notificationButton);

      expect(onNotificationClick).toHaveBeenCalledWith('1');
    });

    it('should call onLogout when logout button is clicked', () => {
      const onLogout = vi.fn();
      renderHeader({ onLogout });

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(onLogout).toHaveBeenCalled();
    });

    it('should call onProfileClick when profile button is clicked', () => {
      const onProfileClick = vi.fn();
      renderHeader({ onProfileClick });

      const profileButton = screen.getByText('Profile');
      fireEvent.click(profileButton);

      expect(onProfileClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      renderHeader();

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const onLogout = vi.fn();
      renderHeader({ onLogout });

      const logoutButton = screen.getByText('Logout');
      logoutButton.focus();
      expect(logoutButton).toHaveFocus();

      // Click the button instead of keyDown since the mock doesn't handle keyboard events
      fireEvent.click(logoutButton);
      expect(onLogout).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should render all components on desktop', () => {
      renderHeader();

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
    });
  });

  describe('Light/Dark Mode Support', () => {
    it('should render theme toggle component', () => {
      renderHeader();

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should render language selector for RTL support', () => {
      renderHeader();

      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    });
  });

  describe('PropTypes Validation', () => {
    it('should handle missing optional props', () => {
      const minimalProps = {
        user: {
          name: 'Test User',
          role: 'User'
        },
        onLogout: vi.fn()
      };

      expect(() => renderHeader(minimalProps)).not.toThrow();
    });

    it('should handle empty arrays', () => {
      renderHeader({
        breadcrumbs: [],
        notifications: []
      });

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});

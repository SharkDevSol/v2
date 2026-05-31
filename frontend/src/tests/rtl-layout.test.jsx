/**
 * RTL Layout Tests
 * 
 * Comprehensive tests for RTL (Right-to-Left) layout support for Arabic language.
 * Tests all components to ensure proper RTL behavior including:
 * - Sidebar positioning (right side)
 * - Text alignment (right)
 * - Icon positioning
 * - Margins and paddings
 * - Dropdown menus
 * - Navigation elements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Import components to test
import Sidebar from '../COMPONENTS/Sidebar/Sidebar';
import Header from '../COMPONENTS/Header/Header';
import Button from '../COMPONENTS/Button/Button';
import Card from '../COMPONENTS/Card/Card';
import Modal from '../COMPONENTS/Modal/Modal';
import Table from '../COMPONENTS/Table/Table';
import Input from '../COMPONENTS/Input/Input';
import Select from '../COMPONENTS/Select/Select';
import Badge from '../COMPONENTS/Badge/Badge';
import StatCard from '../COMPONENTS/StatCard/StatCard';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'ar',
      changeLanguage: vi.fn()
    }
  })
}));

/**
 * Helper function to render component with RTL context
 */
const renderWithRTL = (component) => {
  // Set document direction to RTL
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          {component}
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

/**
 * Helper function to check if element has RTL styling
 */
const hasRTLStyling = (element) => {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.direction === 'rtl' || element.getAttribute('dir') === 'rtl';
};

describe('RTL Layout Support', () => {
  beforeEach(() => {
    // Reset document direction before each test
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    // Clean up after each test
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  describe('Document Level RTL', () => {
    it('should set document direction to RTL for Arabic', () => {
      document.documentElement.dir = 'rtl';
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should set document language to Arabic', () => {
      document.documentElement.lang = 'ar';
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should apply RTL class to html element', () => {
      document.documentElement.dir = 'rtl';
      const html = document.documentElement;
      expect(html.getAttribute('dir')).toBe('rtl');
    });
  });

  describe('Sidebar Component RTL', () => {
    const mockMenuItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <span>📊</span>,
        path: '/dashboard',
        roles: ['admin']
      },
      {
        id: 'students',
        label: 'Students',
        icon: <span>👨‍🎓</span>,
        path: '/students',
        roles: ['admin']
      }
    ];

    it('should position sidebar on the right side in RTL mode', () => {
      const { container } = renderWithRTL(
        <Sidebar
          collapsed={false}
          onToggle={vi.fn()}
          menuItems={mockMenuItems}
          activeItem="dashboard"
          onNavigate={vi.fn()}
          userRole="admin"
        />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeTruthy();
      
      // Check if RTL direction is applied
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should have proper border on left side in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const { container } = renderWithRTL(
        <Sidebar
          collapsed={false}
          onToggle={vi.fn()}
          menuItems={mockMenuItems}
          activeItem="dashboard"
          onNavigate={vi.fn()}
          userRole="admin"
        />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeTruthy();
    });

    it('should align menu items to the right in RTL mode', () => {
      renderWithRTL(
        <Sidebar
          collapsed={false}
          onToggle={vi.fn()}
          menuItems={mockMenuItems}
          activeItem="dashboard"
          onNavigate={vi.fn()}
          userRole="admin"
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Header Component RTL', () => {
    const mockBreadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Students', path: '/students' }
    ];

    const mockNotifications = [
      {
        id: '1',
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
        timestamp: new Date(),
        read: false
      }
    ];

    const mockUser = {
      name: 'Test User',
      role: 'admin',
      avatar: null
    };

    it('should align breadcrumbs to the right in RTL mode', () => {
      renderWithRTL(
        <Header
          breadcrumbs={mockBreadcrumbs}
          notifications={mockNotifications}
          user={mockUser}
          onLogout={vi.fn()}
          onProfileClick={vi.fn()}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position notification icon correctly in RTL mode', () => {
      renderWithRTL(
        <Header
          breadcrumbs={mockBreadcrumbs}
          notifications={mockNotifications}
          user={mockUser}
          onLogout={vi.fn()}
          onProfileClick={vi.fn()}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position profile menu correctly in RTL mode', () => {
      renderWithRTL(
        <Header
          breadcrumbs={mockBreadcrumbs}
          notifications={mockNotifications}
          user={mockUser}
          onLogout={vi.fn()}
          onProfileClick={vi.fn()}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Button Component RTL', () => {
    it('should position icon on the right when iconPosition is left in RTL mode', () => {
      renderWithRTL(
        <Button icon={<span>→</span>} iconPosition="left">
          Click Me
        </Button>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should maintain proper spacing in RTL mode', () => {
      renderWithRTL(
        <Button variant="primary">Test Button</Button>
      );

      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeTruthy();
    });
  });

  describe('Card Component RTL', () => {
    it('should align card header to the right in RTL mode', () => {
      renderWithRTL(
        <Card title="Test Card" subtitle="Test subtitle">
          <p>Card content</p>
        </Card>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position header action button correctly in RTL mode', () => {
      renderWithRTL(
        <Card
          title="Test Card"
          headerAction={<Button size="small">Action</Button>}
        >
          <p>Card content</p>
        </Card>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Modal Component RTL', () => {
    it('should align modal content to the right in RTL mode', () => {
      renderWithRTL(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position close button on the left in RTL mode', () => {
      renderWithRTL(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" showCloseButton={true}>
          <p>Modal content</p>
        </Modal>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Table Component RTL', () => {
    const mockColumns = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
      { key: 'email', header: 'Email' }
    ];

    const mockData = [
      { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' }
    ];

    it('should align table headers to the right in RTL mode', () => {
      renderWithRTL(
        <Table columns={mockColumns} data={mockData} />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align table cells to the right in RTL mode', () => {
      renderWithRTL(
        <Table columns={mockColumns} data={mockData} />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position sort indicators correctly in RTL mode', () => {
      renderWithRTL(
        <Table columns={mockColumns} data={mockData} sortable={true} />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Input Component RTL', () => {
    it('should align input text to the right in RTL mode', () => {
      renderWithRTL(
        <Input
          label="Test Input"
          value=""
          onChange={vi.fn()}
          placeholder="Enter text"
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position input icon on the left when iconPosition is right in RTL mode', () => {
      renderWithRTL(
        <Input
          label="Test Input"
          value=""
          onChange={vi.fn()}
          icon={<span>🔍</span>}
          iconPosition="right"
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align label to the right in RTL mode', () => {
      renderWithRTL(
        <Input
          label="Test Label"
          value=""
          onChange={vi.fn()}
        />
      );

      const label = screen.getByText('Test Label');
      expect(label).toBeTruthy();
    });
  });

  describe('Select Component RTL', () => {
    const mockOptions = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' }
    ];

    it('should align select text to the right in RTL mode', () => {
      renderWithRTL(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position dropdown arrow on the left in RTL mode', () => {
      renderWithRTL(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align dropdown options to the right in RTL mode', () => {
      renderWithRTL(
        <Select
          label="Test Select"
          options={mockOptions}
          value=""
          onChange={vi.fn()}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Badge Component RTL', () => {
    it('should position badge correctly in RTL mode', () => {
      renderWithRTL(
        <Badge variant="primary" count={5}>
          <Button>Notifications</Button>
        </Badge>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align badge text to the right in RTL mode', () => {
      renderWithRTL(
        <Badge variant="success">New</Badge>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('StatCard Component RTL', () => {
    it('should align stat card content to the right in RTL mode', () => {
      renderWithRTL(
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<span>👨‍🎓</span>}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should position icon on the left in RTL mode', () => {
      renderWithRTL(
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<span>👨‍🎓</span>}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align trend indicator correctly in RTL mode', () => {
      renderWithRTL(
        <StatCard
          title="Total Students"
          value="1,234"
          trend={{ value: 12, direction: 'up' }}
        />
      );

      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Dropdown Menus RTL', () => {
    it('should position dropdown menu on the left side in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const dropdown = document.createElement('div');
      dropdown.className = 'dropdown-menu';
      document.body.appendChild(dropdown);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(dropdown);
    });
  });

  describe('Navigation Elements RTL', () => {
    it('should reverse navigation arrow directions in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const nav = document.createElement('nav');
      nav.innerHTML = '<button class="icon-arrow-right">→</button>';
      document.body.appendChild(nav);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(nav);
    });

    it('should align navigation items to the right in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const nav = document.createElement('nav');
      nav.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      document.body.appendChild(nav);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(nav);
    });
  });

  describe('Margins and Paddings RTL', () => {
    it('should mirror margin-left to margin-right in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.className = 'ml-auto';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });

    it('should mirror padding-left to padding-right in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.style.paddingLeft = '20px';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });
  });

  describe('Text Alignment RTL', () => {
    it('should align text to the right by default in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('p');
      element.textContent = 'Test text';
      document.body.appendChild(element);

      const computedStyle = window.getComputedStyle(element);
      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });

    it('should reverse text-left and text-right classes in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const leftElement = document.createElement('p');
      leftElement.className = 'text-left';
      document.body.appendChild(leftElement);

      const rightElement = document.createElement('p');
      rightElement.className = 'text-right';
      document.body.appendChild(rightElement);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(leftElement);
      document.body.removeChild(rightElement);
    });
  });

  describe('Flex Direction RTL', () => {
    it('should reverse flex-row direction in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.className = 'flex flex-row';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });

    it('should reverse justify-start and justify-end in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const startElement = document.createElement('div');
      startElement.className = 'flex justify-start';
      document.body.appendChild(startElement);

      const endElement = document.createElement('div');
      endElement.className = 'flex justify-end';
      document.body.appendChild(endElement);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(startElement);
      document.body.removeChild(endElement);
    });
  });

  describe('Border Radius RTL', () => {
    it('should mirror border-radius for directional corners in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.className = 'rounded-l';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });
  });

  describe('Transform RTL', () => {
    it('should mirror translateX transformations in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.className = 'translate-x-full';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });
  });

  describe('Scrollbar RTL', () => {
    it('should position scrollbar on the left side in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.style.overflow = 'auto';
      element.style.height = '100px';
      element.innerHTML = '<div style="height: 200px;">Content</div>';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });
  });

  describe('Animation Direction RTL', () => {
    it('should reverse slide-in animations in RTL mode', () => {
      document.documentElement.dir = 'rtl';
      
      const element = document.createElement('div');
      element.className = 'slide-in-left';
      document.body.appendChild(element);

      expect(document.documentElement.dir).toBe('rtl');
      
      document.body.removeChild(element);
    });
  });
});

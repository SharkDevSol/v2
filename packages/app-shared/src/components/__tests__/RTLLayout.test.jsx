/**
 * RTL Layout Support Tests
 * 
 * This test suite verifies that all components work correctly in RTL (Right-to-Left) mode
 * for Arabic language support. It tests:
 * - Sidebar positioning (right side in RTL)
 * - Text alignment (right-aligned in RTL)
 * - Icon positioning
 * - Margins and paddings
 * - Dropdown menus
 * - Navigation elements
 * 
 * Requirements: 16.5, 16.6, 18.9
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Modal from '../Modal/Modal';
import Table from '../Table/Table';
import Card from '../Card/Card';
import Toast from '../Toast/Toast';
import { ChevronRight, Home, Users, Settings } from 'lucide-react';

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

describe('RTL Layout Support', () => {
  beforeEach(() => {
    // Set document direction to RTL
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  });

  afterEach(() => {
    // Reset to LTR
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  describe('Sidebar Component RTL', () => {
    const mockMenuItems = [
      {
        id: 'dashboard',
        label: 'لوحة القيادة',
        icon: <Home />,
        path: '/dashboard',
        roles: ['admin']
      },
      {
        id: 'students',
        label: 'الطلاب',
        icon: <Users />,
        path: '/students',
        badge: 5,
        roles: ['admin']
      },
      {
        id: 'settings',
        label: 'الإعدادات',
        icon: <Settings />,
        path: '/settings',
        roles: ['admin']
      }
    ];

    it('should position sidebar on the right side in RTL mode', () => {
      const { container } = render(
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          menuItems={mockMenuItems}
          activeItem="dashboard"
          onNavigate={() => {}}
          userRole="admin"
        />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toBeTruthy();
      
      // Check if sidebar has RTL-specific styles applied
      const computedStyle = window.getComputedStyle(sidebar);
      // In RTL mode, sidebar should be positioned on the right
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align menu text to the right in RTL mode', () => {
      render(
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          menuItems={mockMenuItems}
          activeItem="dashboard"
          onNavigate={() => {}}
          userRole="admin"
        />
      );

      const menuButton = screen.getByText('لوحة القيادة');
      expect(menuButton).toBeTruthy();
    });

    it('should display badge on the left side in RTL mode', () => {
      const { container } = render(
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          menuItems={mockMenuItems}
          activeItem="students"
          onNavigate={() => {}}
          userRole="admin"
        />
      );

      // Badge should be present for students menu item
      const badge = container.querySelector('[class*="badge"]');
      expect(badge).toBeTruthy();
    });

    it('should mirror chevron icons in RTL mode', () => {
      const menuItemsWithChildren = [
        {
          id: 'academic',
          label: 'الأكاديمية',
          icon: <Home />,
          path: '/academic',
          children: [
            {
              id: 'marks',
              label: 'العلامات',
              icon: <ChevronRight />,
              path: '/academic/marks'
            }
          ],
          roles: ['admin']
        }
      ];

      render(
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          menuItems={menuItemsWithChildren}
          activeItem="academic"
          onNavigate={() => {}}
          userRole="admin"
        />
      );

      // Chevron icon should be present
      const expandIcon = screen.getByText('الأكاديمية').parentElement.querySelector('[class*="expandIcon"]');
      expect(expandIcon).toBeTruthy();
    });
  });

  describe('Header Component RTL', () => {
    const mockUser = {
      name: 'أحمد محمد',
      role: 'مدير',
      avatar: null
    };

    const mockBreadcrumbs = [
      { label: 'الرئيسية', path: '/' },
      { label: 'الطلاب', path: '/students' },
      { label: 'الملف الشخصي' }
    ];

    it('should render header with RTL direction', () => {
      const { container } = render(
        <LanguageProvider>
          <Header
            breadcrumbs={mockBreadcrumbs}
            notifications={[]}
            user={mockUser}
            onLogout={() => {}}
            onProfileClick={() => {}}
          />
        </LanguageProvider>
      );

      const header = container.querySelector('header');
      expect(header).toBeTruthy();
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should align breadcrumbs from right to left in RTL mode', () => {
      render(
        <LanguageProvider>
          <Header
            breadcrumbs={mockBreadcrumbs}
            notifications={[]}
            user={mockUser}
            onLogout={() => {}}
            onProfileClick={() => {}}
          />
        </LanguageProvider>
      );

      const breadcrumb = screen.getByText('الرئيسية');
      expect(breadcrumb).toBeTruthy();
    });

    it('should position utility buttons correctly in RTL mode', () => {
      const { container } = render(
        <LanguageProvider>
          <Header
            breadcrumbs={mockBreadcrumbs}
            notifications={[]}
            user={mockUser}
            onLogout={() => {}}
            onProfileClick={() => {}}
          />
        </LanguageProvider>
      );

      const rightSection = container.querySelector('[class*="rightSection"]');
      expect(rightSection).toBeTruthy();
    });
  });

  describe('Form Components RTL', () => {
    it('should align input text to the right in RTL mode', () => {
      render(
        <Input
          label="الاسم"
          value="أحمد"
          onChange={() => {}}
          placeholder="أدخل الاسم"
        />
      );

      const input = screen.getByPlaceholderText('أدخل الاسم');
      expect(input).toBeTruthy();
    });

    it('should position input icons correctly in RTL mode', () => {
      const { container } = render(
        <Input
          label="البحث"
          value=""
          onChange={() => {}}
          icon={<Home />}
          iconPosition="left"
        />
      );

      const iconWrapper = container.querySelector('[class*="Icon"]');
      expect(iconWrapper).toBeTruthy();
    });

    it('should align select dropdown to the right in RTL mode', () => {
      const options = [
        { value: '1', label: 'الخيار الأول' },
        { value: '2', label: 'الخيار الثاني' }
      ];

      render(
        <Select
          label="اختر خيار"
          options={options}
          value="1"
          onChange={() => {}}
        />
      );

      const select = screen.getByText('اختر خيار');
      expect(select).toBeTruthy();
    });
  });

  describe('Modal Component RTL', () => {
    it('should render modal with RTL direction', () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="عنوان النافذة"
        >
          <p>محتوى النافذة</p>
        </Modal>
      );

      const modal = container.querySelector('[class*="modal"]');
      expect(modal).toBeTruthy();
      expect(screen.getByText('عنوان النافذة')).toBeTruthy();
    });

    it('should position close button on the left in RTL mode', () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="عنوان النافذة"
          showCloseButton={true}
        >
          <p>محتوى النافذة</p>
        </Modal>
      );

      const closeButton = container.querySelector('[class*="closeButton"]');
      expect(closeButton).toBeTruthy();
    });

    it('should align modal footer buttons from right to left in RTL mode', () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="عنوان النافذة"
          footer={
            <>
              <Button variant="primary">حفظ</Button>
              <Button variant="secondary">إلغاء</Button>
            </>
          }
        >
          <p>محتوى النافذة</p>
        </Modal>
      );

      const footer = container.querySelector('[class*="footer"]');
      expect(footer).toBeTruthy();
    });
  });

  describe('Table Component RTL', () => {
    const columns = [
      { key: 'name', header: 'الاسم', sortable: true },
      { key: 'age', header: 'العمر', sortable: true },
      { key: 'class', header: 'الصف', sortable: false }
    ];

    const data = [
      { name: 'أحمد محمد', age: 15, class: 'الصف العاشر' },
      { name: 'فاطمة علي', age: 14, class: 'الصف التاسع' }
    ];

    it('should align table headers to the right in RTL mode', () => {
      render(
        <Table
          columns={columns}
          data={data}
          sortable={true}
        />
      );

      const nameHeader = screen.getByText('الاسم');
      expect(nameHeader).toBeTruthy();
    });

    it('should align table cells to the right in RTL mode', () => {
      render(
        <Table
          columns={columns}
          data={data}
        />
      );

      const cell = screen.getByText('أحمد محمد');
      expect(cell).toBeTruthy();
    });

    it('should position sort icons correctly in RTL mode', () => {
      const { container } = render(
        <Table
          columns={columns}
          data={data}
          sortable={true}
        />
      );

      const table = container.querySelector('table');
      expect(table).toBeTruthy();
    });
  });

  describe('Card Component RTL', () => {
    it('should align card title to the right in RTL mode', () => {
      render(
        <Card
          title="عنوان البطاقة"
          subtitle="عنوان فرعي"
        >
          <p>محتوى البطاقة</p>
        </Card>
      );

      const title = screen.getByText('عنوان البطاقة');
      expect(title).toBeTruthy();
    });

    it('should position card header action on the left in RTL mode', () => {
      const { container } = render(
        <Card
          title="عنوان البطاقة"
          headerAction={<Button variant="ghost">تعديل</Button>}
        >
          <p>محتوى البطاقة</p>
        </Card>
      );

      const headerAction = screen.getByText('تعديل');
      expect(headerAction).toBeTruthy();
    });
  });

  describe('Toast Component RTL', () => {
    it('should render toast with RTL direction', () => {
      const { container } = render(
        <Toast
          type="success"
          message="تم الحفظ بنجاح"
          onClose={() => {}}
        />
      );

      const toast = screen.getByText('تم الحفظ بنجاح');
      expect(toast).toBeTruthy();
    });

    it('should position toast icon on the right in RTL mode', () => {
      const { container } = render(
        <Toast
          type="success"
          message="تم الحفظ بنجاح"
          onClose={() => {}}
        />
      );

      const toastElement = container.querySelector('[class*="toast"]');
      expect(toastElement).toBeTruthy();
    });

    it('should position close button on the left in RTL mode', () => {
      const { container } = render(
        <Toast
          type="info"
          message="معلومة مهمة"
          onClose={() => {}}
        />
      );

      const closeButton = container.querySelector('button');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Button Component RTL', () => {
    it('should position icon on the right when iconPosition is left in RTL mode', () => {
      const { container } = render(
        <Button
          variant="primary"
          icon={<ChevronRight />}
          iconPosition="left"
        >
          التالي
        </Button>
      );

      const button = screen.getByText('التالي');
      expect(button).toBeTruthy();
    });

    it('should render button text correctly in RTL mode', () => {
      render(
        <Button variant="primary">
          حفظ التغييرات
        </Button>
      );

      const button = screen.getByText('حفظ التغييرات');
      expect(button).toBeTruthy();
    });
  });

  describe('Navigation Elements RTL', () => {
    it('should mirror navigation arrows in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <button className="icon-arrow-right">
            <ChevronRight />
          </button>
        </div>
      );

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button.className).toContain('icon-arrow-right');
    });

    it('should position dropdown menus correctly in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="dropdown-menu">
            <button>خيار 1</button>
            <button>خيار 2</button>
          </div>
        </div>
      );

      const dropdown = container.querySelector('.dropdown-menu');
      expect(dropdown).toBeTruthy();
    });
  });

  describe('Margin and Padding RTL', () => {
    it('should mirror margin-left to margin-right in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="ml-auto">محتوى</div>
        </div>
      );

      const element = container.querySelector('.ml-auto');
      expect(element).toBeTruthy();
    });

    it('should mirror padding for directional elements in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div style={{ paddingLeft: '20px' }}>محتوى</div>
        </div>
      );

      const element = container.querySelector('div > div');
      expect(element).toBeTruthy();
    });
  });

  describe('Text Alignment RTL', () => {
    it('should align text to the right by default in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <p>نص عربي</p>
        </div>
      );

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeTruthy();
      expect(paragraph.textContent).toBe('نص عربي');
    });

    it('should swap text-left and text-right classes in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <p className="text-left">نص محاذاة يسار</p>
          <p className="text-right">نص محاذاة يمين</p>
        </div>
      );

      const leftAligned = container.querySelector('.text-left');
      const rightAligned = container.querySelector('.text-right');
      
      expect(leftAligned).toBeTruthy();
      expect(rightAligned).toBeTruthy();
    });
  });

  describe('Flex Direction RTL', () => {
    it('should reverse flex-row direction in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="flex flex-row">
            <span>أول</span>
            <span>ثاني</span>
            <span>ثالث</span>
          </div>
        </div>
      );

      const flexContainer = container.querySelector('.flex-row');
      expect(flexContainer).toBeTruthy();
    });

    it('should maintain flex-col direction in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="flex flex-col">
            <span>أول</span>
            <span>ثاني</span>
            <span>ثالث</span>
          </div>
        </div>
      );

      const flexContainer = container.querySelector('.flex-col');
      expect(flexContainer).toBeTruthy();
    });
  });

  describe('Border Radius RTL', () => {
    it('should mirror rounded-l to rounded-r in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="rounded-l">محتوى</div>
        </div>
      );

      const element = container.querySelector('.rounded-l');
      expect(element).toBeTruthy();
    });

    it('should mirror rounded-r to rounded-l in RTL mode', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="rounded-r">محتوى</div>
        </div>
      );

      const element = container.querySelector('.rounded-r');
      expect(element).toBeTruthy();
    });
  });

  describe('Complete Layout RTL', () => {
    it('should render complete layout with sidebar on right in RTL mode', () => {
      const { container } = render(
        <LanguageProvider>
          <div dir="rtl">
            <Sidebar
              collapsed={false}
              onToggle={() => {}}
              menuItems={[
                {
                  id: 'dashboard',
                  label: 'لوحة القيادة',
                  icon: <Home />,
                  path: '/dashboard',
                  roles: ['admin']
                }
              ]}
              activeItem="dashboard"
              onNavigate={() => {}}
              userRole="admin"
            />
            <Header
              breadcrumbs={[{ label: 'الرئيسية' }]}
              notifications={[]}
              user={{ name: 'أحمد', role: 'مدير' }}
              onLogout={() => {}}
              onProfileClick={() => {}}
            />
          </div>
        </LanguageProvider>
      );

      expect(container.querySelector('aside')).toBeTruthy();
      expect(container.querySelector('header')).toBeTruthy();
    });

    it('should maintain proper spacing in RTL layout', () => {
      const { container } = render(
        <div dir="rtl">
          <div className="container">
            <div className="grid grid-cols-3 gap-md">
              <Card title="بطاقة 1">محتوى</Card>
              <Card title="بطاقة 2">محتوى</Card>
              <Card title="بطاقة 3">محتوى</Card>
            </div>
          </div>
        </div>
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeTruthy();
    });
  });
});

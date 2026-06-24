# PageLayout Component

A comprehensive layout wrapper component that provides consistent page structure with Sidebar, Header, content area, and Footer.

## Features

- ✅ Consistent layout structure across all pages
- ✅ Integrated Sidebar navigation with collapse/expand
- ✅ Header with breadcrumbs, search, notifications, and profile menu
- ✅ Optional page header with title, subtitle, and actions
- ✅ Loading state with full-page skeleton
- ✅ Error state display
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Light and dark mode support
- ✅ RTL layout support for Arabic
- ✅ WCAG AA accessibility compliance
- ✅ Role-based menu filtering

## Usage

### Basic Usage

```jsx
import { PageLayout } from '../COMPONENTS/Layout';
import { Home, Users, Settings } from 'lucide-react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home />,
    path: '/dashboard',
    roles: ['admin']
  },
  {
    id: 'students',
    label: 'Students',
    icon: <Users />,
    path: '/students',
    badge: 5,
    roles: ['admin', 'staff']
  }
];

const user = {
  name: 'John Doe',
  role: 'Admin',
  avatar: '/avatar.jpg'
};

function MyPage() {
  return (
    <PageLayout
      title="Dashboard"
      subtitle="Welcome to your dashboard"
      menuItems={menuItems}
      activeMenuItem="dashboard"
      onNavigate={(path, id) => console.log('Navigate to', path)}
      user={user}
      onLogout={() => console.log('Logout')}
      onProfileClick={() => console.log('Profile clicked')}
    >
      <div>Your page content here</div>
    </PageLayout>
  );
}
```

### With Page Actions

```jsx
<PageLayout
  title="Students"
  subtitle="Manage student records"
  actions={
    <>
      <Button variant="secondary" icon={<Download />}>
        Export
      </Button>
      <Button variant="primary" icon={<Plus />}>
        Add Student
      </Button>
    </>
  }
  menuItems={menuItems}
  activeMenuItem="students"
  onNavigate={handleNavigate}
  user={user}
  onLogout={handleLogout}
>
  <StudentList />
</PageLayout>
```

### With Breadcrumbs

```jsx
const breadcrumbs = [
  { label: 'Home', path: '/' },
  { label: 'Students', path: '/students' },
  { label: 'John Doe' }
];

<PageLayout
  title="Student Details"
  breadcrumbs={breadcrumbs}
  menuItems={menuItems}
  activeMenuItem="students"
  onNavigate={handleNavigate}
  user={user}
  onLogout={handleLogout}
>
  <StudentDetails />
</PageLayout>
```

### With Loading State

```jsx
<PageLayout
  title="Dashboard"
  loading={true}
  menuItems={menuItems}
  activeMenuItem="dashboard"
  onNavigate={handleNavigate}
  user={user}
  onLogout={handleLogout}
>
  <div>This content won't be shown while loading</div>
</PageLayout>
```

### With Error State

```jsx
<PageLayout
  title="Dashboard"
  error="Failed to load dashboard data. Please try again."
  menuItems={menuItems}
  activeMenuItem="dashboard"
  onNavigate={handleNavigate}
  user={user}
  onLogout={handleLogout}
>
  <div>This content won't be shown when there's an error</div>
</PageLayout>
```

### With Notifications

```jsx
const notifications = [
  {
    id: '1',
    type: 'info',
    title: 'New Message',
    message: 'You have a new message from John',
    timestamp: new Date(),
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Payment Due',
    message: 'Payment is due in 3 days',
    timestamp: new Date(),
    read: true
  }
];

<PageLayout
  title="Dashboard"
  menuItems={menuItems}
  activeMenuItem="dashboard"
  onNavigate={handleNavigate}
  notifications={notifications}
  onNotificationClick={(id) => console.log('Notification clicked', id)}
  user={user}
  onLogout={handleLogout}
>
  <Dashboard />
</PageLayout>
```

### With Search

```jsx
<PageLayout
  title="Dashboard"
  menuItems={menuItems}
  activeMenuItem="dashboard"
  onNavigate={handleNavigate}
  onSearch={(query) => console.log('Search for', query)}
  user={user}
  onLogout={handleLogout}
>
  <Dashboard />
</PageLayout>
```

### With Nested Menu Items

```jsx
const menuItems = [
  {
    id: 'academic',
    label: 'Academic',
    icon: <BookOpen />,
    path: '/academic',
    children: [
      {
        id: 'marks',
        label: 'Marks',
        icon: <FileText />,
        path: '/academic/marks'
      },
      {
        id: 'exams',
        label: 'Exams',
        icon: <ClipboardList />,
        path: '/academic/exams'
      }
    ]
  }
];

<PageLayout
  title="Marks"
  menuItems={menuItems}
  activeMenuItem="marks"
  onNavigate={handleNavigate}
  user={user}
  onLogout={handleLogout}
>
  <MarksList />
</PageLayout>
```

## Props

### PageLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Page content |
| `title` | `string` | - | Optional page title |
| `subtitle` | `string` | - | Optional page subtitle |
| `actions` | `ReactNode` | - | Optional page actions (buttons, etc.) |
| `breadcrumbs` | `Array<Breadcrumb>` | `[]` | Optional breadcrumbs for Header |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string` | `null` | Error message |
| `menuItems` | `Array<MenuItem>` | `[]` | Menu items for Sidebar |
| `activeMenuItem` | `string` | `''` | Active menu item ID |
| `onNavigate` | `Function` | - | Navigation callback `(path, id) => void` |
| `notifications` | `Array<Notification>` | `[]` | Notifications for Header |
| `onNotificationClick` | `Function` | - | Notification click callback `(id) => void` |
| `user` | `User` | - | User information for Header |
| `onLogout` | `Function` | - | Logout callback |
| `onProfileClick` | `Function` | - | Profile click callback |
| `onSearch` | `Function` | - | Search callback `(query) => void` |
| `userRole` | `string` | `'admin'` | User role for menu filtering |
| `className` | `string` | `''` | Additional CSS classes |

### MenuItem Interface

```typescript
interface MenuItem {
  id: string;              // Unique identifier
  label: string;           // Display label
  icon: ReactNode;         // Icon component
  path: string;            // Navigation path
  badge?: number;          // Optional badge count
  children?: MenuItem[];   // Optional nested items
  roles?: string[];        // Optional role restrictions
}
```

### Breadcrumb Interface

```typescript
interface Breadcrumb {
  label: string;    // Display label
  path?: string;    // Optional navigation path
}
```

### Notification Interface

```typescript
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
```

### User Interface

```typescript
interface User {
  name: string;
  role: string;
  avatar?: string;
}
```

## Responsive Behavior

### Desktop (1024px+)
- Sidebar expanded by default (260px width)
- Full header with all utilities
- Spacious content area

### Tablet (768px - 1023px)
- Sidebar collapsed by default (70px width)
- Full header with all utilities
- Optimized content spacing

### Mobile (320px - 767px)
- Sidebar hidden by default
- Hamburger menu button to open sidebar
- Sidebar opens as overlay
- Stacked header utilities
- Compact content spacing

## Accessibility

- ✅ Semantic HTML elements (`<nav>`, `<header>`, `<main>`, `<footer>`)
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators (3:1 contrast ratio)
- ✅ Screen reader compatible
- ✅ Touch target size (44x44px minimum)
- ✅ WCAG AA contrast ratios (4.5:1 for normal text)

## Theme Support

The component uses CSS variables for theming:

```css
--color-surface
--color-background
--color-border
--color-text
--color-text-secondary
--color-primary
--color-primary-hover
--color-danger
--shadow-lg
--border-radius-md
--font-size-*
--font-weight-*
--line-height-*
```

## RTL Support

The component automatically adapts to RTL layout when `dir="rtl"` is set on the document:

- Sidebar moves to the right
- Text alignment changes to right
- Icons and controls mirror appropriately

## Testing

Run tests with:

```bash
npm test PageLayout.test.jsx
npm test Sidebar.test.jsx
```

## Related Components

- [Sidebar](../Sidebar/README.md) - Navigation sidebar
- [Header](../Header/README.md) - Page header with utilities
- [PageHeader](./PageHeader.jsx) - Page title and actions
- [Footer](./Footer.jsx) - Page footer

## Examples

See the test files for comprehensive usage examples:
- `PageLayout.test.jsx`
- `Sidebar.test.jsx`

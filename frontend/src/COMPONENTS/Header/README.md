# Header Component

The Header component provides a comprehensive navigation bar with utilities including breadcrumbs, search, notifications, profile menu, theme toggle, and language selector.

## Features

- ✅ **Breadcrumb Navigation**: Shows current page location in hierarchy
- ✅ **Global Search**: Expandable search bar with keyboard support
- ✅ **Notification Center**: Dropdown with notification list and unread count
- ✅ **Profile Menu**: User information and logout functionality
- ✅ **Theme Toggle**: Switch between light and dark modes
- ✅ **Language Selector**: Support for English, Amharic, and Arabic
- ✅ **Responsive Design**: Adapts to mobile, tablet, and desktop
- ✅ **RTL Support**: Full right-to-left layout for Arabic
- ✅ **Accessibility**: WCAG AA compliant with keyboard navigation
- ✅ **Light/Dark Mode**: Full theme support

## Components

### Header (Main Component)

The main header component that orchestrates all subcomponents.

#### Props

```typescript
interface HeaderProps {
  breadcrumbs?: Array<{
    label: string;
    path?: string;
  }>;
  onSearch?: (query: string) => void;
  notifications?: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  onNotificationClick?: (id: string) => void;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout: () => void;
  onProfileClick?: () => void;
  className?: string;
}
```

#### Usage

```jsx
import Header from './COMPONENTS/Header/Header';

function App() {
  const breadcrumbs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Students', path: '/students' },
    { label: 'Profile' }
  ];

  const notifications = [
    {
      id: '1',
      type: 'info',
      title: 'New Student Enrolled',
      message: 'John Doe has been enrolled in Grade 10',
      timestamp: new Date(),
      read: false
    }
  ];

  const user = {
    name: 'Jane Smith',
    role: 'Admin',
    avatar: 'https://example.com/avatar.jpg'
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // Implement search logic
  };

  const handleNotificationClick = (id) => {
    console.log('Notification clicked:', id);
    // Mark notification as read
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Implement logout logic
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    // Navigate to profile page
  };

  return (
    <Header
      breadcrumbs={breadcrumbs}
      onSearch={handleSearch}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      user={user}
      onLogout={handleLogout}
      onProfileClick={handleProfileClick}
    />
  );
}
```

### Breadcrumbs

Navigation trail showing current page location.

#### Props

```typescript
interface BreadcrumbsProps {
  breadcrumbs: Array<{
    label: string;
    path?: string;
  }>;
}
```

#### Features

- Home icon as first breadcrumb
- Clickable breadcrumbs with navigation
- Current page highlighted
- Horizontal scroll on overflow
- RTL support

### SearchBar

Expandable search input with icon and clear button.

#### Props

```typescript
interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}
```

#### Features

- Expandable on click
- Clear button when text is entered
- Keyboard support (Enter to search, Escape to close)
- Click outside to collapse
- Auto-focus on expand

### NotificationCenter

Dropdown displaying notifications with unread count badge.

#### Props

```typescript
interface NotificationCenterProps {
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  onNotificationClick?: (id: string) => void;
  className?: string;
}
```

#### Features

- Unread count badge
- Color-coded notification types
- Relative timestamps (e.g., "2 hours ago")
- Empty state
- Click outside to close
- Escape key to close
- View all notifications link

### ProfileMenu

User profile dropdown with menu options.

#### Props

```typescript
interface ProfileMenuProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout: () => void;
  onProfileClick?: () => void;
  className?: string;
}
```

#### Features

- User avatar or initials
- User name and role display
- Profile menu item (optional)
- Settings menu item
- Logout button
- Click outside to close
- Escape key to close

## Responsive Behavior

### Desktop (1024px+)

- Full header with all components visible
- Breadcrumbs displayed
- User name and role visible in profile button
- Expanded search bar (350px)

### Tablet (768px - 1023px)

- All components visible
- Slightly smaller search bar (250px)
- User name and role visible

### Mobile (320px - 767px)

- Breadcrumbs hidden
- Search bar becomes full-width overlay when expanded
- User name and role hidden in profile button (avatar only)
- Dropdowns become full-width modals

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and links
- **Escape**: Close dropdowns and search bar
- **Arrow Keys**: Navigate within dropdowns

### Screen Reader Support

- Proper ARIA labels on all interactive elements
- ARIA expanded states on dropdowns
- ARIA current on active breadcrumb
- Semantic HTML structure

### Focus Management

- Visible focus indicators (2px outline)
- Focus trap in dropdowns
- Auto-focus on search input when expanded

### Color Contrast

- All text meets WCAG AA standards (4.5:1 for normal text)
- Focus indicators have 3:1 contrast ratio

## Theming

The Header component fully supports light and dark modes using CSS variables.

### Light Mode

- White background (`--bg-elevated`)
- Dark text (`--text-primary`)
- Subtle shadows (`--shadow-sm`)

### Dark Mode

- Dark background (`--bg-elevated` in dark mode)
- Light text (`--text-primary` in dark mode)
- Darker shadows

### Custom Styling

You can customize the Header by overriding CSS variables:

```css
.custom-header {
  --header-height: 72px;
  --bg-elevated: #f0f0f0;
}
```

## RTL Support

The Header component fully supports right-to-left languages (Arabic).

### RTL Behavior

- Layout mirrored (profile menu on left, breadcrumbs on right)
- Text alignment reversed
- Icons flipped where appropriate
- Dropdowns positioned correctly

### Enabling RTL

RTL is automatically enabled when the language is set to Arabic through the LanguageContext.

## Integration with Contexts

### ThemeContext

The Header integrates with ThemeContext through the ThemeToggle component:

```jsx
import { ThemeProvider } from './contexts/ThemeContext';

<ThemeProvider>
  <Header {...props} />
</ThemeProvider>
```

### LanguageContext

The Header integrates with LanguageContext through the LanguageSelector component:

```jsx
import { LanguageProvider } from './contexts/LanguageContext';

<LanguageProvider>
  <Header {...props} />
</LanguageProvider>
```

## Testing

Comprehensive tests are provided for all components:

- **Header.test.jsx**: Main header component tests
- **ProfileMenu.test.jsx**: Profile menu component tests

### Running Tests

```bash
# Run all Header tests
npm test -- src/COMPONENTS/Header

# Run specific test file
npm test -- Header.test.jsx
npm test -- ProfileMenu.test.jsx
```

### Test Coverage

- ✅ Rendering with all props
- ✅ User interactions (clicks, keyboard)
- ✅ Dropdown open/close behavior
- ✅ Click outside to close
- ✅ Escape key to close
- ✅ Accessibility features
- ✅ Light/Dark mode support
- ✅ RTL support
- ✅ Responsive behavior

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

- Optimized re-renders with proper React hooks
- CSS transitions for smooth animations
- Lazy loading of dropdown content
- Efficient event listeners (cleanup on unmount)

## Future Enhancements

- [ ] Global search modal with results
- [ ] Notification preferences
- [ ] User status indicator (online/offline)
- [ ] Quick actions menu
- [ ] Keyboard shortcuts panel

## Related Components

- [ThemeToggle](../ThemeToggle/README.md)
- [LanguageSelector](../LanguageSelector/README.md)
- [Badge](../Badge/README.md)

## Requirements Validation

This component satisfies the following requirements from the design document:

- ✅ **Requirement 3.6**: Header with breadcrumbs, search, notifications, and profile menu
- ✅ **Requirement 3.7**: Breadcrumbs showing current page location
- ✅ **Requirement 3.8**: Search icon that opens search interface
- ✅ **Requirement 3.9**: Notifications icon that opens notification center
- ✅ **Requirement 3.10**: Profile icon with user info and logout option
- ✅ **Requirement 3.14**: Light and dark mode support
- ✅ **Requirement 13.1-13.10**: Responsive design for mobile, tablet, desktop
- ✅ **Requirement 14.1-14.11**: Theme system with light/dark modes
- ✅ **Requirement 15.1-15.12**: Accessibility compliance (WCAG AA)
- ✅ **Requirement 16.1-16.10**: Multi-language support with RTL

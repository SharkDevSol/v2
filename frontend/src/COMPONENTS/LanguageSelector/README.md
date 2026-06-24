# LanguageSelector Component

A flexible language selector component that supports multiple display variants and integrates with the application's language context.

## Features

- ✅ **Two Display Variants**: Dropdown (default) or button group
- ✅ **Multi-Language Support**: English, Amharic, and Arabic
- ✅ **RTL Support**: Automatic right-to-left layout for Arabic
- ✅ **Flag Icons**: Optional flag display for each language
- ✅ **Theme Support**: Full light and dark mode compatibility
- ✅ **Accessibility**: WCAG AA compliant with keyboard navigation
- ✅ **Responsive**: Mobile-friendly with touch targets ≥44px
- ✅ **Context Integration**: Seamlessly integrates with LanguageContext
- ✅ **Persistent State**: Saves language preference to localStorage

## Usage

### Basic Usage (Dropdown Variant)

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';

function Header() {
  return (
    <header>
      <LanguageSelector />
    </header>
  );
}
```

### Button Group Variant

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';

function SettingsPage() {
  return (
    <div>
      <h2>Language Settings</h2>
      <LanguageSelector variant="buttons" />
    </div>
  );
}
```

### With Flag Icons

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';

function Navigation() {
  return (
    <nav>
      {/* Dropdown with flags */}
      <LanguageSelector showFlags={true} />
      
      {/* Button group with flags */}
      <LanguageSelector variant="buttons" showFlags={true} />
    </nav>
  );
}
```

### With Custom Styling

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';
import styles from './MyComponent.module.css';

function MyComponent() {
  return (
    <div>
      <LanguageSelector className={styles.customLanguageSelector} />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'dropdown' \| 'buttons'` | `'dropdown'` | Display variant - dropdown menu or button group |
| `showFlags` | `boolean` | `false` | Whether to display flag icons for each language |
| `className` | `string` | `''` | Additional CSS class for custom styling |

## Supported Languages

| Language | Code | Native Name | Flag |
|----------|------|-------------|------|
| English | `en` | English | 🇬🇧 |
| Amharic | `am` | አማርኛ | 🇪🇹 |
| Arabic | `ar` | العربية | 🇸🇦 |

## Behavior

### Language Switching

When a user selects a language:
1. The UI updates immediately to show the selected language
2. The language preference is saved to `localStorage`
3. The `document.documentElement.lang` attribute is updated
4. For Arabic, `document.documentElement.dir` is set to `'rtl'`
5. For Amharic, the font family is updated to support Ethiopic script
6. All components using `useLanguage()` or `useTranslation()` are updated

### Dropdown Variant

- Displays current language with Globe icon
- Opens dropdown menu on click
- Closes on:
  - Selecting a language
  - Clicking outside the dropdown
  - Pressing Escape key
- Shows check icon next to current language in dropdown

### Button Group Variant

- Displays all languages as buttons
- Active language button is highlighted
- Shows check icon on active button
- No dropdown - all options always visible

## Accessibility

### Keyboard Navigation

- **Tab**: Focus the language selector button
- **Enter/Space**: Open dropdown (dropdown variant) or select language (button variant)
- **Escape**: Close dropdown (dropdown variant only)
- **Tab**: Navigate through language options

### ARIA Attributes

- `aria-label`: Descriptive labels for all interactive elements
- `aria-expanded`: Indicates dropdown open/closed state
- `aria-haspopup`: Indicates dropdown menu presence
- `aria-pressed`: Indicates active button in button group
- `role="menu"`: Semantic role for dropdown menu
- `role="menuitem"`: Semantic role for language options
- `role="group"`: Semantic role for button group

### Screen Reader Support

- All interactive elements have descriptive labels
- Current language is announced
- Language changes are announced
- Icons are hidden from screen readers with `aria-hidden="true"`

### Touch Targets

All interactive elements meet WCAG AA requirements:
- Minimum size: 44x44 pixels
- Adequate spacing between elements

## Styling

The component uses CSS Modules for scoped styling and supports:

- **CSS Variables**: Uses design system variables for colors, spacing, etc.
- **Light/Dark Mode**: Automatically adapts to theme changes
- **RTL Layout**: Mirrors layout for right-to-left languages
- **Responsive Design**: Adapts to mobile, tablet, and desktop viewports
- **Animations**: Smooth transitions with `prefers-reduced-motion` support

### CSS Variables Used

```css
/* Colors */
--bg-secondary
--bg-tertiary
--bg-elevated
--border-primary
--border-secondary
--border-focus
--text-primary
--text-secondary
--color-primary
--color-primary-light

/* Spacing */
--radius-md
--radius-lg
--shadow-sm
--shadow-lg

/* Typography */
--font-size-sm
--font-size-xs
--font-weight-medium

/* Z-index */
--z-dropdown
```

## Integration with LanguageContext

The component requires `LanguageProvider` to be present in the component tree:

```jsx
import { LanguageProvider } from './contexts/LanguageContext';
import LanguageSelector from './COMPONENTS/LanguageSelector';

function App() {
  return (
    <LanguageProvider>
      <LanguageSelector />
      {/* Other components */}
    </LanguageProvider>
  );
}
```

### Using Language in Other Components

```jsx
import { useLanguage } from './contexts/LanguageContext';

function MyComponent() {
  const { language, changeLanguage, isRTL, isAmharic, isEnglish } = useLanguage();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <p>Is RTL: {isRTL ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Examples

### Header with Language Selector

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';
import ThemeToggle from './COMPONENTS/ThemeToggle';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Logo" />
      </div>
      
      <div className={styles.controls}>
        <LanguageSelector variant="dropdown" />
        <ThemeToggle />
      </div>
    </header>
  );
}
```

### Settings Page with Button Group

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';
import Card from './COMPONENTS/Card';
import styles from './Settings.module.css';

function SettingsPage() {
  return (
    <div className={styles.settings}>
      <Card title="Language Preferences">
        <p>Select your preferred language:</p>
        <LanguageSelector variant="buttons" showFlags={true} />
      </Card>
    </div>
  );
}
```

### Login Page with Language Selector

```jsx
import LanguageSelector from './COMPONENTS/LanguageSelector';
import ThemeToggle from './COMPONENTS/ThemeToggle';
import styles from './Login.module.css';

function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.headerControls}>
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className={styles.loginCard}>
        {/* Login form */}
      </div>
    </div>
  );
}
```

## Testing

The component includes comprehensive tests covering:

- ✅ Rendering in both variants
- ✅ Language switching functionality
- ✅ Dropdown open/close behavior
- ✅ Active language indicators
- ✅ Flag icon display
- ✅ Keyboard navigation
- ✅ Accessibility attributes
- ✅ Integration with LanguageContext
- ✅ Multiple instance synchronization
- ✅ RTL layout updates
- ✅ Font family updates for Amharic
- ✅ localStorage persistence

Run tests with:

```bash
npm test -- LanguageSelector.test.jsx
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

- Lightweight component with minimal re-renders
- Uses React hooks for optimal performance
- CSS Modules for scoped styling without runtime overhead
- Efficient event listeners with proper cleanup

## Related Components

- **ThemeToggle**: Switch between light and dark modes
- **Header**: Main navigation header
- **LanguageContext**: Language state management

## License

Part of the Skoolific V2 UI/UX redesign project.

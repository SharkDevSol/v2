# Theme System Documentation

## Overview

The Skoolific V2 theme system provides a comprehensive design foundation with support for light and dark modes. It includes CSS variables for colors, typography, spacing, shadows, and more.

## Files

- **`theme.js`** - JavaScript theme configuration with light and dark theme objects
- **`global.css`** - CSS variables and global styles for the entire application
- **`design-tokens.js`** - Design tokens (legacy, being replaced by theme.js)
- **`theme.css`** - Theme CSS variables (legacy, being replaced by global.css)

## Usage

### Importing Theme Configuration

```javascript
import { lightTheme, darkTheme, getTheme, themeConfig } from '@/config/theme';

// Get light theme
const light = getTheme('light');

// Get dark theme
const dark = getTheme('dark');

// Get theme by mode variable
const currentMode = 'dark';
const theme = getTheme(currentMode);
```

### Using CSS Variables

The theme system provides CSS variables that automatically update when switching between light and dark modes.

#### In CSS/CSS Modules

```css
.button {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}
```

#### In JavaScript/JSX

```javascript
// Using inline styles (not recommended, prefer CSS modules)
const buttonStyle = {
  backgroundColor: 'var(--color-primary)',
  color: 'var(--text-inverse)',
  padding: 'var(--spacing-md) var(--spacing-lg)',
};
```

## Theme Structure

### Colors

#### Primary Colors
- `--color-primary` - Main brand color
- `--color-primary-hover` - Hover state
- `--color-primary-active` - Active/pressed state
- `--color-primary-light` - Light background variant

#### Semantic Colors
- **Success**: `--color-success`, `--color-success-light`, `--color-success-dark`
- **Warning**: `--color-warning`, `--color-warning-light`, `--color-warning-dark`
- **Danger/Error**: `--color-danger`, `--color-error`, `--color-danger-light`, `--color-danger-dark`
- **Info**: `--color-info`, `--color-info-light`, `--color-info-dark`

#### Background Colors
- `--bg-primary` - Main background
- `--bg-secondary` - Secondary background
- `--bg-tertiary` - Tertiary background
- `--bg-elevated` - Elevated surfaces (cards, modals)
- `--bg-overlay` - Overlay/backdrop
- `--bg-hover` - Hover state background
- `--bg-active` - Active state background

#### Text Colors
- `--text-primary` - Primary text
- `--text-secondary` - Secondary text
- `--text-tertiary` - Tertiary text
- `--text-disabled` - Disabled text
- `--text-inverse` - Inverse text (for dark backgrounds)
- `--text-link` - Link color
- `--text-link-hover` - Link hover color

#### Border Colors
- `--border-primary` - Primary border
- `--border-secondary` - Secondary border
- `--border-tertiary` - Tertiary border
- `--border-focus` - Focus state border
- `--border-error` - Error state border
- `--border-success` - Success state border
- `--border-warning` - Warning state border

#### Shadows
- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow
- `--shadow-xl` - Extra large shadow
- `--shadow-2xl` - 2X large shadow
- `--shadow-inner` - Inner shadow
- `--shadow-focus` - Focus ring shadow

### Typography

#### Font Families
- `--font-sans` - Sans-serif font stack
- `--font-mono` - Monospace font stack
- `--font-amharic` - Amharic font stack

#### Font Sizes
- `--font-size-xs` - 12px
- `--font-size-sm` - 14px
- `--font-size-base` - 16px
- `--font-size-lg` - 18px
- `--font-size-xl` - 20px
- `--font-size-2xl` - 24px
- `--font-size-3xl` - 30px
- `--font-size-4xl` - 36px
- `--font-size-5xl` - 48px

#### Font Weights
- `--font-weight-light` - 300
- `--font-weight-normal` - 400
- `--font-weight-medium` - 500
- `--font-weight-semibold` - 600
- `--font-weight-bold` - 700

#### Line Heights
- `--line-height-tight` - 1.25
- `--line-height-normal` - 1.5
- `--line-height-relaxed` - 1.75
- `--line-height-loose` - 2

### Spacing

- `--spacing-xs` - 4px
- `--spacing-sm` - 8px
- `--spacing-md` - 16px
- `--spacing-lg` - 24px
- `--spacing-xl` - 32px
- `--spacing-2xl` - 48px
- `--spacing-3xl` - 64px
- `--spacing-4xl` - 96px

### Border Radius

- `--radius-none` - 0
- `--radius-sm` - 4px
- `--radius-md` - 8px
- `--radius-lg` - 12px
- `--radius-xl` - 16px
- `--radius-2xl` - 24px
- `--radius-full` - 9999px (fully rounded)

### Z-Index

- `--z-base` - 0
- `--z-dropdown` - 1000
- `--z-sticky` - 1020
- `--z-fixed` - 1030
- `--z-modal-backdrop` - 1040
- `--z-modal` - 1050
- `--z-popover` - 1060
- `--z-tooltip` - 1070

### Transitions

- `--transition-fast` - 150ms
- `--transition-base` - 200ms
- `--transition-slow` - 300ms
- `--transition-slower` - 500ms

### Breakpoints

- `--breakpoint-mobile` - 320px
- `--breakpoint-tablet` - 768px
- `--breakpoint-desktop` - 1024px
- `--breakpoint-wide` - 1280px

## Switching Themes

To switch between light and dark modes, add or remove the `dark` or `dark-mode` class to the `<body>` element:

```javascript
// Switch to dark mode
document.body.classList.add('dark');

// Switch to light mode
document.body.classList.remove('dark');

// Toggle theme
document.body.classList.toggle('dark');
```

## Utility Classes

The global.css file includes utility classes for common styling needs:

### Layout
- `.container` - Centered container with max-width
- `.container-fluid` - Full-width container

### Flexbox
- `.flex`, `.flex-col`, `.flex-row`
- `.items-start`, `.items-center`, `.items-end`
- `.justify-start`, `.justify-center`, `.justify-end`, `.justify-between`
- `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-lg`, `.gap-xl`

### Grid
- `.grid`
- `.grid-cols-1`, `.grid-cols-2`, `.grid-cols-3`, `.grid-cols-4`, `.grid-cols-6`, `.grid-cols-12`

### Spacing
- `.m-0`, `.mt-xs`, `.mt-sm`, `.mt-md`, `.mt-lg`, `.mt-xl`
- `.mb-xs`, `.mb-sm`, `.mb-md`, `.mb-lg`, `.mb-xl`
- `.p-xs`, `.p-sm`, `.p-md`, `.p-lg`, `.p-xl`

### Typography
- `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`
- `.text-primary`, `.text-secondary`, `.text-tertiary`, `.text-disabled`
- `.font-light`, `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`
- `.text-left`, `.text-center`, `.text-right`

### Display
- `.hidden`, `.block`, `.inline`, `.inline-block`

## Responsive Design

The theme system includes responsive breakpoints:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

Grid columns automatically adjust:
- Mobile: All grids become single column
- Tablet: 3+ column grids become 2 columns
- Desktop: Full grid layout

## RTL Support

For right-to-left languages (Arabic), add the `rtl` class or `dir="rtl"` attribute:

```html
<body class="rtl">
  <!-- Content -->
</body>

<!-- OR -->

<div dir="rtl">
  <!-- Content -->
</div>
```

## Accessibility

The theme system includes accessibility features:

- **Focus Indicators**: Visible focus outlines with sufficient contrast
- **WCAG AA Compliance**: Color combinations meet 4.5:1 contrast ratio
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference
- **Semantic Colors**: Clear semantic meaning for success, warning, error, info

## Best Practices

1. **Use CSS Variables**: Always use CSS variables instead of hardcoded colors
2. **Semantic Colors**: Use semantic colors (success, warning, danger) for their intended purpose
3. **Consistent Spacing**: Use the spacing scale for margins and padding
4. **Typography Scale**: Use the defined font sizes for consistency
5. **Shadow Hierarchy**: Use appropriate shadow levels for visual hierarchy
6. **Transitions**: Use defined transition durations for smooth animations
7. **Responsive Design**: Test components at all breakpoints
8. **Dark Mode**: Ensure components work in both light and dark modes
9. **Accessibility**: Maintain sufficient contrast ratios and focus indicators

## Examples

### Button Component

```css
.button {
  /* Use theme variables */
  background-color: var(--color-primary);
  color: var(--text-inverse);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.button.success {
  background-color: var(--color-success);
  border-color: var(--color-success);
}

.button.danger {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
}
```

### Card Component

```css
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.cardHeader {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-primary);
}

.cardTitle {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.cardContent {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}
```

### Input Component

```css
.input {
  width: 100%;
  height: var(--input-height-md);
  padding: var(--input-padding-y) var(--input-padding-x);
  font-size: var(--font-size-base);
  font-family: var(--font-sans);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input:hover {
  border-color: var(--border-secondary);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.input.error {
  border-color: var(--border-error);
}

.input:disabled {
  background-color: var(--bg-secondary);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

## Migration Guide

If you're migrating from the old theme system:

1. Replace `design-tokens.js` imports with `theme.js`
2. Replace `theme.css` imports with `global.css`
3. Update CSS variable names to match the new naming convention
4. Test components in both light and dark modes
5. Verify responsive behavior at all breakpoints

## Support

For questions or issues with the theme system, please refer to:
- Design document: `.kiro/specs/skoolific-v2-ui-redesign/design.md`
- Requirements document: `.kiro/specs/skoolific-v2-ui-redesign/requirements.md`

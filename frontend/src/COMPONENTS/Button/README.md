# Button Component

A versatile, accessible button component with multiple variants, sizes, and states. Fully supports light/dark mode theming and keyboard navigation.

## Features

- ✅ 6 variants: primary, secondary, success, warning, danger, ghost
- ✅ 3 sizes: small, medium, large
- ✅ Multiple states: default, hover, active, disabled, loading
- ✅ Icon support with configurable position (left/right)
- ✅ Full width option
- ✅ Light and dark mode support via CSS variables
- ✅ Accessibility compliant (WCAG AA)
- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ Smooth animations and transitions

## Installation

The Button component is already installed in the project. Import it from:

```jsx
import Button from './COMPONENTS/Button/Button';
```

## Basic Usage

```jsx
import Button from './COMPONENTS/Button/Button';

function MyComponent() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click Me
    </Button>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Button content (required) |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'ghost'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `icon` | `ReactNode` | - | Icon element to display |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position of the icon |
| `onClick` | `function` | - | Click event handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | - | ARIA label for accessibility |

## Variants

### Primary
Main action button with prominent styling.

```jsx
<Button variant="primary">Primary Button</Button>
```

### Secondary
Secondary action with less prominent styling.

```jsx
<Button variant="secondary">Secondary Button</Button>
```

### Success
Positive action (e.g., save, confirm, approve).

```jsx
<Button variant="success">Save Changes</Button>
```

### Warning
Caution action (e.g., proceed with caution).

```jsx
<Button variant="warning">Proceed with Caution</Button>
```

### Danger
Destructive action (e.g., delete, remove).

```jsx
<Button variant="danger">Delete Item</Button>
```

### Ghost
Transparent button with minimal styling.

```jsx
<Button variant="ghost">Cancel</Button>
```

## Sizes

```jsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

## States

### Disabled

```jsx
<Button disabled>Disabled Button</Button>
```

### Loading

```jsx
<Button loading>Loading...</Button>
```

The loading state automatically disables the button and shows a spinner.

## With Icons

### Icon on the Left (Default)

```jsx
import { Save } from 'lucide-react';

<Button icon={<Save size={16} />}>
  Save
</Button>
```

### Icon on the Right

```jsx
import { ArrowRight } from 'lucide-react';

<Button icon={<ArrowRight size={16} />} iconPosition="right">
  Next
</Button>
```

### Icon Only

```jsx
import { Trash2 } from 'lucide-react';

<Button 
  variant="danger" 
  icon={<Trash2 size={16} />}
  ariaLabel="Delete item"
>
  {/* Empty children for icon-only button */}
</Button>
```

## Full Width

```jsx
<Button fullWidth variant="primary">
  Full Width Button
</Button>
```

## Accessibility

The Button component follows WCAG AA accessibility guidelines:

### ARIA Labels

Use `ariaLabel` for buttons with icons or unclear text:

```jsx
<Button 
  icon={<Save size={16} />}
  ariaLabel="Save document"
>
  💾
</Button>
```

### Keyboard Navigation

- **Tab**: Focus the button
- **Enter** or **Space**: Activate the button
- **Shift + Tab**: Focus previous element

### Focus Indicators

Visible focus indicators appear when navigating with keyboard (2px outline with 2px offset).

### Screen Reader Support

- All buttons have proper ARIA attributes
- Loading state is announced to screen readers
- Disabled state prevents interaction

## Examples

### Form Submit Button

```jsx
<form onSubmit={handleSubmit}>
  <Button type="submit" variant="primary" loading={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit Form'}
  </Button>
</form>
```

### Confirmation Dialog

```jsx
<div className="dialog-actions">
  <Button variant="ghost" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="danger" onClick={onConfirm}>
    Delete
  </Button>
</div>
```

### Action Bar

```jsx
<div className="action-bar">
  <Button variant="secondary" icon={<Download />}>
    Export
  </Button>
  <Button variant="primary" icon={<Plus />}>
    Add New
  </Button>
</div>
```

### Loading State

```jsx
function SaveButton() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button 
      variant="success" 
      loading={saving}
      onClick={handleSave}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}
```

## Theming

The Button component uses CSS variables for theming. It automatically adapts to light and dark modes.

### CSS Variables Used

```css
/* Colors */
--primary-color
--secondary-color
--success-color
--warning-color
--error-color
--text-color
--bg-secondary
--bg-tertiary
--border-color

/* Shadows */
--card-shadow

/* Focus */
--primary-color (for focus outline)
```

### Custom Styling

You can override styles using the `className` prop:

```jsx
<Button className="my-custom-button">
  Custom Styled Button
</Button>
```

```css
.my-custom-button {
  border-radius: 20px;
  padding: 12px 32px;
}
```

## Testing

The Button component includes comprehensive tests:

- **Button.test.jsx**: Core functionality tests (60 tests)
- **Button.variants.test.jsx**: New variants and features tests (12 tests)

Run tests:

```bash
npm test -- Button.test.jsx
npm test -- Button.variants.test.jsx
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lightweight: ~2KB gzipped
- CSS Modules for scoped styling
- No runtime dependencies
- Optimized animations (60fps)

## Migration Guide

### From Legacy Size Names

The component supports both old and new size names for backward compatibility:

```jsx
// Old (still works)
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// New (recommended)
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

### From Outline Variant

The `outline` variant is deprecated. Use `secondary` or `ghost` instead:

```jsx
// Old
<Button variant="outline">Button</Button>

// New
<Button variant="secondary">Button</Button>
// or
<Button variant="ghost">Button</Button>
```

## Related Components

- **Input**: Form input component
- **Select**: Dropdown select component
- **Modal**: Dialog component (uses Button for actions)
- **Toast**: Notification component (uses Button for actions)

## Changelog

### Version 2.0.0 (Current)
- ✅ Added `success` and `warning` variants
- ✅ Added `small`, `medium`, `large` size names
- ✅ Added `fullWidth` prop
- ✅ Added `iconPosition` prop
- ✅ Added `ariaLabel` prop
- ✅ Improved accessibility with ARIA attributes
- ✅ Enhanced keyboard navigation
- ✅ Better theme support with CSS variables
- ✅ Comprehensive test coverage

### Version 1.0.0
- Initial implementation with basic variants
- Light/dark mode support
- Icon support
- Loading state

## Contributing

When contributing to the Button component:

1. Maintain backward compatibility
2. Add tests for new features
3. Update documentation
4. Follow accessibility guidelines
5. Test in both light and dark modes
6. Test keyboard navigation

## License

Part of the Skoolific V2 UI/UX Redesign project.

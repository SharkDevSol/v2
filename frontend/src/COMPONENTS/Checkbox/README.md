# Checkbox Component

A fully accessible checkbox component with support for checked, unchecked, and indeterminate states.

## Features

- ✅ **Multiple States**: Checked, unchecked, and indeterminate
- ✅ **Validation States**: Error messages and helper text
- ✅ **Disabled State**: Prevents user interaction
- ✅ **Custom Labels**: Support for labels and descriptions
- ✅ **ARIA Attributes**: Full accessibility support
- ✅ **RTL Layout**: Right-to-left language support
- ✅ **Responsive**: Touch-friendly with 44x44px minimum target size
- ✅ **Theme Support**: Light and dark mode compatible
- ✅ **Size Variants**: Small, medium, and large sizes

## Usage

### Basic Checkbox

```jsx
import { Checkbox } from './COMPONENTS/Checkbox';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      label="Accept terms and conditions"
      checked={checked}
      onChange={setChecked}
    />
  );
}
```

### With Description

```jsx
<Checkbox
  label="Subscribe to newsletter"
  description="Get weekly updates about new features and products"
  checked={subscribed}
  onChange={setSubscribed}
/>
```

### With Validation

```jsx
<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={setAgreed}
  required={true}
  error={!agreed ? "You must accept the terms to continue" : ""}
/>
```

### Indeterminate State

```jsx
<Checkbox
  label="Select all"
  checked={false}
  indeterminate={someSelected}
  onChange={handleSelectAll}
/>
```

### Disabled State

```jsx
<Checkbox
  label="This option is disabled"
  checked={false}
  onChange={() => {}}
  disabled={true}
/>
```

### Size Variants

```jsx
<Checkbox label="Small" size="sm" checked={false} onChange={() => {}} />
<Checkbox label="Medium" size="md" checked={false} onChange={() => {}} />
<Checkbox label="Large" size="lg" checked={false} onChange={() => {}} />
```

### With Helper Text

```jsx
<Checkbox
  label="Remember me"
  helperText="You can change this later in settings"
  checked={remember}
  onChange={setRemember}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Checkbox label text |
| `description` | `string` | - | Optional description below the label |
| `checked` | `boolean` | `false` | Checked state |
| `onChange` | `function` | - | Change handler (receives boolean value) |
| `disabled` | `boolean` | `false` | Disabled state |
| `indeterminate` | `boolean` | `false` | Indeterminate state (for "select all" scenarios) |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text to display |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Checkbox size |
| `className` | `string` | - | Additional CSS classes |
| `id` | `string` | auto-generated | Input ID for label association |
| `ariaLabel` | `string` | - | ARIA label for accessibility |
| `ariaDescribedBy` | `string` | - | ARIA described by for accessibility |
| `required` | `boolean` | `false` | Required field indicator |
| `ref` | `React.Ref` | - | Ref forwarded to input element |

## Accessibility

The Checkbox component follows WCAG AA accessibility guidelines:

- **Keyboard Navigation**: Fully keyboard accessible (Tab to focus, Space to toggle)
- **Screen Reader Support**: Proper ARIA attributes for screen readers
- **Focus Indicators**: Visible focus outline with 3:1 contrast ratio
- **Touch Targets**: Minimum 44x44px touch target size on mobile
- **Labels**: Associated labels for all inputs
- **Error Announcements**: Error messages announced via `role="alert"`

## RTL Support

The component automatically adapts to RTL (right-to-left) layouts when `dir="rtl"` is set on a parent element:

- Label and checkbox positions are mirrored
- Helper text alignment is adjusted
- Required indicator position is mirrored

## Theme Support

The component uses CSS variables for theming:

- `--color-primary`: Primary color for checked state
- `--color-primary-hover`: Hover state color
- `--color-error`: Error state color
- `--border-primary`: Border color
- `--border-focus`: Focus outline color
- `--bg-primary`: Background color
- `--bg-secondary`: Secondary background (dark mode)
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color

## Examples

### Select All with Indeterminate State

```jsx
function SelectAllExample() {
  const [items, setItems] = useState([
    { id: 1, checked: false },
    { id: 2, checked: false },
    { id: 3, checked: false }
  ]);

  const allChecked = items.every(item => item.checked);
  const someChecked = items.some(item => item.checked) && !allChecked;

  const handleSelectAll = (checked) => {
    setItems(items.map(item => ({ ...item, checked })));
  };

  const handleItemChange = (id, checked) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  return (
    <div>
      <Checkbox
        label="Select all"
        checked={allChecked}
        indeterminate={someChecked}
        onChange={handleSelectAll}
      />
      {items.map(item => (
        <Checkbox
          key={item.id}
          label={`Item ${item.id}`}
          checked={item.checked}
          onChange={(checked) => handleItemChange(item.id, checked)}
        />
      ))}
    </div>
  );
}
```

### Form Validation

```jsx
function FormExample() {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (agreed) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Checkbox
        label="I agree to the terms and conditions"
        checked={agreed}
        onChange={setAgreed}
        required={true}
        error={submitted && !agreed ? "You must accept the terms" : ""}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Testing

The component includes comprehensive tests covering:

- Rendering with various props
- User interactions (click, keyboard)
- Accessibility attributes
- Validation states
- RTL support
- Edge cases

Run tests with:

```bash
npm test -- Checkbox.test.jsx
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Related Components

- [Radio](../Radio/README.md) - Single selection from multiple options
- [RadioGroup](../Radio/README.md) - Group of radio buttons
- [Input](../Input/README.md) - Text input component
- [Select](../Select/README.md) - Dropdown selection component

# Textarea Component

A fully-featured, accessible textarea component with auto-resize, character counting, validation states, and RTL support.

## Features

- ✅ **Reusable Component**: Consistent styling and behavior across the application
- ✅ **Auto-Resize**: Automatically grows with content
- ✅ **Character Counter**: Shows current character count and optional max length
- ✅ **Validation States**: Error, success, and warning states with messages
- ✅ **Disabled & Read-Only**: Support for non-interactive states
- ✅ **ARIA Attributes**: Full accessibility support for screen readers
- ✅ **RTL Layout**: Right-to-left text direction support
- ✅ **Light & Dark Mode**: Theme-aware styling
- ✅ **Keyboard Navigation**: Full keyboard accessibility
- ✅ **Comprehensive Tests**: 56 passing tests covering all features

## Installation

The component is already installed in the project. Import it from:

```jsx
import Textarea from './COMPONENTS/Textarea/Textarea';
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import Textarea from './COMPONENTS/Textarea/Textarea';

function MyForm() {
  const [description, setDescription] = useState('');
  
  return (
    <Textarea
      label="Description"
      placeholder="Enter your description..."
      value={description}
      onChange={setDescription}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the textarea |
| `value` | `string` | `''` | Controlled value of the textarea (required) |
| `onChange` | `function` | - | Change handler function (required) |
| `placeholder` | `string` | - | Placeholder text |
| `error` | `string` | - | Error message (shows error state) |
| `success` | `string` | - | Success message (shows success state) |
| `warning` | `string` | - | Warning message (shows warning state) |
| `helperText` | `string` | - | Helper text below textarea |
| `required` | `boolean` | `false` | Shows required indicator (*) |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `readOnly` | `boolean` | `false` | Makes textarea read-only |
| `rows` | `number` | `4` | Initial number of rows |
| `maxLength` | `number` | - | Maximum character length |
| `showCount` | `boolean` | `false` | Show character count |
| `autoResize` | `boolean` | `false` | Enable auto-resize functionality |
| `resize` | `'none'` \| `'vertical'` \| `'horizontal'` \| `'both'` | `'vertical'` | Resize behavior |
| `className` | `string` | `''` | Additional CSS classes |
| `id` | `string` | auto-generated | Textarea ID for accessibility |
| `name` | `string` | - | Textarea name attribute |
| `ariaLabel` | `string` | - | ARIA label for accessibility |
| `ariaDescribedBy` | `string` | - | ARIA described-by for accessibility |

## Examples

### Basic Textarea

```jsx
<Textarea
  label="Comments"
  placeholder="Enter your comments..."
  value={comments}
  onChange={setComments}
/>
```

### Required Field with Helper Text

```jsx
<Textarea
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChange={setDescription}
  required
  helperText="Please provide a detailed description"
/>
```

### With Character Counter

```jsx
<Textarea
  label="Bio"
  placeholder="Tell us about yourself..."
  value={bio}
  onChange={setBio}
  showCount
  rows={6}
/>
```

### With Max Length

```jsx
<Textarea
  label="Short Description"
  placeholder="Enter a brief description..."
  value={description}
  onChange={setDescription}
  maxLength={200}
/>
```

### Auto-Resize

```jsx
<Textarea
  label="Notes"
  placeholder="Add your notes..."
  value={notes}
  onChange={setNotes}
  autoResize
  rows={3}
/>
```

### With Validation

```jsx
const [description, setDescription] = useState('');
const [error, setError] = useState('');

const handleChange = (value) => {
  setDescription(value);
  if (value.length < 10) {
    setError('Description must be at least 10 characters');
  } else {
    setError('');
  }
};

<Textarea
  label="Product Description"
  placeholder="Describe the product..."
  value={description}
  onChange={handleChange}
  error={error}
  required
/>
```

### Success State

```jsx
<Textarea
  label="Review"
  placeholder="Write your review..."
  value={review}
  onChange={setReview}
  success="Great! Your review looks good."
/>
```

### Warning State

```jsx
<Textarea
  label="Feedback"
  placeholder="Provide your feedback..."
  value={feedback}
  onChange={setFeedback}
  warning="Consider adding more details"
/>
```

### Disabled

```jsx
<Textarea
  label="System Message"
  value="This field is disabled"
  onChange={() => {}}
  disabled
/>
```

### Read-Only

```jsx
<Textarea
  label="Terms and Conditions"
  value="By using this service..."
  onChange={() => {}}
  readOnly
  rows={4}
/>
```

### Custom Resize Behavior

```jsx
// No resize
<Textarea
  label="Fixed Size"
  value={value}
  onChange={setValue}
  resize="none"
/>

// Vertical resize only (default)
<Textarea
  label="Vertical Resize"
  value={value}
  onChange={setValue}
  resize="vertical"
/>

// Both directions
<Textarea
  label="Free Resize"
  value={value}
  onChange={setValue}
  resize="both"
/>
```

### RTL Support

```jsx
<div dir="rtl">
  <Textarea
    label="الوصف"
    placeholder="أدخل الوصف..."
    value={description}
    onChange={setDescription}
    required
    maxLength={200}
  />
</div>
```

## Accessibility

The Textarea component is fully accessible and includes:

- **ARIA Labels**: Proper labeling for screen readers
- **ARIA Required**: Indicates required fields
- **ARIA Invalid**: Indicates validation errors
- **ARIA Described By**: Links helper text and error messages
- **ARIA Live Regions**: Announces validation messages
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus states
- **Semantic HTML**: Uses proper label and textarea elements
- **Minimum Touch Target**: 44x44px for accessibility

## Theme Support

The component automatically adapts to light and dark themes using CSS variables:

- `--text-primary`: Text color
- `--bg-primary`: Background color
- `--border-primary`: Border color
- `--border-focus`: Focus border color
- `--color-error`: Error state color
- `--color-success`: Success state color
- `--color-warning`: Warning state color
- `--radius-md`: Border radius
- `--transition-base`: Transition duration

## Testing

The component has comprehensive test coverage with 56 passing tests:

```bash
npm test -- Textarea.test.jsx --run
```

Tests cover:
- Basic rendering in light and dark modes
- Required field indicator
- Disabled and read-only states
- Validation states (error, success, warning)
- Helper text display
- Character counter
- User interactions
- Rows configuration
- ARIA attributes
- RTL support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized re-renders with React.forwardRef
- Efficient auto-resize using useEffect
- CSS transitions for smooth animations
- Respects prefers-reduced-motion

## Related Components

- [Input](../Input/README.md) - Single-line text input
- [Select](../Select/README.md) - Dropdown selection
- [Checkbox](../Checkbox/README.md) - Checkbox input
- [Radio](../Radio/README.md) - Radio button input

## License

Part of the Skoolific V2 UI Redesign project.

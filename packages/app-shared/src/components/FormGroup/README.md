# FormGroup Component

A wrapper component for form fields that provides consistent layout with label, error message, and help text support. The FormGroup component ensures proper accessibility and styling for all form elements.

## Features

- ✅ Consistent form field layout
- ✅ Label with optional required indicator
- ✅ Error message display with ARIA support
- ✅ Helper text for additional guidance
- ✅ Inline (horizontal) layout option
- ✅ Label icons support
- ✅ Full accessibility (ARIA attributes)
- ✅ Light and dark mode support
- ✅ RTL (Right-to-Left) support
- ✅ Responsive design
- ✅ Touch-friendly on mobile devices

## Installation

```jsx
import FormGroup from '@/COMPONENTS/FormGroup';
```

## Basic Usage

```jsx
import FormGroup from '@/COMPONENTS/FormGroup';
import Input from '@/COMPONENTS/Input';

function MyForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  return (
    <FormGroup
      label="Full Name"
      required
      error={error}
      helperText="Enter your first and last name"
    >
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
      />
    </FormGroup>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text for the form field |
| `children` | `ReactNode` | **required** | Form field element(s) to wrap |
| `error` | `string` | - | Error message to display (shows error state) |
| `helperText` | `string` | - | Helper text to display below the field |
| `required` | `boolean` | `false` | Whether the field is required (adds asterisk) |
| `className` | `string` | `''` | Additional CSS classes |
| `id` | `string` | auto-generated | ID for the form group |
| `inline` | `boolean` | `false` | Display label and field inline (horizontal) |
| `labelWidth` | `string` | - | Width of label in inline mode (e.g., '150px') |
| `labelIcon` | `ReactNode` | - | Optional icon to display next to label |
| `htmlFor` | `string` | - | ID of the input element this label is for |

## Examples

### Basic Form Field

```jsx
<FormGroup label="Email" required>
  <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormGroup>
```

### With Error Message

```jsx
<FormGroup
  label="Password"
  required
  error="Password must be at least 8 characters"
>
  <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
</FormGroup>
```

### With Helper Text

```jsx
<FormGroup
  label="Username"
  helperText="Choose a unique username (3-20 characters)"
>
  <Input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
  />
</FormGroup>
```

### With Label Icon

```jsx
import { User } from 'lucide-react';

<FormGroup
  label="Full Name"
  labelIcon={<User size={16} />}
  required
>
  <Input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</FormGroup>
```

### Inline Layout

```jsx
<FormGroup
  label="Country"
  inline
  labelWidth="150px"
>
  <Select
    value={country}
    onChange={setCountry}
    options={countryOptions}
  />
</FormGroup>
```

### With Select Component

```jsx
<FormGroup
  label="Department"
  required
  helperText="Select your department"
>
  <Select
    value={department}
    onChange={setDepartment}
    options={[
      { value: 'it', label: 'IT' },
      { value: 'hr', label: 'HR' },
      { value: 'finance', label: 'Finance' }
    ]}
  />
</FormGroup>
```

### With Textarea

```jsx
<FormGroup
  label="Description"
  helperText="Provide a detailed description"
>
  <Textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={4}
  />
</FormGroup>
```

### With Checkbox

```jsx
<FormGroup error={termsError}>
  <Checkbox
    label="I accept the terms and conditions"
    checked={acceptTerms}
    onChange={setAcceptTerms}
    required
  />
</FormGroup>
```

### Without Label

```jsx
<FormGroup helperText="Optional field">
  <Input
    type="text"
    placeholder="Enter value"
  />
</FormGroup>
```

## Accessibility

The FormGroup component automatically handles accessibility:

- **ARIA Labels**: Adds `aria-describedby` to children for error and helper text
- **ARIA Invalid**: Sets `aria-invalid="true"` when error is present
- **ARIA Required**: Sets `aria-required="true"` when required prop is true
- **Error Announcements**: Error messages use `role="alert"` for screen readers
- **Label Association**: Properly associates labels with form fields using `htmlFor`

## Styling

The component uses CSS modules and supports:

- **Light/Dark Mode**: Automatically adapts to theme
- **RTL Support**: Full right-to-left language support
- **Responsive**: Stacks inline forms on mobile devices
- **Custom Styling**: Add custom classes via `className` prop

## Best Practices

1. **Always provide labels**: Labels improve accessibility and usability
2. **Use helper text**: Provide guidance for complex fields
3. **Show errors clearly**: Display validation errors immediately
4. **Mark required fields**: Use the `required` prop for required fields
5. **Don't show both error and helper text**: Error takes precedence
6. **Use inline layout sparingly**: Best for simple forms with short labels
7. **Provide meaningful error messages**: Be specific about what went wrong

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- [Input](../Input/README.md) - Text input component
- [Select](../Select/README.md) - Dropdown select component
- [Checkbox](../Checkbox/README.md) - Checkbox component
- [Radio](../Radio/README.md) - Radio button component
- [Textarea](../Textarea/README.md) - Multi-line text input

## Testing

The component includes comprehensive tests covering:
- Label rendering
- Required indicator
- Error message display
- Helper text display
- ARIA attributes
- Inline layout
- Custom classes
- Label icons

Run tests:
```bash
npm test -- FormGroup.test.jsx
```

## License

Part of the Skoolific V2 design system.

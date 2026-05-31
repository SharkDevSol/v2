# Radio Component

A fully accessible radio button component with support for individual radios and radio groups.

## Features

- ✅ **Single Selection**: Only one option can be selected at a time
- ✅ **Validation States**: Error messages and helper text
- ✅ **Disabled State**: Prevents user interaction
- ✅ **Custom Labels**: Support for labels and descriptions
- ✅ **ARIA Attributes**: Full accessibility support
- ✅ **RTL Layout**: Right-to-left language support
- ✅ **Responsive**: Touch-friendly with 44x44px minimum target size
- ✅ **Theme Support**: Light and dark mode compatible
- ✅ **Size Variants**: Small, medium, and large sizes
- ✅ **Layout Options**: Vertical and horizontal layouts

## Components

### Radio

Individual radio button component.

### RadioGroup

Container component for managing multiple radio buttons.

## Usage

### Basic Radio Group

```jsx
import { RadioGroup } from './COMPONENTS/Radio';

function MyComponent() {
  const [value, setValue] = useState('option1');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  return (
    <RadioGroup
      name="my-options"
      label="Choose an option"
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}
```

### With Descriptions

```jsx
const options = [
  { 
    value: 'basic', 
    label: 'Basic Plan',
    description: 'Perfect for individuals and small teams'
  },
  { 
    value: 'pro', 
    label: 'Pro Plan',
    description: 'Advanced features for growing businesses'
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise Plan',
    description: 'Custom solutions for large organizations'
  }
];

<RadioGroup
  name="plan"
  label="Select your plan"
  options={options}
  value={selectedPlan}
  onChange={setSelectedPlan}
/>
```

### With Validation

```jsx
<RadioGroup
  name="payment-method"
  label="Payment method"
  options={paymentOptions}
  value={paymentMethod}
  onChange={setPaymentMethod}
  required={true}
  error={!paymentMethod ? "Please select a payment method" : ""}
/>
```

### Horizontal Layout

```jsx
<RadioGroup
  name="gender"
  label="Gender"
  layout="horizontal"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]}
  value={gender}
  onChange={setGender}
/>
```

### Disabled Options

```jsx
const options = [
  { value: 'available', label: 'Available Option' },
  { value: 'unavailable', label: 'Unavailable Option', disabled: true },
  { value: 'another', label: 'Another Option' }
];

<RadioGroup
  name="options"
  options={options}
  value={selected}
  onChange={setSelected}
/>
```

### Disabled Group

```jsx
<RadioGroup
  name="options"
  options={options}
  value={selected}
  onChange={setSelected}
  disabled={true}
/>
```

### Size Variants

```jsx
<RadioGroup
  name="size-example"
  size="sm"
  options={options}
  value={value}
  onChange={setValue}
/>
```

### Individual Radio Buttons

```jsx
import { Radio } from './COMPONENTS/Radio';

<Radio
  name="choice"
  value="option1"
  label="Option 1"
  checked={selected === 'option1'}
  onChange={() => setSelected('option1')}
/>
<Radio
  name="choice"
  value="option2"
  label="Option 2"
  checked={selected === 'option2'}
  onChange={() => setSelected('option2')}
/>
```

## RadioGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Radio group name (required for grouping) |
| `options` | `Array<Option>` | `[]` | Array of radio options |
| `value` | `string` | - | Currently selected value |
| `onChange` | `function` | - | Change handler (receives selected value) |
| `disabled` | `boolean` | `false` | Disabled state for all radios |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text to display |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `label` | `string` | - | Group label |
| `description` | `string` | - | Group description |
| `required` | `boolean` | `false` | Required field indicator |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Radio size |
| `className` | `string` | - | Additional CSS classes |

### Option Type

```typescript
interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
```

## Radio Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Radio label text |
| `description` | `string` | - | Optional description below the label |
| `value` | `string` | **required** | Radio value |
| `checked` | `boolean` | `false` | Checked state |
| `onChange` | `function` | - | Change handler |
| `disabled` | `boolean` | `false` | Disabled state |
| `name` | `string` | **required** | Radio group name |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text to display |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Radio size |
| `className` | `string` | - | Additional CSS classes |
| `id` | `string` | auto-generated | Input ID for label association |
| `ariaLabel` | `string` | - | ARIA label for accessibility |
| `ariaDescribedBy` | `string` | - | ARIA described by for accessibility |
| `required` | `boolean` | `false` | Required field indicator |
| `ref` | `React.Ref` | - | Ref forwarded to input element |

## Accessibility

The Radio components follow WCAG AA accessibility guidelines:

- **Keyboard Navigation**: Fully keyboard accessible (Tab to focus, Arrow keys to navigate, Space to select)
- **Screen Reader Support**: Proper ARIA attributes including `role="radiogroup"`
- **Focus Indicators**: Visible focus outline with 3:1 contrast ratio
- **Touch Targets**: Minimum 44x44px touch target size on mobile
- **Labels**: Associated labels for all inputs
- **Error Announcements**: Error messages announced via `role="alert"`
- **Group Semantics**: Proper radiogroup role and aria-labelledby

## RTL Support

The components automatically adapt to RTL (right-to-left) layouts when `dir="rtl"` is set on a parent element:

- Label and radio positions are mirrored
- Helper text alignment is adjusted
- Required indicator position is mirrored

## Theme Support

The components use CSS variables for theming:

- `--color-primary`: Primary color for selected state
- `--color-primary-hover`: Hover state color
- `--color-error`: Error state color
- `--border-primary`: Border color
- `--border-focus`: Focus outline color
- `--bg-primary`: Background color
- `--bg-secondary`: Secondary background (dark mode)
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color

## Examples

### Payment Method Selection

```jsx
function PaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState('');

  const paymentOptions = [
    { 
      value: 'card', 
      label: 'Credit/Debit Card',
      description: 'Pay securely with your card'
    },
    { 
      value: 'paypal', 
      label: 'PayPal',
      description: 'Fast and secure PayPal checkout'
    },
    { 
      value: 'bank', 
      label: 'Bank Transfer',
      description: 'Direct bank transfer'
    }
  ];

  return (
    <RadioGroup
      name="payment"
      label="Payment Method"
      description="Choose how you want to pay"
      options={paymentOptions}
      value={paymentMethod}
      onChange={setPaymentMethod}
      required={true}
    />
  );
}
```

### Form Validation

```jsx
function RegistrationForm() {
  const [accountType, setAccountType] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (accountType) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <RadioGroup
        name="account-type"
        label="Account Type"
        options={[
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' }
        ]}
        value={accountType}
        onChange={setAccountType}
        required={true}
        error={submitted && !accountType ? "Please select an account type" : ""}
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

### Conditional Options

```jsx
function ShippingForm() {
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [country, setCountry] = useState('US');

  const shippingOptions = [
    { value: 'standard', label: 'Standard Shipping', description: '5-7 business days' },
    { value: 'express', label: 'Express Shipping', description: '2-3 business days' },
    { 
      value: 'overnight', 
      label: 'Overnight Shipping', 
      description: 'Next business day',
      disabled: country !== 'US' // Only available in US
    }
  ];

  return (
    <RadioGroup
      name="shipping"
      label="Shipping Method"
      options={shippingOptions}
      value={shippingMethod}
      onChange={setShippingMethod}
      helperText={country !== 'US' ? "Overnight shipping only available in the US" : ""}
    />
  );
}
```

### Responsive Layout

```jsx
<RadioGroup
  name="preference"
  label="Notification Preference"
  layout="horizontal"
  options={[
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push' }
  ]}
  value={preference}
  onChange={setPreference}
/>
```

Note: On mobile devices (< 768px), horizontal layout automatically switches to vertical for better usability.

## Testing

The components include comprehensive tests covering:

- Rendering with various props
- User interactions (click, keyboard)
- Accessibility attributes
- Validation states
- Layout options
- Disabled states
- RTL support
- Edge cases

Run tests with:

```bash
npm test -- Radio.test.jsx RadioGroup.test.jsx
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Related Components

- [Checkbox](../Checkbox/README.md) - Multiple selection component
- [Input](../Input/README.md) - Text input component
- [Select](../Select/README.md) - Dropdown selection component

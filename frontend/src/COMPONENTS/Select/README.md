# Select Component

A comprehensive, accessible Select/Dropdown component with support for single selection, multi-selection, search functionality, grouped options, and full keyboard navigation.

## Features

✅ **Single & Multi-Select Modes** - Support for both single and multiple selection  
✅ **Searchable** - Built-in search/filter functionality for large option lists  
✅ **Grouped Options** - Organize options into labeled groups  
✅ **Validation States** - Error messages, required fields, and helper text  
✅ **Disabled States** - Disable entire select or individual options  
✅ **Accessibility** - WCAG AA compliant with full ARIA support  
✅ **Keyboard Navigation** - Complete keyboard support (Tab, Enter, Escape, Arrows)  
✅ **RTL Support** - Automatic right-to-left layout for Arabic  
✅ **Responsive** - Works seamlessly on mobile, tablet, and desktop  
✅ **Theme Support** - Light and dark mode compatible  

## Installation

The Select component is part of the design system and is already available in the project.

```jsx
import Select from './COMPONENTS/Select/Select';
```

## Basic Usage

### Single Select

```jsx
import { useState } from 'react';
import Select from './COMPONENTS/Select/Select';

function MyComponent() {
  const [value, setValue] = useState('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <Select
      label="Choose an option"
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Select one option"
    />
  );
}
```

### Multi-Select

```jsx
import { useState } from 'react';
import Select from './COMPONENTS/Select/Select';

function MyComponent() {
  const [values, setValues] = useState([]);

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <Select
      label="Choose multiple options"
      options={options}
      value={values}
      onChange={setValues}
      multiple
      placeholder="Select multiple options"
    />
  );
}
```

### Searchable Select

```jsx
<Select
  label="Search for a fruit"
  options={largeOptionsList}
  value={value}
  onChange={setValue}
  searchable
  placeholder="Type to search..."
/>
```

### Grouped Options

```jsx
const groupedOptions = [
  {
    group: 'Fruits',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ],
  },
  {
    group: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli' },
    ],
  },
];

<Select
  label="Choose a food item"
  options={groupedOptions}
  value={value}
  onChange={setValue}
/>
```

### With Validation

```jsx
<Select
  label="Required field"
  options={options}
  value={value}
  onChange={setValue}
  required
  error={!value ? 'This field is required' : ''}
  helperText="Please select an option"
/>
```

### Disabled State

```jsx
<Select
  label="Disabled select"
  options={options}
  value={value}
  onChange={setValue}
  disabled
/>
```

### Disabled Options

```jsx
const optionsWithDisabled = [
  { value: 'option1', label: 'Available Option' },
  { value: 'option2', label: 'Disabled Option', disabled: true },
  { value: 'option3', label: 'Another Available Option' },
];

<Select
  label="Select with disabled options"
  options={optionsWithDisabled}
  value={value}
  onChange={setValue}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the select |
| `options` | `Option[]` | `[]` | Array of options or grouped options |
| `value` | `string \| string[]` | - | Selected value(s) - string for single, array for multiple |
| `onChange` | `(value: string \| string[]) => void` | - | Callback when selection changes |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `searchable` | `boolean` | `false` | Enable search/filter functionality |
| `placeholder` | `string` | `'Select an option'` | Placeholder text when no value selected |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text displayed below the select |
| `required` | `boolean` | `false` | Mark field as required |
| `disabled` | `boolean` | `false` | Disable the select |
| `className` | `string` | `''` | Additional CSS classes |
| `id` | `string` | - | Input ID for accessibility |
| `name` | `string` | - | Input name attribute |

### Option Interface

```typescript
interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string; // For flat options with groups
}
```

### Grouped Options Interface

```typescript
interface GroupedOption {
  group: string;
  options: Option[];
}
```

## Option Formats

The Select component supports three option formats:

### 1. Flat Options (Simple)

```jsx
const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];
```

### 2. Flat Options with Groups

```jsx
const options = [
  { value: '1', label: 'Option 1', group: 'Group A' },
  { value: '2', label: 'Option 2', group: 'Group A' },
  { value: '3', label: 'Option 3', group: 'Group B' },
];
```

### 3. Grouped Options (Structured)

```jsx
const options = [
  {
    group: 'Group A',
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ],
  },
  {
    group: 'Group B',
    options: [
      { value: '3', label: 'Option 3' },
    ],
  },
];
```

## Keyboard Navigation

The Select component supports full keyboard navigation:

| Key | Action |
|-----|--------|
| `Tab` | Focus the select / Close dropdown and move to next element |
| `Enter` | Open dropdown / Select focused option |
| `Escape` | Close dropdown |
| `Arrow Down` | Open dropdown / Move focus to next option |
| `Arrow Up` | Move focus to previous option |
| `Space` | Open dropdown (when closed) |

## Accessibility

The Select component is fully accessible and WCAG AA compliant:

- ✅ **ARIA Attributes**: Proper `aria-haspopup`, `aria-expanded`, `aria-selected`, `aria-invalid`, `aria-required`, `aria-describedby`
- ✅ **Keyboard Navigation**: Full keyboard support for all interactions
- ✅ **Focus Management**: Visible focus indicators with proper contrast ratios
- ✅ **Screen Reader Support**: Compatible with NVDA, JAWS, and VoiceOver
- ✅ **Error Announcements**: Errors announced with `aria-live` regions
- ✅ **Semantic HTML**: Uses proper semantic elements and roles
- ✅ **Touch Targets**: Minimum 44x44px touch targets on mobile devices

## Styling

The Select component uses CSS Modules for scoped styling and supports theme customization through CSS variables:

### CSS Variables Used

```css
/* Colors */
--text-primary
--text-secondary
--text-tertiary
--bg-primary
--bg-secondary
--bg-elevated
--border-primary
--border-secondary
--border-focus
--color-primary
--color-primary-light
--color-error

/* Spacing */
--radius-sm
--radius-md
--radius-lg

/* Shadows */
--shadow-sm
--shadow-md
--shadow-lg

/* Transitions */
--transition-base
--transition-fast

/* Z-index */
--z-dropdown
```

### Custom Styling

You can add custom styles using the `className` prop:

```jsx
<Select
  className="my-custom-select"
  // ... other props
/>
```

```css
.my-custom-select {
  /* Your custom styles */
}
```

## RTL (Right-to-Left) Support

The Select component automatically supports RTL layout for Arabic and other RTL languages:

```jsx
<div dir="rtl">
  <Select
    label="اختر خيارًا"
    options={options}
    value={value}
    onChange={setValue}
  />
</div>
```

The component will automatically:
- Mirror the layout (icons on the left, text aligned right)
- Adjust dropdown positioning
- Reverse keyboard navigation direction

## Responsive Design

The Select component is fully responsive and adapts to different screen sizes:

- **Mobile (320px-767px)**: Touch-optimized with larger touch targets
- **Tablet (768px-1023px)**: Optimized spacing and sizing
- **Desktop (1024px+)**: Full-featured with hover states

## Examples

### Advanced: Searchable Multi-Select with Groups

```jsx
const groupedOptions = [
  {
    group: 'Frontend',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
    ],
  },
  {
    group: 'Backend',
    options: [
      { value: 'node', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
    ],
  },
];

<Select
  label="Select technologies"
  options={groupedOptions}
  value={selectedTechs}
  onChange={setSelectedTechs}
  multiple
  searchable
  placeholder="Search and select multiple"
  helperText="You can select multiple technologies"
/>
```

### Form Integration

```jsx
function MyForm() {
  const [formData, setFormData] = useState({
    category: '',
    tags: [],
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select at least one tag';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Select
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={(value) => {
          setFormData({ ...formData, category: value });
          setErrors({ ...errors, category: '' });
        }}
        required
        error={errors.category}
      />
      
      <Select
        label="Tags"
        options={tagOptions}
        value={formData.tags}
        onChange={(value) => {
          setFormData({ ...formData, tags: value });
          setErrors({ ...errors, tags: '' });
        }}
        multiple
        searchable
        required
        error={errors.tags}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Testing

The Select component includes comprehensive tests covering all features:

```bash
npm test -- Select.test.jsx
```

Test coverage includes:
- ✅ Basic rendering
- ✅ Single select mode
- ✅ Multi-select mode
- ✅ Search functionality
- ✅ Grouped options
- ✅ Disabled states
- ✅ Validation states
- ✅ Keyboard navigation
- ✅ Clear functionality
- ✅ Accessibility features
- ✅ RTL support

## Demo

To see all features in action, check out the demo component:

```jsx
import SelectDemo from './COMPONENTS/Select/SelectDemo';

function App() {
  return <SelectDemo />;
}
```

## Browser Support

The Select component works in all modern browsers:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

The Select component is optimized for performance:

- Uses `React.useMemo` for expensive computations
- Efficient event handling with proper cleanup
- Minimal re-renders with optimized state management
- Smooth animations using CSS transitions

## Best Practices

1. **Always provide a label** for accessibility
2. **Use searchable for large lists** (>10 options)
3. **Group related options** for better organization
4. **Provide clear error messages** for validation
5. **Use helper text** to guide users
6. **Test with keyboard navigation** to ensure accessibility
7. **Consider multi-select** for scenarios where users might need multiple choices

## Troubleshooting

### Dropdown not opening
- Check if the select is disabled
- Verify that options array is not empty
- Ensure proper event handlers are attached

### Search not working
- Verify `searchable` prop is set to `true`
- Check that options have valid `label` properties

### Grouped options not displaying
- Ensure options follow the correct grouped format
- Verify group names are strings

### Styling issues
- Check that CSS variables are defined in your theme
- Verify CSS Modules are properly configured
- Ensure no conflicting global styles

## Related Components

- **Input** - Text input component
- **Checkbox** - Checkbox component
- **Radio** - Radio button component
- **Textarea** - Multi-line text input

## License

Part of the Skoolific V2 UI Design System.

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

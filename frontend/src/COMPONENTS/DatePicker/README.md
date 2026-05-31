# DatePicker Component

A fully-featured date picker component with Ethiopian calendar support, built for the Skoolific V2 UI redesign.

## Features

- ✅ **Gregorian and Ethiopian Calendar Support**: Switch between calendar types seamlessly
- ✅ **Accessible**: WCAG AA compliant with proper ARIA attributes and keyboard navigation
- ✅ **Responsive**: Works on mobile, tablet, and desktop devices
- ✅ **Light/Dark Mode**: Supports theme switching
- ✅ **RTL Support**: Works with right-to-left languages
- ✅ **Date Restrictions**: Min/max date validation
- ✅ **Keyboard Navigation**: Full keyboard support (Enter, Escape, Tab)
- ✅ **Touch-Friendly**: Minimum 44x44px touch targets
- ✅ **Validation States**: Error messages and required field indicators
- ✅ **Clear Functionality**: Easy date clearing with clear button

## Installation

The DatePicker component is located in `src/COMPONENTS/DatePicker/` and can be imported as:

```jsx
import DatePicker from './COMPONENTS/DatePicker';
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import DatePicker from './COMPONENTS/DatePicker';

function MyComponent() {
  const [date, setDate] = useState(null);

  return (
    <DatePicker
      label="Select Date"
      value={date}
      onChange={setDate}
      placeholder="Choose a date"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label text |
| `value` | `Date \| null` | - | Selected date value (Gregorian Date object) |
| `onChange` | `function` | - | Change handler function (receives Date object) |
| `minDate` | `Date` | - | Minimum selectable date |
| `maxDate` | `Date` | - | Maximum selectable date |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `string` | - | Error message to display |
| `calendarType` | `'gregorian' \| 'ethiopian'` | `'gregorian'` | Calendar type |
| `format` | `string` | - | Date format string (future enhancement) |
| `placeholder` | `string` | `'Select date'` | Placeholder text |
| `className` | `string` | `''` | Additional CSS classes |
| `required` | `boolean` | `false` | Required field indicator |
| `id` | `string` | auto-generated | Input ID for accessibility |
| `name` | `string` | - | Input name attribute |

## Examples

### Basic DatePicker

```jsx
const [date, setDate] = useState(null);

<DatePicker
  label="Select Date"
  value={date}
  onChange={setDate}
  placeholder="Choose a date"
/>
```

### DatePicker with Validation

```jsx
const [date, setDate] = useState(null);
const [error, setError] = useState('');

const handleChange = (newDate) => {
  setDate(newDate);
  if (!newDate) {
    setError('Date is required');
  } else {
    setError('');
  }
};

<DatePicker
  label="Birth Date"
  value={date}
  onChange={handleChange}
  error={error}
  required
/>
```

### DatePicker with Min/Max Dates

```jsx
const [date, setDate] = useState(null);
const today = new Date();
const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

<DatePicker
  label="Appointment Date"
  value={date}
  onChange={setDate}
  minDate={minDate}
  maxDate={maxDate}
/>
```

### Ethiopian Calendar DatePicker

```jsx
const [date, setDate] = useState(null);

<DatePicker
  label="የቀን መምረጫ"
  value={date}
  onChange={setDate}
  calendarType="ethiopian"
  placeholder="ቀን ይምረጡ"
/>
```

### Date Range Selection

```jsx
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);

<>
  <DatePicker
    label="Start Date"
    value={startDate}
    onChange={setStartDate}
    maxDate={endDate}
  />
  <DatePicker
    label="End Date"
    value={endDate}
    onChange={setEndDate}
    minDate={startDate}
  />
</>
```

### Disabled DatePicker

```jsx
const [date] = useState(new Date());

<DatePicker
  label="Registration Date"
  value={date}
  onChange={() => {}}
  disabled
/>
```

## Ethiopian Calendar Integration

The DatePicker component integrates with the existing Ethiopian calendar utility (`src/utils/ethiopianCalendar.js`) to provide seamless conversion between Gregorian and Ethiopian dates.

### How it works:

1. **Display**: When `calendarType="ethiopian"`, dates are displayed in Ethiopian format (DD/MM/YYYY Ethiopian)
2. **Selection**: The calendar shows Ethiopian months (Meskerem, Tikimt, etc.) and days
3. **Value**: The component always works with JavaScript Date objects (Gregorian) internally
4. **Conversion**: Automatic conversion happens behind the scenes using `gregorianToEthiopian()` and `ethiopianToGregorian()`

### Ethiopian Calendar Features:

- 13 months (12 months of 30 days + Pagume with 5-6 days)
- Month names in English and Amharic
- Proper day-of-week calculation
- Accurate conversion algorithms

## Keyboard Navigation

- **Enter**: Open calendar when input is focused
- **Escape**: Close calendar
- **Tab**: Navigate between elements
- **Arrow Keys**: Navigate within calendar (when focused)
- **Space/Enter**: Select date in calendar

## Accessibility

The DatePicker component follows WCAG AA accessibility guidelines:

- ✅ Proper ARIA attributes (`aria-label`, `aria-required`, `aria-invalid`, `aria-expanded`, `aria-haspopup`)
- ✅ Keyboard navigation support
- ✅ Focus indicators with 3:1 contrast ratio
- ✅ Screen reader compatible
- ✅ Error messages announced with `role="alert"`
- ✅ Touch targets minimum 44x44px
- ✅ Semantic HTML structure

## Styling

The DatePicker uses CSS Modules for scoped styling and supports:

- Light and dark mode via CSS variables
- RTL (right-to-left) layout
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Custom theming via CSS variables

### CSS Variables Used:

```css
--text-primary
--text-secondary
--text-tertiary
--text-disabled
--bg-primary
--bg-secondary
--border-primary
--border-focus
--color-primary
--color-primary-hover
--color-error
--radius-sm
--radius-md
--radius-lg
--transition-base
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Testing

The component includes comprehensive unit tests covering:

- Basic rendering
- Date selection
- Clear functionality
- Disabled state
- Keyboard navigation
- Ethiopian calendar
- Accessibility

Run tests with:

```bash
npm test -- DatePicker.test.jsx --run
```

## Related Components

- **Input**: Base input component
- **Calendar**: Internal calendar component used by DatePicker
- **Select**: Dropdown selection component

## Future Enhancements

- Custom date format strings
- Date range picker (single component)
- Time picker integration
- Multiple date selection
- Inline calendar mode
- Custom month/year dropdowns
- Localized day/month names from i18n

## Requirements Satisfied

This component satisfies the following requirements from the design document:

- **Requirement 2.1**: DatePicker component for date input
- **Requirement 2.2**: Calendar interface on click
- **Requirement 2.3**: Date selection and input population
- **Requirement 2.7**: Light and dark mode styling
- **Requirement 2.8**: Ethiopian calendar integration
- **Requirement 15.7**: Keyboard navigation support
- **Requirement 15.8**: Focus indicators

## License

Part of the Skoolific V2 UI/UX Redesign project.

# StatCard Component

A modern, accessible card component for displaying dashboard statistics with icons, values, and trend indicators.

## Features

- **Multiple Variants**: Default, primary, secondary, success, warning, and error color schemes
- **Size Options**: Small, medium, and large sizes for different layouts
- **Metric Types**: Support for numbers, percentages, and currency values
- **Trend Indicators**: Optional trend display with up/down arrows and percentage changes
- **Loading State**: Built-in skeleton loader for async data
- **Clickable**: Optional click handler for drill-down functionality
- **Accessibility**: Full WCAG AA compliance with ARIA labels and keyboard navigation
- **RTL Support**: Right-to-left layout support for Arabic language
- **Responsive**: Mobile-optimized with touch-friendly interactions
- **Theme Support**: Light and dark mode with CSS variables

## Usage

### Basic Example

```jsx
import StatCard from './COMPONENTS/StatCard/StatCard';
import { Users } from 'lucide-react';

function Dashboard() {
  return (
    <StatCard
      title="Total Students"
      value={485}
      icon={<Users />}
    />
  );
}
```

### With Trend Indicator

```jsx
<StatCard
  title="Attendance Rate"
  value={92.5}
  metricType="percentage"
  icon={<CheckCircle />}
  variant="success"
  trend={{
    value: 5.2,
    label: "vs last month"
  }}
/>
```

### Currency Display

```jsx
<StatCard
  title="Total Revenue"
  value={125000}
  metricType="currency"
  currency="$"
  icon={<DollarSign />}
  variant="primary"
  trend={{
    value: -3.5,
    label: "vs last quarter"
  }}
/>
```

### Clickable Card

```jsx
<StatCard
  title="Active Staff"
  value={42}
  icon={<UserCheck />}
  onClick={() => navigate('/staff')}
/>
```

### Loading State

```jsx
<StatCard
  title="Total Students"
  value={0}
  icon={<Users />}
  loading={true}
/>
```

### Different Sizes

```jsx
// Small
<StatCard
  title="New Students"
  value={12}
  icon={<UserPlus />}
  size="small"
/>

// Medium (default)
<StatCard
  title="Total Students"
  value={485}
  icon={<Users />}
  size="medium"
/>

// Large
<StatCard
  title="Total Revenue"
  value={125000}
  metricType="currency"
  icon={<DollarSign />}
  size="large"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | The title/label of the statistic |
| `value` | `string \| number` | **required** | The main value to display |
| `icon` | `ReactNode` | **required** | Icon component to display |
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'default'` | Color variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `metricType` | `'number' \| 'percentage' \| 'currency'` | `'number'` | Type of metric for formatting |
| `currency` | `string` | `'$'` | Currency symbol when metricType is 'currency' |
| `trend` | `object` | `undefined` | Optional trend indicator |
| `trend.value` | `number` | - | Trend percentage value (positive or negative) |
| `trend.direction` | `'up' \| 'down'` | auto-detected | Trend direction (auto-detected from value if not provided) |
| `trend.label` | `string` | - | Trend label (e.g., "vs last month") |
| `subtitle` | `string` | `undefined` | Optional subtitle text |
| `loading` | `boolean` | `false` | Show loading state |
| `onClick` | `function` | `undefined` | Optional click handler |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | auto-generated | Custom ARIA label for accessibility |

## Variants

### Color Variants

- **default**: Neutral gray color scheme
- **primary**: Primary brand color (purple/blue)
- **secondary**: Secondary brand color (teal)
- **success**: Green color for positive metrics
- **warning**: Orange/yellow color for caution metrics
- **error**: Red color for negative metrics

### Size Variants

- **small**: Compact size for dense layouts (padding: 16px, icon: 36px, value: 1.5rem)
- **medium**: Standard size for most use cases (padding: 24px, icon: 48px, value: 2.25rem)
- **large**: Large size for emphasis (padding: 32px, icon: 56px, value: 3rem)

## Metric Types

### Number
Formats numbers with thousand separators:
- Input: `1234567`
- Output: `1,234,567`

### Percentage
Adds percentage symbol:
- Input: `85.5`
- Output: `85.5%`

### Currency
Adds currency symbol and formats with thousand separators:
- Input: `12345.67`, currency: `'$'`
- Output: `$12,345.67`

## Trend Indicators

Trend indicators show percentage changes with visual cues:

- **Positive trend** (green): Up arrow, green background
- **Negative trend** (red): Down arrow, red background
- **Neutral trend** (gray): No arrow, gray background

The direction is auto-detected from the value:
- Positive value → up trend
- Negative value → down trend
- Zero value → neutral trend

You can override the auto-detection by providing an explicit `direction` prop.

## Accessibility

The StatCard component is fully accessible:

- **ARIA Labels**: Automatic descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Space keys
- **Focus Indicators**: Visible focus outline for keyboard users
- **Semantic HTML**: Uses appropriate roles (button/article)
- **Loading States**: Proper aria-busy attribute during loading
- **Decorative Elements**: Icons marked with aria-hidden

### Keyboard Shortcuts

When the card is clickable:
- **Tab**: Focus the card
- **Enter**: Activate the card
- **Space**: Activate the card

## Responsive Design

The component is fully responsive:

- **Desktop (1024px+)**: Full size with all features
- **Tablet (768px-1023px)**: Slightly reduced padding and icon size
- **Mobile (320px-767px)**: Optimized for touch with adjusted sizes

## RTL Support

The component fully supports right-to-left languages:

- Icon and content positions are mirrored
- Text alignment is reversed
- Animations respect RTL direction

## Theme Support

The component uses CSS variables for theming:

### Light Mode
- Background: White/light gray
- Text: Dark gray/black
- Borders: Light gray

### Dark Mode
- Background: Dark gray/black
- Text: Light gray/white
- Borders: Dark gray

## Examples

### Dashboard Grid

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
  <StatCard
    title="Total Students"
    value={485}
    icon={<Users />}
    variant="primary"
    trend={{ value: 12.5, label: "vs last month" }}
  />
  
  <StatCard
    title="Total Staff"
    value={42}
    icon={<UserCheck />}
    variant="secondary"
    trend={{ value: 3, label: "vs last month" }}
  />
  
  <StatCard
    title="Attendance Rate"
    value={92.5}
    metricType="percentage"
    icon={<CheckCircle />}
    variant="success"
    trend={{ value: 2.1, label: "vs last week" }}
  />
  
  <StatCard
    title="Fee Collection"
    value={125000}
    metricType="currency"
    icon={<DollarSign />}
    variant="warning"
    trend={{ value: -5.3, label: "vs last month" }}
  />
</div>
```

### With Loading States

```jsx
function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <StatCard
      title="Total Students"
      value={stats.totalStudents || 0}
      icon={<Users />}
      loading={loading}
    />
  );
}
```

## Testing

The component includes comprehensive tests covering:

- Basic rendering
- All variants and sizes
- Metric type formatting
- Trend indicators
- Loading states
- Click interactions
- Keyboard accessibility
- ARIA attributes
- Edge cases (null, undefined, zero values)
- RTL support

Run tests with:
```bash
npm test -- StatCard.test.jsx --run
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Related Components

- **Card**: Base card component for general content
- **Badge**: Small status indicators
- **LoadingSpinner**: Loading indicator
- **Skeleton**: Loading placeholder

## Requirements Validation

This component validates the following requirements from the design document:

- **Requirement 1.8**: Badge components for status display
- **Requirement 1.9**: CSS Modules for scoped styling
- **Requirement 1.10**: Light and dark theme support via CSS variables
- **Requirement 5.2**: StatCard components showing key metrics

## License

Part of the Skoolific V2 UI/UX Redesign project.

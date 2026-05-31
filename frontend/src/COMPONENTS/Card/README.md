# Card Component

A versatile, reusable Card component for grouping related content with support for headers, footers, multiple variants, and full theme support.

## Features

- ✅ Optional header with title, subtitle, and action buttons
- ✅ Optional footer section
- ✅ Three visual variants (default, outlined, elevated)
- ✅ Four padding sizes (none, sm, md, lg)
- ✅ Hover effects for interactive cards
- ✅ Configurable border display
- ✅ Full light/dark mode support
- ✅ RTL (Right-to-Left) layout support
- ✅ Comprehensive ARIA attributes for accessibility
- ✅ Responsive design with mobile optimizations
- ✅ CSS Modules for scoped styling

## Installation

The Card component is part of the Skoolific V2 design system and is located at:

```
src/COMPONENTS/Card/
  ├─ Card.jsx
  ├─ Card.module.css
  ├─ Card.test.jsx
  ├─ Card.example.jsx
  └─ README.md
```

## Basic Usage

```jsx
import Card from './COMPONENTS/Card/Card';

function MyComponent() {
  return (
    <Card>
      <p>This is a basic card with default styling.</p>
    </Card>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | **Required.** The content to display inside the card |
| `title` | `string` | - | Optional title displayed in the header |
| `subtitle` | `string` | - | Optional subtitle displayed below the title |
| `actions` | `ReactNode` | - | Optional action buttons/elements displayed in the header (also accepts `headerAction`) |
| `footer` | `ReactNode` | - | Optional footer content |
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | Visual variant of the card |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size inside the card |
| `hoverable` | `boolean` | `false` | Enable hover effect (shadow and transform) |
| `bordered` | `boolean` | `true` | Show border around the card |
| `className` | `string` | `''` | Additional CSS classes to apply |
| `role` | `string` | - | ARIA role attribute |
| `ariaLabel` | `string` | - | ARIA label for accessibility |
| `ariaLabelledBy` | `string` | - | ARIA labelledby attribute |
| `ariaDescribedBy` | `string` | - | ARIA describedby attribute |

## Examples

### Card with Title and Subtitle

```jsx
<Card 
  title="User Profile" 
  subtitle="Manage your account settings"
>
  <p>Profile information goes here...</p>
</Card>
```

### Card with Header Actions

```jsx
<Card 
  title="Dashboard" 
  actions={
    <>
      <Button variant="ghost" size="small">Refresh</Button>
      <Button variant="primary" size="small">Export</Button>
    </>
  }
>
  <p>Dashboard content...</p>
</Card>
```

### Card with Footer

```jsx
<Card 
  title="Article"
  footer={
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Last updated: 2 hours ago</span>
      <Button variant="secondary" size="small">Read More</Button>
    </div>
  }
>
  <p>Article preview...</p>
</Card>
```

### Card Variants

```jsx
{/* Default variant - subtle shadow and border */}
<Card variant="default" title="Default Card">
  Standard card styling
</Card>

{/* Outlined variant - prominent border, no shadow */}
<Card variant="outlined" title="Outlined Card">
  Emphasized border
</Card>

{/* Elevated variant - large shadow, no border */}
<Card variant="elevated" title="Elevated Card">
  Floating appearance
</Card>
```

### Padding Variants

```jsx
{/* No padding */}
<Card padding="none" title="No Padding">
  Content touches edges (header/footer still have padding)
</Card>

{/* Small padding (12px) */}
<Card padding="sm" title="Small Padding">
  Compact spacing
</Card>

{/* Medium padding (20px) - Default */}
<Card padding="md" title="Medium Padding">
  Standard spacing
</Card>

{/* Large padding (32px) */}
<Card padding="lg" title="Large Padding">
  Generous spacing
</Card>
```

### Hoverable Card

```jsx
<Card 
  hoverable 
  title="Interactive Card"
  onClick={() => console.log('Card clicked')}
  style={{ cursor: 'pointer' }}
>
  <p>Hover over this card to see the effect!</p>
</Card>
```

### Card without Border

```jsx
<Card 
  bordered={false}
  title="Borderless Card"
>
  <p>Seamless integration with background</p>
</Card>
```

### Accessible Card

```jsx
<Card 
  title="Notification"
  role="article"
  ariaLabel="System notification"
  ariaDescribedBy="notification-content"
>
  <p id="notification-content">
    Your profile has been updated successfully.
  </p>
</Card>
```

### Complex Card Example

```jsx
<Card 
  title="Dashboard Statistics"
  subtitle="Overview of key metrics"
  variant="elevated"
  padding="lg"
  hoverable
  actions={<Button variant="ghost" size="small">Refresh</Button>}
  footer={
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Updated 5 minutes ago</span>
      <Button variant="primary" size="small">View Details</Button>
    </div>
  }
>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
    <div>
      <h4>Total Users</h4>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>1,234</p>
    </div>
    <div>
      <h4>Active Sessions</h4>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>567</p>
    </div>
  </div>
</Card>
```

## Styling

The Card component uses CSS Modules for scoped styling and CSS variables for theming. All colors, shadows, and spacing adapt automatically to the current theme (light/dark mode).

### CSS Variables Used

- `--bg-elevated`: Card background color
- `--border-primary`: Border color
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color (subtitle)
- `--radius-lg`: Border radius
- `--shadow-sm`: Small shadow (default)
- `--shadow-md`: Medium shadow (hover)
- `--shadow-lg`: Large shadow (elevated variant)
- `--transition-base`: Transition duration
- `--line-height-tight`: Title line height
- `--line-height-normal`: Subtitle line height

### Custom Styling

You can add custom styles using the `className` prop or inline styles:

```jsx
<Card 
  className="my-custom-card"
  style={{ maxWidth: '600px', margin: '0 auto' }}
>
  Content
</Card>
```

## Responsive Design

The Card component is fully responsive:

- **Desktop (1024px+)**: Full layout with side-by-side header actions
- **Tablet (768px-1023px)**: Optimized spacing
- **Mobile (320px-767px)**: Stacked header layout with actions below title

## RTL Support

The Card component fully supports Right-to-Left (RTL) languages like Arabic:

- Header layout reverses (actions on left, title on right)
- Text alignment changes to right
- All spacing and margins mirror appropriately

RTL is automatically applied when `dir="rtl"` is set on a parent element.

## Accessibility

The Card component follows WCAG AA accessibility guidelines:

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy (h3 for title)
- ✅ ARIA attributes support (role, aria-label, aria-labelledby, aria-describedby)
- ✅ Keyboard navigation support (when hoverable/clickable)
- ✅ Screen reader friendly
- ✅ Sufficient color contrast in both light and dark modes

### Accessibility Best Practices

1. **Use descriptive titles**: Provide clear, concise titles that describe the card content
2. **Add ARIA labels**: Use `ariaLabel` for cards without visible titles
3. **Link related content**: Use `ariaLabelledBy` and `ariaDescribedBy` to connect elements
4. **Keyboard support**: For interactive cards, ensure keyboard navigation works
5. **Focus indicators**: Interactive cards should have visible focus states

## Testing

The Card component has comprehensive test coverage (50 tests):

- ✅ Rendering in light and dark modes
- ✅ All variants (default, outlined, elevated)
- ✅ All padding sizes (none, sm, md, lg)
- ✅ Header, footer, and content rendering
- ✅ Hoverable state
- ✅ Bordered prop
- ✅ Theme switching
- ✅ Accessibility attributes
- ✅ Custom props and className
- ✅ Edge cases (empty content, null children)

Run tests with:

```bash
npm test -- src/COMPONENTS/Card/Card.test.jsx --run
```

## Browser Support

The Card component works in all modern browsers:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

The Card component is optimized for performance:

- Minimal re-renders (pure component)
- CSS transitions for smooth animations
- No JavaScript-based animations
- Efficient CSS Modules (tree-shakeable)

## Related Components

- **Button**: Use in card headers and footers
- **Badge**: Display status indicators in cards
- **StatCard**: Specialized card for dashboard statistics
- **Modal**: Use cards inside modals for structured content

## Migration Guide

If you're migrating from an older card implementation:

1. Replace `headerAction` prop with `actions` (both work, but `actions` is preferred)
2. Update padding values: `small` → `sm`, `medium` → `md`, `large` → `lg`
3. Add `bordered={false}` if you previously used custom CSS to hide borders
4. Review ARIA attributes and add them for better accessibility

## Contributing

When contributing to the Card component:

1. Maintain backward compatibility
2. Add tests for new features
3. Update this README with new examples
4. Ensure accessibility standards are met
5. Test in both light and dark modes
6. Test RTL layout for Arabic support

## License

Part of the Skoolific V2 UI/UX Redesign project.

## Support

For issues or questions about the Card component:

1. Check the examples in `Card.example.jsx`
2. Review the test file `Card.test.jsx` for usage patterns
3. Consult the design system documentation
4. Contact the development team

---

**Last Updated**: December 2024  
**Version**: 2.0  
**Status**: ✅ Production Ready

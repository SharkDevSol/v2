# Toast Notification Component

A reusable Toast notification component for displaying temporary messages to users.

## Features

- ✅ Multiple variants (success, error, warning, info)
- ✅ Auto-dismiss with configurable duration
- ✅ Manual close button
- ✅ Multiple toast support (stacking/queue)
- ✅ 6 position options (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
- ✅ Smooth slide-in/out animations
- ✅ Full accessibility support (ARIA attributes)
- ✅ RTL layout support
- ✅ Light and dark mode support
- ✅ Responsive design

## Usage

### Basic Usage with Hook

```jsx
import { useToast } from './COMPONENTS/Toast/useToast';
import ToastContainer from './COMPONENTS/Toast/ToastContainer';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please review your input.');
  };

  const handleInfo = () => {
    toast.info('New updates available.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
      
      {/* Toast Container */}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemove={toast.removeToast}
        position={toast.position}
      />
    </div>
  );
}
```

### Custom Configuration

```jsx
// Initialize hook with custom defaults
const toast = useToast({
  position: 'bottom-right',
  duration: 3000,
  showCloseButton: true
});

// Override defaults for specific toast
toast.success('Saved!', {
  duration: 2000,
  position: 'top-center'
});

// Persistent toast (no auto-dismiss)
toast.error('Critical error!', {
  duration: 0
});
```

### Advanced Usage

```jsx
// Add toast and get ID
const toastId = toast.addToast({
  message: 'Processing...',
  type: 'info',
  duration: 0
});

// Remove specific toast
setTimeout(() => {
  toast.removeToast(toastId);
}, 5000);

// Clear all toasts
toast.clearToasts();
```

## API Reference

### useToast Hook

**Options:**
```typescript
{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number; // milliseconds, 0 = no auto-dismiss
  showCloseButton?: boolean;
}
```

**Returns:**
```typescript
{
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, options?: Partial<ToastOptions>) => string;
  position: string;
}
```

### Toast Component Props

```typescript
{
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds, 0 = no auto-dismiss
  showCloseButton?: boolean;
  position?: string;
  onClose: (id: string) => void;
}
```

### ToastContainer Component Props

```typescript
{
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}
```

## Position Options

- `top-right` - Top right corner (default)
- `top-left` - Top left corner
- `top-center` - Top center
- `bottom-right` - Bottom right corner
- `bottom-left` - Bottom left corner
- `bottom-center` - Bottom center

## Accessibility

The Toast component follows WCAG AA accessibility guidelines:

- Uses `role="alert"` for screen reader announcements
- Uses `aria-live="assertive"` for immediate announcements
- Uses `aria-atomic="true"` for complete message reading
- Close button has proper `aria-label`
- Keyboard accessible (Tab to close button, Enter/Space to close)

## RTL Support

The component automatically adapts to RTL layouts:
- Border indicators flip to the right side
- Positions mirror (left ↔ right)
- Text direction follows document direction

## Styling

The component uses CSS Modules and CSS variables for theming:

```css
/* Light mode */
--bg-elevated: #ffffff;
--text-primary: #1f2937;
--color-success: #10b981;
--color-error: #ef4444;
--color-warning: #f59e0b;
--color-info: #3b82f6;

/* Dark mode */
--bg-elevated: #1f2937;
--text-primary: #f9fafb;
```

## Examples

### Success Toast
```jsx
toast.success('Student registered successfully!');
```

### Error Toast with Custom Duration
```jsx
toast.error('Failed to save data', { duration: 7000 });
```

### Warning Toast at Bottom
```jsx
toast.warning('Please review the form', { position: 'bottom-center' });
```

### Info Toast without Auto-dismiss
```jsx
toast.info('System maintenance scheduled', { duration: 0 });
```

### Multiple Toasts
```jsx
toast.success('File 1 uploaded');
toast.success('File 2 uploaded');
toast.success('File 3 uploaded');
// All three toasts will stack vertically
```

## Testing

The component includes comprehensive tests covering:
- Rendering in light and dark modes
- All toast variants
- Close button functionality
- Auto-dismiss behavior
- Multiple toast stacking
- All position options
- Accessibility attributes
- Hook functionality

Run tests:
```bash
npm test -- Toast.test.jsx --run
```

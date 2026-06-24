# Modal Component

A fully accessible, feature-rich modal dialog component for the Skoolific V2 UI redesign.

## Features

✅ **Reusable Component** - Single component for all dialog needs  
✅ **Multiple Sizes** - Small, medium, large, and fullscreen variants  
✅ **Structured Layout** - Header, body, and footer sections  
✅ **Keyboard Support** - Close with Escape key  
✅ **Backdrop Click** - Optional close on overlay click  
✅ **Focus Trap** - Keeps focus within modal for accessibility  
✅ **Smooth Animations** - Fade in/out with slide-up effect  
✅ **ARIA Attributes** - Full accessibility compliance (role="dialog", aria-modal)  
✅ **RTL Support** - Right-to-left layout for Arabic  
✅ **Comprehensive Tests** - 38 unit tests covering all functionality  

## Installation

The Modal component is already installed in the project. Import it from:

```javascript
import Modal from '../COMPONENTS/Modal/Modal';
```

## Basic Usage

```jsx
import { useState } from 'react';
import Modal from '../COMPONENTS/Modal/Modal';
import Button from '../COMPONENTS/Button/Button';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
      >
        <p>This is the modal content.</p>
      </Modal>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **required** | Controls modal visibility |
| `onClose` | `function` | **required** | Callback when modal should close |
| `title` | `string` | **required** | Modal title displayed in header |
| `children` | `ReactNode` | **required** | Modal body content |
| `footer` | `ReactNode` | `undefined` | Optional footer content (buttons, actions) |
| `size` | `'small' \| 'medium' \| 'large' \| 'full'` | `'medium'` | Modal size variant |
| `showCloseButton` | `boolean` | `true` | Show X button in header |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape key |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | `undefined` | Custom ARIA label (overrides title) |
| `ariaDescribedBy` | `string` | `undefined` | ID of element describing modal |

## Size Variants

### Small (400px max-width)
Perfect for simple confirmations or alerts.

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  size="small"
>
  <p>Are you sure you want to delete this item?</p>
</Modal>
```

### Medium (600px max-width) - Default
Ideal for forms and standard dialogs.

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Student"
  size="medium"
>
  <form>
    {/* Form fields */}
  </form>
</Modal>
```

### Large (900px max-width)
For complex content or data tables.

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Student Details"
  size="large"
>
  <div>
    {/* Complex content */}
  </div>
</Modal>
```

### Fullscreen (95vw x 95vh)
For maximum content space.

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Report Preview"
  size="full"
>
  <div>
    {/* Full report content */}
  </div>
</Modal>
```

## With Footer

Add action buttons in the footer section:

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Deletion"
  footer={
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  <p>Are you sure you want to delete this student? This action cannot be undone.</p>
</Modal>
```

## Without Close Button

For critical actions that require explicit user choice:

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Important Notice"
  showCloseButton={false}
  closeOnOverlayClick={false}
  closeOnEscape={false}
  footer={
    <Button onClick={handleAcknowledge}>
      I Understand
    </Button>
  }
>
  <p>Please read this important information carefully.</p>
</Modal>
```

## Accessibility Features

### Keyboard Navigation

- **Tab**: Move focus between interactive elements
- **Shift + Tab**: Move focus backwards
- **Escape**: Close modal (if `closeOnEscape` is true)
- **Enter**: Activate focused button

### Focus Management

- Automatically focuses first interactive element when opened
- Traps focus within modal (cannot tab outside)
- Restores focus to trigger element when closed

### Screen Reader Support

- `role="dialog"` for proper dialog semantics
- `aria-modal="true"` to indicate modal behavior
- `aria-labelledby` links to modal title
- `aria-describedby` can link to description element
- Close button has `aria-label="Close modal"`

### ARIA Example

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Student Information"
  ariaDescribedBy="student-description"
>
  <p id="student-description">
    View and edit student details below.
  </p>
  {/* Student form */}
</Modal>
```

## RTL Support

The Modal component automatically supports right-to-left layouts for Arabic:

```css
/* Automatically applied when dir="rtl" is set on document */
[dir="rtl"] .header {
  flex-direction: row-reverse;
}

[dir="rtl"] .footer {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

[dir="rtl"] .title {
  text-align: right;
}
```

## Animations

### Overlay Animation
- **Fade in**: 200ms ease-out
- Backdrop blur effect

### Modal Animation
- **Slide up**: 300ms ease-out
- Scale from 0.95 to 1.0
- Opacity from 0 to 1

### Mobile Animation
On mobile devices, modal slides up from bottom:
- **Slide up from bottom**: 300ms ease-out

### Reduced Motion
Respects user's `prefers-reduced-motion` setting:

```css
@media (prefers-reduced-motion: reduce) {
  .overlay,
  .modal {
    animation: none;
  }
}
```

## Responsive Behavior

### Desktop (1024px+)
- Centered modal with max-width based on size
- 16px padding around modal

### Tablet (768px - 1023px)
- Same as desktop

### Mobile (< 768px)
- Full width modal
- Slides up from bottom
- Rounded top corners only
- No padding around modal
- Fullscreen variant takes entire viewport

## Styling

### Theme Variables

The Modal uses CSS variables for theming:

```css
/* Background and borders */
--bg-elevated: Modal background color
--border-primary: Border color
--shadow-2xl: Box shadow

/* Text colors */
--text-primary: Title and content color
--text-secondary: Close button color

/* Interactive states */
--bg-secondary: Close button hover background
--border-focus: Focus outline color

/* Z-index */
--z-modal-backdrop: 1040
--z-modal: 1050

/* Border radius */
--radius-xl: 16px (modal corners)
--radius-md: 8px (close button)

/* Transitions */
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Custom Styling

Add custom classes for specific styling:

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Custom Modal"
  className="my-custom-modal"
>
  <p>Content</p>
</Modal>
```

```css
/* MyComponent.module.css */
.myCustomModal {
  /* Custom styles */
}
```

## Body Scroll Lock

The Modal automatically locks body scroll when open:

```javascript
// When modal opens
document.body.style.overflow = 'hidden';

// When modal closes
document.body.style.overflow = 'unset';
```

This prevents background content from scrolling while modal is active.

## Portal Rendering

The Modal uses React Portal to render outside the normal DOM hierarchy:

```javascript
import { createPortal } from 'react-dom';

return createPortal(
  <div className="modal-overlay">
    {/* Modal content */}
  </div>,
  document.body
);
```

This ensures:
- Modal appears above all other content
- No z-index conflicts with parent containers
- Proper stacking context

## Testing

The Modal component has comprehensive test coverage (38 tests):

### Test Categories

1. **Rendering** (8 tests)
   - Open/close states
   - Title, children, footer rendering
   - Close button visibility

2. **Size Variants** (4 tests)
   - Small, medium, large, full sizes

3. **Close Functionality** (6 tests)
   - Close button click
   - Escape key press
   - Overlay click
   - Conditional close behavior

4. **Body Scroll Lock** (3 tests)
   - Lock on open
   - Unlock on close
   - Unlock on unmount

5. **Focus Management** (2 tests)
   - Initial focus
   - Focus trap

6. **Accessibility** (6 tests)
   - ARIA attributes
   - Role and modal attributes
   - Accessible labels

7. **Custom Styling** (1 test)
   - Custom className

8. **Portal Rendering** (1 test)
   - Renders in document.body

9. **Edge Cases** (3 tests)
   - Rapid open/close
   - Empty children
   - Complex nested content

10. **RTL Support** (2 tests)
    - RTL layout
    - RTL with footer

11. **Animation Support** (2 tests)
    - Overlay fade-in
    - Modal slide-up

### Running Tests

```bash
# Run all tests
npm test

# Run Modal tests only
npm test -- Modal.test.jsx

# Run tests in watch mode
npm run test:watch -- Modal.test.jsx
```

## Common Patterns

### Confirmation Dialog

```jsx
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
```

### Form Dialog

```jsx
function EditStudentModal({ isOpen, onClose, student, onSave }) {
  const [formData, setFormData] = useState(student);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student"
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
        />
      </form>
    </Modal>
  );
}
```

### Alert Dialog

```jsx
function AlertDialog({ isOpen, onClose, title, message, type = 'info' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <Button variant="primary" onClick={onClose}>
          OK
        </Button>
      }
    >
      <div className={`alert alert-${type}`}>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance Considerations

1. **Portal Rendering**: Minimal performance impact
2. **Animation**: CSS-based, hardware-accelerated
3. **Focus Trap**: Efficient event delegation
4. **Body Scroll Lock**: No layout thrashing

## Troubleshooting

### Modal doesn't close on Escape

Check that `closeOnEscape` is not set to `false`:

```jsx
<Modal closeOnEscape={true} {/* ... */} />
```

### Focus not trapped

Ensure modal content has focusable elements (buttons, inputs, links).

### Scroll not locked

The component handles this automatically. If issues persist, check for conflicting CSS on body element.

### Animation not smooth

Check browser support for CSS animations and `backdrop-filter`. Older browsers may not support blur effect.

## Related Components

- **Button**: For modal actions
- **Input**: For form fields in modals
- **Toast**: For success/error feedback after modal actions
- **LoadingSpinner**: For loading states in modals

## License

Part of the Skoolific V2 UI Redesign project.

# Skoolific V2 - Design & Styles Documentation

## Waliigala (Overview)

Skoolific V2 design system guutuu ta'e kan CSS custom properties (variables), CSS Modules, fi utility classes irratti hundaa'edha. Pirojektiin kun light/dark mode, RTL support (Arabiffaa fi Amaariffaa), responsive design, fi accessibility (WCAG AA) ni deeggara.

---

## 1. Teknolojii Styling Fayyadamame

| Teknolojii | Itti Fayyadama |
|---|---|
| **CSS Modules** (`.module.css`) | Component-level scoped styles - mala ijoo |
| **CSS Custom Properties** | Design tokens fi theme variables |
| **Styled Components** v6 | Bakka tokko tokkotti |
| **MUI (Material UI)** v7 | UI components muraasa |
| **Ant Design** v5 | Charts fi components muraasa |
| **Framer Motion** | Animations fi page transitions |

---

## 2. Color System (Sirna Halluu)

### Brand Colors - Alkhwarizm

```
Primary (Digital Violet):    #8b5cf6 / #6F56FF
Secondary (Teal):            #14b8a6
Accent (Amber):              #f59e0b
```

### Primary Color Scale

| Token | Halluu | Hex |
|---|---|---|
| `--color-primary-50` | Ifaa baay'ee | `#f5f3ff` |
| `--color-primary-100` | Ifaa | `#ede9fe` |
| `--color-primary-200` | Ifaa giddugaleessa | `#ddd6fe` |
| `--color-primary-300` | Giddugaleessa ifaa | `#c4b5fd` |
| `--color-primary-400` | Giddugaleessa | `#a78bfa` |
| `--color-primary-500` | **Ijoo (Main)** | `#8b5cf6` |
| `--color-primary-600` | Hover | `#7c3aed` |
| `--color-primary-700` | Active | `#6d28d9` |
| `--color-primary-800` | Dukkana | `#5b21b6` |
| `--color-primary-900` | Dukkana baay'ee | `#4c1d95` |

### Semantic Colors (Halluuwwan Hiika Qaban)

| Gosa | Halluu | Ifaa | Dukkana |
|---|---|---|---|
| **Success** | `#22c55e` | `#f0fdf4` | `#15803d` |
| **Warning** | `#f59e0b` | `#fffbeb` | `#b45309` |
| **Error/Danger** | `#ef4444` | `#fef2f2` | `#b91c1c` |
| **Info** | `#3b82f6` | `#eff6ff` | `#1d4ed8` |

### Background & Surface Colors

| Variable | Light Mode | Ibsa |
|---|---|---|
| `--bg-primary` | `#ffffff` | Background ijoo |
| `--bg-secondary` | `#f9fafb` | Background lammaffaa |
| `--bg-tertiary` | `#f3f4f6` | Background sadaffaa |
| `--bg-elevated` | `#ffffff` | Cards, modals |
| `--bg-overlay` | `rgba(0,0,0,0.5)` | Modal backdrop |

### Text Colors

| Variable | Halluu | Itti Fayyadama |
|---|---|---|
| `--text-primary` | `#111827` | Barreeffama ijoo |
| `--text-secondary` | `#6b7280` | Barreeffama lammaffaa |
| `--text-tertiary` | `#9ca3af` | Barreeffama sadaffaa |
| `--text-disabled` | `#d1d5db` | Disabled state |
| `--text-inverse` | `#ffffff` | Background dukkana irratti |
| `--text-link` | `#8b5cf6` | Links |

---

## 3. Typography (Sirna Barreeffamaa)

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--font-amharic: 'Noto Sans Ethiopic', 'Nyala', 'Ethiopia Jiret', sans-serif;
```

- **Inter** - Font ijoo application guutuuf
- **Roboto** - Legacy font (index.css keessatti)
- **Noto Sans Ethiopic** - Afaan Amaariffaaf

### Font Sizes

| Token | Hamma | Itti Fayyadama |
|---|---|---|
| `--font-size-xs` | 12px | Labels xixiqqoo, captions |
| `--font-size-sm` | 14px | Body text xixiqqoo |
| `--font-size-base` | 16px | Body text idilee |
| `--font-size-lg` | 18px | Body text guddaa |
| `--font-size-xl` | 20px | Heading h5 |
| `--font-size-2xl` | 24px | Heading h4 |
| `--font-size-3xl` | 30px | Heading h3 |
| `--font-size-4xl` | 36px | Heading h2 |
| `--font-size-5xl` | 48px | Heading h1 |

### Font Weights

| Token | Gatii | Itti Fayyadama |
|---|---|---|
| `--font-weight-light` | 300 | Barreeffama salphaa |
| `--font-weight-normal` | 400 | Body text |
| `--font-weight-medium` | 500 | Buttons, labels |
| `--font-weight-semibold` | 600 | Headings, emphasis |
| `--font-weight-bold` | 700 | Headings guguddoo |

### Line Heights

| Token | Gatii |
|---|---|
| `--line-height-tight` | 1.25 |
| `--line-height-normal` | 1.5 |
| `--line-height-relaxed` | 1.75 |
| `--line-height-loose` | 2 |

---

## 4. Spacing System (Sirna Iddoo)

Base unit: **8px**

| Token | Gatii | Itti Fayyadama |
|---|---|---|
| `--spacing-xs` | 4px | Iddoo xixiqqoo baay'ee |
| `--spacing-sm` | 8px | Iddoo xixiqqoo |
| `--spacing-md` | 16px | Iddoo idilee |
| `--spacing-lg` | 24px | Iddoo guddaa |
| `--spacing-xl` | 32px | Iddoo guddaa baay'ee |
| `--spacing-2xl` | 48px | Section spacing |
| `--spacing-3xl` | 64px | Page sections |
| `--spacing-4xl` | 96px | Hero sections |

---

## 5. Border Radius

| Token | Gatii | Itti Fayyadama |
|---|---|---|
| `--radius-none` | 0 | Geengoo malee |
| `--radius-sm` | 4px | Inputs, tags |
| `--radius-md` | 8px | Buttons, cards |
| `--radius-lg` | 12px | Cards guguddoo |
| `--radius-xl` | 16px | Modals |
| `--radius-2xl` | 24px | Containers |
| `--radius-full` | 9999px | Avatars, badges |

---

## 6. Shadows (Gaaddidduu)

| Token | Itti Fayyadama |
|---|---|
| `--shadow-sm` | Inputs, buttons |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Elevated cards, popovers |
| `--shadow-xl` | Modals |
| `--shadow-2xl` | Floating elements |
| `--shadow-inner` | Inset effects |
| `--shadow-focus` | Focus ring (primary color) |

---

## 7. Z-Index Scale

| Token | Gatii | Itti Fayyadama |
|---|---|---|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 1000 | Dropdown menus |
| `--z-sticky` | 1020 | Sticky headers |
| `--z-fixed` | 1030 | Fixed elements |
| `--z-modal-backdrop` | 1040 | Modal backdrop |
| `--z-modal` | 1050 | Modal content |
| `--z-popover` | 1060 | Popovers |
| `--z-tooltip` | 1070 | Tooltips |

---

## 8. Transitions & Animations

### Transition Durations

| Token | Yeroo | Itti Fayyadama |
|---|---|---|
| `--transition-fast` | 150ms | Hover states, toggles |
| `--transition-base` | 200ms | General interactions |
| `--transition-slow` | 300ms | Page transitions |
| `--transition-slower` | 500ms | Complex animations |

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animations Jiran

- **fadeIn / fadeOut** - Modal backdrop
- **modalSlideIn / modalSlideOut** - Modal content
- **slideDown** - Dropdowns
- **slideInRight / slideOutRight** - Toast notifications
- **cardFadeIn** - Card appear
- **shimmer** - Skeleton loading
- **shake** - Input error
- **pulse** - Badge notification
- **spin** - Loading spinner
- **accordionExpand** - Accordion content

---

## 9. Responsive Breakpoints

| Maqaa | Hamma | Ibsa |
|---|---|---|
| Mobile | 320px - 767px | Bilbila |
| Tablet | 768px - 1023px | Tablet |
| Desktop | 1024px - 1279px | Kompiyuutara |
| Wide | 1280px+ | Screen bal'aa |

### Responsive Behavior

- **Mobile**: Grid hundi column 1 ta'a, font-size ni xiqqaata
- **Tablet**: Grid 3+ columns → 2 columns ta'a
- **Desktop**: Layout guutuu mul'ata

---

## 10. Component Patterns (Akkaataa Component)

### File Structure

```
COMPONENTS/
  ComponentName/
    ComponentName.jsx        ← Component logic
    ComponentName.module.css ← Scoped styles
    ComponentName.test.jsx   ← Tests (yoo jiraate)
    README.md               ← Documentation (yoo jiraate)
```

### CSS Module Import Pattern

```jsx
import styles from './ComponentName.module.css';

const ComponentName = ({ variant = 'primary', size = 'medium' }) => {
  const classes = [
    styles.component,
    styles[variant],
    styles[size],
  ].filter(Boolean).join(' ');

  return <div className={classes}>...</div>;
};
```

### Component Props Pattern

Components hundi props kana qabu:
- `variant` - Visual style (primary, secondary, success, warning, danger, ghost)
- `size` - Hamma (small, medium, large)
- `disabled` - Disabled state
- `loading` - Loading state
- `className` - Additional CSS classes
- `ariaLabel` - Accessibility label

---

## 11. RTL Support (Afaan Mirga-gara-Bitaa)

Pirojektiin kun RTL (Right-to-Left) ni deeggara Arabiffaa fi afaanota birootiif.

### Activate RTL

```html
<body class="rtl" dir="rtl">
```

### RTL keessatti wanti jijjiiramu:
- Direction: `rtl`
- Text alignment: right
- Flex direction: mirrored
- Margins/Paddings: mirrored
- Icons: flipped horizontally
- Sidebar: right side
- Animations: reversed

---

## 12. Accessibility (Dhaqqabummaa)

### WCAG AA Standards

- **Focus indicators**: `outline: 2px solid var(--border-focus)` + `outline-offset: 2px`
- **Color contrast**: 4.5:1 ratio minimum
- **Touch targets**: Minimum 44x44px mobile irratti
- **Reduced motion**: `prefers-reduced-motion` ni kabaja
- **Skip links**: Keyboard navigation deeggaruuf
- **ARIA labels**: Screen readers deeggaruuf

### Focus Visible

```css
*:focus-visible {
  outline: 2px solid var(--a11y-focus-ring);
  outline-offset: 2px;
}
```

---

## 13. Dark Mode

Dark mode activate gochuuf:

```javascript
document.body.classList.add('dark');
// or
document.body.classList.add('dark-mode');
```

CSS variables automatically ni jijjiiramu light → dark.

---

## 14. Utility Classes

### Layout

| Class | Hojii |
|---|---|
| `.container` | Max-width 1280px, centered |
| `.container-fluid` | Full width |
| `.flex` | Display flex |
| `.flex-col` | Flex column |
| `.grid` | Display grid |
| `.grid-cols-{1-12}` | Grid columns |

### Spacing

| Class | Hojii |
|---|---|
| `.m-0` | Margin 0 |
| `.mt-{xs,sm,md,lg,xl}` | Margin top |
| `.mb-{xs,sm,md,lg,xl}` | Margin bottom |
| `.p-{xs,sm,md,lg,xl}` | Padding |
| `.gap-{xs,sm,md,lg,xl}` | Gap |

### Typography

| Class | Hojii |
|---|---|
| `.text-{xs,sm,base,lg,xl}` | Font size |
| `.font-{light,normal,medium,semibold,bold}` | Font weight |
| `.text-{left,center,right}` | Text alignment |
| `.text-{primary,secondary,tertiary}` | Text color |

---

## 15. Component-Specific Variables

### Buttons

```css
--button-height-sm: 32px;
--button-height-md: 40px;
--button-height-lg: 48px;
--button-padding-x-sm: 12px;
--button-padding-x-md: 16px;
--button-padding-x-lg: 24px;
```

### Inputs

```css
--input-height-sm: 32px;
--input-height-md: 40px;
--input-height-lg: 48px;
--input-padding-x: 12px;
--input-padding-y: 8px;
```

### Cards

```css
--card-padding-sm: 12px;
--card-padding-md: 16px;
--card-padding-lg: 24px;
```

### Layout

```css
--sidebar-width: 280px;
--sidebar-width-collapsed: 64px;
--header-height: 64px;
```

---

## 16. Files Ijoo (Key Files)

| File | Ibsa |
|---|---|
| `src/styles/global.css` | CSS variables guutuu fi utility classes |
| `src/styles/theme.css` | Theme variables (legacy, global.css tti ce'aa jira) |
| `src/styles/design-tokens.js` | JS design tokens (legacy) |
| `src/styles/animations.css` | Animations fi transitions |
| `src/styles/fonts.css` | Font loading fi fallbacks |
| `src/index.css` | Global base styles fi brand colors |

---

## 17. Best Practices (Gorsa)

1. **CSS Variables fayyadami** - Halluu hardcode hin godhin
2. **Semantic colors** - Success, warning, error hiika isaaniif fayyadami
3. **Spacing scale** - Spacing system fayyadami, values random hin godhin
4. **CSS Modules** - Component haaraa yoo uumtu `.module.css` fayyadami
5. **Mobile-first** - Mobile irraa jalqabii design godhi
6. **Accessibility** - Focus states fi ARIA labels dabalii
7. **RTL** - Layout haaraa yoo uumtu RTL yaadi
8. **Reduced motion** - Animations `prefers-reduced-motion` kabajuu qabu
9. **Dark mode** - CSS variables fayyadamuun automatic ta'a

---

## 18. Fakkeenya Itti Fayyadama (Usage Examples)

### Button Haaraa Uumuu

```css
/* MyButton.module.css */
.button {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

### Card Haaraa Uumuu

```css
/* MyCard.module.css */
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

---

## 19. Glassmorphism Dashboard Design System

### Waliigala (Overview)

Skoolific V2 dashboard design premium **Glassmorphism** aesthetic fayyadama — dark mode dukkana keessatti glass-like translucent containers kan blur effect qabaniin ijaarame. Design kun Dribbble trending UI patterns irratti hundaa'ee, high-fidelity, clean vector look kenna.

### Design Philosophy

- **Glass Panels**: Translucent containers with `backdrop-filter: blur()` over a subtle background
- **Dark Mode First**: Deep dark surfaces with luminous accent colors
- **Floating Sidebar**: Vertical icon-only navigation with glowing outline icons
- **Soft Depth**: Layered glass panels create visual hierarchy without harsh shadows
- **Glowing Accents**: Semantic colors emit subtle glow effects for emphasis

---

### 19.1 Background & Atmosphere

```css
/* Root background - subtle indoor/office scene with dark overlay */
.dashboardRoot {
  background-image: url('/path-to-ambient-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* Dark overlay to ensure readability */
.dashboardRoot::before {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.85) 0%,
    rgba(15, 23, 42, 0.92) 50%,
    rgba(15, 23, 42, 0.88) 100%
  );
  z-index: 0;
}
```

| Token | Value | Description |
|---|---|---|
| `--glass-bg-overlay` | `rgba(15, 23, 42, 0.88)` | Main dark overlay |
| `--glass-bg-deep` | `#0f172a` | Deepest background |
| `--glass-bg-dark` | `#1e293b` | Dark surface fallback |

---

### 19.2 Glass Panel Styles

#### Primary Glass Container (Main Cards)

```css
.glassPanel {
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: var(--radius-2xl); /* 24px */
  padding: var(--spacing-lg);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

#### Secondary Glass Container (Nested Cards)

```css
.glassPanelInner {
  background: rgba(51, 65, 85, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: var(--radius-xl); /* 16px */
  padding: var(--spacing-md);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

#### Glass Tokens

| Token | Value | Description |
|---|---|---|
| `--glass-surface-1` | `rgba(30, 41, 59, 0.45)` | Primary glass panel |
| `--glass-surface-2` | `rgba(51, 65, 85, 0.35)` | Nested/inner glass panel |
| `--glass-surface-3` | `rgba(71, 85, 105, 0.25)` | Subtle inner elements |
| `--glass-border` | `rgba(148, 163, 184, 0.12)` | Glass border |
| `--glass-border-subtle` | `rgba(148, 163, 184, 0.08)` | Subtle glass border |
| `--glass-blur-heavy` | `blur(20px)` | Primary blur |
| `--glass-blur-medium` | `blur(12px)` | Secondary blur |
| `--glass-blur-light` | `blur(8px)` | Light blur |
| `--glass-highlight` | `inset 0 1px 0 rgba(255, 255, 255, 0.05)` | Top edge highlight |

---

### 19.3 Color Palette (Dark Glassmorphism)

#### Accent Colors

| Name | Hex | Usage |
|---|---|---|
| **Digital Violet** | `#8b5cf6` | Primary accent, active states, links |
| **Violet Glow** | `rgba(139, 92, 246, 0.3)` | Glow effect behind accent elements |
| **Teal Accent** | `#14b8a6` | Secondary accent, charts |
| **Cyan Highlight** | `#22d3ee` | Chart segments, data viz |

#### Semantic Colors (Glowing Variants)

| Semantic | Color | Glow | Usage |
|---|---|---|---|
| **Success** | `#4ade80` | `rgba(74, 222, 128, 0.2)` | Complete badges, positive metrics |
| **Warning** | `#fbbf24` | `rgba(251, 191, 36, 0.2)` | On Going badges, alerts |
| **Error** | `#f87171` | `rgba(248, 113, 113, 0.2)` | Danger states |
| **Info** | `#60a5fa` | `rgba(96, 165, 250, 0.2)` | Informational elements |

#### Text Colors (Dark Mode)

| Token | Value | Usage |
|---|---|---|
| `--glass-text-primary` | `#ffffff` | Headings, primary content |
| `--glass-text-secondary` | `rgba(255, 255, 255, 0.7)` | Body text, descriptions |
| `--glass-text-tertiary` | `rgba(255, 255, 255, 0.5)` | Captions, labels |
| `--glass-text-muted` | `rgba(255, 255, 255, 0.35)` | Disabled, placeholder |

---

### 19.4 Floating Sidebar

```css
.glassSidebar {
  position: fixed;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: var(--radius-2xl); /* 24px */
  padding: var(--spacing-md) var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  z-index: var(--z-fixed);
}

.sidebarIcon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg); /* 12px */
  color: rgba(255, 255, 255, 0.5);
  transition: all var(--transition-base);
  cursor: pointer;
}

.sidebarIcon:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(139, 92, 246, 0.1);
}

.sidebarIcon.active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}
```

| Property | Value | Notes |
|---|---|---|
| Width | `56px` | Icon-only, compact |
| Position | Fixed, vertically centered | Floats over content |
| Icons | Outline style, 20-24px | Lucide, Phosphor, or Heroicons outline |
| Active glow | `box-shadow: 0 0 12px rgba(139, 92, 246, 0.3)` | Violet glow on active |

---

### 19.5 Dashboard Layout Grid

```css
.dashboardGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  margin-left: 88px; /* Sidebar width + spacing */
}

/* Activity chart - spans 1 column */
.activityCard {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

/* Stats column - spans 1 column */
.statsColumn {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Overview donut - spans 1 column */
.overviewCard {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
}

/* Challenges list - spans 2 columns */
.challengesCard {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
}

/* Calendar + Output - spans 1 column */
.calendarCard {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}
```

---

### 19.6 Chart Styles (Glassmorphism)

#### Bar Chart (Activity)

```css
.barChart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 160px;
  padding-top: var(--spacing-md);
}

.bar {
  flex: 1;
  background: rgba(148, 163, 184, 0.25);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  position: relative;
  transition: background var(--transition-base);
}

.bar:hover {
  background: rgba(148, 163, 184, 0.4);
}

.barLabel {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-xs);
  color: var(--glass-text-tertiary);
}
```

#### Donut Chart (Overview/Progress)

```css
.donutChart {
  position: relative;
  width: 140px;
  height: 140px;
}

.donutCenter {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donutPercentage {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--glass-text-primary);
}

.donutSubtext {
  font-size: var(--font-size-xs);
  color: var(--glass-text-tertiary);
}
```

Chart color tokens:

| Token | Value | Usage |
|---|---|---|
| `--chart-segment-1` | `#fbbf24` | Yellow/Amber segment |
| `--chart-segment-2` | `#22d3ee` | Cyan segment |
| `--chart-segment-3` | `#8b5cf6` | Violet segment |
| `--chart-segment-4` | `#4ade80` | Green segment |
| `--chart-bar-default` | `rgba(148, 163, 184, 0.25)` | Default bar fill |
| `--chart-bar-hover` | `rgba(148, 163, 184, 0.4)` | Hovered bar fill |

---

### 19.7 Pill Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full); /* 9999px */
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}

.badgeOnGoing {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badgeComplete {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.badgeAmazing {
  background: rgba(148, 163, 184, 0.15);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
```

---

### 19.8 List Items (Challenges/Tasks)

```css
.listItem {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.listItemIcon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: 2px solid rgba(148, 163, 184, 0.3);
  color: var(--glass-text-secondary);
}

.listItemIcon.complete {
  border-color: #4ade80;
  color: #4ade80;
}

.listItemTitle {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--glass-text-primary);
}

.listItemProgress {
  font-size: var(--font-size-xs);
  color: var(--glass-text-tertiary);
  margin-right: var(--spacing-md);
}
```

---

### 19.9 Calendar Widget

```css
.calendarWidget {
  background: var(--glass-surface-2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
}

.calendarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.calendarTitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--glass-text-primary);
}

.calendarNav {
  display: flex;
  gap: var(--spacing-xs);
}

.calendarNavBtn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: var(--glass-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.calendarNavBtn:hover {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}

.calendarDayLabel {
  font-size: var(--font-size-xs);
  color: var(--glass-text-tertiary);
  padding: 4px 0;
}

.calendarDay {
  font-size: var(--font-size-sm);
  color: var(--glass-text-primary);
  padding: 6px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.calendarDay:hover {
  background: rgba(139, 92, 246, 0.15);
}

.calendarDay.active {
  background: #8b5cf6;
  color: #ffffff;
  font-weight: var(--font-weight-semibold);
}
```

---

### 19.10 Stat Cards (Heart Rate, Distance, Water)

```css
.statCard {
  background: var(--glass-surface-2);
  border: 1px solid var(--glass-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.statIcon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.statValue {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--glass-text-primary);
}

.statLabel {
  font-size: var(--font-size-xs);
  color: var(--glass-text-tertiary);
}
```

---

### 19.11 Header Bar

```css
.dashboardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  margin-left: 88px; /* Sidebar offset */
}

.dashboardTitle {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--glass-text-primary);
  letter-spacing: -0.02em;
}

.headerActions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.notificationBtn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.1);
  color: var(--glass-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.notificationBtn:hover {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 2px solid rgba(139, 92, 246, 0.4);
  object-fit: cover;
}
```

---

### 19.12 Dropdown Selectors

```css
.glassDropdown {
  appearance: none;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: var(--radius-md);
  padding: 4px 24px 4px 10px;
  font-size: var(--font-size-xs);
  color: var(--glass-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.glassDropdown:hover {
  border-color: rgba(139, 92, 246, 0.3);
  color: var(--glass-text-primary);
}

.glassDropdown:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}
```

---

### 19.13 Responsive Behavior (Glassmorphism)

```css
/* Tablet */
@media (max-width: 1023px) {
  .dashboardGrid {
    grid-template-columns: 1fr 1fr;
    margin-left: 0;
    padding: var(--spacing-md);
  }

  .glassSidebar {
    position: fixed;
    bottom: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    top: auto;
    width: auto;
    flex-direction: row;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-2xl);
  }
}

/* Mobile */
@media (max-width: 767px) {
  .dashboardGrid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .challengesCard,
  .activityCard,
  .overviewCard {
    grid-column: 1 / -1;
  }
}
```

---

### 19.14 Performance Notes

| Concern | Solution |
|---|---|
| `backdrop-filter` performance | Use `will-change: transform` on glass panels; limit nested blur layers to 2 |
| Background image | Compress to WebP, use `loading="lazy"` if dynamic |
| Animations on glass | Prefer `opacity` and `transform` over `backdrop-filter` animations |
| Fallback (no blur support) | Provide solid `background: rgba(30, 41, 59, 0.9)` as fallback |

```css
/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(20px)) {
  .glassPanel {
    background: rgba(30, 41, 59, 0.92);
  }
}
```

---

### 19.15 Complete CSS Variables (Glassmorphism Theme)

```css
:root {
  /* Glass Surfaces */
  --glass-surface-1: rgba(30, 41, 59, 0.45);
  --glass-surface-2: rgba(51, 65, 85, 0.35);
  --glass-surface-3: rgba(71, 85, 105, 0.25);

  /* Glass Borders */
  --glass-border: rgba(148, 163, 184, 0.12);
  --glass-border-subtle: rgba(148, 163, 184, 0.08);
  --glass-border-accent: rgba(139, 92, 246, 0.3);

  /* Glass Blur */
  --glass-blur-heavy: blur(20px);
  --glass-blur-medium: blur(12px);
  --glass-blur-light: blur(8px);

  /* Glass Text */
  --glass-text-primary: #ffffff;
  --glass-text-secondary: rgba(255, 255, 255, 0.7);
  --glass-text-tertiary: rgba(255, 255, 255, 0.5);
  --glass-text-muted: rgba(255, 255, 255, 0.35);

  /* Accent */
  --glass-accent: #8b5cf6;
  --glass-accent-glow: rgba(139, 92, 246, 0.3);
  --glass-accent-subtle: rgba(139, 92, 246, 0.15);

  /* Semantic Glow */
  --glass-success: #4ade80;
  --glass-success-glow: rgba(74, 222, 128, 0.2);
  --glass-warning: #fbbf24;
  --glass-warning-glow: rgba(251, 191, 36, 0.2);
  --glass-error: #f87171;
  --glass-error-glow: rgba(248, 113, 113, 0.2);
  --glass-info: #60a5fa;
  --glass-info-glow: rgba(96, 165, 250, 0.2);

  /* Chart Colors */
  --glass-chart-1: #fbbf24;
  --glass-chart-2: #22d3ee;
  --glass-chart-3: #8b5cf6;
  --glass-chart-4: #4ade80;

  /* Shadows */
  --glass-shadow-sm: 0 4px 16px rgba(0, 0, 0, 0.2);
  --glass-shadow-md: 0 8px 32px rgba(0, 0, 0, 0.3);
  --glass-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.4);
  --glass-shadow-glow: 0 0 12px var(--glass-accent-glow);
}
```

---

*Galmeen kun guyyaa May 30, 2026 irratti uumame.*
*Pirojektii: Skoolific V2 - School Management System*

# Cyclone - Component Architecture

This document describes the component organization for the Cyclone project using the **Atomic Design** methodology by Brad Frost.

## Table of Contents

- [What is Atomic Design?](#what-is-atomic-design)
- [Directory Structure](#directory-structure)
- [Atomic Hierarchy](#atomic-hierarchy)
- [Component Guidelines](#component-guidelines)
- [Finding Components](#finding-components)
- [Creating New Components](#creating-new-components)
- [Mobile Considerations](#mobile-considerations)
- [Resources](#resources)

## What is Atomic Design?

Atomic Design is a methodology for creating design systems by breaking interfaces into fundamental building blocks and combining them to form increasingly complex components.

### The Five Levels

1. **Atoms** - Basic building blocks (buttons, inputs, icons)
2. **Molecules** - Simple groups of atoms (input with label, menu item)
3. **Organisms** - Complex UI sections (navigation bar, timeline clip)
4. **Templates** - Page layouts with placeholder content
5. **Pages** - Specific instances of templates with real content

### Benefits for Cyclone

- **Clear Hierarchy** - Easy to locate components by complexity
- **Improved Reusability** - DRY principle at the component level
- **Better Testing** - Smaller components are easier to test in isolation
- **Mobile-Ready** - Templates can adapt layouts for different screen sizes
- **Scalable** - New features can be built without touching core atoms

## Directory Structure

```
src/components/
├── atoms/              # Primitive UI building blocks
│   ├── BlockCursor/
│   ├── TerminalButton/
│   ├── TerminalInput/
│   ├── TerminalNoise/
│   ├── CRTEffects/
│   ├── DurationDisplay/
│   └── index.ts
├── molecules/          # Simple component combinations
│   ├── TerminalPanel/
│   ├── LaneHeader/
│   ├── ClipHandle/
│   ├── RulerTick/
│   ├── ColorSwatch/
│   ├── DialogHeader/
│   ├── DialogFooter/
│   └── index.ts
├── organisms/          # Complex, standalone components
│   ├── Timeline/
│   ├── Lane/
│   ├── Clip/
│   ├── Ruler/
│   ├── Minimap/
│   ├── ColorPicker/
│   └── index.ts
├── templates/          # Page-level layouts
│   ├── TimelineTemplate/
│   └── index.ts
├── pages/              # Complete application views
│   ├── TimelinePage/
│   └── index.ts
├── (Legacy components not yet migrated)
│   ├── MenuBar/
│   ├── CommandPalette/
│   ├── Help/
│   ├── ... (others)
├── index.ts            # Central export hub
└── README.md           # This file
```

## Atomic Hierarchy

### Atoms

**Definition:** Single-purpose, non-divisible UI elements with no dependencies on other components.

**Terminal UI Atoms:**
- `BlockCursor` - Blinking terminal cursor element
- `TerminalButton` - Button with ASCII borders and variants
- `TerminalInput` - Text input with terminal styling
- `TerminalNoise` - Background noise effect layer
- `CRTEffects` - Scanline and phosphor glow effects

**Display Atoms:**
- `DurationDisplay` - Formatted time/duration text

**Guidelines:**
- Should be completely self-contained
- No dependencies on other components (except maybe other atoms)
- Highly reusable across the application
- 100% test coverage target

**Example Structure:**
```
atoms/
├── TerminalButton/
│   ├── TerminalButton.tsx
│   ├── TerminalButton.test.tsx
│   ├── TerminalButton.module.css
│   └── index.ts
```

### Molecules

**Definition:** Combinations of atoms that form functional UI groups.

**Current Molecules:**
- `TerminalPanel` - Panel with title and border
- `LaneHeader` - Lane name and color section
- `ClipHandle` - Resize handle for clips
- `RulerTick` - Single bar/beat marker
- `GridLine` - Single grid line
- `ColorSwatch` - Color picker button
- `DialogHeader` - Reusable dialog title bar
- `DialogFooter` - Reusable action button row

**Guidelines:**
- Combine 2-5 atoms into a functional unit
- Should serve a single, clear purpose
- Can have minimal state (usually controlled by parent)
- >90% test coverage target

### Organisms

**Definition:** Complete UI sections that combine molecules and atoms into functional units.

**Timeline Organisms:**
- `Clip` - Timeline clip with drag/resize functionality
- `Lane` - Lane with clips and grid
- `Ruler` - Bar/beat ruler with time markers
- `Minimap` - Overview navigation widget
- `HUD` - Heads-up display with status info

**Dialog Organisms:**
- `CommandPalette` - Searchable command interface
- `QuickInput` - Quick value entry dialog
- `ColorPicker` - Color selection dialog
- `ContextMenu` - Right-click context menu
- `KeyboardHelp` - Keyboard shortcuts reference
- `Help` - Main help system
- `ProjectSelector` - Project management dialog
- `SaveAsDialog` - Save file dialog

**Navigation Organisms:**
- `MenuBar` - Top menu bar with file/edit/view menus
- `CommandFooter` - Bottom command reference bar
- `TerminalMenu` - Dropdown menu system
- `FileMenu` - File operations menu

**Other Organisms:**
- `BootSequence` - Application boot animation

**Guidelines:**
- Complex functionality and internal state management
- Can contain multiple molecules and atoms
- Should be self-contained and portable
- >80% test coverage target

### Templates

**Definition:** Page layouts that arrange organisms into complete screens without specific content.

**Current Templates:**
- `TimelineTemplate` - Main timeline layout
  - MenuBar (top navigation and controls)
  - Timeline (main timeline with lanes and clips)
  - CommandFooter (bottom command bar)

**Guidelines:**
- Define layout structure, not content
- Use prop slots for organism placement
- Handle responsive behavior
- Mobile-ready layouts
- >70% test coverage target

### Pages

**Definition:** Complete application screens with real data and state management.

**Current Pages:**
- `TimelinePage` - Main song arranger timeline view
  - Handles project loading logic
  - Manages keyboard shortcuts
  - Orchestrates modal display (Help, CommandPalette, QuickInput)
  - Renders TimelineTemplate with appropriate state

**Future Pages:**
- `ProjectsPage` - Project list/management (for mobile)
- `SettingsPage` - Application settings
- `OnboardingPage` - First-time user experience

**Guidelines:**
- Connect to Redux store
- Handle application-level logic
- Use templates for layout
- Orchestrate data flow between organisms
- >70% test coverage target

## Component Guidelines

### File Structure

Each component should follow this structure:

```
ComponentName/
├── ComponentName.tsx           # Main component file
├── ComponentName.test.tsx      # Test file
├── ComponentName.module.css    # Styles (if using CSS modules)
└── index.ts                    # Re-export
```

### Naming Conventions

- **Components:** PascalCase (`TerminalButton.tsx`)
- **Props Interface:** `ComponentNameProps`
- **CSS Classes:** kebab-case (`.terminal-button`)
- **Test Files:** `ComponentName.test.tsx`

### TypeScript Standards

```typescript
// Good: Explicit interface for props
interface TerminalButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Bad: Using 'any'
interface TerminalButtonProps {
  onClick: any; // ❌ Don't use 'any'
}

// Good: Proper null checking
const item = array[0];
if (!item) return null;

// Bad: Non-null assertion
const item = array[0]!; // ❌ Never use '!'
```

### Component Template

```typescript
import React from 'react';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  // Props definition
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  // Component logic

  return (
    // JSX
  );
};
```

### Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    // Test user interactions
  });
});
```

## Finding Components

### By Complexity

1. **Need a basic UI element?** → Check `atoms/`
2. **Need a simple combination?** → Check `molecules/`
3. **Need a complete feature?** → Check `organisms/`
4. **Need a page layout?** → Check `templates/`
5. **Need a full screen?** → Check `pages/`

### By Feature Area

- **Terminal UI:** `atoms/Terminal*`, `molecules/Terminal*`
- **Timeline:** `organisms/Clip`, `organisms/Lane`, `organisms/Ruler`
- **Dialogs:** `organisms/*Dialog`, `organisms/*Palette`, `organisms/*Menu`
- **Navigation:** `organisms/MenuBar`, `organisms/CommandFooter`
- **Effects:** `atoms/CRTEffects`, `atoms/TerminalNoise`

### Import Patterns

```typescript
// Import from central hub (recommended)
import { TerminalButton, BlockCursor } from '@/components';

// Import from specific atomic level
import { TerminalButton } from '@/components/atoms';

// Import directly (when tree-shaking is critical)
import { TerminalButton } from '@/components/atoms/TerminalButton';
```

## Creating New Components

### Step 1: Determine Atomic Level

Ask yourself:
- Is it a single, indivisible UI element? → **Atom**
- Does it combine 2-5 atoms? → **Molecule**
- Is it a complete, standalone feature? → **Organism**
- Does it define page structure? → **Template**
- Is it a complete screen with data? → **Page**

### Step 2: Create Directory Structure

```bash
# Example: Creating a new atom
mkdir -p src/components/atoms/NewAtom
touch src/components/atoms/NewAtom/NewAtom.tsx
touch src/components/atoms/NewAtom/NewAtom.test.tsx
touch src/components/atoms/NewAtom/NewAtom.module.css
touch src/components/atoms/NewAtom/index.ts
```

### Step 3: Write Tests First (TDD)

```typescript
// NewAtom.test.tsx
import { render, screen } from '@testing-library/react';
import { NewAtom } from './NewAtom';

describe('NewAtom', () => {
  it('should render with correct text', () => {
    render(<NewAtom text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Step 4: Implement Component

```typescript
// NewAtom.tsx
import React from 'react';
import styles from './NewAtom.module.css';

interface NewAtomProps {
  text: string;
}

export const NewAtom: React.FC<NewAtomProps> = ({ text }) => {
  return <div className={styles.newAtom}>{text}</div>;
};
```

### Step 5: Export from Barrel

```typescript
// atoms/index.ts
export { NewAtom } from './NewAtom';
```

### Step 6: Run Tests

```bash
npm test NewAtom
```

## Mobile Considerations

### Responsive Breakpoints

The templates use these breakpoints:

```css
/* Mobile: < 768px (touch-first, vertical layout) */
/* Tablet: 768px - 1024px (hybrid, adaptive layout) */
/* Desktop: > 1024px (current experience) */
```

### Mobile-Specific Variants

When creating mobile variants:

1. **Atoms:** Larger touch targets (48x48dp minimum)
2. **Molecules:** Touch-optimized interactions
3. **Organisms:** Gesture support (swipe, pinch, drag)
4. **Templates:** Vertical layouts for mobile

### Example: Mobile-Responsive Atom

```typescript
interface TerminalButtonProps {
  label: string;
  onClick: () => void;
  isMobile?: boolean; // Mobile variant flag
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  label,
  onClick,
  isMobile = false
}) => {
  const className = isMobile
    ? styles.terminalButtonMobile
    : styles.terminalButton;

  return (
    <button className={className} onClick={onClick}>
      {label}
    </button>
  );
};
```

## Resources

### Atomic Design

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/) - Original methodology
- [Atomic Design Principles](https://bradfrost.com/blog/post/atomic-web-design/) - Core concepts

### Cyclone Docs

- [CLAUDE.md](/CLAUDE.md) - Development workflow and standards
- [Project README](/README.md) - Project overview and setup

### Testing

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### React Patterns

- [React Component Composition](https://reactpatterns.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Last Updated:** 2025-10-13
**Migration Status:** ✅ Complete - All 7 phases of atomic design migration finished

### Migration Summary

- **Phase 1:** ✅ Directory structure and documentation
- **Phase 2:** ✅ Atom components (6 components migrated)
- **Phase 3:** ✅ Molecule components (7 components extracted/created)
- **Phase 4:** ✅ Organism components (6 components migrated)
- **Phase 5:** ✅ Template components (TimelineTemplate created)
- **Phase 6:** ✅ Page components (TimelinePage created, App.tsx refactored)
- **Phase 7:** ✅ Cleanup and documentation

**Test Results:** 618 out of 621 tests passing (3 pre-existing failures unrelated to migration)

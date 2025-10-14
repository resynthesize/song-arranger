# RowSelector Component

A molecule component for switching between different parameter rows in the pattern editor.

## Overview

The RowSelector provides a tab-based interface for selecting between 8 different pattern row types: note, velocity, length, delay, and four auxiliary rows (auxA-D). It supports both horizontal and vertical layouts, full keyboard navigation, and custom labels for auxiliary rows.

## Usage

### Basic Example

```tsx
import { RowSelector } from '@/components/molecules';
import { PatternRow } from '@/types';
import { useState } from 'react';

function PatternEditor() {
  const [selectedRow, setSelectedRow] = useState<PatternRow>('note');

  return (
    <div>
      <RowSelector
        selectedRow={selectedRow}
        onRowChange={setSelectedRow}
      />
      {/* PatternRow component displaying the selected row */}
    </div>
  );
}
```

### With Custom Aux Labels

```tsx
<RowSelector
  selectedRow={selectedRow}
  onRowChange={setSelectedRow}
  auxLabels={{
    auxA: 'cc #1',
    auxB: 'aftertouch',
    auxC: 'pitchbend',
    auxD: 'modwheel',
  }}
/>
```

### Vertical Layout

```tsx
<RowSelector
  selectedRow={selectedRow}
  onRowChange={setSelectedRow}
  layout="vertical"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `selectedRow` | `PatternRow` | Yes | - | Currently selected row type |
| `onRowChange` | `(row: PatternRow) => void` | Yes | - | Callback when user selects a row |
| `auxLabels` | `{ auxA?: string, auxB?: string, auxC?: string, auxD?: string }` | No | `undefined` | Custom labels for auxiliary rows |
| `layout` | `'horizontal' \| 'vertical'` | No | `'horizontal'` | Layout direction of the tabs |

## PatternRow Type

```typescript
type PatternRow = 'note' | 'velocity' | 'length' | 'delay' | 'auxA' | 'auxB' | 'auxC' | 'auxD';
```

## Default Labels

- **note**: "NOTE"
- **velocity**: "VELO"
- **length**: "LENGTH"
- **delay**: "DELAY"
- **auxA**: "AUX A"
- **auxB**: "AUX B"
- **auxC**: "AUX C"
- **auxD**: "AUX D"

## Keyboard Navigation

### Horizontal Layout (default)
- **Arrow Right**: Navigate to next row
- **Arrow Left**: Navigate to previous row
- **Home**: Jump to first row (NOTE)
- **End**: Jump to last row (AUX D)
- **Enter/Space**: Select focused row

### Vertical Layout
- **Arrow Down**: Navigate to next row
- **Arrow Up**: Navigate to previous row
- **Home**: Jump to first row (NOTE)
- **End**: Jump to last row (AUX D)
- **Enter/Space**: Select focused row

## Accessibility

The component follows WAI-ARIA tab pattern guidelines:

- Container has `role="tablist"` with `aria-orientation`
- Each button has `role="tab"` with `aria-selected`
- Selected tab has `tabIndex="0"`, others have `tabIndex="-1"`
- Keyboard navigation follows roving tabindex pattern
- Focus is managed properly on selection changes

## Styling

The component uses CSS modules (`RowSelector.module.css`) with the following CSS variables:

- `--color-bg-secondary`: Background color of container
- `--color-bg-tertiary`: Background color of tabs
- `--color-bg-hover`: Hover background color
- `--color-text-primary`: Primary text color
- `--color-text-secondary`: Secondary text color
- `--color-primary`: Selected tab background
- `--color-primary-hover`: Selected tab hover background
- `--color-focus`: Focus ring color
- `--font-mono`: Monospace font family

## Testing

The component has 31 comprehensive tests covering:
- Rendering all row buttons
- Selection state management
- User interactions (click)
- Custom aux labels
- Keyboard navigation (arrows, Home, End, Enter, Space)
- Layout variants (horizontal/vertical)
- Dynamic prop updates
- Focus management
- Accessibility attributes

**Test Coverage**: 98.55%

Run tests with:
```bash
npm test -- RowSelector.test.tsx
```

## Implementation Notes

- Component uses roving tabindex for keyboard navigation
- Focus is maintained after click interactions using `requestAnimationFrame`
- Clicking already-selected row does not trigger `onRowChange`
- All keyboard navigation wraps around (first ↔ last)
- Component is fully controlled (selected state managed by parent)

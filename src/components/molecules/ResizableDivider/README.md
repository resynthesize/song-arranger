# ResizableDivider

A horizontal resizable divider component that allows users to adjust the height of adjacent panes via mouse drag.

## Features

- Mouse drag interaction with visual feedback
- Configurable min/max height constraints
- Smooth hover and active states
- Accessible with ARIA attributes and keyboard focus
- Clean modern styling with subtle visual indicators
- Automatic event listener cleanup

## Usage

```tsx
import { ResizableDivider } from '@/components/molecules/ResizableDivider';

function MyLayout() {
  const [editorHeight, setEditorHeight] = useState(400);

  return (
    <div>
      <div style={{ height: `calc(100vh - ${editorHeight}px)` }}>
        {/* Top pane */}
      </div>

      <ResizableDivider
        onResize={setEditorHeight}
        minHeight={200}
        maxHeight={600}
      />

      <div style={{ height: editorHeight }}>
        {/* Bottom pane */}
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onResize` | `(newHeight: number) => void` | required | Callback invoked during drag with the new height value |
| `minHeight` | `number` | `200` | Minimum allowed height for the bottom pane |
| `maxHeight` | `number` | `600` | Maximum allowed height for the bottom pane |

## Behavior

1. **Hover**: Cursor changes to `ns-resize` and divider highlights
2. **Mouse Down**: Initiates drag mode with visual feedback
3. **Mouse Move** (while dragging): Continuously calls `onResize` with new calculated height
4. **Mouse Up**: Ends drag mode and removes document listeners
5. **Constraints**: Automatically clamps height values between `minHeight` and `maxHeight`

## Accessibility

- `role="separator"` for screen readers
- `aria-label` describing the divider's purpose
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` for current state
- `aria-orientation="horizontal"` indicating the resize direction
- `tabIndex={0}` for keyboard focus support

## Styling

The component uses CSS modules with modern theme variables. The divider features:

- Subtle gradient borders for depth
- 3-dot visual handle indicator
- Smooth color transitions on hover/drag
- Customizable via CSS variables:
  - `--color-bg-secondary`: Default background
  - `--color-bg-hover`: Hover state background
  - `--color-primary-dark`: Active drag background
  - `--color-border`: Border color
  - `--color-text-secondary`: Dot indicator color
  - `--color-primary`: Active state accent color

## Implementation Details

- Uses React `useState` for drag state tracking
- Uses `useEffect` with cleanup for document event listeners
- Calculates new height as: `window.innerHeight - event.clientY`
- Applies constraints using: `Math.max(minHeight, Math.min(maxHeight, newHeight))`
- Properly removes event listeners on unmount and drag end

## Test Coverage

100% test coverage including:
- Rendering and accessibility
- Mouse interaction states
- Drag behavior and callbacks
- Min/max constraint enforcement
- Event listener cleanup
- Edge cases and rapid movements

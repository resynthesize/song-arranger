# Pattern Visualization Redesign

## Current Problems

### 1. Loop Visualization
**Issue:** Diagonal stripe pattern is visually distracting when patterns loop beyond their length
- Current: 45° diagonal stripes at 15% opacity across looped section
- Clutters the view, especially with multiple looping patterns

### 2. Pattern Data Overlay
**Issue:** Vertical bars showing gate positions don't provide glanceable pattern recognition
- Current: Simple vertical lines at gate positions
- Hard to distinguish patterns at a glance
- Doesn't convey rhythm, density, or character
- Similar to looking at raw binary data instead of waveform

## Design Goals

1. **Subtlety:** Loop indicators should be informative but not distracting
2. **Glanceability:** Pattern overlays should instantly convey character/identity
3. **Terminal Aesthetic:** Stay true to Cyclone's retro/modern dual theme
4. **Performance:** Lightweight rendering for many patterns
5. **Scale Awareness:** Work across zoom levels (compressed to expanded view)

---

## SOLUTION 1: Loop Visualization Alternatives

### Option A: Opacity Fade ⭐ RECOMMENDED
**Concept:** Looped section has subtle opacity reduction

```css
.loopFill {
  background: var(--color-bg-elevated);
  opacity: 0.4; /* Dim the looped section */
}
```

**Pros:**
- Extremely subtle and non-distracting
- Clear visual distinction
- Works well at all zoom levels
- Minimal cognitive load

**Cons:**
- Less obvious that it's specifically a "loop"
- Might be confused with inactive/muted state

---

### Option B: Vertical Loop Marker
**Concept:** Single vertical line at loop boundary with optional loop icon

```
┌──────────┊────────┐
│ PATTERN  ┊  loop  │
└──────────┊────────┘
     ↑ Loop start marker
```

**CSS:**
```css
.loopMarker {
  position: absolute;
  left: var(--pattern-original-width);
  width: 2px;
  height: 100%;
  background: var(--color-secondary);
  opacity: 0.5;
}

.loopMarker::after {
  content: '↻'; /* or '⟳' */
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  color: var(--color-secondary);
}
```

**Pros:**
- Clear loop boundary indication
- Icon makes purpose explicit
- Minimal visual noise
- Terminal-appropriate

**Cons:**
- May be too subtle at high zoom
- Requires space for icon

---

### Option C: Dashed Border
**Concept:** Looped section has dashed border instead of solid

```
┌───────────┬ ─ ─ ─ ─┐
│ PATTERN   │  loop   │
└───────────┴ ─ ─ ─ ─┘
     solid   ↑ dashed
```

**CSS:**
```css
.looping {
  border-right-style: dashed;
  background: linear-gradient(
    to right,
    var(--color-bg-elevated) var(--pattern-original-width-percent),
    color-mix(in srgb, var(--color-bg-elevated) 90%, var(--color-secondary)) var(--pattern-original-width-percent)
  );
}
```

**Pros:**
- Clearly indicates looped section
- Border pattern is familiar UI convention
- Works at all zoom levels

**Cons:**
- Border style change might be too subtle
- Could conflict with selected state styling

---

### Option D: Corner Bracket
**Concept:** Small bracket character in corner of looped section

```
┌──────────────────┐
│ PATTERN      ⟲   │  ← loop indicator
└──────────────────┘
```

**Pros:**
- Minimal visual footprint
- Clear semantic meaning
- Scales well

**Cons:**
- May be missed at small zoom
- Requires pattern to be tall enough

---

## SOLUTION 2: Pattern Data Overlay Redesign

### Available Data for Visualization
From P3Bar structure:
- `gate[16]`: Step triggers (binary)
- `velo[16]`: Velocity (1-127)
- `note[16]`: Note values
- `last_step`: Active steps per bar
- `skip[16]`, `tie[16]`: Step modifiers

### Option A: Velocity Graph (Histogram) ⭐ RECOMMENDED
**Concept:** Show velocity as vertical bars creating a rhythmic "waveform"

```
Visual representation:
┌──────────────────┐
│ ▂█▅▁▃█▁▆▃▁█▆▂▁▃█ │ ← Velocity heights
└──────────────────┘
```

**Implementation:**
```typescript
interface VelocityBar {
  position: number; // 0-100%
  height: number;   // 0-100% based on velocity
  isActive: boolean; // gate[i] === 1
}

function extractVelocityGraph(patternData: P3PatternData): VelocityBar[] {
  const bars: VelocityBar[] = [];
  let totalSteps = 0;

  // Calculate total steps
  patternData.bars.forEach(bar => totalSteps += bar.last_step);

  let currentStep = 0;
  patternData.bars.forEach(bar => {
    for (let i = 0; i < bar.last_step; i++) {
      if (bar.gate[i] === 1) {
        bars.push({
          position: (currentStep / totalSteps) * 100,
          height: (bar.velo[i] / 127) * 100,
          isActive: true
        });
      }
      currentStep++;
    }
  });

  return bars;
}
```

**CSS:**
```css
.velocityVisualization {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
  opacity: 0.3;
}

.velocityBar {
  position: absolute;
  bottom: 0;
  width: 2px;
  background: var(--pattern-color, var(--color-primary));
  box-shadow: 0 0 2px var(--pattern-color, var(--color-primary));
}
```

**Pros:**
- Instantly shows rhythm and dynamics
- Recognizable "waveform" shape
- Velocity is crucial musical info
- Glanceable density information
- Works like DAW piano roll preview

**Cons:**
- Requires calculating velocity heights
- May be cluttered on very dense patterns

---

### Option B: Rhythm Grid (Step Indicator)
**Concept:** Show grid of steps with filled/empty cells for gate pattern

```
Visual representation:
┌──────────────────┐
│ ██ █  █ ██    █  │ ← Filled = gate on
│ ││ │  │ ││    │  │ ← Grid lines
└──────────────────┘
```

**Implementation:**
```typescript
interface StepCell {
  position: number;    // 0-100%
  width: number;       // Cell width
  isActive: boolean;   // gate === 1
  isAccented: boolean; // velocity > 100
}

function extractStepGrid(patternData: P3PatternData): StepCell[] {
  const cells: StepCell[] = [];
  let totalSteps = 0;

  patternData.bars.forEach(bar => totalSteps += bar.last_step);

  let currentStep = 0;
  patternData.bars.forEach(bar => {
    const cellWidth = (bar.last_step / totalSteps) * 100;

    for (let i = 0; i < bar.last_step; i++) {
      cells.push({
        position: (currentStep / totalSteps) * 100,
        width: 100 / totalSteps,
        isActive: bar.gate[i] === 1,
        isAccented: bar.velo[i] > 100
      });
      currentStep++;
    }
  });

  return cells;
}
```

**CSS:**
```css
.stepGrid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

.stepCell {
  height: 100%;
  border-right: 1px solid color-mix(in srgb, var(--color-grid) 30%, transparent);
  opacity: 0.2;
}

.stepCell.active {
  background: var(--pattern-color, var(--color-primary));
  opacity: 0.4;
}

.stepCell.accented {
  opacity: 0.6;
  background: var(--color-highlight);
}
```

**Pros:**
- Clear step-by-step rhythm
- Shows exact gate pattern
- Good for drum patterns
- Familiar to sequencer users

**Cons:**
- Can be cluttered with 16+ steps
- Less distinctive at a glance
- Loses info at low zoom

---

### Option C: Density Heatmap
**Concept:** Divide pattern into regions, color by activity density

```
Visual representation:
┌──────────────────┐
│▓▓▓░░░▓▓▓▓░░▓▓▓▓░│ ← Darker = more active
└──────────────────┘
```

**Implementation:**
```typescript
interface DensityRegion {
  startPercent: number;
  endPercent: number;
  density: number; // 0-1
  avgVelocity: number; // 0-127
}

function extractDensityHeatmap(
  patternData: P3PatternData,
  regions: number = 8
): DensityRegion[] {
  // Divide pattern into N regions
  let totalSteps = 0;
  patternData.bars.forEach(bar => totalSteps += bar.last_step);

  const stepsPerRegion = totalSteps / regions;
  const densityMap: DensityRegion[] = [];

  for (let r = 0; r < regions; r++) {
    let activeCount = 0;
    let veloSum = 0;
    let stepCount = 0;

    // Count active steps in region
    let currentStep = 0;
    patternData.bars.forEach(bar => {
      for (let i = 0; i < bar.last_step; i++) {
        if (currentStep >= r * stepsPerRegion &&
            currentStep < (r + 1) * stepsPerRegion) {
          stepCount++;
          if (bar.gate[i] === 1) {
            activeCount++;
            veloSum += bar.velo[i];
          }
        }
        currentStep++;
      }
    });

    densityMap.push({
      startPercent: (r / regions) * 100,
      endPercent: ((r + 1) / regions) * 100,
      density: stepCount > 0 ? activeCount / stepCount : 0,
      avgVelocity: activeCount > 0 ? veloSum / activeCount : 0
    });
  }

  return densityMap;
}
```

**Pros:**
- Shows pattern "shape" at a glance
- Works well at any zoom level
- Low render cost
- Distinctive patterns

**Cons:**
- Loses fine rhythmic detail
- Less precise than other options
- May be too abstract

---

### Option D: Signature Pattern (First Bar Preview)
**Concept:** Show detailed view of first bar only as "thumbnail"

```
Visual representation:
┌──────────────────┐
│ █▅▂█▅ █    ▂▃█  │ ← First bar detailed
└──────────────────┘
```

**Pros:**
- Clean, uncluttered
- Shows enough to recognize
- Low render cost
- Works at all zoom levels

**Cons:**
- Doesn't represent full pattern
- Assumes first bar is representative

---

## RECOMMENDATIONS

### For Loop Visualization:
**Use Option A (Opacity Fade) + Option B (Loop Marker)**

Combine subtle opacity with a minimal marker:
```css
.loopFill {
  background: var(--color-bg-elevated);
  opacity: 0.5;
}

.loopMarker {
  position: absolute;
  left: var(--pattern-original-width);
  width: 1px;
  height: 100%;
  background: var(--color-secondary);
  opacity: 0.6;
}
```

### For Pattern Data Overlay:
**Use Option A (Velocity Graph)**

Best balance of glanceability, information density, and aesthetic:
- Shows rhythm clearly
- Velocity is musically meaningful
- Distinctive shapes for recognition
- Familiar to DAW users
- Works with terminal aesthetic

**Responsive display:**
```typescript
// Show different detail levels based on pattern width
if (widthPx < 40) {
  // Show nothing (too small)
} else if (widthPx < 100) {
  // Show density heatmap (Option C)
} else if (widthPx < 200) {
  // Show signature pattern (Option D)
} else {
  // Show full velocity graph (Option A)
}
```

---

## Implementation Plan

1. **Create new visualization utilities:**
   - `extractVelocityGraph()` in `patternVisualization.ts`
   - `extractDensityHeatmap()` as fallback for small patterns

2. **Update Pattern component:**
   - Replace `gateVisualization` with `velocityVisualization`
   - Add responsive logic for detail levels
   - Update CSS for new overlay style

3. **Update loop visualization:**
   - Replace diagonal stripes with opacity + marker
   - Add loop marker element
   - Update CSS for subtlety

4. **Add tests:**
   - Test velocity extraction logic
   - Test responsive behavior
   - Visual regression tests

5. **Get feedback:**
   - Test with real pattern data
   - Iterate on opacity/sizing values
   - Consider user preferences toggle

---

## Visual Comparison

### Current State:
```
┌──────────╱╱╱╱╱╱╱┐  ← Distracting stripes
│ KICK  │││││││││││  ← Noisy gates
└──────────╱╱╱╱╱╱╱┘
```

### Proposed State:
```
┌──────────┊░░░░░░░┐  ← Subtle opacity + marker
│ KICK ▂█▅█▂█▁  ░░░│  ← Glanceable velocity
└──────────┊░░░░░░░┘
```

Much cleaner, more informative, less distracting!

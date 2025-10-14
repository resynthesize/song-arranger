# Cyclone - Development Guide

This document outlines development practices and workflows for the Cyclone project.

## Project Overview

Cyclone is a web-based sequence editor and timeline tool for the Sequentix Cirklon hardware sequencer, featuring retro VT terminal and modern minimalist themes.

## Tech Stack

- **Frontend:** React 18+ with TypeScript
- **State Management:** Redux Toolkit
- **Build Tool:** Vite
- **Testing:** Jest + React Testing Library
- **Styling:** CSS Modules / Styled Components (TBD)
- **Design:** Retro terminal aesthetic with CRT effects

## Development Workflow

### Git Workflow

1. **Repository Structure:**
   - Main branch: `main`
   - Feature branches: `btallent/gam-{issue-number}-{description}` (matches Linear git branch names)
   - Example: `btallent/gam-5-framework-setup`

2. **Commit Strategy:**
   - Commit after each completed task or significant milestone
   - Reference Linear issue IDs in commit messages
   - Use conventional commit format when applicable

3. **Commit Message Format:**
   ```
   [GAM-XX] Brief description of changes

   - Detailed point 1
   - Detailed point 2
   ```

4. **Branch Management:**
   - Create feature branch for each Linear issue
   - Keep branches focused on single issues
   - Merge to main after completion and review

### Test-Driven Development (TDD)

**Philosophy:** Write tests first, then implement features to pass those tests.

**TDD Cycle:**
1. **Red:** Write a failing test
2. **Green:** Write minimal code to make test pass
3. **Refactor:** Clean up code while keeping tests green

**What to Test:**

1. **Components:**
   - Rendering with different props
   - User interactions (clicks, drags, keyboard)
   - State changes and updates
   - Accessibility (ARIA attributes, keyboard navigation)

2. **Redux Logic:**
   - Reducers: state transformations
   - Selectors: computed values
   - Actions: dispatched correctly
   - Thunks: async logic (if used)

3. **Utilities:**
   - Duration calculations
   - Time formatting
   - Zoom calculations
   - Grid/snap logic

4. **Integration:**
   - Component + Redux interactions
   - Multi-component workflows
   - User journeys (create clip → select → delete)

**Testing Patterns:**

```typescript
// Component test example
describe('Clip', () => {
  it('should render with correct dimensions', () => {
    // Arrange
    const props = { duration: 4, position: 0 };

    // Act
    render(<Clip {...props} />);

    // Assert
    expect(screen.getByTestId('clip')).toHaveStyle({ width: '400px' });
  });
});

// Redux test example
describe('clipsSlice', () => {
  it('should add clip to lane', () => {
    // Arrange
    const initialState = { clips: [] };

    // Act
    const newState = clipsReducer(initialState, addClip({ laneId: '1', duration: 4 }));

    // Assert
    expect(newState.clips).toHaveLength(1);
  });
});
```

**Test Coverage:**
- Aim for 80%+ coverage on critical paths
- 100% coverage on utility functions
- Focus on behavior, not implementation details

**Testing Tools:**
- **Jest:** Test runner and assertions
- **React Testing Library:** Component testing
- **@testing-library/user-event:** User interaction simulation
- **jest-dom:** Enhanced DOM matchers

### Code Standards

**TypeScript:**
- Strict mode enabled
- Explicit types for props and state
- No `any` types (use `unknown` if needed)
- Interfaces for data structures, types for unions/utilities
- **NEVER use non-null assertion operator (`!`)** - always use proper guards and checks instead
  - Bad: `const item = array[0]!;`
  - Good: `const item = array[0]; if (!item) return;`

**React Patterns:**
- Functional components only
- Custom hooks for reusable logic
- Props interface for each component
- Meaningful component and variable names

**File Structure:**
```
src/
├── components/          # React components
│   ├── Timeline/
│   │   ├── Timeline.tsx
│   │   ├── Timeline.test.tsx
│   │   └── Timeline.module.css
│   └── Clip/
├── store/              # Redux store
│   ├── slices/
│   │   ├── clipsSlice.ts
│   │   └── clipsSlice.test.ts
│   └── store.ts
├── utils/              # Utility functions
│   ├── duration.ts
│   └── duration.test.ts
├── types/              # TypeScript types
│   └── index.ts
├── styles/             # Global styles
│   ├── theme.css       # CSS variables
│   └── crt-effects.css
└── App.tsx
```

**Naming Conventions:**
- Components: PascalCase (`Timeline.tsx`)
- Utilities: camelCase (`calculateDuration.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_ZOOM_LEVEL`)
- CSS classes: kebab-case (`.timeline-lane`)

### Design System

**Colors (CSS Variables):**
```css
--color-bg: #000000;
--color-primary: #00ff00;
--color-secondary: #008800;
--color-highlight: #66ff66;
--color-grid: #003300;
```

**Typography:**
- Primary: VT323 (authentic terminal feel)
- Alternative: Share Tech Mono (better readability)
- Fallback: Courier, monospace

**Effects:**
- Scanlines: 5-15% opacity
- Phosphor glow: CSS text-shadow/box-shadow
- All effects toggleable for accessibility

### Linear Integration

**Issue References:**
- Always reference Linear issue ID in commits: `[GAM-XX]`
- Use Linear's suggested branch names
- Close issues with PR merge to main

**Issue Workflow:**
1. Pick issue from backlog
2. Create feature branch (use Linear's git branch name)
3. Write tests (TDD)
4. Implement feature
5. Commit with issue reference
6. Push to GitHub
7. Create PR (if needed)
8. Update issue status in Linear

### Performance Considerations

- Virtualize long lists if needed
- Memoize expensive calculations
- Use React.memo for pure components
- Optimize Redux selectors with reselect
- CSS transforms for animations (not position/width)
- RequestAnimationFrame for smooth interactions

### Accessibility

- Keyboard navigation for all interactions
- ARIA labels where needed
- Focus management
- Respect `prefers-reduced-motion`
- Toggles for CRT effects
- Semantic HTML

## Getting Started

1. Clone repository
2. `npm install`
3. `npm test` - Run tests once
4. `npm run dev` - Start dev server
5. Create feature branch for Linear issue
6. Follow TDD approach
7. Commit often with Linear issue references

## Running Tests

The project uses Jest with React Testing Library for testing.

**Available Test Commands:**

- `npm test` - Run all tests once and exit (recommended for CI/CD and general use)
- `npm run test:watch` - Run tests in watch mode (re-runs on file changes)
- `npm run test:ci` - Run tests in CI mode with additional optimizations

**Best Practices:**

1. **Run tests before committing:**
   ```bash
   npm test
   ```
   Ensure all tests pass before creating commits.

2. **Watch mode during development:**
   ```bash
   npm run test:watch
   ```
   Use watch mode while actively developing to get instant feedback.

3. **Test file naming:**
   - Component tests: `ComponentName.test.tsx`
   - Utility tests: `utilityName.test.ts`
   - Redux tests: `sliceName.test.ts`

4. **Test organization:**
   - Place test files alongside the code they test
   - Use descriptive test names that explain expected behavior
   - Group related tests using `describe` blocks

5. **Redux testing:**
   - Components using Redux hooks need to be wrapped with a `<Provider>`
   - Create a test store helper function for consistent setup
   - When using `rerender`, ensure the component is still wrapped with the Provider

**Example Test Setup with Redux:**

```typescript
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import myReducer from '@/store/slices/mySlice';

const createTestStore = () => {
  return configureStore({
    reducer: { my: myReducer },
    preloadedState: { /* initial state */ },
  });
};

const renderWithProvider = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

// For tests that need rerender:
const store = createTestStore();
const { rerender } = render(
  <Provider store={store}>
    <MyComponent {...props} />
  </Provider>
);

rerender(
  <Provider store={store}>
    <MyComponent {...newProps} />
  </Provider>
);
```

## Resources

- [Linear Project](https://linear.app/gamedevs/project/song-arranger-f4f223461148)
- [Monolake 8bit Inspiration](https://roberthenke.com/concerts/monolake8bit.html)
- [VT323 Font](https://fonts.google.com/specimen/VT323)
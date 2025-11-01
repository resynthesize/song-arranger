# Claude Code - Agent Guidelines for Cyclone

This document outlines best practices and workflows for Claude Code when working on the Cyclone project.

## Browser Debugging with Playwright

### Overview

The project includes a Playwright-based browser inspection system that allows automated testing and debugging of the running application. This provides a crucial feedback loop for catching runtime errors, console warnings, and visual regressions.

### Setup

The browser inspection tools are already set up in this project:
- **Playwright**: Headless browser automation framework
- **tsx**: TypeScript execution for running inspection scripts
- **npm run inspect**: Main command for browser inspection

### When to Use Browser Inspection

Use `npm run inspect` in these scenarios:

1. **After Making Significant Changes**: Always test after refactoring components or state management
2. **When Fixing Bugs**: Verify the fix didn't introduce console errors or warnings
3. **Before Committing**: Final check before creating commits
4. **During State Management Work**: Redux changes often cause selector warnings
5. **When Working with UI Components**: Catch rendering errors early

### Usage Examples

#### Basic Health Check

```bash
npm run inspect -- --url http://localhost:5174 --wait-for "#root"
```

This will:
- Navigate to the running dev server
- Wait for the root element to load
- Capture all console messages (log, warn, error)
- Report any JavaScript errors
- Exit with status code indicating success/failure

#### Take Screenshot for Visual Verification

```bash
npm run inspect -- --url http://localhost:5174 --screenshot screenshots/current-state.png --wait-for ".timeline"
```

#### Inspect Specific Elements

```bash
npm run inspect -- --url http://localhost:5174 --selector ".pattern-editor" --wait-for ".pattern-editor"
```

#### Run JavaScript in Page Context

```bash
npm run inspect -- --url http://localhost:5174 --evaluate "document.querySelectorAll('.track').length"
```

#### Debug Mode (Show Browser Window)

```bash
npm run inspect -- --url http://localhost:5174 --headed
```

### Typical Debugging Workflow

1. **Make code changes** to fix an issue or add a feature
2. **Check if dev server is running** (look for background Bash process)
3. **Run browser inspection** to verify no console errors/warnings
4. **If errors found**:
   - Analyze the error messages
   - Fix the issues
   - Run inspection again
   - Repeat until clean
5. **Take screenshot** if visual verification needed
6. **Commit** once inspection shows zero errors/warnings

### Common Issues Detected

The browser inspection tool is particularly useful for catching:

- **Redux Selector Warnings**: "Selector unknown returned the root state"
- **React Warnings**: Invalid props, missing keys, hooks violations
- **Console Errors**: Runtime JavaScript errors
- **Rendering Issues**: Component crashes, null references
- **State Management**: Improper state updates, missing dependencies

### Example: Recent Redux Selector Fix

A recent debugging session used browser inspection to identify and fix Redux selector issues:

1. **Initial inspection** revealed 4 warnings:
   ```
   Selector unknown returned the root state when called
   ```

2. **Identified problematic code**:
   - `Timeline.tsx`: `const debugState = useAppSelector((state) => state);`
   - `CommandPalette.tsx`: `const state = useAppSelector(state => state);`
   - `FileMenu.tsx`: `const songData = useAppSelector((state) => state.song);`
   - `FileMenu.tsx`: `const timeline = useAppSelector((state) => state.timeline);`

3. **Fixed by**:
   - Using specific selectors instead of entire state slices
   - Using `useStore()` and `store.getState()` for one-time reads
   - Moving state access into callbacks/useMemo

4. **Verified fix**:
   ```bash
   npm run inspect -- --url http://localhost:5174 --wait-for "#root"
   ```
   Result: **0 errors, 0 warnings** ✓

### Integration with Development Flow

Browser inspection should be integrated into the regular development workflow:

#### Before Committing

```bash
# Quick check
npm run inspect -- --url http://localhost:5174 --wait-for "#root"

# If clean, proceed with commit
git add .
git commit -m "[GAM-XX] Description"
```

#### After Major Refactoring

```bash
# Comprehensive check with screenshot
npm run inspect -- \\
  --url http://localhost:5174 \\
  --wait-for ".timeline" \\
  --screenshot screenshots/post-refactor.png

# Compare with before screenshot if needed
```

#### CI/CD Integration (Future)

The inspect script can be integrated into CI/CD:
- Exit code 0 = success (no errors)
- Exit code 1 = failure (errors detected)

### Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `--url` | URL to test (default: localhost:5173) | `--url http://localhost:5174` |
| `--screenshot` | Save screenshot to path | `--screenshot app.png` |
| `--selector` | Get HTML of element | `--selector "#root"` |
| `--evaluate` | Run JavaScript | `--evaluate "window.innerWidth"` |
| `--wait-for` | Wait for element | `--wait-for ".timeline"` |
| `--timeout` | Timeout in ms (default: 30000) | `--timeout 60000` |
| `--headed` | Show browser window | `--headed` |

### Scripts Location

All browser inspection scripts are in `/scripts/`:
- `browser-inspect.ts` - Main inspection script
- `quick-check.sh` - Quick health check helper
- `README.md` - Detailed documentation

### Best Practices

1. **Always check dev server URL**: Port may change if 5173 is in use
2. **Use --wait-for for dynamic content**: Ensures elements load before inspection
3. **Run headed mode for visual debugging**: Use `--headed` when troubleshooting
4. **Check exit code**: Script exits with code 1 if errors detected
5. **Take screenshots for regressions**: Visual evidence of changes
6. **Test after state management changes**: Redux/state changes are error-prone

## Redux State Management

### Selector Best Practices

Based on recent fixes, follow these patterns for Redux selectors:

#### ❌ Bad: Selecting Entire State Slices

```typescript
// Causes unnecessary re-renders and warnings
const state = useAppSelector((state) => state);
const songData = useAppSelector((state) => state.song);
const timeline = useAppSelector((state) => state.timeline);
```

#### ✅ Good: Specific Selectors

```typescript
// Use specific selectors from @/store/selectors
import { selectMetadata, selectCurrentSongName } from '@/store/selectors';

const metadata = useAppSelector(selectMetadata);
const currentSongName = useAppSelector(selectCurrentSongName);
```

#### ✅ Good: Store Access for One-Time Reads

```typescript
import { useStore } from 'react-redux';
import type { RootState } from '@/store/store';

const Component = () => {
  const store = useStore<RootState>();

  const handleSave = useCallback(() => {
    // Get state only when needed, don't subscribe
    const state = store.getState();
    const songData = state.song;
    const timeline = state.timeline;

    // Use the data...
  }, [store]);
};
```

#### ✅ Good: useMemo for Conditional Computation

```typescript
const displayCommands = useMemo(() => {
  if (!isOpen) return [];

  const state = store.getState();
  return computeCommands(state);
}, [isOpen, store]);
```

### Why This Matters

- **Performance**: Selecting entire state causes re-renders on ANY state change
- **Redux Warnings**: Redux toolkit detects and warns about root state selection
- **Developer Experience**: Console warnings clutter development workflow
- **Best Practices**: Following Redux patterns improves maintainability

## Testing Integration

### Before Deploying

Run this checklist before deploying:

```bash
# 1. Run unit tests
npm test

# 2. Run browser inspection
npm run inspect -- --url http://localhost:5174 --wait-for "#root"

# 3. Take deployment screenshot
npm run inspect -- \\
  --url http://localhost:5174 \\
  --screenshot screenshots/deployment-$(date +%Y%m%d).png \\
  --wait-for ".timeline"

# 4. Build the project
npm run build

# 5. Preview production build
npm run preview
```

## Documentation

For more detailed information:
- Browser inspection: `/scripts/README.md`
- Development workflow: `/CLAUDE.md`
- Architecture: `/ARCHITECTURE.md`
- Migration guides: `/MIGRATION_GUIDE.md`

## Summary

The Playwright browser inspection system provides a crucial feedback loop for development:
- ✅ Catch console errors and warnings before committing
- ✅ Verify Redux selectors don't return root state
- ✅ Visual verification through screenshots
- ✅ Runtime validation of changes
- ✅ Automated testing capability

**Always run `npm run inspect` after making changes to state management or UI components.**

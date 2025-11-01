# Browser Inspection Scripts

These scripts enable automated browser inspection of the Cyclone app for debugging, testing, and quality assurance.

## Setup

The required dependencies are already installed:
- Playwright (headless browser automation)
- tsx (TypeScript execution)

## Usage

### Basic Inspection

Run a basic health check (waits for app to load, captures console output):

```bash
npm run inspect
```

### Take a Screenshot

```bash
npm run inspect -- --screenshot screenshots/app.png
```

### Wait for Specific Element

```bash
npm run inspect -- --wait-for ".timeline"
```

### Inspect DOM Content

Get the innerHTML of a specific element:

```bash
npm run inspect -- --selector "#root"
```

### Evaluate JavaScript

Run JavaScript in the page context:

```bash
npm run inspect -- --evaluate "document.querySelectorAll('.pattern').length"
```

### Run in Headed Mode

See the browser window (useful for debugging):

```bash
npm run inspect -- --headed
```

### Combine Multiple Options

```bash
npm run inspect -- --screenshot screenshots/timeline.png --wait-for ".timeline" --evaluate "window.innerWidth"
```

## Quick Check Script

Run a comprehensive health check:

```bash
./scripts/quick-check.sh
```

This will:
1. Check if the dev server is running
2. Launch a browser
3. Navigate to the app
4. Wait for the root element
5. Capture console output
6. Take a screenshot

## Options Reference

| Option | Description | Example |
|--------|-------------|---------|
| `--url <url>` | URL to navigate to | `--url http://localhost:5173` |
| `--screenshot <path>` | Take a screenshot | `--screenshot app.png` |
| `--selector <selector>` | Get innerHTML of element | `--selector "#root"` |
| `--evaluate <code>` | Run JavaScript | `--evaluate "window.innerWidth"` |
| `--wait-for <selector>` | Wait for element | `--wait-for ".timeline"` |
| `--timeout <ms>` | Timeout in milliseconds | `--timeout 60000` |
| `--headed` | Show browser window | `--headed` |
| `--help` | Show help message | `--help` |

## Examples for Claude

### Check for Console Errors

```bash
npm run inspect
```

This will capture all console messages and report any errors or warnings.

### Verify Specific Component Rendered

```bash
npm run inspect -- --wait-for ".pattern-editor" --screenshot screenshots/pattern-editor.png
```

### Get Redux State

```bash
npm run inspect -- --evaluate "window.store.getState()"
```

(Note: This requires exposing the store on window in dev mode)

### Check Responsive Behavior

```bash
npm run inspect -- --evaluate "{ width: window.innerWidth, height: window.innerHeight }"
```

### Verify Element Count

```bash
npm run inspect -- --evaluate "document.querySelectorAll('.track').length"
```

### Full Page Screenshot

```bash
npm run inspect -- --screenshot screenshots/full-page.png --wait-for ".timeline"
```

## Output

The script will output:
- All console messages (log, warn, error)
- JavaScript errors
- Warnings
- DOM content (if selector provided)
- Evaluation results (if evaluate provided)
- Screenshot path (if screenshot taken)
- Summary of results

## Exit Codes

- `0`: Success with no errors
- `1`: Failure or errors detected

## Tips

1. **Always ensure dev server is running** before running inspection scripts
2. **Use --wait-for** to ensure elements are loaded before inspection
3. **Use --headed** to debug issues visually
4. **Take screenshots** to verify visual state
5. **Combine options** to get comprehensive inspection results

## Integration with Development

These scripts can be used:
- During development to check for console errors
- In CI/CD pipelines for automated checks
- To verify visual regressions
- To inspect runtime state
- To debug issues without manual browser interaction

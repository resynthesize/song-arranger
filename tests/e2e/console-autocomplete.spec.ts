import { test, expect } from '@playwright/test';

test.describe('Console Autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
  });

  test('should show autocomplete when typing info.', async ({ page }) => {
    // Click on console input
    const consoleInput = page.locator('[data-testid="console-input-field"]');
    await consoleInput.click();

    // Type "info."
    await consoleInput.fill('info.');

    // Wait for autocomplete to appear
    const autocomplete = page.locator('[data-testid="console-autocomplete"]');
    await expect(autocomplete).toBeVisible();

    // Should show trackCount and patternCount
    const items = page.locator('.console-autocomplete__item');
    await expect(items).toHaveCount(2);
  });

  test('should navigate autocomplete with arrow keys', async ({ page }) => {
    const consoleInput = page.locator('[data-testid="console-input-field"]');
    await consoleInput.click();
    await consoleInput.fill('info.');

    // Wait for autocomplete
    await page.waitForSelector('[data-testid="console-autocomplete"]');

    // First item should be selected
    const selectedItem = page.locator('.console-autocomplete__item--selected');
    await expect(selectedItem).toHaveCount(1);

    // Press down arrow
    await page.keyboard.press('ArrowDown');

    // Second item should be selected
    const items = page.locator('.console-autocomplete__item');
    const secondItem = items.nth(1);
    await expect(secondItem).toHaveClass(/console-autocomplete__item--selected/);
  });

  test('should accept autocomplete with Enter key', async ({ page }) => {
    const consoleInput = page.locator('[data-testid="console-input-field"]');
    await consoleInput.click();
    await consoleInput.fill('info.');

    // Wait for autocomplete
    await page.waitForSelector('[data-testid="console-autocomplete"]');

    // Press Enter to accept
    await page.keyboard.press('Enter');

    // Input should be updated
    await expect(consoleInput).toHaveValue('info.trackCount');

    // Autocomplete should be hidden
    const autocomplete = page.locator('[data-testid="console-autocomplete"]');
    await expect(autocomplete).not.toBeVisible();
  });

  test('should close autocomplete with Escape', async ({ page }) => {
    const consoleInput = page.locator('[data-testid="console-input-field"]');
    await consoleInput.click();
    await consoleInput.fill('info.');

    // Wait for autocomplete
    await page.waitForSelector('[data-testid="console-autocomplete"]');

    // Press Escape
    await page.keyboard.press('Escape');

    // Autocomplete should be hidden
    const autocomplete = page.locator('[data-testid="console-autocomplete"]');
    await expect(autocomplete).not.toBeVisible();
  });

  test('should not show autocomplete after special characters', async ({ page }) => {
    const consoleInput = page.locator('[data-testid="console-input-field"]');
    await consoleInput.click();

    // Type "clear("
    await consoleInput.fill('clear(');

    // Wait a bit
    await page.waitForTimeout(200);

    // Autocomplete should not be visible
    const autocomplete = page.locator('[data-testid="console-autocomplete"]');
    await expect(autocomplete).not.toBeVisible();
  });

  test('MODERN THEME: should have NO green colors', async ({ page }) => {
    // Switch to modern theme by dispatching Redux action directly
    // (Console z-index prevents clicking menu item)
    await page.evaluate(() => {
      // Access the Redux store from window (exposed by React DevTools or we can use __REDUX_DEVTOOLS_EXTENSION__)
      const store = (window as any).__store__;
      if (store) {
        store.dispatch({ type: 'theme/setTheme', payload: 'modern' });
      }
    });

    // Wait for theme to actually change in DOM
    await page.waitForTimeout(200);

    const consoleInput = page.locator('[data-testid="console-input-field"]');
    await consoleInput.click();
    await consoleInput.fill('info.');

    // Wait for autocomplete
    await page.waitForSelector('[data-testid="console-autocomplete"]');

    // Debug: Check what classes are on the root element
    const rootClasses = await page.evaluate(() => {
      const app = document.querySelector('.app');
      return app ? app.className : 'NO APP ELEMENT';
    });
    console.log('Root app classes:', rootClasses);

    // Check console input text color - should NOT be green
    const inputColor = await consoleInput.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Input text color:', inputColor);
    expect(inputColor).not.toMatch(/rgb\(0,\s*255,\s*0\)/); // Not bright green
    expect(inputColor).not.toMatch(/rgb\(0,\s*170,\s*0\)/); // Not dark green

    // Check prompt color - should be blue
    const prompt = page.locator('.console-input__prompt');
    const promptColor = await prompt.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Prompt color:', promptColor);
    expect(promptColor).not.toMatch(/rgb\(0,\s*255,\s*0\)/);

    // Check autocomplete item background on hover
    const firstItem = page.locator('.console-autocomplete__item').first();
    await firstItem.hover();

    const hoverBg = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Hover background:', hoverBg);
    expect(hoverBg).not.toMatch(/rgba?\(0,\s*255,\s*0/); // No green in background

    // Check selected item background
    const selectedItem = page.locator('.console-autocomplete__item--selected');
    const selectedBg = await selectedItem.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Selected background:', selectedBg);
    expect(selectedBg).not.toMatch(/rgba?\(0,\s*255,\s*0/); // No green in background

    // Check selected item text color
    const selectedColor = await selectedItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Selected text color:', selectedColor);
    expect(selectedColor).not.toMatch(/rgb\(0,\s*255,\s*0\)/);
    expect(selectedColor).not.toMatch(/rgb\(0,\s*170,\s*0\)/);
  });
});

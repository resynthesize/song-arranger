/**
 * User interaction helpers - composable interaction patterns
 *
 * These helpers provide reusable interaction patterns that work across different
 * test scenarios. They handle browser-specific quirks and provide consistent
 * behavior for common operations like dragging, clicking, and keyboard input.
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Drag element by offset using native browser mouse events
 *
 * This helper simulates real user drag interactions by using the Page's mouse API
 * to trigger native browser events. This is necessary for components that use
 * document-level event listeners (not React synthetic events).
 *
 * @param element - The Playwright locator for the element to drag
 * @param deltaX - Horizontal pixels to drag (positive = right, negative = left)
 * @param deltaY - Vertical pixels to drag (positive = down, negative = up)
 *
 * @example
 * // Drag pattern 100px to the right
 * const pattern = getPatternElement(page, 0);
 * await dragBy(pattern, 100, 0);
 *
 * @example
 * // Drag velocity bar up by 20px to increase value
 * const velocityBar = page.locator('[data-testid="velocity-bar-0"]');
 * await dragBy(velocityBar, 0, -20);
 *
 * Special behavior:
 * - For pattern elements (data-testid="pattern-*"), automatically finds the
 *   content div where the drag handler is attached
 * - Includes 200ms delay after mousedown to allow React useEffect hooks to
 *   attach document-level event listeners
 */
export const dragBy = async (
  element: Locator,
  deltaX: number,
  deltaY: number
) => {
  // For patterns, find the content div inside the pattern element
  // Pattern component structure has multiple child divs:
  // <div class="pattern">
  //   <div class="loopFill"> (optional)
  //   <div class="pattern__handle pattern__handle--left">  (PatternHandle)
  //   <div class="_content_*"> (THIS is where the drag handler is)
  //   <div class="pattern__handle pattern__handle--right"> (PatternHandle)
  // </div>
  const testId = await element.getAttribute('data-testid');
  const isPattern = testId?.startsWith('pattern-');

  // If this is a pattern element, find the content div specifically
  // CSS modules preserve the word "content" in the hashed class (_content_xxxxx)
  const dragTarget = isPattern
    ? element.locator('> div[class*="content"]')
    : element;

  const box = await dragTarget.boundingBox();
  if (!box) throw new Error('Drag target has no bounding box');

  const page = dragTarget.page();

  // Calculate positions (center of element)
  const sourceX = box.x + box.width / 2;
  const sourceY = box.y + box.height / 2;
  const targetX = sourceX + deltaX;
  const targetY = sourceY + deltaY;

  // Manual mouse operations to trigger native browser events
  // The usePatternDrag hook listens to document-level mousemove/mouseup events
  // IMPORTANT: Add delay after mousedown to let React's useEffect add document listeners
  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.waitForTimeout(200); // Wait for React useEffect to run and add listeners (tested: 200ms works)
  await page.mouse.move(targetX, targetY);
  await page.mouse.up();
};

/**
 * Drag element to specific absolute coordinates
 *
 * This helper drags an element from its current position to specific
 * screen coordinates. Useful when you know the exact target position.
 *
 * @param element - The Playwright locator for the element to drag
 * @param targetX - Target X coordinate in pixels (absolute screen position)
 * @param targetY - Target Y coordinate in pixels (absolute screen position)
 *
 * @example
 * // Drag pattern to specific screen position
 * const pattern = getPatternElement(page, 0);
 * await dragTo(pattern, 500, 200);
 */
export const dragTo = async (
  element: Locator,
  targetX: number,
  targetY: number
) => {
  await element.hover();
  await element.page().mouse.down();
  await element.page().mouse.move(targetX, targetY, { steps: 10 });
  await element.page().mouse.up();
};

/**
 * Click element with keyboard modifiers
 *
 * This helper clicks an element while holding down specified modifier keys.
 * Useful for testing keyboard shortcuts and modified click behaviors.
 *
 * @param element - The Playwright locator for the element to click
 * @param modifiers - Array of modifier keys ('Alt', 'Control', 'Meta', 'Shift')
 *
 * @example
 * // Shift+click to toggle gate
 * const step = page.locator('[data-testid="step-0"]');
 * await clickWithModifiers(step, ['Shift']);
 *
 * @example
 * // Alt+Shift+click to toggle aux flag
 * await clickWithModifiers(step, ['Alt', 'Shift']);
 */
export const clickWithModifiers = async (
  element: Locator,
  modifiers: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>
) => {
  await element.click({ modifiers });
};

/**
 * Double-click and type (for inline editing)
 *
 * This helper activates inline editing by double-clicking an element,
 * then fills it with text and optionally submits with Enter.
 *
 * @param element - The Playwright locator for the element to edit
 * @param text - The text to type
 * @param submit - Whether to press Enter after typing (default: true)
 *
 * @example
 * // Edit track name
 * const trackName = page.locator('[data-testid="track-name"]');
 * await doubleClickAndType(trackName, 'Bass');
 *
 * @example
 * // Edit without submitting
 * await doubleClickAndType(trackName, 'Draft', false);
 */
export const doubleClickAndType = async (
  element: Locator,
  text: string,
  submit = true
) => {
  await element.dblclick();
  await element.fill(text);
  if (submit) {
    await element.press('Enter');
  }
};

/**
 * Press keyboard key with optional modifiers
 *
 * This helper presses a keyboard key, optionally holding modifier keys.
 * Useful for testing keyboard shortcuts.
 *
 * @param page - The Playwright page object
 * @param key - The key to press (e.g., 'Enter', 'Escape', 'ArrowDown')
 * @param modifiers - Optional array of modifier keys to hold
 *
 * @example
 * // Press Ctrl+S to save
 * await pressKey(page, 'S', ['Control']);
 *
 * @example
 * // Press escape to close dialog
 * await pressKey(page, 'Escape');
 */
export const pressKey = async (page: Page, key: string, modifiers?: string[]) => {
  const keys = modifiers ? [...modifiers, key] : [key];
  for (const k of keys) {
    if (k !== key) await page.keyboard.down(k);
  }
  await page.keyboard.press(key);
  if (modifiers) {
    for (const k of modifiers) {
      await page.keyboard.up(k);
    }
  }
};

/**
 * Wait for animation to complete
 *
 * DEPRECATED: Prefer using web-first assertions or waitForFunction instead.
 * This helper uses waitForTimeout which is a Playwright anti-pattern.
 *
 * Only use this when:
 * - You've verified no other waiting strategy works
 * - The animation duration is known and fixed
 * - You've documented why this is necessary
 *
 * @param page - The Playwright page object
 * @param duration - Animation duration in milliseconds (default: 300)
 *
 * @deprecated Use web-first assertions or page.waitForFunction instead
 */
export const waitForAnimation = async (page: Page, duration = 300) => {
  await page.waitForTimeout(duration);
};

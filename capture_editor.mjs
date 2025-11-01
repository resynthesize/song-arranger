import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  // Navigate to the app
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');

  // Wait for timeline to be ready
  await page.waitForSelector('[data-testid="timeline"]', { timeout: 10000 });

  // Take initial screenshot
  await page.screenshot({ path: '/tmp/timeline_initial.png', fullPage: true });
  console.log('✓ Captured initial timeline view');

  // Find and double-click a pattern to open the editor
  const pattern = page.locator('[data-testid^="pattern-"]').first();
  const count = await pattern.count();

  if (count > 0) {
    // Double-click the content area of the pattern
    const patternContent = pattern.locator('> div[class*="content"]');
    await patternContent.dblclick();

    // Wait for pattern editor to appear
    await page.waitForSelector('[data-testid="pattern-editor"]', { timeout: 5000 });
    await page.waitForTimeout(500);  // Let any animations settle

    // Take screenshot of pattern editor
    await page.screenshot({ path: '/tmp/pattern_editor.png', fullPage: true });
    console.log('✓ Captured pattern editor view');

    // Get pattern editor dimensions and position
    const editor = page.locator('[data-testid="pattern-editor"]');
    const box = await editor.boundingBox();
    if (box) {
      console.log('\nPattern Editor Dimensions:');
      console.log(`  Position: (${box.x}, ${box.y})`);
      console.log(`  Size: ${box.width}x${box.height}`);
      console.log(`  Viewport: 1920x1080`);
      console.log(`  Space utilization: ${((box.width * box.height) / (1920 * 1080) * 100).toFixed(1)}%`);
    }

    // Get all rows in the pattern editor
    const rows = page.locator('[data-testid="pattern-editor"] [data-row]');
    const rowCount = await rows.count();
    console.log('\nPattern Editor Content:');
    console.log(`  Total rows: ${rowCount}`);

    // Check header
    const header = page.locator('[data-testid="pattern-editor-header"]');
    const headerCount = await header.count();
    if (headerCount > 0) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        console.log(`  Header height: ${headerBox.height}px`);
      }
    }

    // Take a close-up screenshot of just the editor
    await editor.screenshot({ path: '/tmp/pattern_editor_closeup.png' });
    console.log('✓ Captured pattern editor close-up');

  } else {
    console.log('✗ No patterns found to open editor');
  }

  await page.waitForTimeout(2000);  // Keep browser open briefly to inspect

} finally {
  await browser.close();
}

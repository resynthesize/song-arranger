#!/usr/bin/env tsx

/**
 * UI Assessment Script for Cyclone
 *
 * This script imports a CKS file and interacts with the UI to assess
 * the current state and identify areas for improvement.
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AssessmentResult {
  step: string;
  success: boolean;
  screenshot?: string;
  issues: string[];
  observations: string[];
  consoleErrors: string[];
  consoleWarnings: string[];
}

class UIAssessment {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: AssessmentResult[] = [];
  private screenshotDir = 'screenshots/assessment';
  private stepCounter = 0;

  async init(url: string = 'http://localhost:5174', headless: boolean = false) {
    console.log('🚀 Launching browser...');
    this.browser = await chromium.launch({ headless, slowMo: headless ? 0 : 500 });
    this.page = await this.browser.newPage();

    // Set up console listeners
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        consoleErrors.push(text);
        console.log(`❌ [ERROR] ${text}`);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.log(`⚠️  [WARNING] ${text}`);
      }
    });

    this.page.on('pageerror', (error) => {
      consoleErrors.push(error.toString());
      console.log(`❌ [PAGE ERROR] ${error.toString()}`);
    });

    // Store for later retrieval
    (this.page as any)._consoleErrors = consoleErrors;
    (this.page as any)._consoleWarnings = consoleWarnings;

    // Create screenshot directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    console.log(`📱 Navigating to ${url}...`);
    await this.page.goto(url);
    await this.page.waitForSelector('#root', { timeout: 10000 });
    console.log('✅ App loaded\n');
  }

  async takeScreenshot(name: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    const filename = `${String(this.stepCounter).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  async recordStep(step: string, action: () => Promise<void>): Promise<AssessmentResult> {
    this.stepCounter++;
    console.log(`\n📍 Step ${this.stepCounter}: ${step}`);

    const result: AssessmentResult = {
      step,
      success: true,
      issues: [],
      observations: [],
      consoleErrors: [],
      consoleWarnings: [],
    };

    try {
      // Clear previous console messages
      if (this.page) {
        const errors = (this.page as any)._consoleErrors;
        const warnings = (this.page as any)._consoleWarnings;
        errors.length = 0;
        warnings.length = 0;
      }

      await action();

      // Wait a bit for any async operations
      await this.page?.waitForTimeout(1000);

      // Capture screenshot
      const screenshot = await this.takeScreenshot(step.toLowerCase().replace(/\s+/g, '-'));
      result.screenshot = screenshot;
      console.log(`📸 Screenshot: ${screenshot}`);

      // Capture console messages
      if (this.page) {
        result.consoleErrors = [...(this.page as any)._consoleErrors];
        result.consoleWarnings = [...(this.page as any)._consoleWarnings];
      }

      if (result.consoleErrors.length > 0) {
        result.issues.push(`Console errors: ${result.consoleErrors.length}`);
      }
      if (result.consoleWarnings.length > 0) {
        result.issues.push(`Console warnings: ${result.consoleWarnings.length}`);
      }

      console.log('✅ Step completed');
    } catch (error) {
      result.success = false;
      result.issues.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`❌ Step failed: ${error instanceof Error ? error.message : String(error)}`);

      try {
        const screenshot = await this.takeScreenshot(`${step.toLowerCase().replace(/\s+/g, '-')}-error`);
        result.screenshot = screenshot;
      } catch (e) {
        // Screenshot failed, continue
      }
    }

    this.results.push(result);
    return result;
  }

  async importCKSFile(filepath: string) {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Import CKS File', async () => {
      if (!this.page) return;

      // Click File menu
      const fileMenu = await this.page.waitForSelector('button:has-text("FILE")', { timeout: 5000 });
      await fileMenu.click();
      console.log('  📂 Opened File menu');

      // Wait for menu to appear
      await this.page.waitForTimeout(500);

      // Set up file chooser handler BEFORE clicking
      const fileChooserPromise = this.page.waitForEvent('filechooser');

      // Click Import Cirklon option (try multiple selectors)
      let importButton = await this.page.$('button:has-text("Import Cirklon (.CKS)")');
      if (!importButton) {
        importButton = await this.page.$(':text("Import Cirklon (.CKS)")');
      }
      if (!importButton) {
        throw new Error('Could not find Import Cirklon menu item');
      }
      await importButton.click();
      console.log('  📥 Clicked Import Cirklon (.CKS)');

      // Handle the file chooser
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filepath);
      console.log(`  📄 Selected file: ${filepath}`);

      // Wait for import to complete
      await this.page.waitForTimeout(3000);
    });
  }

  async assessTimeline() {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Assess Timeline View', async () => {
      if (!this.page) return;

      const result = this.results[this.results.length - 1];

      // Check if tracks are visible
      const tracks = await this.page.$$('.track');
      result.observations.push(`Tracks visible: ${tracks.length}`);
      console.log(`  🎵 Found ${tracks.length} tracks`);

      // Check if patterns are visible
      const patterns = await this.page.$$('.pattern');
      result.observations.push(`Patterns visible: ${patterns.length}`);
      console.log(`  🎼 Found ${patterns.length} patterns`);

      // Check if ruler is visible
      const ruler = await this.page.$('.ruler');
      result.observations.push(`Ruler visible: ${ruler !== null}`);
      console.log(`  📏 Ruler visible: ${ruler !== null}`);

      // Check if HUD is visible
      const hud = await this.page.$('.hud');
      result.observations.push(`HUD visible: ${hud !== null}`);
      console.log(`  🎮 HUD visible: ${hud !== null}`);

      // Get viewport state
      const viewportInfo = await this.page.evaluate(() => {
        return {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollable: document.documentElement.scrollHeight > window.innerHeight,
        };
      });
      result.observations.push(`Viewport: ${viewportInfo.width}x${viewportInfo.height}`);
      result.observations.push(`Scrollable: ${viewportInfo.scrollable}`);
    });
  }

  async testPatternSelection() {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Test Pattern Selection', async () => {
      if (!this.page) return;

      const result = this.results[this.results.length - 1];

      // Try to click first pattern
      const firstPattern = await this.page.$('.pattern');
      if (firstPattern) {
        await firstPattern.click();
        console.log('  🖱️  Clicked first pattern');
        await this.page.waitForTimeout(500);

        // Check if pattern is selected
        const selectedPatterns = await this.page.$$('.pattern--selected');
        result.observations.push(`Selected patterns: ${selectedPatterns.length}`);
        console.log(`  ✓ Selected patterns: ${selectedPatterns.length}`);
      } else {
        result.observations.push('No patterns available to select');
        console.log('  ⚠️  No patterns found to select');
      }
    });
  }

  async testTrackHeader() {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Test Track Header Interaction', async () => {
      if (!this.page) return;

      const result = this.results[this.results.length - 1];

      // Try to click first track header
      const firstTrackHeader = await this.page.$('.track-header');
      if (firstTrackHeader) {
        await firstTrackHeader.click();
        console.log('  🖱️  Clicked first track header');
        await this.page.waitForTimeout(500);

        // Check if track is current
        const currentTracks = await this.page.$$('.track--current');
        result.observations.push(`Current tracks: ${currentTracks.length}`);
        console.log(`  ✓ Current tracks: ${currentTracks.length}`);
      } else {
        result.observations.push('No track headers available');
        console.log('  ⚠️  No track headers found');
      }
    });
  }

  async testPatternEditor() {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Test Pattern Editor', async () => {
      if (!this.page) return;

      const result = this.results[this.results.length - 1];

      // Double-click a pattern to open editor
      const firstPattern = await this.page.$('.pattern');
      if (firstPattern) {
        await firstPattern.dblclick();
        console.log('  🖱️  Double-clicked pattern');
        await this.page.waitForTimeout(1000);

        // Check if pattern editor opened
        const patternEditor = await this.page.$('.pattern-editor');
        const editorVisible = patternEditor !== null;
        result.observations.push(`Pattern editor opened: ${editorVisible}`);
        console.log(`  📝 Pattern editor visible: ${editorVisible}`);

        if (editorVisible) {
          // Check for editor components
          const editorHeader = await this.page.$('.pattern-editor-header');
          result.observations.push(`Editor header visible: ${editorHeader !== null}`);

          const patternRows = await this.page.$$('.pattern-row');
          result.observations.push(`Pattern rows: ${patternRows.length}`);
          console.log(`  📊 Pattern rows: ${patternRows.length}`);
        }
      } else {
        result.observations.push('No patterns available to open');
        console.log('  ⚠️  No patterns to open');
      }
    });
  }

  async testZoom() {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Test Zoom Controls', async () => {
      if (!this.page) return;

      const result = this.results[this.results.length - 1];

      // Try zoom in
      const zoomInButton = await this.page.$('button:has-text("+")');
      if (zoomInButton) {
        await zoomInButton.click();
        console.log('  🔍 Clicked zoom in');
        await this.page.waitForTimeout(500);
        result.observations.push('Zoom in button works');
      } else {
        result.issues.push('Zoom in button not found');
      }

      // Try zoom out
      const zoomOutButton = await this.page.$('button:has-text("-")');
      if (zoomOutButton) {
        await zoomOutButton.click();
        console.log('  🔍 Clicked zoom out');
        await this.page.waitForTimeout(500);
        result.observations.push('Zoom out button works');
      } else {
        result.issues.push('Zoom out button not found');
      }
    });
  }

  async testKeyboardShortcuts() {
    if (!this.page) throw new Error('Page not initialized');

    await this.recordStep('Test Keyboard Shortcuts', async () => {
      if (!this.page) return;

      const result = this.results[this.results.length - 1];

      // Test Cmd+K for command palette (use Meta key for Mac, Control for others)
      await this.page.keyboard.press('Meta+k');
      await this.page.waitForTimeout(500);

      const commandPalette = await this.page.$('.command-palette-overlay');
      const paletteVisible = commandPalette !== null;
      result.observations.push(`Command palette (Cmd+K): ${paletteVisible}`);
      console.log(`  ⌨️  Command palette visible: ${paletteVisible}`);

      if (paletteVisible) {
        // Close it
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
      }
    });
  }

  generateReport(): string {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════',
      '  CYCLONE UI ASSESSMENT REPORT',
      '═══════════════════════════════════════════════════════',
      '',
    ];

    // Summary
    const totalSteps = this.results.length;
    const successfulSteps = this.results.filter(r => r.success).length;
    const totalIssues = this.results.reduce((sum, r) => sum + r.issues.length, 0);
    const totalErrors = this.results.reduce((sum, r) => sum + r.consoleErrors.length, 0);
    const totalWarnings = this.results.reduce((sum, r) => sum + r.consoleWarnings.length, 0);

    lines.push('📊 SUMMARY');
    lines.push('─────────────────────────────────────────────────────');
    lines.push(`Total Steps: ${totalSteps}`);
    lines.push(`Successful: ${successfulSteps}/${totalSteps}`);
    lines.push(`Issues Found: ${totalIssues}`);
    lines.push(`Console Errors: ${totalErrors}`);
    lines.push(`Console Warnings: ${totalWarnings}`);
    lines.push('');

    // Detailed results
    this.results.forEach((result, index) => {
      lines.push(`\n${index + 1}. ${result.step}`);
      lines.push('─────────────────────────────────────────────────────');
      lines.push(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);

      if (result.screenshot) {
        lines.push(`Screenshot: ${result.screenshot}`);
      }

      if (result.observations.length > 0) {
        lines.push('\n  Observations:');
        result.observations.forEach(obs => lines.push(`    • ${obs}`));
      }

      if (result.issues.length > 0) {
        lines.push('\n  ⚠️  Issues:');
        result.issues.forEach(issue => lines.push(`    • ${issue}`));
      }

      if (result.consoleErrors.length > 0) {
        lines.push('\n  ❌ Console Errors:');
        result.consoleErrors.slice(0, 3).forEach(err => lines.push(`    • ${err.substring(0, 100)}`));
        if (result.consoleErrors.length > 3) {
          lines.push(`    ... and ${result.consoleErrors.length - 3} more`);
        }
      }

      if (result.consoleWarnings.length > 0) {
        lines.push('\n  ⚠️  Console Warnings:');
        result.consoleWarnings.slice(0, 3).forEach(warn => lines.push(`    • ${warn.substring(0, 100)}`));
        if (result.consoleWarnings.length > 3) {
          lines.push(`    ... and ${result.consoleWarnings.length - 3} more`);
        }
      }
    });

    // Recommendations
    lines.push('\n\n🔧 RECOMMENDATIONS');
    lines.push('─────────────────────────────────────────────────────');

    const recommendations: string[] = [];

    if (totalErrors > 0) {
      recommendations.push('Fix console errors - these indicate runtime issues');
    }

    if (totalWarnings > 0) {
      recommendations.push('Address console warnings for better performance');
    }

    // Check specific issues from results
    const noPatterns = this.results.some(r =>
      r.observations.some(obs => obs.includes('Patterns visible: 0'))
    );
    if (noPatterns) {
      recommendations.push('Patterns not rendering - check pattern rendering logic');
    }

    const noTracks = this.results.some(r =>
      r.observations.some(obs => obs.includes('Tracks visible: 0'))
    );
    if (noTracks) {
      recommendations.push('Tracks not rendering - check track rendering logic');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No major issues detected!');
    }

    recommendations.forEach(rec => lines.push(`• ${rec}`));

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const headless = !args.includes('--headed');
  const url = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:5174';
  const cksFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1] ||
                  path.join(__dirname, '../cirklon/xtlove.CKS');

  console.log('🎭 Cyclone UI Assessment\n');
  console.log(`URL: ${url}`);
  console.log(`CKS File: ${cksFile}`);
  console.log(`Mode: ${headless ? 'Headless' : 'Headed'}\n`);

  const assessment = new UIAssessment();

  try {
    await assessment.init(url, headless);

    // Run assessment steps
    await assessment.importCKSFile(cksFile);
    await assessment.assessTimeline();
    await assessment.testPatternSelection();
    await assessment.testTrackHeader();
    await assessment.testPatternEditor();
    await assessment.testZoom();
    await assessment.testKeyboardShortcuts();

    // Generate and print report
    const report = assessment.generateReport();
    console.log('\n' + report);

    // Save report to file
    const reportPath = path.join(assessment['screenshotDir'], 'assessment-report.txt');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await assessment.close();
  }
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Browser Inspection Script for Cyclone
 *
 * This script allows automated inspection of the running Cyclone app:
 * - Captures console logs and errors
 * - Inspects DOM structure
 * - Takes screenshots
 * - Checks for runtime errors
 * - Evaluates JavaScript in the page context
 */

import { chromium, Browser, Page, ConsoleMessage } from 'playwright';

interface InspectionOptions {
  url?: string;
  screenshot?: string;
  selector?: string;
  evaluate?: string;
  waitForSelector?: string;
  timeout?: number;
  headless?: boolean;
}

interface InspectionResult {
  success: boolean;
  consoleMessages: Array<{ type: string; text: string }>;
  errors: string[];
  warnings: string[];
  domContent?: string;
  evaluationResult?: any;
  screenshotPath?: string;
}

async function inspectBrowser(options: InspectionOptions): Promise<InspectionResult> {
  const {
    url = 'http://localhost:5173',
    screenshot,
    selector,
    evaluate,
    waitForSelector,
    timeout = 30000,
    headless = true
  } = options;

  const result: InspectionResult = {
    success: true,
    consoleMessages: [],
    errors: [],
    warnings: []
  };

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch({ headless });

    // Create page
    page = await browser.newPage();

    // Set up console message listener
    page.on('console', (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();

      result.consoleMessages.push({ type, text });

      if (type === 'error') {
        result.errors.push(text);
      } else if (type === 'warning') {
        result.warnings.push(text);
      }

      console.log(`[${type.toUpperCase()}] ${text}`);
    });

    // Set up page error listener
    page.on('pageerror', (error) => {
      const errorMessage = error.toString();
      result.errors.push(errorMessage);
      console.error('[PAGE ERROR]', errorMessage);
    });

    // Navigate to URL
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { timeout });

    // Wait for selector if specified
    if (waitForSelector) {
      console.log(`Waiting for selector: ${waitForSelector}`);
      await page.waitForSelector(waitForSelector, { timeout });
    }

    // Wait a bit for any async operations to complete
    await page.waitForTimeout(2000);

    // Get DOM content if selector specified
    if (selector) {
      console.log(`Getting DOM content for: ${selector}`);
      const element = await page.$(selector);
      if (element) {
        result.domContent = await element.innerHTML();
      } else {
        result.warnings.push(`Selector not found: ${selector}`);
      }
    }

    // Evaluate JavaScript if specified
    if (evaluate) {
      console.log(`Evaluating: ${evaluate}`);
      result.evaluationResult = await page.evaluate(evaluate);
    }

    // Take screenshot if specified
    if (screenshot) {
      console.log(`Taking screenshot: ${screenshot}`);
      await page.screenshot({ path: screenshot, fullPage: true });
      result.screenshotPath = screenshot;
    }

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
    console.error('Inspection failed:', error);
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Parse command line arguments
function parseArgs(): InspectionOptions {
  const args = process.argv.slice(2);
  const options: InspectionOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--url':
        options.url = nextArg;
        i++;
        break;
      case '--screenshot':
        options.screenshot = nextArg;
        i++;
        break;
      case '--selector':
        options.selector = nextArg;
        i++;
        break;
      case '--evaluate':
        options.evaluate = nextArg;
        i++;
        break;
      case '--wait-for':
        options.waitForSelector = nextArg;
        i++;
        break;
      case '--timeout':
        options.timeout = parseInt(nextArg, 10);
        i++;
        break;
      case '--headed':
        options.headless = false;
        break;
      case '--help':
        console.log(`
Browser Inspection Script

Usage: npm run inspect [options]

Options:
  --url <url>              URL to navigate to (default: http://localhost:5173)
  --screenshot <path>      Take a screenshot and save to path
  --selector <selector>    Get innerHTML of element matching selector
  --evaluate <code>        Evaluate JavaScript in page context
  --wait-for <selector>    Wait for selector before continuing
  --timeout <ms>           Timeout in milliseconds (default: 30000)
  --headed                 Run in headed mode (show browser window)
  --help                   Show this help message

Examples:
  npm run inspect
  npm run inspect -- --screenshot screenshot.png
  npm run inspect -- --selector "#root"
  npm run inspect -- --evaluate "window.innerWidth"
  npm run inspect -- --wait-for ".timeline"
        `);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('Starting browser inspection...\n');

  const result = await inspectBrowser(options);

  console.log('\n=== INSPECTION RESULTS ===\n');

  if (result.errors.length > 0) {
    console.log('ERRORS:');
    result.errors.forEach(err => console.log(`  - ${err}`));
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS:');
    result.warnings.forEach(warn => console.log(`  - ${warn}`));
    console.log();
  }

  if (result.domContent) {
    console.log('DOM CONTENT:');
    console.log(result.domContent.substring(0, 500) + (result.domContent.length > 500 ? '...' : ''));
    console.log();
  }

  if (result.evaluationResult !== undefined) {
    console.log('EVALUATION RESULT:');
    console.log(JSON.stringify(result.evaluationResult, null, 2));
    console.log();
  }

  if (result.screenshotPath) {
    console.log(`Screenshot saved to: ${result.screenshotPath}`);
    console.log();
  }

  console.log(`Total console messages: ${result.consoleMessages.length}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);

  process.exit(result.success && result.errors.length === 0 ? 0 : 1);
}

main().catch(console.error);

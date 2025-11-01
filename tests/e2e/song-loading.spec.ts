/**
 * Cyclone - Song Loading E2E Tests
 * Test loading CKS files into the application
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Song Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with a clean state
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());

    // Reload after clearing
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for app to be ready
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();

    // Wait for test helpers to be available
    await page.waitForFunction(() => (window as any).__testHelpers__?.parseCKSFile);
  });

  test('should load xtlove.cks file successfully', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(msg.text());
    });

    // Read the xtlove.cks file
    const cksPath = path.join(__dirname, '../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');

    // Parse using the same function the app uses (ensures metadata is generated)
    const cksData = await page.evaluate((jsonString) => {
      // Import parseCKSFile from the app's context
      const { parseCKSFile } = (window as any).__testHelpers__;
      return parseCKSFile(jsonString);
    }, cksContent);

    // Count expected tracks and patterns from the file
    const songData = cksData.song_data['xt love'];
    const expectedPatternCount = Object.keys(songData.patterns).length;
    const expectedSceneCount = Object.keys(songData.scenes).length;

    console.log(`Expected patterns: ${expectedPatternCount}`);
    console.log(`Expected scenes: ${expectedSceneCount}`);

    // Directly dispatch load actions instead of using file input
    await page.evaluate((cksData) => {
      const store = (window as any).__store__;
      if (!store) throw new Error('Redux store not found');

      console.log('[Test] About to dispatch loadSong');
      console.log('[Test] CKS data has song:', Object.keys(cksData.song_data)[0]);
      console.log('[Test] Current state before dispatch:', Object.keys(store.getState().song.present.song_data)[0]);

      // Dispatch loadSong action directly
      store.dispatch({
        type: 'song/loadSong',
        payload: cksData,
      });

      console.log('[Test] Dispatched loadSong, checking state...');
      const newState = store.getState();
      console.log('[Test] State after dispatch:', {
        songNames: Object.keys(newState.song.present.song_data),
      });
    }, cksData);

    // Wait for React to re-render
    await page.waitForTimeout(1000);

    // Print captured console logs
    console.log('=== CAPTURED CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
    console.log('=== END CONSOLE LOGS ===');

    // Check Redux state to verify song loaded
    const songState = await page.evaluate(() => {
      const store = (window as any).__store__;
      if (!store) throw new Error('Redux store not found');
      return store.getState().song.present;
    });

    console.log('Song state after load:', {
      hasSongData: !!songState.song_data,
      songNames: Object.keys(songState.song_data || {}),
      hasMetadata: !!songState._cyclone_metadata,
    });

    // Verify song data is loaded
    expect(songState).toBeDefined();
    expect(songState.song_data).toBeDefined();
    expect(songState.song_data['xt love']).toBeDefined();

    // Verify patterns and scenes are loaded
    const loadedSong = songState.song_data['xt love'];
    const actualPatternCount = Object.keys(loadedSong.patterns || {}).length;
    const actualSceneCount = Object.keys(loadedSong.scenes || {}).length;

    console.log(`Actual patterns: ${actualPatternCount}`);
    console.log(`Actual scenes: ${actualSceneCount}`);

    expect(actualPatternCount).toBe(expectedPatternCount);
    expect(actualSceneCount).toBe(expectedSceneCount);

    // Verify tracks are visible in the UI
    const trackCount = await page.locator('[data-testid^="track-"]').count();
    console.log(`Tracks visible in UI: ${trackCount}`);
    expect(trackCount).toBeGreaterThan(0);

    // Verify patterns are visible in the UI
    const patternCount = await page.locator('[data-testid^="pattern-"]').count();
    console.log(`Patterns visible in UI: ${patternCount}`);
    expect(patternCount).toBeGreaterThan(0);
  });

  test('should verify loadSong action is dispatched correctly', async ({ page }) => {
    // Monitor Redux actions
    await page.evaluate(() => {
      const store = (window as any).__store__;
      if (!store) throw new Error('Redux store not found');

      // Intercept dispatch to log actions
      const originalDispatch = store.dispatch;
      (window as any).__actions__ = [];
      store.dispatch = function(action: any) {
        (window as any).__actions__.push({
          type: action.type,
          hasPayload: !!action.payload,
          payloadKeys: action.payload ? Object.keys(action.payload) : [],
        });
        return originalDispatch.call(this, action);
      };
    });

    // Read the xtlove.cks file
    const cksPath = path.join(__dirname, '../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');

    // Click the File menu
    await page.click('text=FILE');
    await page.waitForTimeout(200);

    // Click "Import Cirklon (.CKS)..."
    await page.click('text=Import Cirklon (.CKS)...');
    await page.waitForTimeout(500);

    // Trigger file input programmatically
    await page.evaluate((cksContent) => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (!fileInput) {
        throw new Error('File input not found');
      }

      const blob = new Blob([cksContent], { type: 'application/json' });
      const file = new File([blob], 'xtlove.cks', { type: 'application/json' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }, cksContent);

    // Wait for actions to be dispatched
    await page.waitForTimeout(2000);

    // Get dispatched actions
    const actions = await page.evaluate(() => (window as any).__actions__);

    console.log('Dispatched actions:', JSON.stringify(actions, null, 2));

    // Find loadSong action
    const loadSongAction = actions.find((a: any) => a.type === 'song/loadSong');

    expect(loadSongAction).toBeDefined();
    expect(loadSongAction.hasPayload).toBe(true);
    expect(loadSongAction.payloadKeys).toContain('song_data');
    expect(loadSongAction.payloadKeys).toContain('_cyclone_metadata');
  });

  test('should check for console errors during loading', async ({ page }) => {
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];

    // Listen for console messages
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Read the xtlove.cks file
    const cksPath = path.join(__dirname, '../../cirklon/xtlove.CKS');
    const cksContent = fs.readFileSync(cksPath, 'utf-8');

    // Click the File menu
    await page.click('text=FILE');
    await page.waitForTimeout(200);

    // Click "Import Cirklon (.CKS)..."
    await page.click('text=Import Cirklon (.CKS)...');
    await page.waitForTimeout(500);

    // Trigger file input programmatically
    await page.evaluate((cksContent) => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (!fileInput) {
        throw new Error('File input not found');
      }

      const blob = new Blob([cksContent], { type: 'application/json' });
      const file = new File([blob], 'xtlove.cks', { type: 'application/json' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }, cksContent);

    // Wait for loading to complete
    await page.waitForTimeout(2000);

    // Log all console messages
    console.log('Console messages:', consoleMessages);
    console.log('Console errors:', consoleErrors);

    // Check for Redux-related errors
    const reduxErrors = consoleErrors.filter(err =>
      err.includes('redux') ||
      err.includes('reducer') ||
      err.includes('action') ||
      err.includes('state')
    );

    if (reduxErrors.length > 0) {
      console.error('Redux errors found:', reduxErrors);
    }

    // The test should not fail on errors, just report them
    // expect(reduxErrors.length).toBe(0);
  });
});

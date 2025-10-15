/**
 * Cyclone - Test Utilities
 * Common utilities for testing React components
 */

import { act } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

/**
 * Advance all timers and flush pending updates
 * Useful for components that use setTimeout/setInterval in useEffect
 */
export const advanceTimersAndFlush = async (): Promise<void> => {
  await act(async () => {
    jest.runAllTimers();
  });
};

/**
 * Advance timers by a specific amount of time and restore real timers
 * This is useful for components with setTimeout/setInterval that need real timers afterward
 * @param ms - Milliseconds to advance
 */
export const advanceTimersByTime = async (ms: number): Promise<void> => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    // Restore real timers after advancing for userEvent compatibility
    jest.useRealTimers();
  });
};

/**
 * Setup fake timers before tests
 * Call this in beforeEach to use fake timers in tests
 */
export const setupFakeTimers = (): void => {
  jest.useFakeTimers();
};

/**
 * Cleanup fake timers after tests
 * Call this in afterEach to restore real timers
 */
export const cleanupFakeTimers = (): void => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
};

/**
 * Wrap userEvent operations in act() to prevent act warnings
 * Use this for any userEvent operations that trigger state updates
 */
export const actUser = async <T,>(operation: () => Promise<T>): Promise<T> => {
  let result: T;
  await act(async () => {
    result = await operation();
  });
  return result!;
};

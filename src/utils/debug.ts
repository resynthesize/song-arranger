/**
 * Song Arranger - Debug Utilities
 * Centralized logging that only runs in development mode
 */

/**
 * Check if we're in development mode
 * Uses import.meta.env.MODE for Vite, defaults to true for Jest/tests
 */
const isDevelopment = import.meta.env?.MODE !== 'production';

/**
 * Debug logger that only logs in development mode
 * Provides type-safe logging methods that match console API
 */
export const logger = {
  /**
   * Log a message (development only)
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log an error message (always logs, even in production)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Log a warning message (development only)
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log an informational message (development only)
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Group logs together (development only)
   */
  group: (label: string): void => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * End a log group (development only)
   */
  groupEnd: (): void => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log a table (development only)
   */
  table: (data: unknown): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

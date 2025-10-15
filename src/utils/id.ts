/**
 * Cyclone - ID Generation Utilities
 * Centralized ID generation for consistent unique identifiers
 */

/**
 * Generate a unique ID with timestamp and random component
 * @param prefix - ID prefix (e.g., 'pattern', 'track', 'scene')
 * @returns Unique ID string in format: `{prefix}-{timestamp}-{random}`
 * @example
 * ```ts
 * generateId('pattern') // => 'pattern-1634567890123-a1b2c3d4e'
 * ```
 */
export const generateId = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 11);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate multiple unique IDs at once
 * Useful for batch operations
 * @param prefix - ID prefix
 * @param count - Number of IDs to generate
 * @returns Array of unique IDs
 * @example
 * ```ts
 * generateIds('track', 3) // => ['track-...', 'track-...', 'track-...']
 * ```
 */
export const generateIds = (prefix: string, count: number): string[] => {
  return Array.from({ length: count }, () => generateId(prefix));
};

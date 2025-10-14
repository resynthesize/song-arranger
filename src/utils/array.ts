/**
 * Cyclone - Array Utilities
 * Helper functions for safe array access
 */

/**
 * Returns the first element of an array, or undefined if the array is empty
 * This provides safe access without using the non-null assertion operator
 *
 * @param array - The array to get the first element from
 * @returns The first element or undefined
 *
 * @example
 * const arr = [1, 2, 3];
 * const firstItem = first(arr);
 * if (firstItem !== undefined) {
 *   console.log(firstItem); // 1
 * }
 */
export function first<T>(array: readonly T[]): T | undefined {
  return array[0];
}

/**
 * Returns the last element of an array, or undefined if the array is empty
 * This provides safe access without using the non-null assertion operator
 *
 * @param array - The array to get the last element from
 * @returns The last element or undefined
 *
 * @example
 * const arr = [1, 2, 3];
 * const lastItem = last(arr);
 * if (lastItem !== undefined) {
 *   console.log(lastItem); // 3
 * }
 */
export function last<T>(array: readonly T[]): T | undefined {
  return array[array.length - 1];
}

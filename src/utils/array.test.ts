/**
 * Song Arranger - Array Utilities Tests
 * Tests for safe array access helpers
 */

import { first, last } from './array';

describe('Array Utilities', () => {
  describe('first', () => {
    it('should return the first element of a non-empty array', () => {
      const arr = [1, 2, 3];
      expect(first(arr)).toBe(1);
    });

    it('should return undefined for an empty array', () => {
      const arr: number[] = [];
      expect(first(arr)).toBeUndefined();
    });

    it('should work with readonly arrays', () => {
      const arr: readonly string[] = ['a', 'b', 'c'];
      expect(first(arr)).toBe('a');
    });

    it('should work with arrays of objects', () => {
      const arr = [{ id: 1 }, { id: 2 }];
      expect(first(arr)).toEqual({ id: 1 });
    });

    it('should return undefined for an array with undefined as first element', () => {
      const arr = [undefined, 1, 2];
      expect(first(arr)).toBeUndefined();
    });
  });

  describe('last', () => {
    it('should return the last element of a non-empty array', () => {
      const arr = [1, 2, 3];
      expect(last(arr)).toBe(3);
    });

    it('should return undefined for an empty array', () => {
      const arr: number[] = [];
      expect(last(arr)).toBeUndefined();
    });

    it('should work with readonly arrays', () => {
      const arr: readonly string[] = ['a', 'b', 'c'];
      expect(last(arr)).toBe('c');
    });

    it('should work with arrays of objects', () => {
      const arr = [{ id: 1 }, { id: 2 }];
      expect(last(arr)).toEqual({ id: 2 });
    });

    it('should return the only element in a single-element array', () => {
      const arr = [42];
      expect(last(arr)).toBe(42);
    });

    it('should return undefined for an array with undefined as last element', () => {
      const arr = [1, 2, undefined];
      expect(last(arr)).toBeUndefined();
    });
  });
});

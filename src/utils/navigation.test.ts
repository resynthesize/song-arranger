/**
 * Cyclone - Navigation Utilities Tests
 * Tests for clip navigation in all 4 directions
 */

import {
  findNearestClipEast,
  findNearestClipWest,
  findNearestClipNorth,
  findNearestClipSouth,
  findNearestNeighbor,
} from './navigation';
import type { Clip, Lane } from '@/types';

// Helper to create test clips
const createClip = (id: string, trackId: string, position: number, duration: number = 4): Clip => ({
  id,
  trackId,
  position,
  duration,
});

// Helper to create test lanes
const createLane = (id: string, name: string): Lane => ({
  id,
  name,
});

describe('Navigation Utilities', () => {
  describe('findNearestClipEast', () => {
    it('should find the nearest clip to the right in the same lane', () => {
      const currentClip = createClip('clip1', 'lane1', 0);
      const clips = [
        currentClip,
        createClip('clip2', 'lane1', 8),  // Nearest to the right
        createClip('clip3', 'lane1', 16), // Further right
        createClip('clip4', 'lane2', 4),  // Different lane
      ];

      const result = findNearestClipEast(currentClip, clips);
      expect(result?.id).toBe('clip2');
    });

    it('should return null if no clip exists to the right', () => {
      const currentClip = createClip('clip1', 'lane1', 16);
      const clips = [
        currentClip,
        createClip('clip2', 'lane1', 0),  // To the left
        createClip('clip3', 'lane1', 8),  // To the left
      ];

      const result = findNearestClipEast(currentClip, clips);
      expect(result).toBeNull();
    });

    it('should return null if current clip is the only clip in lane', () => {
      const currentClip = createClip('clip1', 'lane1', 0);
      const clips = [
        currentClip,
        createClip('clip2', 'lane2', 8), // Different lane
      ];

      const result = findNearestClipEast(currentClip, clips);
      expect(result).toBeNull();
    });

    it('should ignore the current clip itself', () => {
      const currentClip = createClip('clip1', 'lane1', 0);
      const clips = [currentClip];

      const result = findNearestClipEast(currentClip, clips);
      expect(result).toBeNull();
    });

    it('should find clip immediately adjacent (no gap)', () => {
      const currentClip = createClip('clip1', 'lane1', 0, 4);
      const clips = [
        currentClip,
        createClip('clip2', 'lane1', 4),  // Starts where clip1 ends
      ];

      const result = findNearestClipEast(currentClip, clips);
      expect(result?.id).toBe('clip2');
    });
  });

  describe('findNearestClipWest', () => {
    it('should find the nearest clip to the left in the same lane', () => {
      const currentClip = createClip('clip3', 'lane1', 16);
      const clips = [
        createClip('clip1', 'lane1', 0),  // Further left
        createClip('clip2', 'lane1', 8),  // Nearest to the left
        currentClip,
        createClip('clip4', 'lane2', 12), // Different lane
      ];

      const result = findNearestClipWest(currentClip, clips);
      expect(result?.id).toBe('clip2');
    });

    it('should return null if no clip exists to the left', () => {
      const currentClip = createClip('clip1', 'lane1', 0);
      const clips = [
        currentClip,
        createClip('clip2', 'lane1', 8),  // To the right
        createClip('clip3', 'lane1', 16), // To the right
      ];

      const result = findNearestClipWest(currentClip, clips);
      expect(result).toBeNull();
    });

    it('should return null if current clip is the only clip in lane', () => {
      const currentClip = createClip('clip1', 'lane1', 8);
      const clips = [
        currentClip,
        createClip('clip2', 'lane2', 0), // Different lane
      ];

      const result = findNearestClipWest(currentClip, clips);
      expect(result).toBeNull();
    });

    it('should find clip immediately adjacent (no gap)', () => {
      const currentClip = createClip('clip2', 'lane1', 4, 4);
      const clips = [
        createClip('clip1', 'lane1', 0, 4), // Ends where clip2 starts
        currentClip,
      ];

      const result = findNearestClipWest(currentClip, clips);
      expect(result?.id).toBe('clip1');
    });
  });

  describe('findNearestClipNorth', () => {
    const lanes: Lane[] = [
      createLane('lane1', 'Lane 1'),
      createLane('lane2', 'Lane 2'),
      createLane('lane3', 'Lane 3'),
    ];

    it('should find clip in previous lane with closest position to current clip center', () => {
      const currentClip = createClip('clip-current', 'lane2', 8, 4); // Center at 10
      const clips = [
        createClip('clip1', 'lane1', 0, 4),   // Center at 2
        createClip('clip2', 'lane1', 8, 4),   // Center at 10 - CLOSEST
        createClip('clip3', 'lane1', 20, 4),  // Center at 22
        currentClip,
        createClip('clip4', 'lane3', 8, 4),   // Different direction (south)
      ];

      const result = findNearestClipNorth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip2');
    });

    it('should return null if current clip is in first lane', () => {
      const currentClip = createClip('clip-current', 'lane1', 8, 4);
      const clips = [
        currentClip,
        createClip('clip2', 'lane2', 8, 4),
      ];

      const result = findNearestClipNorth(currentClip, clips, lanes);
      expect(result).toBeNull();
    });

    it('should return null if no clips exist in previous lane', () => {
      const currentClip = createClip('clip-current', 'lane2', 8, 4);
      const clips = [
        currentClip,
        createClip('clip2', 'lane3', 8, 4), // Lane below
      ];

      const result = findNearestClipNorth(currentClip, clips, lanes);
      expect(result).toBeNull();
    });

    it('should find nearest clip by center position (breaks tie correctly)', () => {
      const currentClip = createClip('clip-current', 'lane2', 10, 2); // Center at 11
      const clips = [
        createClip('clip1', 'lane1', 10, 2),  // Center at 11 - exact match
        createClip('clip2', 'lane1', 11, 2),  // Center at 12 - 1 away
        createClip('clip3', 'lane1', 9, 2),   // Center at 10 - 1 away
        currentClip,
      ];

      const result = findNearestClipNorth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip1'); // Exact center match
    });

    it('should handle single clip in previous lane', () => {
      const currentClip = createClip('clip-current', 'lane2', 8, 4);
      const clips = [
        createClip('clip1', 'lane1', 100, 4), // Only clip in lane1, far away
        currentClip,
      ];

      const result = findNearestClipNorth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip1'); // Should return it even though far
    });
  });

  describe('findNearestClipSouth', () => {
    const lanes: Lane[] = [
      createLane('lane1', 'Lane 1'),
      createLane('lane2', 'Lane 2'),
      createLane('lane3', 'Lane 3'),
    ];

    it('should find clip in next lane with closest position to current clip center', () => {
      const currentClip = createClip('clip-current', 'lane2', 8, 4); // Center at 10
      const clips = [
        createClip('clip1', 'lane1', 8, 4),   // Different direction (north)
        currentClip,
        createClip('clip2', 'lane3', 0, 4),   // Center at 2
        createClip('clip3', 'lane3', 8, 4),   // Center at 10 - CLOSEST
        createClip('clip4', 'lane3', 20, 4),  // Center at 22
      ];

      const result = findNearestClipSouth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip3');
    });

    it('should return null if current clip is in last lane', () => {
      const currentClip = createClip('clip-current', 'lane3', 8, 4);
      const clips = [
        createClip('clip1', 'lane2', 8, 4),
        currentClip,
      ];

      const result = findNearestClipSouth(currentClip, clips, lanes);
      expect(result).toBeNull();
    });

    it('should return null if no clips exist in next lane', () => {
      const currentClip = createClip('clip-current', 'lane2', 8, 4);
      const clips = [
        createClip('clip1', 'lane1', 8, 4), // Lane above
        currentClip,
      ];

      const result = findNearestClipSouth(currentClip, clips, lanes);
      expect(result).toBeNull();
    });

    it('should find nearest clip by center position', () => {
      const currentClip = createClip('clip-current', 'lane1', 10, 2); // Center at 11
      const clips = [
        currentClip,
        createClip('clip1', 'lane2', 10, 2),  // Center at 11 - exact match
        createClip('clip2', 'lane2', 11, 2),  // Center at 12 - 1 away
        createClip('clip3', 'lane2', 9, 2),   // Center at 10 - 1 away
      ];

      const result = findNearestClipSouth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip1'); // Exact center match
    });

    it('should handle single clip in next lane', () => {
      const currentClip = createClip('clip-current', 'lane1', 8, 4);
      const clips = [
        currentClip,
        createClip('clip1', 'lane2', 100, 4), // Only clip in lane2, far away
      ];

      const result = findNearestClipSouth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip1'); // Should return it even though far
    });
  });

  describe('Edge cases', () => {
    it('should handle empty clips array', () => {
      const currentClip = createClip('clip1', 'lane1', 0);
      const clips: Clip[] = [];
      const lanes: Lane[] = [createLane('lane1', 'Lane 1')];

      expect(findNearestClipEast(currentClip, clips)).toBeNull();
      expect(findNearestClipWest(currentClip, clips)).toBeNull();
      expect(findNearestClipNorth(currentClip, clips, lanes)).toBeNull();
      expect(findNearestClipSouth(currentClip, clips, lanes)).toBeNull();
    });

    it('should handle clip with very large position values', () => {
      const currentClip = createClip('clip1', 'lane1', 1000000);
      const clips = [
        createClip('clip2', 'lane1', 1000004),
        currentClip,
      ];

      const result = findNearestClipEast(currentClip, clips);
      expect(result?.id).toBe('clip2');
    });

    it('should handle clips with different durations correctly', () => {
      const currentClip = createClip('clip-current', 'lane1', 0, 2); // Center at 1
      const lanes: Lane[] = [
        createLane('lane1', 'Lane 1'),
        createLane('lane2', 'Lane 2'),
      ];
      const clips = [
        currentClip,
        createClip('clip1', 'lane2', 0, 10), // Center at 5
        createClip('clip2', 'lane2', 0, 1),  // Center at 0.5 - CLOSER to 1
      ];

      const result = findNearestClipSouth(currentClip, clips, lanes);
      expect(result?.id).toBe('clip2'); // Should pick by center distance
    });
  });

  describe('findNearestNeighbor', () => {
    it('should prioritize clip to the right in same lane', () => {
      const deletedClip = createClip('deleted', 'lane1', 8);
      const allClips = [
        createClip('left', 'lane1', 0),    // To the left
        deletedClip,
        createClip('right', 'lane1', 16),  // To the right - PRIORITY 1
        createClip('other', 'lane2', 8),   // Other lane
      ];

      const result = findNearestNeighbor(deletedClip, allClips);
      expect(result?.id).toBe('right');
    });

    it('should select clip to the left if no clip to the right', () => {
      const deletedClip = createClip('deleted', 'lane1', 16);
      const allClips = [
        createClip('left', 'lane1', 8),    // To the left - PRIORITY 2
        deletedClip,
        createClip('other', 'lane2', 20),  // Other lane
      ];

      const result = findNearestNeighbor(deletedClip, allClips);
      expect(result?.id).toBe('left');
    });

    it('should select closest clip in any lane if no clips in same lane', () => {
      const deletedClip = createClip('deleted', 'lane2', 10, 4); // Center at 12
      const allClips = [
        createClip('far', 'lane1', 50, 4),    // Center at 52
        deletedClip,
        createClip('close', 'lane3', 10, 4),  // Center at 12 - CLOSEST
      ];

      const result = findNearestNeighbor(deletedClip, allClips);
      expect(result?.id).toBe('close');
    });

    it('should return null if no other clips exist', () => {
      const deletedClip = createClip('deleted', 'lane1', 8);
      const allClips = [deletedClip];

      const result = findNearestNeighbor(deletedClip, allClips);
      expect(result).toBeNull();
    });

    it('should filter out the deleted clip from consideration', () => {
      const deletedClip = createClip('deleted', 'lane1', 8);
      const allClips = [
        createClip('other', 'lane1', 16),
        deletedClip,
      ];

      const result = findNearestNeighbor(deletedClip, allClips);
      expect(result?.id).toBe('other');
      expect(result?.id).not.toBe('deleted');
    });

    it('should handle multiple clips and select nearest by priority', () => {
      const deletedClip = createClip('deleted', 'lane2', 10);
      const allClips = [
        createClip('lane1-clip', 'lane1', 10), // Same position, different lane
        deletedClip,
        createClip('right', 'lane2', 14),      // Right in same lane - SHOULD WIN
        createClip('left', 'lane2', 6),        // Left in same lane
        createClip('lane3-clip', 'lane3', 10), // Same position, different lane
      ];

      const result = findNearestNeighbor(deletedClip, allClips);
      expect(result?.id).toBe('right'); // Priority to right in same lane
    });
  });
});

/**
 * Song Arranger - Duration Utilities Tests
 * Tests for duration calculation and formatting utilities
 */

import { calculateGlobalDuration, calculateSelectedDuration, formatDuration } from './duration';
import type { Clip } from '@/types';

describe('formatDuration', () => {
  it('should format zero seconds as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('should format seconds less than 60 with leading zero', () => {
    expect(formatDuration(5)).toBe('00:05');
    expect(formatDuration(9)).toBe('00:09');
  });

  it('should format seconds less than 60 without leading zero for tens', () => {
    expect(formatDuration(45)).toBe('00:45');
    expect(formatDuration(59)).toBe('00:59');
  });

  it('should format exactly 60 seconds as 01:00', () => {
    expect(formatDuration(60)).toBe('01:00');
  });

  it('should format minutes and seconds correctly', () => {
    expect(formatDuration(90)).toBe('01:30');
    expect(formatDuration(125)).toBe('02:05');
    expect(formatDuration(272)).toBe('04:32');
  });

  it('should handle hours correctly (over 59 minutes)', () => {
    expect(formatDuration(3600)).toBe('60:00');
    expect(formatDuration(3665)).toBe('61:05');
  });

  it('should round to nearest second', () => {
    expect(formatDuration(90.4)).toBe('01:30');
    expect(formatDuration(90.5)).toBe('01:31');
    expect(formatDuration(90.6)).toBe('01:31');
  });

  it('should handle negative values by treating as zero', () => {
    expect(formatDuration(-10)).toBe('00:00');
  });
});

describe('calculateGlobalDuration', () => {
  const createClip = (position: number, duration: number, trackId = 'lane-1'): Clip => ({
    id: `clip-${Math.random()}`,
    trackId,
    position,
    duration,
  });

  it('should return 0 for empty clips array', () => {
    expect(calculateGlobalDuration([], 120)).toBe(0);
  });

  it('should calculate duration for single clip at start', () => {
    const clips = [createClip(0, 4)]; // 4 beats starting at 0
    // At 120 BPM: each beat = 60/120 = 0.5 seconds
    // 4 beats = 4 * 0.5 = 2 seconds
    expect(calculateGlobalDuration(clips, 120)).toBe(2);
  });

  it('should calculate duration for single clip with offset', () => {
    const clips = [createClip(4, 8)]; // 8 beats starting at position 4
    // Rightmost position = 4 + 8 = 12 beats
    // At 120 BPM: 12 beats * 0.5 seconds/beat = 6 seconds
    expect(calculateGlobalDuration(clips, 120)).toBe(6);
  });

  it('should find rightmost clip across multiple lanes', () => {
    const clips = [
      createClip(0, 4, 'lane-1'),
      createClip(8, 4, 'lane-2'),  // Ends at 12
      createClip(4, 8, 'lane-3'),  // Ends at 12
      createClip(12, 4, 'lane-1'), // Ends at 16 - rightmost
    ];
    // Rightmost position = 16 beats
    // At 120 BPM: 16 * 0.5 = 8 seconds
    expect(calculateGlobalDuration(clips, 120)).toBe(8);
  });

  it('should calculate correctly at different tempos', () => {
    const clips = [createClip(0, 16)]; // 16 beats

    // At 60 BPM: each beat = 1 second, 16 beats = 16 seconds
    expect(calculateGlobalDuration(clips, 60)).toBe(16);

    // At 120 BPM: each beat = 0.5 seconds, 16 beats = 8 seconds
    expect(calculateGlobalDuration(clips, 120)).toBe(8);

    // At 140 BPM: each beat = 60/140 seconds, 16 beats = 16 * 60/140 ≈ 6.857 seconds
    expect(calculateGlobalDuration(clips, 140)).toBeCloseTo(6.857, 2);
  });

  it('should handle clips with decimal durations', () => {
    const clips = [createClip(0, 4.5)]; // 4.5 beats
    // At 120 BPM: 4.5 * 0.5 = 2.25 seconds
    expect(calculateGlobalDuration(clips, 120)).toBe(2.25);
  });

  it('should handle clips with decimal positions', () => {
    const clips = [createClip(2.5, 4)]; // Ends at 6.5 beats
    // At 120 BPM: 6.5 * 0.5 = 3.25 seconds
    expect(calculateGlobalDuration(clips, 120)).toBe(3.25);
  });
});

describe('calculateSelectedDuration', () => {
  const createClip = (id: string, duration: number): Clip => ({
    id,
    trackId: 'lane-1',
    position: 0,
    duration,
  });

  it('should return 0 for empty selection', () => {
    const clips = [createClip('clip-1', 4)];
    expect(calculateSelectedDuration(clips, [], 120)).toBe(0);
  });

  it('should return 0 when no clips exist', () => {
    expect(calculateSelectedDuration([], ['clip-1'], 120)).toBe(0);
  });

  it('should calculate duration for single selected clip', () => {
    const clips = [createClip('clip-1', 8)];
    // 8 beats at 120 BPM = 8 * 0.5 = 4 seconds
    expect(calculateSelectedDuration(clips, ['clip-1'], 120)).toBe(4);
  });

  it('should sum durations for multiple selected clips', () => {
    const clips = [
      createClip('clip-1', 4),
      createClip('clip-2', 8),
      createClip('clip-3', 2),
    ];
    // Total: 14 beats at 120 BPM = 14 * 0.5 = 7 seconds
    expect(calculateSelectedDuration(clips, ['clip-1', 'clip-2', 'clip-3'], 120)).toBe(7);
  });

  it('should only include selected clips in calculation', () => {
    const clips = [
      createClip('clip-1', 4),
      createClip('clip-2', 8),
      createClip('clip-3', 2),
    ];
    // Only clip-1 and clip-3: 6 beats at 120 BPM = 3 seconds
    expect(calculateSelectedDuration(clips, ['clip-1', 'clip-3'], 120)).toBe(3);
  });

  it('should handle non-existent clip IDs gracefully', () => {
    const clips = [createClip('clip-1', 4)];
    // clip-2 doesn't exist, should only count clip-1
    expect(calculateSelectedDuration(clips, ['clip-1', 'clip-2'], 120)).toBe(2);
  });

  it('should calculate correctly at different tempos', () => {
    const clips = [
      createClip('clip-1', 4),
      createClip('clip-2', 4),
    ];
    // Total: 8 beats

    // At 60 BPM: 8 * 1 = 8 seconds
    expect(calculateSelectedDuration(clips, ['clip-1', 'clip-2'], 60)).toBe(8);

    // At 120 BPM: 8 * 0.5 = 4 seconds
    expect(calculateSelectedDuration(clips, ['clip-1', 'clip-2'], 120)).toBe(4);
  });

  it('should handle decimal durations', () => {
    const clips = [
      createClip('clip-1', 3.5),
      createClip('clip-2', 2.25),
    ];
    // Total: 5.75 beats at 120 BPM = 5.75 * 0.5 = 2.875 seconds
    expect(calculateSelectedDuration(clips, ['clip-1', 'clip-2'], 120)).toBe(2.875);
  });
});

/**
 * Song Arranger - Duration Utilities Tests
 * Tests for duration calculation and formatting
 */

import { beatsToSeconds, formatDuration, calculateGlobalDuration, calculateSelectedDuration } from './duration';
import type { Clip } from '@/types';

describe('beatsToSeconds', () => {
  it('should convert beats to seconds at 120 BPM', () => {
    const tempo = 120;
    const beats = 4;
    const seconds = beatsToSeconds(beats, tempo);
    // At 120 BPM, 1 beat = 0.5 seconds
    // 4 beats = 2 seconds
    expect(seconds).toBe(2);
  });

  it('should convert beats to seconds at 60 BPM', () => {
    const tempo = 60;
    const beats = 4;
    const seconds = beatsToSeconds(beats, tempo);
    // At 60 BPM, 1 beat = 1 second
    // 4 beats = 4 seconds
    expect(seconds).toBe(4);
  });

  it('should convert beats to seconds at 90 BPM', () => {
    const tempo = 90;
    const beats = 8;
    const seconds = beatsToSeconds(beats, tempo);
    // At 90 BPM, 1 beat = 60/90 = 0.6667 seconds
    // 8 beats = 5.3333 seconds
    expect(seconds).toBeCloseTo(5.333, 2);
  });

  it('should handle fractional beats', () => {
    const tempo = 120;
    const beats = 2.5;
    const seconds = beatsToSeconds(beats, tempo);
    // At 120 BPM, 1 beat = 0.5 seconds
    // 2.5 beats = 1.25 seconds
    expect(seconds).toBe(1.25);
  });

  it('should handle zero beats', () => {
    const tempo = 120;
    const beats = 0;
    const seconds = beatsToSeconds(beats, tempo);
    expect(seconds).toBe(0);
  });
});

describe('formatDuration', () => {
  it('should format seconds as MM:SS', () => {
    const seconds = 125;
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('02:05');
  });

  it('should pad single-digit minutes', () => {
    const seconds = 65;
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('01:05');
  });

  it('should pad single-digit seconds', () => {
    const seconds = 62;
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('01:02');
  });

  it('should handle zero duration', () => {
    const seconds = 0;
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('00:00');
  });

  it('should handle large durations', () => {
    const seconds = 3661; // 61 minutes and 1 second
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('61:01');
  });

  it('should round down fractional seconds', () => {
    const seconds = 125.7;
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('02:05');
  });

  it('should handle very small fractional values', () => {
    const seconds = 0.5;
    const formatted = formatDuration(seconds);
    expect(formatted).toBe('00:00');
  });
});

describe('calculateGlobalDuration', () => {
  it('should calculate duration from start to rightmost clip', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      { id: '2', laneId: 'lane1', position: 8, duration: 4 },
      { id: '3', laneId: 'lane2', position: 4, duration: 4 },
    ];
    const duration = calculateGlobalDuration(clips);
    // Rightmost clip is at position 8 with duration 4
    // Total duration = 8 + 4 = 12 beats
    expect(duration).toBe(12);
  });

  it('should return 0 for empty clips array', () => {
    const clips: Clip[] = [];
    const duration = calculateGlobalDuration(clips);
    expect(duration).toBe(0);
  });

  it('should handle single clip', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 2, duration: 6 },
    ];
    const duration = calculateGlobalDuration(clips);
    // Position 2 + duration 6 = 8 beats
    expect(duration).toBe(8);
  });

  it('should handle clips with same end position', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 8 },
      { id: '2', laneId: 'lane2', position: 4, duration: 4 },
    ];
    const duration = calculateGlobalDuration(clips);
    // Both end at position 8
    expect(duration).toBe(8);
  });

  it('should handle clips starting at position 0', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 4 },
    ];
    const duration = calculateGlobalDuration(clips);
    expect(duration).toBe(4);
  });
});

describe('calculateSelectedDuration', () => {
  it('should sum durations of selected clips', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      { id: '2', laneId: 'lane1', position: 8, duration: 4 },
      { id: '3', laneId: 'lane2', position: 4, duration: 6 },
    ];
    const selectedIds = ['1', '3'];
    const duration = calculateSelectedDuration(clips, selectedIds);
    // Clip 1: 4 beats + Clip 3: 6 beats = 10 beats
    expect(duration).toBe(10);
  });

  it('should return 0 for no selected clips', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 4 },
    ];
    const selectedIds: string[] = [];
    const duration = calculateSelectedDuration(clips, selectedIds);
    expect(duration).toBe(0);
  });

  it('should return 0 for empty clips array', () => {
    const clips: Clip[] = [];
    const selectedIds = ['1', '2'];
    const duration = calculateSelectedDuration(clips, selectedIds);
    expect(duration).toBe(0);
  });

  it('should handle single selected clip', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 8 },
      { id: '2', laneId: 'lane2', position: 4, duration: 4 },
    ];
    const selectedIds = ['2'];
    const duration = calculateSelectedDuration(clips, selectedIds);
    expect(duration).toBe(4);
  });

  it('should handle all clips selected', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 4 },
      { id: '2', laneId: 'lane1', position: 8, duration: 4 },
      { id: '3', laneId: 'lane2', position: 4, duration: 6 },
    ];
    const selectedIds = ['1', '2', '3'];
    const duration = calculateSelectedDuration(clips, selectedIds);
    // 4 + 4 + 6 = 14 beats
    expect(duration).toBe(14);
  });

  it('should ignore non-existent clip IDs', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 4 },
    ];
    const selectedIds = ['1', 'nonexistent'];
    const duration = calculateSelectedDuration(clips, selectedIds);
    // Only clip 1 exists: 4 beats
    expect(duration).toBe(4);
  });

  it('should handle fractional durations', () => {
    const clips: Clip[] = [
      { id: '1', laneId: 'lane1', position: 0, duration: 2.5 },
      { id: '2', laneId: 'lane2', position: 4, duration: 3.25 },
    ];
    const selectedIds = ['1', '2'];
    const duration = calculateSelectedDuration(clips, selectedIds);
    expect(duration).toBe(5.75);
  });
});

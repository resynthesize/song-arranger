/**
 * Tests for note conversion utilities
 */

import { noteToMidi, midiToNote, incrementNote } from './noteConversion';

describe('noteConversion', () => {
  describe('noteToMidi', () => {
    it('should convert valid note strings to MIDI numbers', () => {
      expect(noteToMidi('C 0')).toBe(0);
      expect(noteToMidi('C 4')).toBe(48); // C in octave 4
      expect(noteToMidi('A 4')).toBe(57); // A in octave 4
      expect(noteToMidi('G 10')).toBe(127); // Highest valid MIDI note
    });

    it('should handle notes with and without spaces', () => {
      expect(noteToMidi('C 3')).toBe(36);
      expect(noteToMidi('C3')).toBe(36);
      expect(noteToMidi('D#4')).toBe(51); // D# = 3, octave 4 = 48 + 3 = 51
      expect(noteToMidi('D# 4')).toBe(51);
    });

    it('should return -1 for invalid notes', () => {
      expect(noteToMidi('---')).toBe(-1);
      expect(noteToMidi('')).toBe(-1);
      expect(noteToMidi('X 4')).toBe(-1);
      expect(noteToMidi('C')).toBe(-1);
      expect(noteToMidi('invalid')).toBe(-1);
    });

    it('should clamp out-of-range notes', () => {
      expect(noteToMidi('C 11')).toBe(-1); // Above MIDI 127
      expect(noteToMidi('C -1')).toBe(-1); // Below MIDI 0
    });
  });

  describe('midiToNote', () => {
    it('should convert MIDI numbers to note strings', () => {
      expect(midiToNote(0)).toBe('C 0');
      expect(midiToNote(60)).toBe('C 5'); // 60 / 12 = 5, 60 % 12 = 0 (C)
      expect(midiToNote(69)).toBe('A 5'); // 69 / 12 = 5, 69 % 12 = 9 (A)
      expect(midiToNote(127)).toBe('G 10'); // Highest note (127 / 12 = 10, 127 % 12 = 7 = G)
    });

    it('should format notes with space between name and octave', () => {
      expect(midiToNote(36)).toBe('C 3');
      expect(midiToNote(51)).toBe('D# 4'); // 51 / 12 = 4, 51 % 12 = 3 (D#)
    });

    it('should return "---" for invalid MIDI numbers', () => {
      expect(midiToNote(-1)).toBe('---');
      expect(midiToNote(128)).toBe('---');
      expect(midiToNote(200)).toBe('---');
    });
  });

  describe('incrementNote', () => {
    it('should increment notes by semitones', () => {
      expect(incrementNote('C 4', 1)).toBe('C# 4');
      expect(incrementNote('C 4', 12)).toBe('C 5'); // One octave up
      expect(incrementNote('C 4', -12)).toBe('C 3'); // One octave down
    });

    it('should clamp increments to valid MIDI range', () => {
      expect(incrementNote('G 10', 1)).toBe('G 10'); // Already at max (MIDI 127)
      expect(incrementNote('C 0', -1)).toBe('C 0'); // Already at min (MIDI 0)
    });

    it('should handle invalid notes by starting from middle C', () => {
      expect(incrementNote('---', 0)).toBe('C 5'); // Middle C (MIDI 60)
      expect(incrementNote('---', 12)).toBe('C 6'); // One octave up from middle C
      expect(incrementNote('', -12)).toBe('C 4'); // One octave down from middle C
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve notes through round-trip conversion', () => {
      const notes = ['C 0', 'C# 4', 'G 5', 'A 4', 'G 10'];
      notes.forEach(note => {
        const midi = noteToMidi(note);
        const converted = midiToNote(midi);
        expect(converted).toBe(note);
      });
    });

    it('should handle all MIDI notes 0-127', () => {
      for (let midi = 0; midi <= 127; midi++) {
        const note = midiToNote(midi);
        const convertedBack = noteToMidi(note);
        expect(convertedBack).toBe(midi);
      }
    });
  });
});

/**
 * Utilities for converting between note names and MIDI note numbers
 * Based on Cirklon P3 pattern format: "C 3", "D#4", "---" etc.
 * Range: C0 to G#10 (MIDI notes 0 to 127)
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert a note string (e.g. "C 3", "D#4") to MIDI note number (0-127)
 * Returns -1 for invalid or empty notes (e.g. "---")
 */
export function noteToMidi(noteStr: string): number {
  if (!noteStr || noteStr.trim() === '---' || noteStr.trim() === '') {
    return -1;
  }

  // Parse note string - format is like "C 3" or "C#3" or "D 4"
  const trimmed = noteStr.trim();

  // Match pattern: note name (C-G with optional #), optional space, octave number
  const match = trimmed.match(/^([A-G]#?)\s*(\d+)$/);

  if (!match) {
    return -1;
  }

  const noteName = match[1];
  const octaveStr = match[2];

  if (!noteName || !octaveStr) {
    return -1;
  }

  const octave = parseInt(octaveStr, 10);

  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) {
    return -1;
  }

  // MIDI note number = (octave * 12) + note index
  const midiNote = (octave * 12) + noteIndex;

  // Clamp to valid MIDI range (0-127)
  if (midiNote < 0 || midiNote > 127) {
    return -1;
  }

  return midiNote;
}

/**
 * Convert MIDI note number (0-127) to note string format (e.g. "C 3")
 * Returns "---" for invalid MIDI numbers
 */
export function midiToNote(midiNote: number): string {
  if (midiNote < 0 || midiNote > 127) {
    return '---';
  }

  const octave = Math.floor(midiNote / 12);
  const noteIndex = midiNote % 12;
  const noteName = NOTE_NAMES[noteIndex];

  // Format with space between note and octave, matching Cirklon format
  return `${noteName} ${octave}`;
}

/**
 * Increment a note string by a number of semitones
 * Returns the new note string, clamped to valid MIDI range (0-127)
 */
export function incrementNote(noteStr: string, semitones: number): string {
  const midiNote = noteToMidi(noteStr);

  // If invalid note, start from C4 (middle C, MIDI 60)
  if (midiNote === -1) {
    const newMidi = Math.max(0, Math.min(127, 60 + semitones));
    return midiToNote(newMidi);
  }

  // Increment and clamp
  const newMidi = Math.max(0, Math.min(127, midiNote + semitones));
  return midiToNote(newMidi);
}

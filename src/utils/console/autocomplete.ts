/**
 * Cyclone - Autocomplete Engine
 * Provides VSCode-style autocomplete suggestions for console commands
 */

export interface AutocompleteSuggestion {
  text: string;
  type: 'property' | 'method' | 'keyword' | 'variable';
  description?: string;
}

/**
 * Get autocomplete suggestions for current input
 *
 * @param input - Current input text
 * @param cursorPosition - Position of cursor in input
 * @returns Array of suggestions
 */
export function getAutocompleteSuggestions(
  input: string,
  cursorPosition: number
): AutocompleteSuggestion[] {
  // Get the text up to cursor position
  const textBeforeCursor = input.slice(0, cursorPosition);

  // Don't show autocomplete inside function calls or after special characters
  if (textBeforeCursor.match(/[()[\]{}]$/)) {
    return [];
  }

  // Find the last token being typed
  const token = getLastToken(textBeforeCursor);

  if (!token) {
    return getTopLevelSuggestions();
  }

  // Check if we're typing a property/method (after a dot)
  const dotIndex = textBeforeCursor.lastIndexOf('.');
  if (dotIndex !== -1) {
    const objectName = getObjectNameBeforeDot(textBeforeCursor, dotIndex);
    const partialProperty = textBeforeCursor.slice(dotIndex + 1);
    return getPropertySuggestions(objectName, partialProperty);
  }

  // Top-level suggestions filtered by current token
  return getTopLevelSuggestions().filter(s =>
    s.text.toLowerCase().startsWith(token.toLowerCase())
  );
}

/**
 * Get the last token being typed (word or property)
 */
function getLastToken(text: string): string {
  // Match word characters, dots, and parentheses
  const match = text.match(/[\w.]+$/);
  return match ? match[0] : '';
}

/**
 * Get the object name before a dot
 * e.g., "info.track" -> "info"
 */
function getObjectNameBeforeDot(text: string, dotIndex: number): string {
  const textBeforeDot = text.slice(0, dotIndex);
  const match = textBeforeDot.match(/(\w+)$/);
  return match?.[1] ?? '';
}

/**
 * Get top-level suggestions (global objects and functions)
 */
function getTopLevelSuggestions(): AutocompleteSuggestion[] {
  return [
    // Core functions
    { text: 'help', type: 'method', description: 'Show help message' },

    // State access
    { text: 'tracks', type: 'variable', description: 'All tracks' },
    { text: 'patterns', type: 'variable', description: 'All patterns' },
    { text: 'scenes', type: 'variable', description: 'All scenes' },
    { text: 'song', type: 'variable', description: 'Current CKS song data' },

    // Pattern operations
    { text: 'createPattern', type: 'method', description: 'Create new pattern' },
    { text: 'removePattern', type: 'method', description: 'Remove pattern by name' },
    { text: 'p', type: 'method', description: 'Pattern builder DSL' },

    // Scene operations
    { text: 'createScene', type: 'method', description: 'Create new scene' },
    { text: 'removeScene', type: 'method', description: 'Remove scene by name' },
    { text: 'assignPattern', type: 'method', description: 'Assign pattern to track in scene' },

    // Track settings
    { text: 'setTrackColor', type: 'method', description: 'Set track color' },
    { text: 'setTrackTranspose', type: 'method', description: 'Set track transpose' },

    // Utilities
    { text: 'Math', type: 'variable', description: 'Math utilities' },
    { text: 'Array', type: 'variable', description: 'Array utilities' },
    { text: 'note', type: 'variable', description: 'Music theory helpers' },
    { text: 'gen', type: 'variable', description: 'Pattern generators' },
  ];
}

/**
 * Get property/method suggestions for an object
 */
function getPropertySuggestions(
  objectName: string,
  partialProperty: string
): AutocompleteSuggestion[] {
  const suggestions = getObjectProperties(objectName);

  if (!partialProperty) {
    return suggestions;
  }

  return suggestions.filter(s =>
    s.text.toLowerCase().startsWith(partialProperty.toLowerCase())
  );
}

/**
 * Get available properties for a specific object
 */
function getObjectProperties(objectName: string): AutocompleteSuggestion[] {
  switch (objectName) {
    case 'Math':
      return [
        { text: 'abs', type: 'method', description: 'Absolute value' },
        { text: 'ceil', type: 'method', description: 'Round up' },
        { text: 'floor', type: 'method', description: 'Round down' },
        { text: 'max', type: 'method', description: 'Maximum value' },
        { text: 'min', type: 'method', description: 'Minimum value' },
        { text: 'random', type: 'method', description: 'Random number 0-1' },
        { text: 'round', type: 'method', description: 'Round to nearest' },
        { text: 'sqrt', type: 'method', description: 'Square root' },
        { text: 'pow', type: 'method', description: 'Power' },
        { text: 'PI', type: 'property', description: 'Pi constant' },
      ];

    case 'Array':
      return [
        { text: 'from', type: 'method', description: 'Create array from iterable' },
        { text: 'isArray', type: 'method', description: 'Check if value is array' },
        { text: 'of', type: 'method', description: 'Create array from arguments' },
      ];

    case 'note':
      return [
        { text: 'midiToName', type: 'method', description: 'MIDI number to note name' },
        { text: 'nameToMidi', type: 'method', description: 'Note name to MIDI' },
        { text: 'scale', type: 'method', description: 'Generate scale' },
        { text: 'chord', type: 'method', description: 'Generate chord' },
      ];

    case 'gen':
      return [
        { text: 'range', type: 'method', description: 'Generate number range' },
        { text: 'repeat', type: 'method', description: 'Repeat pattern' },
        { text: 'choose', type: 'method', description: 'Random choice from array' },
        { text: 'random', type: 'method', description: 'Random number in range' },
      ];

    default:
      return [];
  }
}

/**
 * Apply an autocomplete suggestion to input text
 *
 * @param input - Current input text
 * @param cursorPosition - Current cursor position
 * @param suggestion - Suggestion to apply
 * @returns Updated input and new cursor position
 */
export function applySuggestion(
  input: string,
  cursorPosition: number,
  suggestion: AutocompleteSuggestion
): { input: string; cursorPosition: number } {
  const textBeforeCursor = input.slice(0, cursorPosition);
  const textAfterCursor = input.slice(cursorPosition);

  // Find the token to replace
  const dotIndex = textBeforeCursor.lastIndexOf('.');

  let newTextBeforeCursor: string;
  if (dotIndex !== -1) {
    // Replace property name after dot
    newTextBeforeCursor = textBeforeCursor.slice(0, dotIndex + 1) + suggestion.text;
  } else {
    // Replace the last token
    const lastTokenMatch = textBeforeCursor.match(/(\w*)$/);
    const matchedToken = lastTokenMatch?.[1];
    if (lastTokenMatch && matchedToken !== undefined) {
      const replaceStart = cursorPosition - matchedToken.length;
      newTextBeforeCursor = input.slice(0, replaceStart) + suggestion.text;
    } else {
      newTextBeforeCursor = textBeforeCursor + suggestion.text;
    }
  }

  // Add parentheses for methods
  const suffix = suggestion.type === 'method' ? '()' : '';
  const newInput = newTextBeforeCursor + suffix + textAfterCursor;
  const newCursorPosition = newTextBeforeCursor.length + (suggestion.type === 'method' ? 1 : suffix.length);

  return {
    input: newInput,
    cursorPosition: newCursorPosition,
  };
}

/**
 * Cyclone - ConsoleAutocomplete Component
 * VSCode-style autocomplete dropdown for console
 */

import React from 'react';
import type { AutocompleteSuggestion } from '@/utils/console/autocomplete';
import './ConsoleAutocomplete.css';

export interface ConsoleAutocompleteProps {
  suggestions: AutocompleteSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: AutocompleteSuggestion) => void;
  onClose: () => void;
}

export const ConsoleAutocomplete: React.FC<ConsoleAutocompleteProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="console-autocomplete" data-testid="console-autocomplete">
      <ul className="console-autocomplete__list">
        {suggestions.map((suggestion, index) => (
          <li
            key={`${suggestion.text}-${index}`}
            className={`console-autocomplete__item ${
              index === selectedIndex ? 'console-autocomplete__item--selected' : ''
            }`}
            onClick={() => onSelect(suggestion)}
            data-testid={`autocomplete-item-${index}`}
          >
            <span
              className={`console-autocomplete__icon console-autocomplete__icon--${suggestion.type}`}
            >
              {getIconForType(suggestion.type)}
            </span>
            <span className="console-autocomplete__text">{suggestion.text}</span>
            {suggestion.description && (
              <span className="console-autocomplete__description">
                {suggestion.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Get icon character for suggestion type
 */
function getIconForType(type: AutocompleteSuggestion['type']): string {
  switch (type) {
    case 'method':
      return 'ƒ';
    case 'property':
      return '⚡';
    case 'variable':
      return '○';
    case 'keyword':
      return '▸';
    default:
      return '•';
  }
}

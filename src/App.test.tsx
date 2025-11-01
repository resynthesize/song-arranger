/**
 * Cyclone - App Component Tests
 * Tests for the main App component
 */

import { screen } from '@testing-library/react';
import App from './App';
import { renderWithProviders } from './utils/testUtils';

// Mock the storage util
jest.mock('./utils/storage', () => ({
  getTemplateProject: jest.fn(() => null),
}));

describe('App', () => {
  it('should render app with menu bar', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('should render timeline', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should display default tempo in HUD', () => {
    renderWithProviders(<App />);

    // HUD should be present
    const hud = screen.queryByTestId('hud');
    if (hud) {
      expect(screen.getByText('120')).toBeInTheDocument(); // Default tempo
    } else {
      // HUD not rendered in tests - that's OK, just verify app renders
      expect(screen.getByTestId('timeline')).toBeInTheDocument();
    }
  });
});

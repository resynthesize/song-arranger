/**
 * TimelinePage Tests
 */

import { screen } from '@testing-library/react';
import TimelinePage from './TimelinePage';
import { renderWithProviders } from '@/utils/testUtils';

// Mock storage utility
jest.mock('@/utils/storage', () => ({
  getTemplateProject: jest.fn(() => null),
}));

describe('TimelinePage', () => {
  it('should render TimelineTemplate', () => {
    renderWithProviders(<TimelinePage />);
    expect(screen.getByTestId('timeline-template')).toBeInTheDocument();
  });

  it('should render MenuBar through TimelineTemplate', () => {
    renderWithProviders(<TimelinePage />);
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('should render Timeline through TimelineTemplate', () => {
    renderWithProviders(<TimelinePage />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });
});

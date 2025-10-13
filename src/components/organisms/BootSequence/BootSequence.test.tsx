/**
 * Song Arranger - BootSequence Component Tests
 * Terminal boot sequence with localStorage preference
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BootSequence from './BootSequence';

describe('BootSequence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render without crashing', () => {
    render(<BootSequence onComplete={() => {}} />);
    expect(screen.getByTestId('boot-sequence')).toBeInTheDocument();
  });

  it('should display boot messages', async () => {
    render(<BootSequence onComplete={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/COMMODORE 8032/i)).toBeInTheDocument();
    });
  });

  it('should call onComplete after sequence finishes', async () => {
    const onComplete = jest.fn();
    render(<BootSequence onComplete={onComplete} />);

    await waitFor(() => { expect(onComplete).toHaveBeenCalled(); }, {
      timeout: 5000,
    });
  });

  it('should skip boot sequence when Escape key is pressed', async () => {
    const onComplete = jest.fn();
    render(<BootSequence onComplete={onComplete} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => { expect(onComplete).toHaveBeenCalled(); }, {
      timeout: 100,
    });
  });

  it('should save skip preference to localStorage when Escape is pressed', () => {
    const onComplete = jest.fn();
    render(<BootSequence onComplete={onComplete} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(localStorage.getItem('skipBootSequence')).toBe('true');
  });

  it('should not render if skip preference is set in localStorage', () => {
    localStorage.setItem('skipBootSequence', 'true');
    const onComplete = jest.fn();

    render(<BootSequence onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('boot-sequence')).not.toBeInTheDocument();
  });

  it('should show progress indicators during boot', async () => {
    render(<BootSequence onComplete={() => {}} />);

    // Should have [OK] indicators after messages appear
    await waitFor(() => {
      expect(screen.getByText(/\[OK\]/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display skip instruction', () => {
    render(<BootSequence onComplete={() => {}} />);

    expect(screen.getByText(/ESC.*SKIP/i)).toBeInTheDocument();
  });

  it('should have terminal aesthetic styling', () => {
    render(<BootSequence onComplete={() => {}} />);

    const bootElement = screen.getByTestId('boot-sequence');
    expect(bootElement).toHaveClass('boot-sequence');
  });

  it('should animate boot messages sequentially', () => {
    render(<BootSequence onComplete={() => {}} />);

    const bootMessages = screen.getByTestId('boot-messages');
    expect(bootMessages.children.length).toBeGreaterThan(0);
  });

  it('should handle rapid Escape key presses gracefully', () => {
    const onComplete = jest.fn();
    render(<BootSequence onComplete={onComplete} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

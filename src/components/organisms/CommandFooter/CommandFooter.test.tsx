/**
 * Cyclone - Command Footer Tests
 * Tests for context-sensitive command footer component
 */

import { render, screen } from '@testing-library/react';
import CommandFooter from './CommandFooter';

describe('CommandFooter', () => {
  it('should render component', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);
    expect(screen.getByTestId('command-footer')).toBeInTheDocument();
  });

  it('should display global shortcuts when no selection', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    // Should show global shortcuts
    expect(screen.getByText('SPACE')).toBeInTheDocument();
    expect(screen.getByText('Play/Pause')).toBeInTheDocument();
    expect(screen.getAllByText(/Zoom/).length).toBeGreaterThan(0);

    // Should not show clip-specific shortcuts
    expect(screen.queryByText('Delete selected clips')).not.toBeInTheDocument();
    expect(screen.queryByText('Duplicate selected clips')).not.toBeInTheDocument();
  });

  it('should display clip shortcuts when clips are selected', () => {
    render(<CommandFooter hasSelection={true} selectionCount={2} isEditing={false} />);

    // Should show clip-specific shortcuts (only implemented ones)
    expect(screen.getByText('DEL')).toBeInTheDocument();
    expect(screen.getByText('BKSP')).toBeInTheDocument();
    expect(screen.getAllByText('Delete selected clips').length).toBe(2); // Delete and Backspace
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Duplicate selected clips')).toBeInTheDocument();

    // Should NOT show unimplemented shortcuts
    expect(screen.queryByText('Edit clip label')).not.toBeInTheDocument();
    expect(screen.queryByText('Change clip color')).not.toBeInTheDocument();
    expect(screen.queryByText('Join adjacent selected clips')).not.toBeInTheDocument();

    // Should show duration shortcuts
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Set clip duration to 1 bar')).toBeInTheDocument();

    // Should show essential global shortcuts
    expect(screen.getByText('[')).toBeInTheDocument();
    expect(screen.getByText(']')).toBeInTheDocument();
    expect(screen.getByText('SPACE')).toBeInTheDocument();
  });

  it('should hide conflicting shortcuts when editing', () => {
    render(<CommandFooter hasSelection={true} selectionCount={1} isEditing={true} />);

    // Should hide shortcuts that conflict with text editing
    expect(screen.queryByText('Duplicate selected clips')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit clip label')).not.toBeInTheDocument();
    expect(screen.queryByText('Change clip color')).not.toBeInTheDocument();

    // Should still show some global shortcuts (play, zoom)
    expect(screen.getByText('SPACE')).toBeInTheDocument();
    expect(screen.getByText('[')).toBeInTheDocument();
    expect(screen.getByText(']')).toBeInTheDocument();

    // Note: Delete shortcuts and alphanumeric shortcuts are not available when editing
  });

  it('should show global shortcuts when no selection', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    // Should show navigation shortcuts when no selection
    expect(screen.getAllByText(/↑/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/↓/).length).toBeGreaterThan(0);

    // Should show add lane shortcut
    expect(screen.getByText('Add new lane')).toBeInTheDocument();
  });

  it('should not show unimplemented shortcuts like undo/redo', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    // Undo/redo are not yet implemented, should not be shown
    expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    expect(screen.queryByText('Redo')).not.toBeInTheDocument();
  });

  it('should display help shortcut', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    expect(screen.getByText('Shift+/')).toBeInTheDocument();
    expect(screen.getByText('Show help')).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    const footer = screen.getByTestId('command-footer');
    expect(footer).toHaveClass('command-footer');
  });

  it('should render shortcuts as separate items', () => {
    const { container } = render(
      <CommandFooter hasSelection={true} selectionCount={1} isEditing={false} />
    );

    // Should have shortcut items
    const shortcutItems = container.querySelectorAll('.command-footer__shortcut');
    expect(shortcutItems.length).toBeGreaterThan(0);
  });
});

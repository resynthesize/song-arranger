/**
 * Song Arranger - Command Footer Tests
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
    expect(screen.getByText(/SPACE/)).toBeInTheDocument();
    expect(screen.getByText(/Play/)).toBeInTheDocument();
    expect(screen.getByText(/\[/)).toBeInTheDocument();
    expect(screen.getByText(/]/)).toBeInTheDocument();
    expect(screen.getAllByText(/Zoom/).length).toBeGreaterThan(0);

    // Should not show clip-specific shortcuts
    expect(screen.queryByText('Delete selected clips')).not.toBeInTheDocument();
    expect(screen.queryByText('Duplicate selected clips')).not.toBeInTheDocument();
  });

  it('should display clip shortcuts when clips are selected', () => {
    render(<CommandFooter hasSelection={true} selectionCount={2} isEditing={false} />);

    // Should show clip-specific shortcuts
    expect(screen.getByText('DEL')).toBeInTheDocument();
    expect(screen.getByText('BKSP')).toBeInTheDocument();
    expect(screen.getAllByText('Delete selected clips').length).toBe(2); // Delete and Backspace
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Duplicate selected clips')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('Edit clip label')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Change clip color')).toBeInTheDocument();
  });

  it('should hide conflicting shortcuts when editing', () => {
    render(<CommandFooter hasSelection={true} selectionCount={1} isEditing={true} />);

    // Should hide shortcuts that conflict with text editing
    expect(screen.queryByText('Duplicate selected clips')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit clip label')).not.toBeInTheDocument();
    expect(screen.queryByText('Change clip color')).not.toBeInTheDocument();

    // Should still show global shortcuts (play, zoom, navigation, undo/redo)
    expect(screen.getByText('SPACE')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Z')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();

    // Note: Delete shortcuts are not available when editing to prevent accidental deletion
  });

  it('should show navigation shortcuts in all contexts', () => {
    const contexts = [
      { hasSelection: false, selectionCount: 0, isEditing: false },
      { hasSelection: true, selectionCount: 1, isEditing: false },
      { hasSelection: true, selectionCount: 1, isEditing: true },
    ];

    contexts.forEach((context) => {
      const { unmount } = render(<CommandFooter {...context} />);

      // Should show arrow navigation
      expect(screen.getByText(/↑/)).toBeInTheDocument();
      expect(screen.getByText(/↓/)).toBeInTheDocument();

      unmount();
    });
  });

  it('should show undo/redo shortcuts in all contexts', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    expect(screen.getByText('Ctrl+Z')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Shift+Z')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('should display help shortcut', () => {
    render(<CommandFooter hasSelection={false} selectionCount={0} isEditing={false} />);

    expect(screen.getByText('?')).toBeInTheDocument();
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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RowSelector from './RowSelector';
import { PatternRow } from '@/types';

describe('RowSelector', () => {
  const mockOnRowChange = jest.fn();

  beforeEach(() => {
    mockOnRowChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render all 8 row buttons', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      expect(screen.getByRole('tab', { name: /note/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /velo/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /length/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /delay/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux a/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux b/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux c/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux d/i })).toBeInTheDocument();
    });

    it('should highlight selected row', () => {
      render(
        <RowSelector selectedRow="velocity" onRowChange={mockOnRowChange} />
      );

      const selectedTab = screen.getByRole('tab', { name: /velo/i });
      expect(selectedTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should not highlight non-selected rows', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      expect(veloTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should have proper tablist role on container', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onRowChange when row clicked', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      await user.click(veloTab);

      expect(mockOnRowChange).toHaveBeenCalledWith('velocity');
      expect(mockOnRowChange).toHaveBeenCalledTimes(1);
    });

    it('should call onRowChange for each row type when clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <RowSelector selectedRow="auxD" onRowChange={mockOnRowChange} />
      );

      const rowTests: Array<{ label: RegExp; value: PatternRow }> = [
        { label: /note/i, value: 'note' },
        { label: /velo/i, value: 'velocity' },
        { label: /length/i, value: 'length' },
        { label: /delay/i, value: 'delay' },
        { label: /aux a/i, value: 'auxA' },
        { label: /aux b/i, value: 'auxB' },
        { label: /aux c/i, value: 'auxC' },
        { label: /aux d/i, value: 'auxD' },
      ];

      for (const { label, value } of rowTests) {
        mockOnRowChange.mockClear();
        rerender(<RowSelector selectedRow="auxD" onRowChange={mockOnRowChange} />);

        const tab = screen.getByRole('tab', { name: label });
        await user.click(tab);

        if (value === 'auxD') {
          // Clicking already selected row should not trigger callback
          expect(mockOnRowChange).not.toHaveBeenCalled();
        } else {
          expect(mockOnRowChange).toHaveBeenCalledWith(value);
        }
      }
    });

    it('should not call onRowChange when clicking already selected row', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const noteTab = screen.getByRole('tab', { name: /note/i });
      await user.click(noteTab);

      expect(mockOnRowChange).not.toHaveBeenCalled();
    });
  });

  describe('Custom Aux Labels', () => {
    it('should display custom aux labels when provided', () => {
      const auxLabels = {
        auxA: 'cc #1',
        auxB: 'aftertouch',
        auxC: 'pitchbend',
        auxD: 'modwheel',
      };

      render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          auxLabels={auxLabels}
        />
      );

      expect(screen.getByRole('tab', { name: 'cc #1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'aftertouch' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'pitchbend' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'modwheel' })).toBeInTheDocument();
    });

    it('should display default labels when aux labels not provided', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      expect(screen.getByRole('tab', { name: /aux a/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux b/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux c/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux d/i })).toBeInTheDocument();
    });

    it('should display mix of custom and default aux labels', () => {
      const auxLabels = {
        auxA: 'cc #1',
        auxC: 'pitchbend',
      };

      render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          auxLabels={auxLabels}
        />
      );

      expect(screen.getByRole('tab', { name: 'cc #1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux b/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'pitchbend' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aux d/i })).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to next row on ArrowRight', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const noteTab = screen.getByRole('tab', { name: /note/i });
      noteTab.focus();

      await user.keyboard('{ArrowRight}');

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      expect(veloTab).toHaveFocus();
    });

    it('should navigate to previous row on ArrowLeft', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="velocity" onRowChange={mockOnRowChange} />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      veloTab.focus();

      await user.keyboard('{ArrowLeft}');

      const noteTab = screen.getByRole('tab', { name: /note/i });
      expect(noteTab).toHaveFocus();
    });

    it('should wrap to last row when ArrowLeft on first row', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const noteTab = screen.getByRole('tab', { name: /note/i });
      noteTab.focus();

      await user.keyboard('{ArrowLeft}');

      const auxDTab = screen.getByRole('tab', { name: /aux d/i });
      expect(auxDTab).toHaveFocus();
    });

    it('should wrap to first row when ArrowRight on last row', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="auxD" onRowChange={mockOnRowChange} />
      );

      const auxDTab = screen.getByRole('tab', { name: /aux d/i });
      auxDTab.focus();

      await user.keyboard('{ArrowRight}');

      const noteTab = screen.getByRole('tab', { name: /note/i });
      expect(noteTab).toHaveFocus();
    });

    it('should jump to first row on Home key', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="auxD" onRowChange={mockOnRowChange} />
      );

      const auxDTab = screen.getByRole('tab', { name: /aux d/i });
      auxDTab.focus();

      await user.keyboard('{Home}');

      const noteTab = screen.getByRole('tab', { name: /note/i });
      expect(noteTab).toHaveFocus();
    });

    it('should jump to last row on End key', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const noteTab = screen.getByRole('tab', { name: /note/i });
      noteTab.focus();

      await user.keyboard('{End}');

      const auxDTab = screen.getByRole('tab', { name: /aux d/i });
      expect(auxDTab).toHaveFocus();
    });

    it('should select row on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      veloTab.focus();

      await user.keyboard('{Enter}');

      expect(mockOnRowChange).toHaveBeenCalledWith('velocity');
    });

    it('should select row on Space key', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const lengthTab = screen.getByRole('tab', { name: /length/i });
      lengthTab.focus();

      await user.keyboard(' ');

      expect(mockOnRowChange).toHaveBeenCalledWith('length');
    });
  });

  describe('Layout Options', () => {
    it('should apply horizontal layout class by default', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('horizontal');
    });

    it('should apply horizontal layout class when specified', () => {
      render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          layout="horizontal"
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('horizontal');
    });

    it('should apply vertical layout class when specified', () => {
      render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          layout="vertical"
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('vertical');
    });

    it('should navigate with ArrowDown in vertical layout', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          layout="vertical"
        />
      );

      const noteTab = screen.getByRole('tab', { name: /note/i });
      noteTab.focus();

      await user.keyboard('{ArrowDown}');

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      expect(veloTab).toHaveFocus();
    });

    it('should navigate with ArrowUp in vertical layout', async () => {
      const user = userEvent.setup();
      render(
        <RowSelector
          selectedRow="velocity"
          onRowChange={mockOnRowChange}
          layout="vertical"
        />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      veloTab.focus();

      await user.keyboard('{ArrowUp}');

      const noteTab = screen.getByRole('tab', { name: /note/i });
      expect(noteTab).toHaveFocus();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update selection when selectedRow prop changes', () => {
      const { rerender } = render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      let noteTab = screen.getByRole('tab', { name: /note/i });
      expect(noteTab).toHaveAttribute('aria-selected', 'true');

      rerender(
        <RowSelector selectedRow="velocity" onRowChange={mockOnRowChange} />
      );

      noteTab = screen.getByRole('tab', { name: /note/i });
      const veloTab = screen.getByRole('tab', { name: /velo/i });

      expect(noteTab).toHaveAttribute('aria-selected', 'false');
      expect(veloTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should update aux labels when auxLabels prop changes', () => {
      const { rerender } = render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          auxLabels={{ auxA: 'original' }}
        />
      );

      expect(screen.getByRole('tab', { name: 'original' })).toBeInTheDocument();

      rerender(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          auxLabels={{ auxA: 'updated' }}
        />
      );

      expect(screen.getByRole('tab', { name: 'updated' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'original' })).not.toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus on selected tab after selection changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      await user.click(veloTab);

      rerender(
        <RowSelector selectedRow="velocity" onRowChange={mockOnRowChange} />
      );

      expect(veloTab).toHaveFocus();
    });

    it('should set tabIndex=-1 on non-selected tabs', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const veloTab = screen.getByRole('tab', { name: /velo/i });
      expect(veloTab).toHaveAttribute('tabIndex', '-1');
    });

    it('should set tabIndex=0 on selected tab', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const noteTab = screen.getByRole('tab', { name: /note/i });
      expect(noteTab).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on tablist', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Pattern row selector');
    });

    it('should have aria-orientation on horizontal tablist', () => {
      render(
        <RowSelector selectedRow="note" onRowChange={mockOnRowChange} />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should have aria-orientation on vertical tablist', () => {
      render(
        <RowSelector
          selectedRow="note"
          onRowChange={mockOnRowChange}
          layout="vertical"
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    });
  });
});

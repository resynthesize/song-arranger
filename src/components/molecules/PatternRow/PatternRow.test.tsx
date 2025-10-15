import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatternRow } from './PatternRow';
import type { P3Bar } from '@/types';
import { actUser } from '@/utils/testUtils';

// Helper function to create a mock P3Bar with default values
const createMockBar = (overrides?: Partial<P3Bar>): P3Bar => {
  return {
    direction: 'forward',
    tbase: '  4',
    last_step: 16,
    xpos: 0,
    reps: 1,
    gbar: false,

    // Default note data - some active, some empty
    note: [
      'C 3', 'D 3', '---', 'E 3',
      'F 3', '---', 'G 3', 'A 3',
      'B 3', 'C 4', '---', 'D 4',
      'E 4', '---', 'F 4', 'G 4'
    ],

    // Default velocity data (0-127)
    velo: [
      100, 80, 0, 90,
      95, 0, 85, 110,
      75, 120, 0, 65,
      105, 0, 70, 115
    ],

    // Default length data
    length: [
      64, 32, 0, 48,
      96, 0, 80, 112,
      40, 72, 0, 56,
      88, 0, 60, 100
    ],

    // Default delay data
    delay: [
      0, 5, 0, 10,
      15, 0, 20, 8,
      12, 18, 0, 6,
      14, 0, 16, 22
    ],

    // Aux values
    aux_A_value: [
      10, 20, 30, 40,
      50, 60, 70, 80,
      90, 100, 110, 120,
      127, 115, 105, 95
    ],
    aux_B_value: [
      127, 110, 90, 70,
      50, 30, 10, 0,
      20, 40, 60, 80,
      100, 120, 110, 90
    ],
    aux_C_value: [
      64, 64, 64, 64,
      32, 32, 32, 32,
      96, 96, 96, 96,
      48, 48, 48, 48
    ],
    aux_D_value: [
      0, 10, 20, 30,
      40, 50, 60, 70,
      80, 90, 100, 110,
      120, 127, 100, 50
    ],

    // Gate flags (1 = active, 0 = inactive)
    gate: [
      1, 1, 0, 1,
      1, 0, 1, 1,
      1, 1, 0, 1,
      1, 0, 1, 1
    ],

    // Tie flags
    tie: [
      0, 0, 0, 1,
      0, 0, 1, 0,
      0, 1, 0, 0,
      1, 0, 0, 0
    ],

    // Skip flags
    skip: [
      0, 0, 0, 0,
      0, 0, 0, 1,
      0, 0, 0, 0,
      0, 1, 0, 0
    ],

    // Transpose defeat flags
    note_X: Array(16).fill(0),

    // Aux flags
    aux_A_flag: Array(16).fill(1),
    aux_B_flag: Array(16).fill(1),
    aux_C_flag: Array(16).fill(1),
    aux_D_flag: Array(16).fill(1),

    ...overrides,
  };
};

describe('PatternRow', () => {
  describe('Rendering and Structure', () => {
    it('should render 16 BarChart components', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="note" />);

      const bars = screen.getAllByTestId('bar-chart-container');
      expect(bars).toHaveLength(16);
    });

    it('should display step numbers 1-16 below bars', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="note" />);

      for (let i = 1; i <= 16; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('should render with correct container structure', () => {
      const barData = createMockBar();
      const { container } = render(<PatternRow barData={barData} row="note" />);

      const patternRow = container.querySelector('[data-testid="pattern-row"]');
      expect(patternRow).toBeInTheDocument();
    });
  });

  describe('Note Row Data Mapping', () => {
    it('should display correct note labels for note row', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="note" />);

      // Check that note labels are displayed
      expect(screen.getByText('C 3')).toBeInTheDocument();
      expect(screen.getByText('D 3')).toBeInTheDocument();
      expect(screen.getByText('E 3')).toBeInTheDocument();
      expect(screen.getByText('F 3')).toBeInTheDocument();
    });

    it('should use MIDI note value for bar height on note row', () => {
      const barData = createMockBar({
        note: ['C 3', 'D 3', 'G 10', 'C 0', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---'],
        velo: [127, 64, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      render(<PatternRow barData={barData} row="note" />);

      const bars = screen.getAllByTestId('bar-chart-fill');

      // First bar (C 3 = MIDI 36) should be ~28.3% (36/127)
      const c3Percent = (36 / 127) * 100;
      expect(bars[0]).toHaveStyle({ height: `${c3Percent}%` });

      // Second bar (D 3 = MIDI 38) should be ~29.9% (38/127)
      const d3Percent = (38 / 127) * 100;
      expect(bars[1]).toHaveStyle({ height: `${d3Percent}%` });

      // Third bar (G 10 = MIDI 127) should be 100% (127/127) - highest note
      expect(bars[2]).toHaveStyle({ height: '100%' });

      // Fourth bar (C 0 = MIDI 0) should be 0% (0/127) - lowest note
      expect(bars[3]).toHaveStyle({ height: '0%' });
    });

    it('should handle empty notes (---) correctly', () => {
      const barData = createMockBar({
        note: ['---', '---', 'C 3', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---'],
        velo: [0, 50, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        gate: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      render(<PatternRow barData={barData} row="note" />);

      // Empty note should still show the "---" label
      const labels = screen.getAllByText('---');
      expect(labels.length).toBeGreaterThan(0);

      // Bar height should be 0% for empty notes
      const bars = screen.getAllByTestId('bar-chart-fill');
      expect(bars[0]).toHaveStyle({ height: '0%' });
    });

    it('should not show note labels for non-note rows', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="velocity" />);

      // Note labels should not be present
      expect(screen.queryByText('C 3')).not.toBeInTheDocument();
      expect(screen.queryByText('D 3')).not.toBeInTheDocument();
    });
  });

  describe('Velocity Row Data Mapping', () => {
    it('should display correct data for velocity row', () => {
      const barData = createMockBar({
        velo: [127, 100, 64, 32, 0, 50, 75, 90, 110, 120, 85, 95, 105, 60, 70, 80],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-fill');

      // First bar should be 100% (127/127)
      expect(bars[0]).toHaveStyle({ height: '100%' });

      // Second bar should be ~78.7% (100/127)
      const expectedPercent = (100 / 127) * 100;
      expect(bars[1]).toHaveStyle({ height: `${expectedPercent}%` });

      // Fifth bar should be 0% (0/127)
      expect(bars[4]).toHaveStyle({ height: '0%' });
    });
  });

  describe('Length Row Data Mapping', () => {
    it('should display correct data for length row', () => {
      const barData = createMockBar({
        length: [127, 100, 64, 32, 0, 50, 75, 90, 110, 120, 85, 95, 105, 60, 70, 80],
      });
      render(<PatternRow barData={barData} row="length" />);

      const bars = screen.getAllByTestId('bar-chart-fill');

      // First bar should be 100% (127/127)
      expect(bars[0]).toHaveStyle({ height: '100%' });

      // Fourth bar should be ~25.2% (32/127)
      const expectedPercent = (32 / 127) * 100;
      expect(bars[3]).toHaveStyle({ height: `${expectedPercent}%` });
    });
  });

  describe('Delay Row Data Mapping', () => {
    it('should display correct data for delay row', () => {
      const barData = createMockBar({
        delay: [47, 40, 30, 20, 10, 0, 5, 15, 25, 35, 45, 42, 38, 33, 28, 23],
      });
      render(<PatternRow barData={barData} row="delay" />);

      const bars = screen.getAllByTestId('bar-chart-fill');

      // Note: delay max is 47, so we need to adjust maxValue
      // First bar should be 100% (47/47)
      expect(bars[0]).toHaveStyle({ height: '100%' });

      // Sixth bar should be 0% (0/47)
      expect(bars[5]).toHaveStyle({ height: '0%' });
    });
  });

  describe('Aux Rows Data Mapping', () => {
    it('should display correct data for auxA row', () => {
      const barData = createMockBar({
        aux_A_value: [127, 100, 64, 32, 0, 50, 75, 90, 110, 120, 85, 95, 105, 60, 70, 80],
      });
      render(<PatternRow barData={barData} row="auxA" />);

      const bars = screen.getAllByTestId('bar-chart-fill');

      // First bar should be 100%
      expect(bars[0]).toHaveStyle({ height: '100%' });

      // Third bar should be ~50.4% (64/127)
      const expectedPercent = (64 / 127) * 100;
      expect(bars[2]).toHaveStyle({ height: `${expectedPercent}%` });
    });

    it('should display correct data for auxB row', () => {
      const barData = createMockBar({
        aux_B_value: [127, 90, 60, 30, 0, 20, 40, 80, 100, 110, 120, 70, 50, 10, 5, 95],
      });
      render(<PatternRow barData={barData} row="auxB" />);

      const bars = screen.getAllByTestId('bar-chart-fill');
      expect(bars[0]).toHaveStyle({ height: '100%' });
    });

    it('should display correct data for auxC row', () => {
      const barData = createMockBar({
        aux_C_value: [127, 90, 60, 30, 0, 20, 40, 80, 100, 110, 120, 70, 50, 10, 5, 95],
      });
      render(<PatternRow barData={barData} row="auxC" />);

      const bars = screen.getAllByTestId('bar-chart-fill');
      expect(bars[0]).toHaveStyle({ height: '100%' });
    });

    it('should display correct data for auxD row', () => {
      const barData = createMockBar({
        aux_D_value: [127, 90, 60, 30, 0, 20, 40, 80, 100, 110, 120, 70, 50, 10, 5, 95],
      });
      render(<PatternRow barData={barData} row="auxD" />);

      const bars = screen.getAllByTestId('bar-chart-fill');
      expect(bars[0]).toHaveStyle({ height: '100%' });
    });
  });

  describe('State Flags - Gate (isActive)', () => {
    it('should pass gate flags as isActive prop', () => {
      const barData = createMockBar({
        gate: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // Odd indices (0, 2, 4...) should have active class
      expect(bars[0]).toHaveClass('active');
      expect(bars[2]).toHaveClass('active');

      // Even indices (1, 3, 5...) should NOT have active class
      expect(bars[1]).not.toHaveClass('active');
      expect(bars[3]).not.toHaveClass('active');
    });

    it('should handle all steps inactive', () => {
      const barData = createMockBar({
        gate: Array(16).fill(0),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-container');
      bars.forEach(bar => {
        expect(bar).not.toHaveClass('active');
      });
    });

    it('should handle all steps active', () => {
      const barData = createMockBar({
        gate: Array(16).fill(1),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-container');
      bars.forEach(bar => {
        expect(bar).toHaveClass('active');
      });
    });
  });

  describe('State Flags - Tie (isTied)', () => {
    it('should pass tie flags as isTied prop', () => {
      const barData = createMockBar({
        tie: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      // Check for tie indicators at the expected positions
      const tieIndicators = screen.getAllByTestId('bar-chart-tie-indicator');
      expect(tieIndicators).toHaveLength(5); // Steps 2, 5, 8, 11, 14 (0-indexed)
    });

    it('should handle no tied steps', () => {
      const barData = createMockBar({
        tie: Array(16).fill(0),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const tieIndicators = screen.queryAllByTestId('bar-chart-tie-indicator');
      expect(tieIndicators).toHaveLength(0);
    });

    it('should handle all steps tied', () => {
      const barData = createMockBar({
        tie: Array(16).fill(1),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const tieIndicators = screen.getAllByTestId('bar-chart-tie-indicator');
      expect(tieIndicators).toHaveLength(16);
    });
  });

  describe('State Flags - Skip (isSkipped)', () => {
    it('should pass skip flags as isSkipped prop', () => {
      const barData = createMockBar({
        skip: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // Steps 3, 7, 11, 15 should have skipped class
      expect(bars[3]).toHaveClass('skipped');
      expect(bars[7]).toHaveClass('skipped');
      expect(bars[11]).toHaveClass('skipped');
      expect(bars[15]).toHaveClass('skipped');

      // Other steps should not
      expect(bars[0]).not.toHaveClass('skipped');
      expect(bars[1]).not.toHaveClass('skipped');
    });

    it('should handle all steps skipped', () => {
      const barData = createMockBar({
        skip: Array(16).fill(1),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-container');
      bars.forEach(bar => {
        expect(bar).toHaveClass('skipped');
      });
    });
  });

  describe('Combined State Flags', () => {
    it('should handle step that is active and tied', () => {
      const barData = createMockBar({
        gate: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        tie: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const firstBar = screen.getAllByTestId('bar-chart-container')[0];
      expect(firstBar).toHaveClass('active');

      const tieIndicators = screen.getAllByTestId('bar-chart-tie-indicator');
      expect(tieIndicators).toHaveLength(1);
    });

    it('should handle step that is inactive and skipped', () => {
      const barData = createMockBar({
        gate: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        skip: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const firstBar = screen.getAllByTestId('bar-chart-container')[0];
      expect(firstBar).not.toHaveClass('active');
      expect(firstBar).toHaveClass('skipped');
    });

    it('should handle all three states combined', () => {
      const barData = createMockBar({
        gate: [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        tie: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        skip: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const firstBar = screen.getAllByTestId('bar-chart-container')[0];
      expect(firstBar).toHaveClass('active');
      expect(firstBar).toHaveClass('skipped');

      const tieIndicators = screen.getAllByTestId('bar-chart-tie-indicator');
      expect(tieIndicators).toHaveLength(1);
    });
  });

  describe('Click Interaction', () => {
    it('should call onStepClick with correct index when step is clicked', async () => {
      const handleStepClick = jest.fn();
      const barData = createMockBar();
      const user = userEvent.setup();

      render(<PatternRow barData={barData} row="note" onStepClick={handleStepClick} />);

      const steps = screen.getAllByTestId('step-container');

      // Click first step (index 0)
      await actUser(() => user.click(steps[0]));
      expect(handleStepClick).toHaveBeenCalledWith(0);

      // Click fifth step (index 4)
      await actUser(() => user.click(steps[4]));
      expect(handleStepClick).toHaveBeenCalledWith(4);

      // Click last step (index 15)
      await actUser(() => user.click(steps[15]));
      expect(handleStepClick).toHaveBeenCalledWith(15);
    });

    it('should not call onStepClick when not provided', async () => {
      const barData = createMockBar();
      const user = userEvent.setup();

      render(<PatternRow barData={barData} row="note" />);

      const steps = screen.getAllByTestId('step-container');

      // Should not throw error when clicking
      await actUser(() => user.click(steps[0]));

      expect(steps[0]).toBeInTheDocument();
    });

    it('should handle clicks on all 16 steps correctly', async () => {
      const handleStepClick = jest.fn();
      const barData = createMockBar();
      const user = userEvent.setup();

      render(<PatternRow barData={barData} row="note" onStepClick={handleStepClick} />);

      const steps = screen.getAllByTestId('step-container');

      // Click all steps and verify each one individually
      for (let i = 0; i < 16; i++) {
        handleStepClick.mockClear();
        await actUser(() => user.click(steps[i]));
        // Should have been called at least once with the correct index
        expect(handleStepClick).toHaveBeenCalledWith(i);
      }
    });
  });

  describe('Step Selection', () => {
    it('should highlight selected steps', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="velocity" selectedSteps={[0, 4, 8, 12]} />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // Selected steps should have selected class
      expect(bars[0]).toHaveClass('selected');
      expect(bars[4]).toHaveClass('selected');
      expect(bars[8]).toHaveClass('selected');
      expect(bars[12]).toHaveClass('selected');

      // Non-selected steps should not
      expect(bars[1]).not.toHaveClass('selected');
      expect(bars[2]).not.toHaveClass('selected');
    });

    it('should handle empty selectedSteps array', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="velocity" selectedSteps={[]} />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // No steps should be selected
      bars.forEach(bar => {
        expect(bar).not.toHaveClass('selected');
      });
    });

    it('should handle all steps selected', () => {
      const barData = createMockBar();
      const allSteps = Array.from({ length: 16 }, (_, i) => i);
      render(<PatternRow barData={barData} row="velocity" selectedSteps={allSteps} />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // All steps should be selected
      bars.forEach(bar => {
        expect(bar).toHaveClass('selected');
      });
    });

    it('should handle undefined selectedSteps', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // No steps should be selected when selectedSteps is undefined
      bars.forEach(bar => {
        expect(bar).not.toHaveClass('selected');
      });
    });

    it('should handle single step selected', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="velocity" selectedSteps={[7]} />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // Only step 7 should be selected
      expect(bars[7]).toHaveClass('selected');

      // All others should not be selected
      bars.forEach((bar, index) => {
        if (index !== 7) {
          expect(bar).not.toHaveClass('selected');
        }
      });
    });

    it('should handle non-sequential step selection', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="velocity" selectedSteps={[1, 3, 7, 15]} />);

      const bars = screen.getAllByTestId('bar-chart-container');

      expect(bars[1]).toHaveClass('selected');
      expect(bars[3]).toHaveClass('selected');
      expect(bars[7]).toHaveClass('selected');
      expect(bars[15]).toHaveClass('selected');
    });
  });

  describe('Edge Cases', () => {
    it('should handle bar with all zero values', () => {
      const barData = createMockBar({
        velo: Array(16).fill(0),
        gate: Array(16).fill(0),
        tie: Array(16).fill(0),
        skip: Array(16).fill(0),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-fill');
      bars.forEach(bar => {
        expect(bar).toHaveStyle({ height: '0%' });
      });
    });

    it('should handle bar with all max values', () => {
      const barData = createMockBar({
        velo: Array(16).fill(127),
        gate: Array(16).fill(1),
      });
      render(<PatternRow barData={barData} row="velocity" />);

      const bars = screen.getAllByTestId('bar-chart-fill');
      bars.forEach(bar => {
        expect(bar).toHaveStyle({ height: '100%' });
      });
    });

    it('should handle switching between different rows with same data', () => {
      const barData = createMockBar({
        velo: [100, 50, 25, 0, 100, 50, 25, 0, 100, 50, 25, 0, 100, 50, 25, 0],
        length: [100, 50, 25, 0, 100, 50, 25, 0, 100, 50, 25, 0, 100, 50, 25, 0],
      });

      const { rerender } = render(<PatternRow barData={barData} row="velocity" />);

      let bars = screen.getAllByTestId('bar-chart-fill');
      const veloHeight = (100 / 127) * 100;
      expect(bars[0]).toHaveStyle({ height: `${veloHeight}%` });

      // Rerender with length row
      rerender(<PatternRow barData={barData} row="length" />);

      bars = screen.getAllByTestId('bar-chart-fill');
      expect(bars[0]).toHaveStyle({ height: `${veloHeight}%` });
    });

    it('should handle note row with all empty notes', () => {
      const barData = createMockBar({
        note: Array(16).fill('---'),
        velo: Array(16).fill(0),
        gate: Array(16).fill(0),
      });
      render(<PatternRow barData={barData} row="note" />);

      const labels = screen.getAllByText('---');
      expect(labels).toHaveLength(16);
    });

    it('should handle invalid step indices in selectedSteps gracefully', () => {
      const barData = createMockBar();
      // Include invalid indices (negative and > 15)
      render(<PatternRow barData={barData} row="velocity" selectedSteps={[-1, 0, 5, 20, 100]} />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // Only valid indices should be selected
      expect(bars[0]).toHaveClass('selected');
      expect(bars[5]).toHaveClass('selected');

      // Invalid indices should be ignored (no errors thrown)
      expect(bars).toHaveLength(16);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      const handleStepClick = jest.fn();
      const barData = createMockBar();

      render(<PatternRow barData={barData} row="velocity" onStepClick={handleStepClick} />);

      const stepContainers = screen.getAllByTestId('step-container');

      // All clickable step containers should have proper attributes
      stepContainers.forEach(container => {
        expect(container).toHaveAttribute('role', 'button');
        expect(container).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper aria-labels for each step', () => {
      const barData = createMockBar();
      render(<PatternRow barData={barData} row="note" />);

      const bars = screen.getAllByTestId('bar-chart-container');

      // Each bar should have an aria-label
      bars.forEach(bar => {
        expect(bar).toHaveAttribute('aria-label');
      });
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BarChart } from './BarChart';

describe('BarChart', () => {
  describe('Rendering and Layout', () => {
    it('should render with correct height based on value', () => {
      render(<BarChart value={64} maxValue={127} height={60} />);

      const bar = screen.getByTestId('bar-chart-fill');
      const heightPercent = (64 / 127) * 100;

      expect(bar).toHaveStyle({ height: `${heightPercent}%` });
    });

    it('should scale value correctly for 0%', () => {
      render(<BarChart value={0} maxValue={127} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '0%' });
    });

    it('should scale value correctly for 100%', () => {
      render(<BarChart value={127} maxValue={127} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '100%' });
    });

    it('should scale value correctly for ~50%', () => {
      render(<BarChart value={64} maxValue={127} />);

      const bar = screen.getByTestId('bar-chart-fill');
      const heightPercent = (64 / 127) * 100;

      expect(bar).toHaveStyle({ height: `${heightPercent}%` });
    });

    it('should use default maxValue of 127', () => {
      render(<BarChart value={127} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '100%' });
    });

    it('should support custom maxValue', () => {
      render(<BarChart value={50} maxValue={100} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '50%' });
    });

    it('should use default height of 150px', () => {
      render(<BarChart value={64} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveStyle({ height: '150px' });
    });

    it('should support custom container height', () => {
      render(<BarChart value={64} height={80} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveStyle({ height: '80px' });
    });
  });

  describe('Label Display', () => {
    it('should display label when provided', () => {
      render(<BarChart value={60} label="C 3" />);

      expect(screen.getByText('C 3')).toBeInTheDocument();
    });

    it('should not display label when not provided', () => {
      render(<BarChart value={60} />);

      const label = screen.queryByTestId('bar-chart-label');
      expect(label).not.toBeInTheDocument();
    });

    it('should display numeric label', () => {
      render(<BarChart value={100} label="100" />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('State Styling', () => {
    it('should show active state styling when isActive is true', () => {
      render(<BarChart value={64} isActive={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveClass('active');
    });

    it('should show inactive state styling when isActive is false', () => {
      render(<BarChart value={64} isActive={false} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).not.toHaveClass('active');
    });

    it('should show active state styling by default when isActive is undefined', () => {
      render(<BarChart value={64} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveClass('active');
    });

    it('should show tied indicator when isTied is true', () => {
      render(<BarChart value={64} isTied={true} />);

      const tieIndicator = screen.getByTestId('bar-chart-tie-indicator');
      expect(tieIndicator).toBeInTheDocument();
    });

    it('should not show tied indicator when isTied is false', () => {
      render(<BarChart value={64} isTied={false} />);

      const tieIndicator = screen.queryByTestId('bar-chart-tie-indicator');
      expect(tieIndicator).not.toBeInTheDocument();
    });

    it('should show skipped styling when isSkipped is true', () => {
      render(<BarChart value={64} isSkipped={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveClass('skipped');
    });

    it('should not show skipped styling when isSkipped is false', () => {
      render(<BarChart value={64} isSkipped={false} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).not.toHaveClass('skipped');
    });
  });

  describe('Interaction', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<BarChart value={64} onClick={handleClick} />);

      const container = screen.getByTestId('bar-chart-container');
      await user.click(container);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not provided', async () => {
      const user = userEvent.setup();

      render(<BarChart value={64} />);

      const container = screen.getByTestId('bar-chart-container');
      await user.click(container);

      // Should not throw error
      expect(container).toBeInTheDocument();
    });

    it('should be keyboard accessible when clickable', () => {
      const handleClick = jest.fn();

      render(<BarChart value={64} onClick={handleClick} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('role', 'button');
      expect(container).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<BarChart value={64} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).not.toHaveAttribute('role', 'button');
    });

    it('should handle Enter key press', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<BarChart value={64} onClick={handleClick} />);

      const container = screen.getByTestId('bar-chart-container');
      container.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key press', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<BarChart value={64} onClick={handleClick} />);

      const container = screen.getByTestId('bar-chart-container');
      container.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label describing value and state', () => {
      render(<BarChart value={64} isActive={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('aria-label', 'Step value 64, active');
    });

    it('should include inactive state in aria-label', () => {
      render(<BarChart value={64} isActive={false} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('aria-label', 'Step value 64, inactive');
    });

    it('should include tied state in aria-label', () => {
      render(<BarChart value={64} isTied={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('aria-label', 'Step value 64, active, tied');
    });

    it('should include skipped state in aria-label', () => {
      render(<BarChart value={64} isSkipped={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('aria-label', 'Step value 64, active, skipped');
    });

    it('should include all states in aria-label', () => {
      render(<BarChart value={64} isActive={false} isTied={true} isSkipped={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('aria-label', 'Step value 64, inactive, tied, skipped');
    });

    it('should include label in aria-label when provided', () => {
      render(<BarChart value={60} label="C 3" isActive={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveAttribute('aria-label', 'Step C 3, value 60, active');
    });
  });

  describe('Edge Cases', () => {
    it('should handle value of 0', () => {
      render(<BarChart value={0} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '0%' });
    });

    it('should handle value equal to maxValue', () => {
      render(<BarChart value={100} maxValue={100} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '100%' });
    });

    it('should handle value greater than maxValue by capping at 100%', () => {
      render(<BarChart value={150} maxValue={100} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '100%' });
    });

    it('should handle negative value by capping at 0%', () => {
      render(<BarChart value={-10} maxValue={100} />);

      const bar = screen.getByTestId('bar-chart-fill');
      expect(bar).toHaveStyle({ height: '0%' });
    });

    it('should handle combined states: inactive and tied', () => {
      render(<BarChart value={64} isActive={false} isTied={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).not.toHaveClass('active');

      const tieIndicator = screen.getByTestId('bar-chart-tie-indicator');
      expect(tieIndicator).toBeInTheDocument();
    });

    it('should handle combined states: active and skipped', () => {
      render(<BarChart value={64} isActive={true} isSkipped={true} />);

      const container = screen.getByTestId('bar-chart-container');
      expect(container).toHaveClass('active');
      expect(container).toHaveClass('skipped');
    });
  });
});

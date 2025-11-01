import React from 'react';
import styles from './BarChart.module.css';

export interface BarChartProps {
  value: number;
  maxValue?: number;
  height?: number;
  color?: string;
  isActive?: boolean;
  isTied?: boolean;
  isSkipped?: boolean;
  isSelected?: boolean;
  isLastStep?: boolean;
  isBeyondLast?: boolean;
  label?: string;
  onClick?: () => void;
}

export const BarChart: React.FC<BarChartProps> = ({
  value,
  maxValue = 127,
  height = 150,
  color,
  isActive = true,
  isTied = false,
  isSkipped = false,
  isSelected = false,
  isLastStep = false,
  isBeyondLast = false,
  label,
  onClick,
}) => {
  // Calculate the fill height as a percentage, clamping between 0 and 100
  const fillPercent = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  // Build class names for different states
  const containerClasses = [
    styles.container,
    isActive ? styles.active : '',
    isSkipped ? styles.skipped : '',
    isSelected ? styles.selected : '',
    isLastStep ? styles.lastStep : '',
    isBeyondLast ? styles.beyondLast : '',
    onClick ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Build aria-label for accessibility
  const buildAriaLabel = (): string => {
    const parts: string[] = [];

    if (label) {
      parts.push(`Step ${label}`);
      parts.push(`value ${value}`);
    } else {
      parts.push(`Step value ${value}`);
    }

    if (isActive) {
      parts.push('active');
    } else {
      parts.push('inactive');
    }

    if (isTied) {
      parts.push('tied');
    }

    if (isSkipped) {
      parts.push('skipped');
    }

    return parts.join(', ');
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={containerClasses}
      style={{
        height: `${height}px`,
        ...(color ? { '--bar-color': color } as React.CSSProperties : {})
      }}
      data-testid="bar-chart-container"
      aria-label={buildAriaLabel()}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <div className={styles.label} data-testid="bar-chart-label">
          {label}
        </div>
      )}

      <div className={styles.barContainer}>
        <div
          className={styles.barFill}
          style={{ height: `${fillPercent}%` }}
          data-testid="bar-chart-fill"
        />
      </div>

      {isTied && (
        <div
          className={styles.tieIndicator}
          data-testid="bar-chart-tie-indicator"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

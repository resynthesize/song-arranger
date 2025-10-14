import React from 'react';
import { BarChart } from '@/components/atoms/BarChart/BarChart';
import type { P3Bar, PatternRow as PatternRowType } from '@/types';
import styles from './PatternRow.module.css';

export interface PatternRowProps {
  barData: P3Bar;
  row: PatternRowType;
  selectedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
}

interface RowDataConfig {
  getValue: (barData: P3Bar, stepIndex: number) => number;
  getLabel: (barData: P3Bar, stepIndex: number) => string | undefined;
  maxValue: number;
}

/**
 * Configuration for extracting data from P3Bar based on row type
 */
const ROW_CONFIGS: Record<PatternRowType, RowDataConfig> = {
  note: {
    getValue: (barData, stepIndex) => barData.velo[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => barData.note[stepIndex],
    maxValue: 127,
  },
  velocity: {
    getValue: (barData, stepIndex) => barData.velo[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.velo[stepIndex] ?? 0),
    maxValue: 127,
  },
  length: {
    getValue: (barData, stepIndex) => barData.length[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.length[stepIndex] ?? 0),
    maxValue: 127,
  },
  delay: {
    getValue: (barData, stepIndex) => barData.delay[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.delay[stepIndex] ?? 0),
    maxValue: 47, // Delay range is 0-47
  },
  auxA: {
    getValue: (barData, stepIndex) => barData.aux_A_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_A_value[stepIndex] ?? 0),
    maxValue: 127,
  },
  auxB: {
    getValue: (barData, stepIndex) => barData.aux_B_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_B_value[stepIndex] ?? 0),
    maxValue: 127,
  },
  auxC: {
    getValue: (barData, stepIndex) => barData.aux_C_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_C_value[stepIndex] ?? 0),
    maxValue: 127,
  },
  auxD: {
    getValue: (barData, stepIndex) => barData.aux_D_value[stepIndex] ?? 0,
    getLabel: (barData, stepIndex) => String(barData.aux_D_value[stepIndex] ?? 0),
    maxValue: 127,
  },
};

export const PatternRow: React.FC<PatternRowProps> = ({
  barData,
  row,
  selectedSteps = [],
  onStepClick,
}) => {
  const config = ROW_CONFIGS[row];

  // Helper to check if a step is selected
  const isStepSelected = (stepIndex: number): boolean => {
    return selectedSteps.includes(stepIndex);
  };

  // Helper to create click handler for a step
  const createStepClickHandler = (stepIndex: number) => {
    if (!onStepClick) {
      return undefined;
    }
    return () => onStepClick(stepIndex);
  };

  // Render 16 BarChart components
  const renderSteps = () => {
    const steps: JSX.Element[] = [];
    const lastStepIndex = barData.last_step - 1; // Convert 1-indexed to 0-indexed

    for (let i = 0; i < 16; i++) {
      const value = config.getValue(barData, i);
      const label = config.getLabel(barData, i);
      const isActive = barData.gate[i] === 1;
      const isTied = barData.tie[i] === 1;
      const isSkipped = barData.skip[i] === 1;
      const isSelected = isStepSelected(i);
      const isLastStep = i === lastStepIndex;
      const isBeyondLast = i > lastStepIndex;

      steps.push(
        <div
          key={i}
          className={styles.stepContainer}
        >
          <BarChart
            value={value}
            maxValue={config.maxValue}
            label={label}
            isActive={isActive}
            isTied={isTied}
            isSkipped={isSkipped}
            isSelected={isSelected}
            isLastStep={isLastStep}
            isBeyondLast={isBeyondLast}
            onClick={createStepClickHandler(i)}
          />
          <div className={styles.stepNumber}>{i + 1}</div>
        </div>
      );
    }

    return steps;
  };

  return (
    <div className={styles.patternRow} data-testid="pattern-row">
      {renderSteps()}
    </div>
  );
};

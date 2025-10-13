/**
 * ColorSwatch Molecule Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ColorSwatch } from './ColorSwatch';

describe('ColorSwatch', () => {
  it('should render with correct color', () => {
    render(
      <ColorSwatch
        color="#ff0000"
        onClick={jest.fn()}
        testId="test-swatch"
      />
    );

    const swatch = screen.getByTestId('test-swatch');
    expect(swatch).toBeInTheDocument();
    expect(swatch).toHaveStyle({ color: '#ff0000' });
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(
      <ColorSwatch
        color="#00ff00"
        onClick={onClick}
        testId="test-swatch"
      />
    );

    const swatch = screen.getByTestId('test-swatch');
    fireEvent.click(swatch);

    expect(onClick).toHaveBeenCalled();
  });

  it('should have default title', () => {
    render(
      <ColorSwatch
        color="#0000ff"
        onClick={jest.fn()}
        testId="test-swatch"
      />
    );

    const swatch = screen.getByTestId('test-swatch');
    expect(swatch).toHaveAttribute('title', 'Change color');
  });

  it('should use custom title when provided', () => {
    render(
      <ColorSwatch
        color="#ff00ff"
        onClick={jest.fn()}
        title="Custom title"
        testId="test-swatch"
      />
    );

    const swatch = screen.getByTestId('test-swatch');
    expect(swatch).toHaveAttribute('title', 'Custom title');
  });
});

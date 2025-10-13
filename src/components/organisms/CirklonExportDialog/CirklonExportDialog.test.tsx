/**
 * Song Arranger - CirklonExportDialog Tests
 * Test-driven development: Write tests first, then implement
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CirklonExportDialog from './CirklonExportDialog';
import type { ExportOptions } from '@/utils/cirklon/export';

describe('CirklonExportDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnExport = jest.fn<(options: ExportOptions) => void>();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnExport.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <CirklonExportDialog
        isOpen={false}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    expect(screen.queryByText(/Export Cirklon/i)).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText(/Export Cirklon/i)).toBeInTheDocument();
  });

  it('should render scene length selector with default value of 8 bars', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const select = screen.getByLabelText(/Scene Length/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('8');
  });

  it('should render scene length options: 4, 8, 16, 32, 64', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const select = screen.getByLabelText(/Scene Length/i);
    const options = select.querySelectorAll('option');

    expect(options).toHaveLength(5);
    expect(options[0]?.value).toBe('4');
    expect(options[1]?.value).toBe('8');
    expect(options[2]?.value).toBe('16');
    expect(options[3]?.value).toBe('32');
    expect(options[4]?.value).toBe('64');
  });

  it('should render beats per bar input with default value of 4', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const input = screen.getByLabelText(/Beats Per Bar/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('4');
  });

  it('should render song name input', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const input = screen.getByLabelText(/Song Name/i);
    expect(input).toBeInTheDocument();
  });

  it('should render Cancel and Export buttons', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByTestId('export-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('export-button')).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const cancelButton = screen.getByTestId('export-cancel-button');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onExport with correct options when Export button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    // Set song name
    const songNameInput = screen.getByLabelText(/Song Name/i);
    await user.clear(songNameInput);
    await user.type(songNameInput, 'My Song');

    // Click export
    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledTimes(1);
    expect(mockOnExport).toHaveBeenCalledWith({
      sceneLengthBars: 8,
      beatsPerBar: 4,
      songName: 'My Song',
      tempo: 120,
    });
  });

  it('should update scene length when selector is changed', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const select = screen.getByLabelText(/Scene Length/i);
    await user.selectOptions(select, '16');

    expect((select as HTMLSelectElement).value).toBe('16');
  });

  it('should update beats per bar when input is changed', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const input = screen.getByLabelText(/Beats Per Bar/i);
    await user.clear(input);
    await user.type(input, '3');

    expect((input as HTMLInputElement).value).toBe('3');
  });

  it('should call onExport with updated values', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    // Change scene length
    const sceneSelect = screen.getByLabelText(/Scene Length/i);
    await user.selectOptions(sceneSelect, '16');

    // Change beats per bar
    const beatsInput = screen.getByLabelText(/Beats Per Bar/i);
    await user.clear(beatsInput);
    await user.type(beatsInput, '3');

    // Set song name
    const songNameInput = screen.getByLabelText(/Song Name/i);
    await user.clear(songNameInput);
    await user.type(songNameInput, 'Custom Song');

    // Click export
    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledWith({
      sceneLengthBars: 16,
      beatsPerBar: 3,
      songName: 'Custom Song',
      tempo: 120,
    });
  });

  it('should validate that beats per bar is a positive number', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const beatsInput = screen.getByLabelText(/Beats Per Bar/i) as HTMLInputElement;
    await user.clear(beatsInput);
    await user.type(beatsInput, '0');

    const exportButton = screen.getByTestId('export-button');

    // Button should be disabled when beats per bar is 0 or negative
    expect(exportButton).toBeDisabled();

    // Verify onExport is not called
    expect(mockOnExport).not.toHaveBeenCalled();
  });

  it('should validate that song name is not empty', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const songNameInput = screen.getByLabelText(/Song Name/i);
    await user.clear(songNameInput);

    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton);

    // Should not call onExport with empty song name
    expect(mockOnExport).not.toHaveBeenCalled();
  });

  it('should close dialog on Escape key press', async () => {
    const user = userEvent.setup();
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should default song name to "Untitled" if not provided', () => {
    render(
      <CirklonExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
      />
    );

    const input = screen.getByLabelText(/Song Name/i) as HTMLInputElement;
    expect(input.value).toBe('Untitled');
  });
});

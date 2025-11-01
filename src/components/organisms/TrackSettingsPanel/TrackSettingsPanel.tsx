/**
 * TrackSettingsPanel - Bottom pane for editing track settings
 * Content extracted from TrackSettingsDialog, displayed in BottomPane instead of modal
 */

import { useState, useEffect } from 'react';
import { BottomPane } from '../BottomPane/BottomPane';
import type { ID } from '@/types';
import type { TrackSettings } from '../TrackSettingsDialog/TrackSettingsDialog';
import styles from './TrackSettingsPanel.module.css';

export interface TrackSettingsPanelProps {
  trackId: ID;
  trackName: string;
  // Current settings
  instrument?: string;
  multiChannel?: number;
  transpose?: number;
  noTranspose?: boolean;
  noFTS?: boolean;
  color?: string;
  height?: number;
  // Available instruments (auto-suggested from existing songs)
  availableInstruments?: string[];
  // Pane settings
  paneHeight: number;
  // Callbacks
  onSave: (settings: TrackSettings) => void;
  onClose: () => void;
  onPaneHeightChange: (height: number) => void;
}

export const TrackSettingsPanel: React.FC<TrackSettingsPanelProps> = ({
  trackId,
  trackName,
  instrument = '',
  multiChannel,
  transpose = 0,
  noTranspose = false,
  noFTS = false,
  color = '#6d8a9e',
  height = 100,
  availableInstruments = [],
  paneHeight,
  onSave,
  onClose,
  onPaneHeightChange,
}) => {
  // Local state for form inputs
  const [localInstrument, setLocalInstrument] = useState(instrument);
  const [localMultiChannel, setLocalMultiChannel] = useState(multiChannel);
  const [localTranspose, setLocalTranspose] = useState(transpose);
  const [localNoTranspose, setLocalNoTranspose] = useState(noTranspose);
  const [localNoFTS, setLocalNoFTS] = useState(noFTS);
  const [localColor, setLocalColor] = useState(color);
  const [localHeight, setLocalHeight] = useState(height);

  // Auto-suggest state for instrument input
  const [instrumentSuggestions, setInstrumentSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update suggestions when instrument input changes
  useEffect(() => {
    if (localInstrument && availableInstruments.length > 0) {
      const filtered = availableInstruments.filter((inst) =>
        inst.toLowerCase().includes(localInstrument.toLowerCase())
      );
      setInstrumentSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setInstrumentSuggestions([]);
      setShowSuggestions(false);
    }
  }, [localInstrument, availableInstruments]);

  const handleSave = () => {
    onSave({
      instrument: localInstrument || undefined,
      multiChannel: localMultiChannel,
      transpose: localTranspose,
      noTranspose: localNoTranspose,
      noFTS: localNoFTS,
      color: localColor,
      height: localHeight,
    });
    onClose();
  };

  return (
    <BottomPane
      id="track-settings"
      title={`Track Settings`}
      subtitle={trackName}
      height={paneHeight}
      resizable
      onClose={onClose}
      onHeightChange={onPaneHeightChange}
      headerRight={
        <button className={styles.buttonSave} onClick={handleSave}>
          Apply
        </button>
      }
    >
      <div className={styles.content}>
        {/* Instrument Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Instrument</div>
          <div className={styles.field}>
            <label htmlFor={`instrument-${trackId}`}>Output:</label>
            <div className={styles.autocompleteWrapper}>
              <input
                id={`instrument-${trackId}`}
                type="text"
                className={styles.input}
                value={localInstrument}
                onChange={(e) => setLocalInstrument(e.target.value)}
                onFocus={() => setShowSuggestions(instrumentSuggestions.length > 0)}
                placeholder="e.g., assimil8r, ob-6, dmux"
              />
              {showSuggestions && instrumentSuggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {instrumentSuggestions.map((inst, idx) => (
                    <div
                      key={idx}
                      className={styles.suggestion}
                      onClick={() => {
                        setLocalInstrument(inst);
                        setShowSuggestions(false);
                      }}
                    >
                      {inst}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={`multichannel-${trackId}`}>
              <input
                id={`multichannel-${trackId}`}
                type="checkbox"
                checked={localMultiChannel !== undefined}
                onChange={(e) => setLocalMultiChannel(e.target.checked ? 1 : undefined)}
              />
              Multi-channel mode
            </label>
          </div>

          {localMultiChannel !== undefined && (
            <div className={styles.field}>
              <label htmlFor={`channel-${trackId}`}>MIDI Channel:</label>
              <input
                id={`channel-${trackId}`}
                type="number"
                className={styles.inputSmall}
                value={localMultiChannel}
                onChange={(e) => setLocalMultiChannel(parseInt(e.target.value))}
                min="1"
                max="16"
              />
            </div>
          )}
        </div>

        {/* Transpose Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Transpose</div>
          <div className={styles.field}>
            <label htmlFor={`transpose-${trackId}`}>Semitones:</label>
            <input
              id={`transpose-${trackId}`}
              type="range"
              className={styles.slider}
              value={localTranspose}
              onChange={(e) => setLocalTranspose(parseInt(e.target.value))}
              min="-36"
              max="36"
              disabled={localNoTranspose}
            />
            <input
              type="number"
              className={styles.inputSmall}
              value={localTranspose}
              onChange={(e) => setLocalTranspose(parseInt(e.target.value))}
              min="-36"
              max="36"
              disabled={localNoTranspose}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={`notranspose-${trackId}`}>
              <input
                id={`notranspose-${trackId}`}
                type="checkbox"
                checked={localNoTranspose}
                onChange={(e) => setLocalNoTranspose(e.target.checked)}
              />
              Disable transpose (for drums)
            </label>
          </div>

          <div className={styles.field}>
            <label htmlFor={`nofts-${trackId}`}>
              <input
                id={`nofts-${trackId}`}
                type="checkbox"
                checked={localNoFTS}
                onChange={(e) => setLocalNoFTS(e.target.checked)}
              />
              Disable force-to-scale
            </label>
          </div>
        </div>

        {/* Appearance Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Appearance</div>
          <div className={styles.field}>
            <label htmlFor={`color-${trackId}`}>Color:</label>
            <div className={styles.colorInput}>
              <input
                id={`color-${trackId}`}
                type="color"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
              />
              <div
                className={styles.colorPreview}
                style={{ backgroundColor: localColor }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={`height-${trackId}`}>Height (px):</label>
            <input
              id={`height-${trackId}`}
              type="number"
              className={styles.inputSmall}
              value={localHeight}
              onChange={(e) => setLocalHeight(parseInt(e.target.value))}
              min="40"
              max="400"
            />
          </div>
        </div>
      </div>
    </BottomPane>
  );
};

export default TrackSettingsPanel;

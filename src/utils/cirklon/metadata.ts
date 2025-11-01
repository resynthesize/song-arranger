/**
 * Cyclone - Metadata Generation
 * Generate _cyclone_metadata for CKS files
 *
 * This module generates the metadata that maps CKS identifiers to React keys
 * and stores UI state for lossless round-trip import/export.
 */

import type { CirklonSongData, CirklonSong, CycloneMetadata } from './types';
import { generateId } from '@/utils/id';
import { MODERN_TRACK_COLORS } from '@/constants';

/**
 * Get track color based on track number
 */
function getTrackColor(trackNum: number): string {
  return MODERN_TRACK_COLORS[(trackNum - 1) % MODERN_TRACK_COLORS.length] || MODERN_TRACK_COLORS[0];
}

/**
 * Extract track number from track key (e.g., "track_1" -> 1)
 */
function extractTrackNumber(trackKey: string): number | null {
  const match = trackKey.match(/^track_(\d+)$/);
  if (!match || !match[1]) {
    return null;
  }
  return parseInt(match[1], 10);
}

/**
 * Collect all unique track keys from scenes
 */
function collectTrackKeys(song: CirklonSong): string[] {
  const trackKeys = new Set<string>();

  Object.entries(song.scenes).forEach(([sceneName, scene]) => {
    if (sceneName === 'workscene') {
      return; // Skip workscene
    }
    if (scene.pattern_assignments) {
      Object.keys(scene.pattern_assignments).forEach((trackKey) => {
        trackKeys.add(trackKey);
      });
    }
  });

  // Sort by track number
  return Array.from(trackKeys).sort((a, b) => {
    const numA = extractTrackNumber(a) || 0;
    const numB = extractTrackNumber(b) || 0;
    return numA - numB;
  });
}

/**
 * Collect all unique pattern names from a song
 */
function collectPatternNames(song: CirklonSong): string[] {
  return Object.keys(song.patterns);
}

/**
 * Get ordered scenes (alphabetically, excluding workscene)
 * Note: This is a fallback for legacy CKS files without metadata.sceneOrder
 */
function getOrderedSceneNames(song: CirklonSong): string[] {
  return Object.entries(song.scenes)
    .filter(([sceneName]) => sceneName !== 'workscene')
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([sceneName]) => sceneName);
}

/**
 * Generate UI mappings for a song
 */
function generateUIMappings(song: CirklonSong): CycloneMetadata['uiMappings'] {
  const uiMappings: CycloneMetadata['uiMappings'] = {
    patterns: {},
    tracks: {},
    scenes: {},
  };

  // Generate pattern mappings
  const patternNames = collectPatternNames(song);
  patternNames.forEach((patternName) => {
    uiMappings.patterns[patternName] = {
      reactKey: generateId('pattern'),
    };
  });

  // Generate track mappings
  const trackKeys = collectTrackKeys(song);
  trackKeys.forEach((trackKey) => {
    const trackNumber = extractTrackNumber(trackKey) || 1;
    uiMappings.tracks[trackKey] = {
      reactKey: generateId('track'),
      color: getTrackColor(trackNumber),
      trackNumber,
    };
  });

  // Generate scene mappings
  const sceneNames = getOrderedSceneNames(song);
  sceneNames.forEach((sceneName) => {
    uiMappings.scenes[sceneName] = {
      reactKey: generateId('scene'),
    };
  });

  return uiMappings;
}

/**
 * Generate default _cyclone_metadata for a CKS file
 * This is called when importing a CKS file that doesn't have metadata
 */
export function generateMetadata(cksData: CirklonSongData): CycloneMetadata {
  // Get the first song (or use empty if no songs)
  const songEntries = Object.entries(cksData.song_data);
  const firstEntry = songEntries[0];
  const currentSongName = firstEntry ? firstEntry[0] : '';
  const currentSong = firstEntry ? firstEntry[1] : null;

  const metadata: CycloneMetadata = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    exportedFrom: 'Cyclone',
    currentSongName,
    uiMappings: {
      patterns: {},
      tracks: {},
      scenes: {},
    },
    trackOrder: [],
    sceneOrder: [],
  };

  // Generate UI mappings if we have a song
  if (currentSong) {
    metadata.uiMappings = generateUIMappings(currentSong);
    metadata.trackOrder = collectTrackKeys(currentSong);
    metadata.sceneOrder = getOrderedSceneNames(currentSong);
  }

  return metadata;
}

/**
 * Ensure a CKS file has _cyclone_metadata
 * If it already has metadata, validate and repair if needed
 * If it doesn't have metadata, generate it
 */
export function ensureMetadata(cksData: CirklonSongData): CirklonSongData {
  // If no metadata, generate it
  if (!cksData._cyclone_metadata) {
    return {
      ...cksData,
      _cyclone_metadata: generateMetadata(cksData),
    };
  }

  // Validate existing metadata
  const metadata = cksData._cyclone_metadata;
  let needsUpdate = false;

  // Ensure version is set
  if (!metadata.version) {
    metadata.version = '2.0.0';
    needsUpdate = true;
  }

  // Ensure currentSongName is valid
  if (!metadata.currentSongName || !cksData.song_data[metadata.currentSongName]) {
    const firstSongName = Object.keys(cksData.song_data)[0];
    metadata.currentSongName = firstSongName || '';
    needsUpdate = true;
  }

  // Ensure uiMappings exists
  if (!metadata.uiMappings) {
    metadata.uiMappings = {
      patterns: {},
      tracks: {},
      scenes: {},
    };
    needsUpdate = true;
  }

  // Ensure trackOrder exists
  if (!metadata.trackOrder) {
    const currentSong = cksData.song_data[metadata.currentSongName];
    metadata.trackOrder = currentSong ? collectTrackKeys(currentSong) : [];
    needsUpdate = true;
  }

  // Ensure sceneOrder exists
  if (!metadata.sceneOrder) {
    const currentSong = cksData.song_data[metadata.currentSongName];
    metadata.sceneOrder = currentSong ? getOrderedSceneNames(currentSong) : [];
    needsUpdate = true;
  }

  // Generate missing mappings for current song
  const currentSong = cksData.song_data[metadata.currentSongName];
  if (currentSong) {
    // Check for missing pattern mappings
    const patternNames = collectPatternNames(currentSong);
    patternNames.forEach((patternName) => {
      if (!metadata.uiMappings.patterns[patternName]) {
        metadata.uiMappings.patterns[patternName] = {
          reactKey: generateId('pattern'),
        };
        needsUpdate = true;
      }
    });

    // Check for missing track mappings
    const trackKeys = collectTrackKeys(currentSong);
    trackKeys.forEach((trackKey) => {
      if (!metadata.uiMappings.tracks[trackKey]) {
        const trackNumber = extractTrackNumber(trackKey) || 1;
        metadata.uiMappings.tracks[trackKey] = {
          reactKey: generateId('track'),
          color: getTrackColor(trackNumber),
          trackNumber,
        };
        needsUpdate = true;
      }
    });

    // Check for missing scene mappings
    const sceneNames = getOrderedSceneNames(currentSong);
    sceneNames.forEach((sceneName) => {
      if (!metadata.uiMappings.scenes[sceneName]) {
        metadata.uiMappings.scenes[sceneName] = {
          reactKey: generateId('scene'),
        };
        needsUpdate = true;
      }
    });
  }

  return needsUpdate ? { ...cksData, _cyclone_metadata: metadata } : cksData;
}

/**
 * Strip _cyclone_metadata from a CKS file for export
 * This produces a clean CKS file that's compatible with Cirklon
 */
export function stripMetadata(cksData: CirklonSongData): Omit<CirklonSongData, '_cyclone_metadata'> {
  const { _cyclone_metadata, ...cleanData } = cksData;
  return cleanData;
}

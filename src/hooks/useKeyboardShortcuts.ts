/**
 * Cyclone - Keyboard Shortcuts Hook
 * Main entry point for keyboard shortcuts functionality
 *
 * This file re-exports the orchestrated keyboard shortcuts from the shortcuts module.
 * The implementation has been split into domain-specific hooks for better organization:
 * - useClipShortcuts: Clip manipulation (delete, duplicate, split, trim, etc.)
 * - useViewShortcuts: View and zoom operations (zoom in/out, frame, etc.)
 * - useLaneShortcuts: Lane manipulation (add, remove, move up/down)
 * - useNavigationShortcuts: Playhead and timeline navigation
 */

export { useKeyboardShortcuts } from './shortcuts';
export type { KeyboardShortcutsState } from './shortcuts';

# Song Arranger

Web-based timeline tool for sketching song structures with retro VT terminal aesthetic.

## Overview

Song Arranger lets you plan out song arrangements in a visual timeline interface similar to Ableton Live's arrange view, but without audio or MIDI processing. Perfect for planning your tracks while away from the studio or collaborating with hardware sequencers like the Sequentix Cirklon.

## Demo

[**Live Demo →**](https://resynthesize.github.io/song-arranger)

## Features

### Timeline & Patterns
- **Track-based timeline** - Organize patterns across multiple horizontal tracks
- **Drag to create** - Click and drag on the timeline to create new patterns
- **Pattern manipulation** - Move, resize, duplicate, split, join, and trim patterns
- **Pattern labels** - Name your patterns for easy identification
- **Pattern types** - Mark patterns as P3 or CK (Cirklon compatibility)
- **Pattern muting** - Mute/unmute individual patterns
- **Rectangle selection** - Select multiple patterns by dragging a selection box
- **Color-coded tracks** - Each track has a customizable color with built-in color picker

### Navigation & View
- **Infinite horizontal scrolling** - Viewport-based rendering for smooth performance
- **Zoom controls** - Zoom in/out horizontally to see more or less detail
- **Vertical zoom** - Adjust track height for better visibility
- **Minimap** - Bird's-eye view of entire arrangement with viewport indicator
- **Playhead** - Visual playback cursor with play/pause controls
- **Frame selection** - Automatically zoom to fit selected patterns or entire arrangement
- **Jump to position** - Quick navigation to specific beat positions

### Project Management
- **Browser storage** - Projects save automatically to local storage
- **Save/Load** - Save current project or load previous projects
- **Save As** - Create copies of projects with new names
- **Project browser** - View and manage all saved projects
- **Delete projects** - Remove unwanted projects
- **Templates** - Set projects as templates for quick starting points
- **Auto-save** - Projects marked as modified until saved

### Import/Export
- **JSON export** - Export arrangements to portable JSON format
- **JSON import** - Import previously exported arrangements
- **Cirklon CKS import** - Load Sequentix Cirklon song files (.CKS)
- **Cirklon CKS export** - Export to Cirklon format with configurable scene lengths (4/8/16/32/64 bars)
- **Preserve pattern types** - Import/export maintains P3 and CK pattern types
- **Mute state preservation** - Import/export maintains pattern mute states

### Keyboard Shortcuts
- **Navigation** - Space (play/pause), arrows (navigate), Home/End (jump), Tab (cycle patterns)
- **Editing** - D (duplicate), Shift+D (duplicate with offset), S (split), J (join), Del (delete), 1-9 (set duration)
- **Pattern** - M (toggle mute), T (toggle pattern type P3↔CK), , . (trim start/end)
- **Selection** - Cmd+A (select all), Cmd+Shift+A (deselect all), arrows (navigate between patterns)
- **View** - [ ] (zoom), Ctrl+Shift+[ ] (vertical zoom), F (frame selection), A (frame all), N (toggle minimap)
- **Commands** - Cmd+Shift+P or F12 (command palette), ? (keyboard help), Cmd+, (settings)

### User Interface
- **Command palette** - Quick access to all commands with fuzzy search
- **Quick input system** - Fast numeric entry for common values (tempo, zoom, snap, etc.)
- **Context menus** - Right-click patterns and tracks for contextual actions
- **Status line** - Real-time feedback for actions and operations
- **Keyboard shortcuts help** - Built-in reference overlay with all shortcuts

### Workflow Features
- **Snap to grid** - Configurable snap values (1/16th, 1/8th, 1/4 note, bars, etc.)
- **Tempo control** - Set BPM for accurate duration calculations
- **Duration display** - See total arrangement duration in bars/beats/time
- **Track reordering** - Drag tracks up/down to reorganize
- **Performance optimized** - Smooth scrolling and interactions even with large arrangements

### Design & Accessibility
- **Retro VT terminal aesthetic** - Inspired by the Monolake 8bit project
- **CRT effects** - Optional scanlines and phosphor glow (toggleable)
- **VT323 font** - Authentic terminal typography
- **Green on black** - Classic terminal color scheme
- **Keyboard-first** - Fully navigable and usable without mouse
- **Reduced motion support** - Respects prefers-reduced-motion preference

## Getting Started

### Quick Start
1. Visit the [live demo](https://resynthesize.github.io/song-arranger)
2. Drag on the timeline to create patterns
3. Press `?` to see all keyboard shortcuts
4. Use the File menu to save/load projects

### Local Development
```bash
# Clone repository
git clone https://github.com/resynthesize/song-arranger.git
cd song-arranger

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

## Usage Tips

- **Start with tracks**: Create tracks for different instruments (kick, bass, lead, etc.)
- **Drag to create**: Click and drag on any track to create a pattern
- **Keyboard shortcuts**: Press `?` to see all available shortcuts
- **Save often**: Use Cmd+S to save your project to browser storage
- **Import Cirklon songs**: Load .CKS files from the File menu to continue work from your hardware sequencer
- **Export for Cirklon**: Export back to .CKS format with configurable scene lengths

## Tech Stack

- **React 18+** with TypeScript (strict mode)
- **Redux Toolkit** for state management
- **Vite** for build tooling
- **Jest + React Testing Library** for testing
- **Canvas API** for pattern rendering
- **CSS Modules** for styling

## Design Inspiration

Inspired by the [Monolake 8bit project](https://roberthenke.com/concerts/monolake8bit.html) with its authentic VT terminal aesthetic and the [Sequentix Cirklon](https://www.sequentix.com/) hardware sequencer workflow.

## Development

See [CLAUDE.md](./CLAUDE.md) for development practices and guidelines.

### Running Tests
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:ci       # Run tests in CI mode
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

Requires a modern browser with ES2020 support.

## Project Status

✅ **Functional** - All core features implemented and tested

Currently in active use and development. See [Linear project](https://linear.app/gamedevs/project/song-arranger-f4f223461148) for planned enhancements.

## Contributing

This is a personal project, but feedback and bug reports are welcome via GitHub issues.

## License

MIT (pending)

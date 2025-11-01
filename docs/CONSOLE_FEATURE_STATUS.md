# Cyclone Live Coding Console - Feature Status

**Last Updated:** 2025-10-22

## Overview

Implementation of a Strudel-inspired live coding console for Cyclone, providing a JavaScript REPL for manipulating CKS song data in real-time.

---

## ✅ Completed Features

### Phase 1: Foundation (COMPLETE)

#### Console UI Components
- ✅ **LiveConsole** organism - Main console container with collapsible state
- ✅ **ConsoleInput** atom - Input field with command history navigation (↑/↓)
- ✅ **ConsoleHistory** molecule - Display of executed commands and their results
- ✅ **ConsoleAutocomplete** molecule - VSCode-style autocomplete dropdown
- ✅ Retro VT terminal aesthetic with CRT effects support
- ✅ Modern theme support with blue color scheme (NO GREEN)
- ✅ Keyboard shortcuts (Cmd/Ctrl+K to toggle visibility)

#### Execution Engine
- ✅ **executeCommand.ts** - Sandboxed JavaScript execution using Function constructor
- ✅ **validateCommand.ts** - Security validation (blocks eval, require, import, etc.)
- ✅ Command history with ↑/↓ navigation
- ✅ Error handling and formatted output

#### Redux Integration
- ✅ **consoleSlice.ts** - State management for console UI and history
- ✅ History persistence
- ✅ Autocomplete state management
- ✅ Current input tracking

### Phase 5: DX Enhancement (Autocomplete - COMPLETE)

#### Autocomplete System
- ✅ **autocomplete.ts** - Context-aware suggestion engine
- ✅ Cursor position tracking for accurate suggestions
- ✅ Property/method detection after dot notation (e.g., `Math.`)
- ✅ Top-level function/variable suggestions
- ✅ Special character handling (hides autocomplete inside `()` `[]` `{}`)
- ✅ Keyboard navigation:
  - ↑/↓ to navigate suggestions
  - Enter to accept suggestion
  - Tab to accept suggestion
  - Escape to close
- ✅ Visual icons for different types (method, property, variable, keyword)
- ✅ Descriptions for all suggestions
- ✅ Auto-insertion of `()` for methods
- ✅ Cursor positioning inside method parentheses

### Phase 2: Core API (COMPLETE)

#### REPL API Structure
- ✅ **replApi.ts** - Full REPL API wired to Redux CKS data
- ✅ State access getters (tracks, patterns, scenes, song)
- ✅ Pattern operations (createPattern, removePattern)
- ✅ Scene operations (createScene, removeScene, assignPattern)
- ✅ Track settings (setTrackColor, setTrackTranspose)
- ✅ Pattern DSL with chainable API: `p(name).bars(n).info()`
- ✅ Music theory helpers (note.midiToName, note.scale, note.chord)
- ✅ Pattern generators (gen.range, gen.repeat, gen.choose, gen.random)
- ✅ Help system with usage examples

#### Architecture
- ✅ Direct CKS manipulation (no adapter layer)
- ✅ Redux actions from songSlice properly wired
- ✅ CirklonPattern creation with correct format
- ✅ Scene positioning and gbar calculation
- ✅ Pattern assignment to tracks in scenes

---

## 🚧 Remaining Work

### Phase 2: Pattern Manipulation (REMAINING)

#### Step-Level Operations (NOT IMPLEMENTED)
These operations require understanding the CKS bar format:

```typescript
// FUTURE: Not yet implemented
p("Bass").steps()           // Get all steps as array
p("Bass").setNote(0, 60)    // Set note at step 0 to C4
p("Bass").setVelocity(0, 100) // Set velocity at step 0
p("Bass").setGate(0, 75)    // Set gate length at step 0
```

**Blocker:** Need to understand CirklonPattern.bars format:
```typescript
bars?: unknown[];  // Array of bar data with 16 steps each
```

**Required Actions:**
1. Document CKS bar format structure
2. Implement step accessor functions
3. Add step mutation functions
4. Add tests for step operations

#### Pattern Note Editing (PLACEHOLDER)
Currently returns: `"Pattern note editing not yet implemented - requires bar format"`

**Required Actions:**
1. Understand how to map MIDI note arrays to CKS bar format
2. Implement `p(name).notes([60, 62, 64])` that creates/modifies bars
3. Handle different pattern types (P3 vs CK)
4. Preserve existing step data (velocity, gate, etc.)

### Phase 3: Strudel-Inspired Modifiers (NOT STARTED)

#### Probabilistic Operations
```typescript
p("Bass").sometimes(0.5, noteArray)  // 50% chance to apply notes
p("Bass").rarely(noteArray)          // 25% chance
p("Bass").often(noteArray)           // 75% chance
```

#### Time-Based Operations
```typescript
p("Bass").every(4, transform)        // Apply every 4 bars
p("Bass").degradeBy(0.3)            // Randomly skip 30% of notes
```

#### Transformations
```typescript
p("Bass").reverse()                  // Reverse note order
p("Bass").palindrome()              // Play forward then backward
p("Bass").rotate(2)                 // Rotate notes by 2 steps
```

### Phase 4: Extended API (NOT STARTED)

#### Track Operations
```typescript
// These don't make sense in CKS - tracks are implicit
// May need to rethink or skip this phase
```

#### Scene Operations (PARTIAL)
- ✅ createScene
- ✅ removeScene
- ✅ assignPattern
- ❌ Scene playback control
- ❌ Scene copying/duplication
- ❌ Scene loop settings

#### File Operations (NOT STARTED)
```typescript
saveSong(filename)          // Export to CKS
loadSong(filename)          // Import from CKS
exportMidi(filename)        // Export to MIDI
```

### Phase 6: Advanced Features (NOT STARTED)

#### Pattern Library
```typescript
// Pre-built pattern generators
patterns.euclidean(steps, pulses)  // Euclidean rhythm
patterns.arpeggio(notes, style)    // Arpeggiator
patterns.randomWalk(start, range)  // Random walk melody
```

#### Live Performance Tools
```typescript
// MIDI input integration
// Pattern recording from MIDI
// Macro system for complex operations
```

---

## 🐛 Known Issues

### Minor Issues
1. **Console font size** - Set to `--font-size-xs` to match track labels
2. **Autocomplete positioning** - Always appears above input (may need adjustment)
3. **Error messages** - Could be more descriptive for CKS-specific errors

### Testing Gaps
- ❌ No unit tests for REPL API functions
- ❌ No integration tests for pattern creation/modification
- ❌ No E2E tests for console commands
- ✅ E2E tests exist for autocomplete UI only

---

## 📝 Documentation Needs

### User Documentation
- ❌ Console user guide
- ❌ API reference documentation
- ❌ Example workflows and tutorials
- ❌ Keyboard shortcuts reference

### Developer Documentation
- ❌ CKS bar format specification
- ❌ Pattern manipulation guide
- ❌ Extending the REPL API guide

---

## 🎯 Current Capabilities

### What Works Now

```javascript
// View state
tracks              // List all tracks
patterns            // List all patterns
scenes              // List all scenes
song                // View CKS song data

// Create patterns and scenes
createPattern("Bass", { bars: 4 })
createScene("Intro", 8)
assignPattern("Intro", "track_1", "Bass")

// Modify patterns
p("Bass").bars(8)        // Change length
p("Bass").info()         // Get pattern info

// Track settings
setTrackColor("track_1", "#ff0000")
setTrackTranspose("track_1", 12)

// Music theory helpers
note.midiToName(60)                        // "C4"
note.nameToMidi("A4")                      // 69
note.scale(60, "major")                    // [60, 62, 64, 65, 67, 69, 71]
note.chord(60, "maj7")                     // [60, 64, 67, 71]

// Generators
gen.range(60, 72, 2)                       // [60, 62, 64, 66, 68, 70]
gen.repeat([60, 62, 64], 3)               // [60, 62, 64, 60, 62, 64, ...]
gen.choose([60, 64, 67])                   // Random note from array
gen.random(60, 72)                         // Random number 60-72
```

### What Doesn't Work Yet

```javascript
// Step-level operations - NOT IMPLEMENTED
p("Bass").steps()                          // ❌ Needs bar format understanding
p("Bass").setNote(0, 60)                   // ❌ Needs bar format understanding
p("Bass").notes([60, 62, 64, 65])         // ❌ Returns error message

// Strudel-inspired modifiers - NOT IMPLEMENTED
p("Bass").sometimes(0.5, transform)        // ❌ Phase 3
p("Bass").reverse()                        // ❌ Phase 3
p("Bass").degradeBy(0.3)                   // ❌ Phase 3
```

---

## 🔍 Technical Architecture

### Data Flow
```
User Input → ConsoleInput
          ↓
    executeCommand.ts
          ↓
    Function() sandbox
          ↓
    replApi.ts (context)
          ↓
    Redux songSlice actions
          ↓
    CKS data mutation
          ↓
    Selectors recompute
          ↓
    UI updates
```

### CKS Integration
- ✅ Direct manipulation of `state.song` (CirklonSongData)
- ✅ Uses `songSlice` actions (addPattern, updatePattern, addScene, etc.)
- ✅ Respects metadata structure (uiMappings, trackOrder, sceneOrder)
- ✅ Generates stable React keys for new entities

### Security Model
- ✅ Function constructor sandbox (not direct eval)
- ✅ Restricted context (no window, document, process, etc.)
- ✅ Pattern validation blocks dangerous operations
- ✅ Read-only state getters

---

## 📋 Next Steps (Priority Order)

### High Priority
1. **Understand CKS Bar Format** - Critical blocker for note editing
2. **Implement p(name).notes()** - Core feature for pattern editing
3. **Add step-level operations** - setNote, setVelocity, setGate
4. **Write unit tests** - Test REPL API functions
5. **User documentation** - How to use the console

### Medium Priority
6. **Phase 3 modifiers** - sometimes, rarely, reverse, etc.
7. **Scene playback control** - Integration with transport
8. **File operations** - Save/load functionality
9. **Integration tests** - Full workflow testing

### Low Priority
10. **Pattern library** - Pre-built generators
11. **Live performance tools** - MIDI input, recording
12. **Macro system** - Complex operation sequences

---

## 📖 References

### Related Files
- Core: `src/utils/console/` - Console utilities
- Components: `src/components/organisms/LiveConsole/` - Console UI
- Redux: `src/store/slices/consoleSlice.ts` - Console state
- Redux: `src/store/slices/songSlice.ts` - CKS data mutations
- Types: `src/utils/cirklon/types.ts` - CKS format definitions

### External Inspiration
- [Strudel Live Coding](https://strudel.cc/) - Pattern DSL inspiration
- [TidalCycles](https://tidalcycles.org/) - Live coding paradigms
- [Monolake 8bit](https://roberthenke.com/concerts/monolake8bit.html) - Visual aesthetic

---

## ✨ Design Decisions

### Why CKS-Native?
- No impedance mismatch between console and file format
- Direct manipulation eliminates adapter layer complexity
- Changes immediately visible in UI via selectors
- Export/save already works (CKS is the source of truth)

### Why Pattern Names Instead of IDs?
- CKS uses pattern names as keys (`patterns: { [name]: pattern }`)
- More intuitive for users (`p("Bass")` vs `p(123)`)
- Matches Cirklon hardware workflow

### Why No Track Operations?
- In CKS, tracks are implicit (defined by pattern assignments)
- You don't "create" a track, you assign a pattern to `track_N` in a scene
- This matches Cirklon hardware behavior

### Why Chainable API?
- Inspired by Strudel's fluent API
- Enables expressive one-liners: `p("Bass").bars(8).info()`
- Natural for live coding workflows

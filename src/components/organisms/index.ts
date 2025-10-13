// Organisms - Complex, standalone components

// Timeline organisms
export { default as Timeline } from './Timeline/Timeline';
export type { TimelineProps } from './Timeline/Timeline';

export { default as Lane } from './Lane/Lane';
export type { LaneProps } from './Lane/Lane';

export { default as Clip } from './Clip/Clip';
export type { ClipProps } from './Clip/Clip';

export { default as Ruler } from './Ruler/Ruler';
export type { RulerProps } from './Ruler/Ruler';

export { default as Minimap } from './Minimap/Minimap';
export type { MinimapProps } from './Minimap/Minimap';

export { ColorPicker } from './ColorPicker/ColorPicker';
export type { ColorPickerProps } from './ColorPicker/ColorPicker';

// Navigation organisms
export { default as MenuBar } from './MenuBar/MenuBar';
export { default as CommandFooter } from './CommandFooter/CommandFooter';
export { TerminalMenu } from './TerminalMenu/TerminalMenu';
export type { TerminalMenuProps, TerminalMenuItem } from './TerminalMenu/TerminalMenu';
export { FileMenu } from './FileMenu/FileMenu';
export type { FileMenuProps } from './FileMenu/FileMenu';
export { default as HUD } from './HUD/HUD';

// Dialog organisms
export { CommandPalette } from './CommandPalette/CommandPalette';
export { default as Help } from './Help/Help';
export { default as KeyboardHelp } from './KeyboardHelp/KeyboardHelp';
export { default as ProjectSelector } from './ProjectSelector/ProjectSelector';
export { QuickInput } from './QuickInput/QuickInput';
export { default as SaveAsDialog } from './SaveAsDialog/SaveAsDialog';
export { default as ContextMenu } from './ContextMenu/ContextMenu';
export type { MenuItem } from './ContextMenu/ContextMenu';

// Other organisms
export { default as BootSequence } from './BootSequence/BootSequence';

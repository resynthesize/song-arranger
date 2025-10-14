/**
 * Cyclone - TimelineTemplate
 * Main timeline page layout combining MenuBar, Timeline, and CommandFooter
 */

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import MenuBar from '../../organisms/MenuBar';
import Timeline from '../../organisms/Timeline';
import CommandFooter from '../../organisms/CommandFooter';
import StatusLine from '../../organisms/StatusLine';
import PatternEditor from '../../organisms/PatternEditor/PatternEditor';
import { ResizableDivider } from '../../molecules/ResizableDivider';
import { setEditorHeight } from '@/store/slices/patternEditorSlice';
import './TimelineTemplate.css';

interface TimelineTemplateProps {
  hasSelection: boolean;
  selectionCount: number;
  isEditing: boolean;
}

const TimelineTemplate = ({ hasSelection, selectionCount, isEditing }: TimelineTemplateProps) => {
  const dispatch = useAppDispatch();

  // Get pattern editor state from Redux
  const openPatternId = useAppSelector((state) => state.patternEditor.openPatternId);

  // Handle resizing the pattern editor pane
  const handleEditorResize = useCallback(
    (newHeight: number) => {
      dispatch(setEditorHeight(newHeight));
    },
    [dispatch]
  );

  return (
    <div className="timeline-template" data-testid="timeline-template">
      <MenuBar />

      {/* Main content area with conditional height based on editor visibility */}
      <div className="timeline-template__content">
        <Timeline />
      </div>

      {/* Resizable divider (only when editor is open) */}
      {openPatternId && (
        <ResizableDivider
          onResize={handleEditorResize}
          minHeight={200}
          maxHeight={600}
        />
      )}

      {/* Pattern editor pane (conditional) */}
      <PatternEditor />

      <StatusLine />
      <CommandFooter
        hasSelection={hasSelection}
        selectionCount={selectionCount}
        isEditing={isEditing}
      />
    </div>
  );
};

export default TimelineTemplate;

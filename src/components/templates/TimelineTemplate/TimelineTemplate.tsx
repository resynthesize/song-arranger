/**
 * Song Arranger - TimelineTemplate
 * Main timeline page layout combining MenuBar, Timeline, and CommandFooter
 */

import MenuBar from '../../organisms/MenuBar';
import Timeline from '../../organisms/Timeline';
import CommandFooter from '../../organisms/CommandFooter';
import './TimelineTemplate.css';

interface TimelineTemplateProps {
  hasSelection: boolean;
  selectionCount: number;
  isEditing: boolean;
}

const TimelineTemplate = ({ hasSelection, selectionCount, isEditing }: TimelineTemplateProps) => {
  return (
    <div className="timeline-template" data-testid="timeline-template">
      <MenuBar />
      <Timeline />
      <CommandFooter
        hasSelection={hasSelection}
        selectionCount={selectionCount}
        isEditing={isEditing}
      />
    </div>
  );
};

export default TimelineTemplate;

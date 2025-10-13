/**
 * Song Arranger - ProjectSelector Component
 * Retro terminal-styled project selection dialog
 */

import { useEffect, useState } from 'react';
import { TerminalPanel } from '../TerminalPanel';
import type { ProjectFile } from '@/utils/storage';
import './ProjectSelector.css';

interface ProjectSelectorProps {
  projects: ProjectFile[];
  title: string;
  mode: 'load' | 'delete';
  onSelect: (project: ProjectFile) => void;
  onClose: () => void;
}

const ProjectSelector = ({ projects, title, mode, onSelect, onClose }: ProjectSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (projects[selectedIndex]) {
          onSelect(projects[selectedIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, projects.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onSelect, projects, selectedIndex]);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    if (diffDays === 1) return 'YESTERDAY';
    if (diffDays < 7) return `${diffDays}D AGO`;

    // Format as MM/DD/YY for older dates
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  const handleProjectClick = (project: ProjectFile, index: number) => {
    setSelectedIndex(index);
    onSelect(project);
  };

  return (
    <div className="project-selector">
      <TerminalPanel title={title} variant="elevated" padding="md">
        <div className="project-selector__content">
          {projects.length === 0 ? (
            <div className="project-selector__empty">
              <p>NO SAVED PROJECTS FOUND</p>
            </div>
          ) : (
            <>
              <div className="project-selector__list">
                {projects.map((project, index) => (
                  <button
                    key={project.id}
                    className={`project-selector__item ${
                      index === selectedIndex ? 'project-selector__item--selected' : ''
                    }`}
                    onClick={() => handleProjectClick(project, index)}
                    data-testid={`project-item-${project.id}`}
                  >
                    <span className="project-selector__item-indicator">
                      {index === selectedIndex ? '>' : ' '}
                    </span>
                    <span className="project-selector__item-name">
                      {project.name}
                      {project.isTemplate && (
                        <span className="project-selector__item-badge"> [TEMPLATE]</span>
                      )}
                    </span>
                    <span className="project-selector__item-date">
                      {formatDate(project.updatedAt)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="project-selector__footer">
                <div className="project-selector__stats">
                  PROJECT {selectedIndex + 1}/{projects.length}
                </div>
                <div className="project-selector__instructions">
                  [↑↓] NAVIGATE [{mode === 'load' ? 'ENTER' : 'ENTER'}] {mode === 'load' ? 'LOAD' : 'DELETE'} [ESC] CANCEL
                </div>
              </div>
            </>
          )}
        </div>
      </TerminalPanel>
    </div>
  );
};

export default ProjectSelector;

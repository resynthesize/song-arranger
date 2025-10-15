/**
 * Cyclone - ProjectSelector Component
 * Sleek, compact project selection dialog
 */

import { useEffect, useState, useRef } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll selected item into view
  useEffect(() => {
    const selectedElement = dialogRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return '1d';
    if (diffDays < 7) return `${diffDays}d`;

    // Format as MM/DD for older dates
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const handleProjectClick = (project: ProjectFile, index: number) => {
    setSelectedIndex(index);
    onSelect(project);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="project-selector" onClick={handleBackdropClick}>
      <div className="project-selector__dialog" ref={dialogRef}>
        <div className="project-selector__header">
          <h2 className="project-selector__title">{title}</h2>
          <button className="project-selector__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="project-selector__empty">
            No saved projects
          </div>
        ) : (
          <>
            <div className="project-selector__list">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  data-index={index}
                  className={`project-selector__item ${
                    index === selectedIndex ? 'project-selector__item--selected' : ''
                  }`}
                  onClick={() => handleProjectClick(project, index)}
                  data-testid={`project-item-${project.id}`}
                >
                  <div className="project-selector__item-main">
                    <span className="project-selector__item-name">
                      {project.name}
                    </span>
                    {project.isTemplate && (
                      <span className="project-selector__item-badge">TEMPLATE</span>
                    )}
                  </div>
                  <span className="project-selector__item-date">
                    {formatDate(project.updatedAt)}
                  </span>
                </button>
              ))}
            </div>

            <div className="project-selector__footer">
              <span className="project-selector__hint">
                ↑↓ Navigate · Enter {mode === 'load' ? 'Load' : 'Delete'} · Esc Cancel
              </span>
              <span className="project-selector__count">
                {selectedIndex + 1}/{projects.length}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;

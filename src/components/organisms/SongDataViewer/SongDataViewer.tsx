/**
 * Cyclone - Song Data Viewer
 * Displays current Redux state as collapsible tree for debugging
 */

import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import styles from './SongDataViewer.module.css';

interface SongDataViewerProps {
  onClose: () => void;
}

interface JSONTreeNodeProps {
  name: string;
  value: unknown;
  depth: number;
  isLast: boolean;
  path: string;
  changeType?: 'added' | 'modified' | 'removed';
  getChangeType?: (path: string) => 'added' | 'modified' | 'removed' | undefined;
}

const JSONTreeNode = ({ name, value, depth, isLast, path, changeType, getChangeType }: JSONTreeNodeProps) => {
  const [isCollapsed, setIsCollapsed] = useState(depth > 2); // Auto-collapse after depth 2
  const [animatedChangeType, setAnimatedChangeType] = useState<'added' | 'modified' | 'removed' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Trigger animation when changeType changes
  useEffect(() => {
    if (changeType) {
      setAnimatedChangeType(changeType);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Remove highlight after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setAnimatedChangeType(null);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [changeType]);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const renderValue = () => {
    if (value === null) return <span className={styles.null}>null</span>;
    if (value === undefined) return <span className={styles.undefined}>undefined</span>;
    if (typeof value === 'string') return <span className={styles.string}>"{value}"</span>;
    if (typeof value === 'number') return <span className={styles.number}>{value}</span>;
    if (typeof value === 'boolean') return <span className={styles.boolean}>{String(value)}</span>;
    return <span>{String(value)}</span>;
  };

  const getPreview = () => {
    if (isArray) {
      const arr = value as unknown[];
      return arr.length === 0 ? '[]' : `[${arr.length}]`;
    }
    if (isObject) {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      return keys.length === 0 ? '{}' : `{${keys.length}}`;
    }
    return '';
  };

  if (!isExpandable) {
    const highlightClass = animatedChangeType ? styles[`highlight-${animatedChangeType}`] : '';
    return (
      <div
        className={`${styles.treeNode} ${highlightClass}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        data-path={path}
      >
        <span className={styles.key}>{name}:</span>{' '}
        {renderValue()}
        {!isLast && <span className={styles.comma}>,</span>}
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((item, idx) => [String(idx), item] as const)
    : Object.entries(value as Record<string, unknown>);

  const highlightClass = animatedChangeType ? styles[`highlight-${animatedChangeType}`] : '';

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.expandable} ${highlightClass}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        data-path={path}
      >
        <span className={styles.arrow}>{isCollapsed ? '▶' : '▼'}</span>
        <span className={styles.key}>{name}:</span>{' '}
        {isCollapsed ? (
          <span className={styles.preview}>{getPreview()}</span>
        ) : (
          <span className={styles.bracket}>{isArray ? '[' : '{'}</span>
        )}
      </div>
      {!isCollapsed && (
        <>
          {entries.map(([key, val], idx) => {
            const childPath = `${path}.${key}`;
            return (
              <JSONTreeNode
                key={key}
                name={key}
                value={val}
                depth={depth + 1}
                isLast={idx === entries.length - 1}
                path={childPath}
                changeType={getChangeType?.(childPath)}
                getChangeType={getChangeType}
              />
            );
          })}
          <div className={styles.treeNode} style={{ paddingLeft: `${depth * 16}px` }}>
            <span className={styles.bracket}>{isArray ? ']' : '}'}</span>
            {!isLast && <span className={styles.comma}>,</span>}
          </div>
        </>
      )}
    </div>
  );
};

const SongDataViewer = ({ onClose }: SongDataViewerProps) => {
  // Get the entire song state from Redux - this will auto-update when state changes
  const songState = useAppSelector((state) => state.song);
  const prevStateRef = useRef<typeof songState>(songState);
  const [changes, setChanges] = useState<Map<string, 'added' | 'modified' | 'removed'>>(new Map());

  // Detect changes between previous and current state
  useEffect(() => {
    const detectChanges = (
      prev: unknown,
      current: unknown,
      path: string = 'song'
    ): Map<string, 'added' | 'modified' | 'removed'> => {
      const changedPaths = new Map<string, 'added' | 'modified' | 'removed'>();

      // Handle null/undefined
      if (prev === null || prev === undefined || current === null || current === undefined) {
        if (prev !== current) {
          changedPaths.set(path, prev === null || prev === undefined ? 'added' : 'removed');
        }
        return changedPaths;
      }

      // Handle primitives
      const prevType = typeof prev;
      const currentType = typeof current;

      if (prevType !== 'object' || currentType !== 'object') {
        if (prev !== current) {
          changedPaths.set(path, 'modified');
        }
        return changedPaths;
      }

      // Handle arrays
      if (Array.isArray(prev) && Array.isArray(current)) {
        const maxLength = Math.max(prev.length, current.length);
        for (let i = 0; i < maxLength; i++) {
          if (i >= prev.length) {
            changedPaths.set(`${path}.${i}`, 'added');
          } else if (i >= current.length) {
            changedPaths.set(`${path}.${i}`, 'removed');
          } else {
            const subChanges = detectChanges(prev[i], current[i], `${path}.${i}`);
            subChanges.forEach((type, subPath) => changedPaths.set(subPath, type));
          }
        }
        return changedPaths;
      }

      // Handle objects
      if (typeof prev === 'object' && typeof current === 'object' && !Array.isArray(prev) && !Array.isArray(current)) {
        const prevObj = prev as Record<string, unknown>;
        const currentObj = current as Record<string, unknown>;

        const allKeys = new Set([...Object.keys(prevObj), ...Object.keys(currentObj)]);

        allKeys.forEach((key) => {
          const prevHasKey = key in prevObj;
          const currentHasKey = key in currentObj;

          if (!prevHasKey && currentHasKey) {
            changedPaths.set(`${path}.${key}`, 'added');
          } else if (prevHasKey && !currentHasKey) {
            changedPaths.set(`${path}.${key}`, 'removed');
          } else {
            const subChanges = detectChanges(prevObj[key], currentObj[key], `${path}.${key}`);
            subChanges.forEach((type, subPath) => changedPaths.set(subPath, type));
          }
        });
      }

      return changedPaths;
    };

    const newChanges = detectChanges(prevStateRef.current, songState);

    if (newChanges.size > 0) {
      setChanges(newChanges);
    }

    prevStateRef.current = songState;
  }, [songState]);

  // Helper to get change type for a path
  const getChangeType = (path: string): 'added' | 'modified' | 'removed' | undefined => {
    return changes.get(path);
  };

  return (
    <div className={styles.viewer} data-testid="song-data-viewer">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Song Data Viewer</h2>
          <div className={styles.metadata}>
            <span className={styles.shortcut}>Ctrl+.</span> to toggle • Updates in real-time
          </div>
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          data-testid="song-data-viewer-close"
        >
          Close
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.tree}>
          <JSONTreeNodeWithChanges
            name="song"
            value={songState}
            depth={0}
            isLast={true}
            path="song"
            getChangeType={getChangeType}
          />
        </div>
      </div>
    </div>
  );
};

// Wrapper to inject change detection
const JSONTreeNodeWithChanges = ({
  path,
  getChangeType,
  ...props
}: Omit<JSONTreeNodeProps, 'changeType'> & {
  getChangeType: (path: string) => 'added' | 'modified' | 'removed' | undefined;
}) => {
  return <JSONTreeNode {...props} path={path} changeType={getChangeType(path)} />;
};

export default SongDataViewer;

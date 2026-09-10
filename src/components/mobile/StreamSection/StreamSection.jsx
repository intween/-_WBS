/**
 * 모바일 스트림 섹션 — 접기/펼치기 아코디언.
 */
import { useState } from 'react';
import { Icon } from '@/components/common';
import TaskCard from '@/components/board/TaskCard/TaskCard';
import './StreamSection.scss';

/**
 * @param {Object} props
 * @param {Object} props.stream
 * @param {Array} props.tasks
 * @param {Object} props.stateMap
 * @param {Object} props.memberMap
 * @param {Object} props.commentCounts
 * @param {Object} props.highlights
 * @param {string|null} props.selectedTaskId
 * @param {Function} props.onSelect
 */
function StreamSection({
  stream,
  tasks = [],
  stateMap,
  memberMap,
  commentCounts,
  highlights,
  selectedTaskId,
  onSelect,
}) {
  const [open, setOpen] = useState(true);

  if (tasks.length === 0) return null;

  return (
    <section className="stream-section" style={{ borderLeftColor: stream.color }}>
      <button
        type="button"
        className="stream-section__head"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} />
        <span className="stream-section__name">{stream.name}</span>
        <span className="stream-section__count is-numeric">{tasks.length}</span>
      </button>

      {open && (
        <ul className="stream-section__list">
          {tasks.map((task) => {
            const state = stateMap[task.id];
            return (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  state={state}
                  member={state?.owner_id ? memberMap[state.owner_id] : null}
                  commentCount={commentCounts[task.id] || 0}
                  highlighted={Boolean(highlights[task.id])}
                  selected={selectedTaskId === task.id}
                  onSelect={onSelect}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default StreamSection;

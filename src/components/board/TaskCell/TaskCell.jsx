/**
 * 스윔레인 한 칸 (워크스트림 × 기간).
 * 업무가 없는 칸은 비활성 배경으로 비워둔다.
 */
import { memo } from 'react';
import TaskCard from '../TaskCard/TaskCard';
import './TaskCell.scss';

/**
 * @param {Object} props
 * @param {Array} props.tasks - 이 칸에 속한 업무 (필터 적용 후)
 * @param {boolean} props.hasAnyTask - 필터 이전에 원래 업무가 있었는지
 * @param {Object} props.stateMap
 * @param {Object} props.memberMap
 * @param {Object} props.commentCounts
 * @param {Object} props.highlights
 * @param {string|null} props.selectedTaskId
 * @param {Function} props.onSelect
 */
function TaskCell({
  tasks = [],
  hasAnyTask = false,
  stateMap,
  memberMap,
  commentCounts,
  highlights,
  selectedTaskId,
  onSelect,
}) {
  const isEmpty = tasks.length === 0;

  return (
    <div
      className={[
        'task-cell',
        isEmpty && 'task-cell--empty',
        isEmpty && !hasAnyTask && 'task-cell--inactive',
      ]
        .filter(Boolean)
        .join(' ')}
      role="gridcell"
    >
      {tasks.map((task) => {
        const state = stateMap[task.id];
        return (
          <TaskCard
            key={task.id}
            task={task}
            state={state}
            member={state?.owner_id ? memberMap[state.owner_id] : null}
            commentCount={commentCounts[task.id] || 0}
            highlighted={Boolean(highlights[task.id])}
            selected={selectedTaskId === task.id}
            onSelect={onSelect}
          />
        );
      })}

      {/* 원래는 업무가 있는데 필터로 가려진 칸 */}
      {isEmpty && hasAnyTask && <span className="task-cell__filtered">필터로 가려짐</span>}
    </div>
  );
}

export default memo(TaskCell);

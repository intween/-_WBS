import { memo } from 'react';
import { Icon, StatusMark } from '@/components/common';
import { OVERDUE_LABEL, getStatus, isCompleted } from '@/constants/status';
import { useUi, useUiActions } from '@/context/hooks';
import { useTaskDragSource } from '@/hooks/useDragTask';
import { splitByQuery } from '@/utils/filter';
import { detailSummary, hasDetail, isDelayed } from '@/utils/progress';
import './TaskChip.scss';

const TaskChip = ({ task, draggable = true, todayISO }) => {
  const { selectTask } = useUiActions();
  const { draggingTaskId, filters } = useUi();
  const dragProps = useTaskDragSource(task.id, draggable && !task.dimmed);
  const status = getStatus(task.status);
  const delayed = isDelayed(task, todayISO);

  const classes = [
    'task-chip',
    isCompleted(task.status) ? 'task-chip--done' : '',
    draggingTaskId === task.id ? 'task-chip--dragging' : '',
    task.dimmed ? 'task-chip--dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      data-stream={task.stream}
      data-status={task.status}
      data-overdue={delayed || undefined}
      tabIndex={task.dimmed ? -1 : undefined}
      aria-hidden={task.dimmed || undefined}
      aria-label={`${task.title}, ${task.streamName}, ${status.label}${delayed ? `, ${OVERDUE_LABEL}` : ''}`}
      onClick={() => selectTask(task.id)}
      {...dragProps}
    >
      <span className="task-chip__bar" aria-hidden="true" />
      <StatusMark status={task.status} />
      <span className="task-chip__title">
        {splitByQuery(task.title, filters.query).map((part, index) =>
          part.matched ? (
            <mark key={index} className="task-chip__match">
              {part.text}
            </mark>
          ) : (
            part.text
          ),
        )}
      </span>
      {hasDetail(task) && (
        <Icon name="document" size={12} className="task-chip__detail" title={detailSummary(task)} />
      )}
      {delayed && <Icon name="bang" size={12} className="task-chip__alert" />}
    </button>
  );
};

export default memo(TaskChip);

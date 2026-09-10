import { memo } from 'react';
import { Badge } from '@/components/common';
import { OVERDUE_LABEL, getStatus, isCompleted } from '@/constants/status';
import { useUiActions } from '@/context/hooks';
import { checklistProgress, isDelayed } from '@/utils/progress';

const AgendaTaskItem = ({ task, todayISO }) => {
  const { selectTask } = useUiActions();
  const status = getStatus(task.status);
  const delayed = isDelayed(task, todayISO);
  const checklist = checklistProgress(task.checklist);

  const classes = [
    'agenda-task',
    isCompleted(task.status) ? 'agenda-task--done' : '',
    delayed ? 'agenda-task--delayed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li>
      <button
        type="button"
        className={classes}
        data-stream={task.stream}
        data-status={task.status}
        data-overdue={delayed || undefined}
        aria-label={`${task.title}, ${task.streamName}, ${status.label}`}
        onClick={() => selectTask(task.id)}
      >
        <span className="agenda-task__bar" aria-hidden="true" />
        <span className="agenda-task__text">
          <span className="agenda-task__title">{task.title}</span>
          <span className="agenda-task__meta">
            {task.streamName}
            {checklist.total > 0 && ` · 체크 ${checklist.done}/${checklist.total}`}
          </span>
        </span>
        {delayed ? (
          <Badge overdue>{OVERDUE_LABEL}</Badge>
        ) : (
          <Badge status={status.key} dot>
            {status.label}
          </Badge>
        )}
      </button>
    </li>
  );
};

export default memo(AgendaTaskItem);

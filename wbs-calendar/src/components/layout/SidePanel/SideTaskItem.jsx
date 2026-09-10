import { memo } from 'react';
import { StatusMark } from '@/components/common';
import { getStatus } from '@/constants/status';
import { useUi, useUiActions } from '@/context/hooks';
import { formatRelativeDue } from '@/utils/date';

const SideTaskItem = ({ task, todayISO, isDelayed }) => {
  const { selectedTaskId } = useUi();
  const { selectTask } = useUiActions();
  const status = getStatus(task.status);
  const relative = formatRelativeDue(task.dueDate, todayISO);

  const classes = [
    'side-task',
    isDelayed ? 'side-task--delayed' : '',
    selectedTaskId === task.id ? 'side-task--selected' : '',
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
        data-overdue={isDelayed || undefined}
        aria-label={`${task.title}, ${status.label}, ${relative}`}
        onClick={() => selectTask(task.id)}
      >
        <span className="side-task__bar" aria-hidden="true" />
        <StatusMark status={task.status} />
        <span className="side-task__title">{task.title}</span>
        <span className="side-task__date">{relative}</span>
      </button>
    </li>
  );
};

export default memo(SideTaskItem);

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelectedTask, useUiActions } from '@/context/hooks';
import TaskDetailBody from './TaskDetailBody';
import TaskDetailHeader from './TaskDetailHeader';
import './TaskDetail.scss';

const TaskDetail = () => {
  const task = useSelectedTask();
  const panelRef = useRef(null);
  const { closeDetail } = useUiActions();
  const taskId = task?.id;

  useEffect(() => {
    if (taskId) panelRef.current?.focus();
  }, [taskId]);

  if (!task) return null;

  return createPortal(
    <aside
      ref={panelRef}
      className="task-detail"
      aria-label={`${task.title} 상세`}
      tabIndex={-1}
    >
      <TaskDetailHeader task={task} onClose={closeDetail} />
      <TaskDetailBody task={task} />
    </aside>,
    document.body,
  );
};

export default TaskDetail;

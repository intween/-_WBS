import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/common';
import { useSelectedTask, useTaskActions, useUiActions } from '@/context/hooks';
import TaskDetailBody from './TaskDetailBody';
import TaskDetailHeader from './TaskDetailHeader';
import './TaskDetail.scss';

const TaskDetail = () => {
  const task = useSelectedTask();
  const panelRef = useRef(null);
  const { closeDetail } = useUiActions();
  const { deleteTask } = useTaskActions();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const taskId = task?.id;

  useEffect(() => {
    if (taskId) panelRef.current?.focus();
    setIsConfirmingDelete(false);
  }, [taskId]);

  if (!task) return null;

  const handleDelete = async () => {
    setIsConfirmingDelete(false);
    const removed = await deleteTask(task.id);
    if (removed) closeDetail();
  };

  return createPortal(
    <>
      <aside
        ref={panelRef}
        className="task-detail"
        aria-label={`${task.title} 상세`}
        tabIndex={-1}
      >
        <TaskDetailHeader
          task={task}
          onClose={closeDetail}
          onRequestDelete={() => setIsConfirmingDelete(true)}
        />
        <TaskDetailBody task={task} />
      </aside>

      <Modal
        isOpen={isConfirmingDelete}
        title="이 업무를 삭제할까요"
        description={`"${task.title}" 과 여기 적힌 상태, 체크리스트, 링크, 메모가 모두 지워집니다. 되돌릴 수 없습니다`}
        confirmLabel="삭제"
        tone="danger"
        onConfirm={handleDelete}
        onClose={() => setIsConfirmingDelete(false)}
      />
    </>,
    document.body,
  );
};

export default TaskDetail;

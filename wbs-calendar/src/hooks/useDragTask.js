import { useCallback, useState } from 'react';
import { DRAG_DATA_TYPE } from '@/constants/views';
import { useTaskActions, useUi, useUiActions } from '@/context/hooks';

export const useTaskDragSource = (taskId, enabled) => {
  const { setDragging } = useUiActions();

  const onDragStart = useCallback(
    (event) => {
      event.dataTransfer.setData(DRAG_DATA_TYPE, taskId);
      event.dataTransfer.effectAllowed = 'move';
      setDragging(taskId);
    },
    [taskId, setDragging],
  );

  const onDragEnd = useCallback(() => setDragging(null), [setDragging]);

  if (!enabled) return { draggable: false };

  return { draggable: true, onDragStart, onDragEnd };
};

export const useDayDropTarget = (dateISO, enabled) => {
  const [isOver, setIsOver] = useState(false);
  const { draggingTaskId } = useUi();
  const { setDragging } = useUiActions();
  const { updateTask } = useTaskActions();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsOver(false), []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsOver(false);
      setDragging(null);
      const taskId = event.dataTransfer.getData(DRAG_DATA_TYPE);
      if (taskId) updateTask(taskId, { dueDate: dateISO });
    },
    [dateISO, setDragging, updateTask],
  );

  if (!enabled) return { isOver: false, isDragActive: false, handlers: {} };

  return {
    isOver,
    isDragActive: Boolean(draggingTaskId),
    handlers: { onDragOver, onDragLeave, onDrop },
  };
};

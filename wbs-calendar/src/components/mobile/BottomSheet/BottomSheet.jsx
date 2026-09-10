import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/components/common/Modal/useFocusTrap';
import TaskDetailBody from '@/components/detail/TaskDetail/TaskDetailBody';
import TaskDetailHeader from '@/components/detail/TaskDetail/TaskDetailHeader';
import { useSelectedTask, useUiActions } from '@/context/hooks';
import { useSwipeDismiss } from './useSwipeDismiss';
import './BottomSheet.scss';

const BottomSheet = () => {
  const task = useSelectedTask();
  const { closeDetail } = useUiActions();
  const containerRef = useRef(null);
  const { offset, handlers } = useSwipeDismiss(closeDetail);
  useFocusTrap(containerRef, Boolean(task), closeDetail);

  if (!task) return null;

  return createPortal(
    <div className="bottom-sheet" role="presentation" onMouseDown={closeDetail}>
      <div
        ref={containerRef}
        className="bottom-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${task.title} 상세`}
        tabIndex={-1}
        style={{ transform: `translateY(${offset}px)` }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="bottom-sheet__grip" aria-hidden="true" {...handlers}>
          <span className="bottom-sheet__grip-bar" />
        </div>
        <TaskDetailHeader task={task} onClose={closeDetail} />
        <TaskDetailBody task={task} />
      </div>
    </div>,
    document.body,
  );
};

export default BottomSheet;

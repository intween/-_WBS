/**
 * 업무 상세 패널.
 * - 데스크탑: 화면 우측에서 슬라이드
 * - 모바일: 아래에서 올라오는 시트 (아래로 스와이프하면 닫힘)
 *
 * 표 안에서 펼치지 않으므로 보드 레이아웃은 흔들리지 않는다.
 */
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon, useFocusTrap, useScrollLock } from '@/components/common';
import { SHEET_CLOSE_THRESHOLD } from '@/constants/config';
import { PERIOD_MAP } from '@/data/periods';
import { STREAM_MAP } from '@/data/streams';
import { TASK_MAP } from '@/data';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUi, useWbs } from '@/context/hooks';
import TaskDetailBody from './TaskDetailBody';
import './TaskDetailPanel.scss';

function TaskDetailPanel() {
  const { selectedTaskId, closeTask } = useUi();
  const { stateMap } = useWbs();
  const isMobile = useIsMobile();

  const panelRef = useRef(null);
  const dragStartRef = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);

  const open = Boolean(selectedTaskId);
  const task = selectedTaskId ? TASK_MAP[selectedTaskId] : null;
  const state = selectedTaskId ? stateMap[selectedTaskId] : null;

  useFocusTrap(panelRef, { active: open, onEscape: closeTask });
  useScrollLock(open);

  // --- 모바일: 아래로 스와이프해서 닫기 ---
  const handleTouchStart = useCallback(
    (event) => {
      if (!isMobile) return;
      dragStartRef.current = event.touches[0].clientY;
    },
    [isMobile]
  );

  const handleTouchMove = useCallback((event) => {
    if (dragStartRef.current === null) return;
    const delta = event.touches[0].clientY - dragStartRef.current;
    // 위로 미는 동작은 무시한다.
    setDragOffset(Math.max(0, delta));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;

    if (dragOffset > SHEET_CLOSE_THRESHOLD) closeTask();
    setDragOffset(0);
  }, [dragOffset, closeTask]);

  const handleBackdrop = useCallback(
    (event) => {
      if (event.target === event.currentTarget) closeTask();
    },
    [closeTask]
  );

  if (!open || !task) return null;

  const stream = STREAM_MAP[task.stream];
  const period = PERIOD_MAP[task.period];

  return createPortal(
    <div className="task-detail" onMouseDown={handleBackdrop}>
      <aside
        className="task-detail__panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${task.title} 상세`}
        tabIndex={-1}
        style={dragOffset ? { transform: `translateY(${dragOffset}px)`, transition: 'none' } : undefined}
      >
        <span className="task-detail__accent" style={{ backgroundColor: stream?.color }} />

        <header
          className="task-detail__header"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="task-detail__grabber" aria-hidden="true" />

          <div className="task-detail__heading">
            <p className="task-detail__crumbs">
              <span style={{ color: stream?.color }}>{stream?.name}</span>
              <span aria-hidden="true"> · </span>
              <span>
                {period?.label} ({period?.range})
              </span>
            </p>
            <h2 className="task-detail__title">{task.title}</h2>
          </div>

          <button
            type="button"
            className="task-detail__close"
            aria-label="상세 닫기"
            onClick={closeTask}
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="task-detail__scroll">
          <TaskDetailBody task={task} state={state} />
        </div>
      </aside>
    </div>,
    document.body
  );
}

export default TaskDetailPanel;

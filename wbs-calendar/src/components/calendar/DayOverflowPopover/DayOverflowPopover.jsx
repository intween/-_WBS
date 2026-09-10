import { useEffect, useRef } from 'react';
import TaskChip from '@/components/calendar/TaskChip/TaskChip';
import { formatFullDate } from '@/utils/date';
import './DayOverflowPopover.scss';

const DayOverflowPopover = ({ dateISO, tasks, todayISO, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="day-overflow"
      role="dialog"
      aria-label={`${formatFullDate(dateISO)} 업무 목록`}
    >
      <p className="day-overflow__title">{formatFullDate(dateISO)}</p>
      <ul className="day-overflow__list">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskChip task={task} todayISO={todayISO} draggable={false} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DayOverflowPopover;

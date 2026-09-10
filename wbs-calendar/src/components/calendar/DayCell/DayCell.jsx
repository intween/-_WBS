import { memo, useCallback, useMemo, useState } from 'react';
import TaskChip from '@/components/calendar/TaskChip/TaskChip';
import DayOverflowPopover from '@/components/calendar/DayOverflowPopover/DayOverflowPopover';
import { MAX_CHIPS_PER_DAY } from '@/constants/views';
import { useDayDropTarget } from '@/hooks/useDragTask';
import { formatFullDate } from '@/utils/date';
import './DayCell.scss';

const activeFirst = (tasks) => [
  ...tasks.filter((task) => !task.dimmed),
  ...tasks.filter((task) => task.dimmed),
];

const DayCell = ({ day, tasks, todayISO, dragEnabled }) => {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const { isOver, isDragActive, handlers } = useDayDropTarget(day.iso, dragEnabled);
  const closeOverflow = useCallback(() => setIsOverflowOpen(false), []);
  const ordered = useMemo(() => activeFirst(tasks), [tasks]);

  const visible = ordered.slice(0, MAX_CHIPS_PER_DAY);
  const overflowCount = ordered.length - visible.length;
  const activeCount = tasks.filter((task) => !task.dimmed).length;

  const classes = [
    'day-cell',
    day.isWeekStart ? 'day-cell--week-start' : '',
    day.isCurrentMonth ? '' : 'day-cell--outside',
    day.isWeekend ? 'day-cell--weekend' : '',
    day.isTodayColumn ? 'day-cell--today-column' : '',
    day.isToday ? 'day-cell--today' : '',
    isDragActive ? 'day-cell--droppable' : '',
    isOver ? 'day-cell--over' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="gridcell"
      aria-label={`${formatFullDate(day.iso)}, 업무 ${activeCount}건`}
      {...handlers}
    >
      {day.isOnsite && <span className="day-cell__band" aria-hidden="true" />}
      <span className="day-cell__number numeric">{day.day}</span>

      <div className="day-cell__chips">
        {visible.map((task) => (
          <TaskChip key={task.id} task={task} todayISO={todayISO} draggable={dragEnabled} />
        ))}
      </div>

      {overflowCount > 0 && (
        <button
          type="button"
          className="day-cell__more"
          aria-expanded={isOverflowOpen}
          aria-label={`${formatFullDate(day.iso)} 업무 전체 보기`}
          onClick={() => setIsOverflowOpen((open) => !open)}
        >
          +{overflowCount}
        </button>
      )}

      {isOverflowOpen && (
        <DayOverflowPopover
          dateISO={day.iso}
          tasks={ordered}
          todayISO={todayISO}
          onClose={closeOverflow}
        />
      )}
    </div>
  );
};

export default memo(DayCell);

import { memo } from 'react';
import TaskChip from '@/components/calendar/TaskChip/TaskChip';
import { formatFullDate, formatWeekday } from '@/utils/date';
import './DayColumn.scss';

const DayColumn = ({ day, tasks, todayISO }) => (
  <section className={`day-column${day.iso === todayISO ? ' day-column--today' : ''}`}>
    <header className="day-column__header">
      <span className="day-column__label">{day.label}</span>
      <span className="day-column__date numeric">
        {formatFullDate(day.iso)} ({formatWeekday(day.iso)})
      </span>
      <span className="day-column__count numeric">{tasks.length}건</span>
    </header>

    <ul className="day-column__list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskChip task={task} todayISO={todayISO} draggable={false} />
        </li>
      ))}
    </ul>
  </section>
);

export default memo(DayColumn);

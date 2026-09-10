import { WEEKDAY_LABELS } from '@/constants/views';
import DayCell from '@/components/calendar/DayCell/DayCell';
import './MonthGrid.scss';

const MonthGrid = ({ month, tasksByDate, todayISO, dragEnabled }) => (
  <section className="month-grid" data-month={month.key} aria-label={month.fullLabel}>
    <h2 className="month-grid__title">{month.label}</h2>

    <div className="month-grid__weekdays" aria-hidden="true">
      {WEEKDAY_LABELS.map((label) => (
        <span key={label} className="month-grid__weekday">
          {label}
        </span>
      ))}
    </div>

    <div className="month-grid__body" role="grid" aria-label={`${month.fullLabel} 캘린더`}>
      {month.weeks.map((week) => (
        <div key={week[0].iso} className="month-grid__week" role="row">
          {week.map((day) => (
            <DayCell
              key={day.iso}
              day={day}
              tasks={day.isCurrentMonth ? tasksByDate[day.iso] ?? [] : []}
              todayISO={todayISO}
              dragEnabled={dragEnabled && day.isCurrentMonth}
            />
          ))}
        </div>
      ))}
    </div>
  </section>
);

export default MonthGrid;

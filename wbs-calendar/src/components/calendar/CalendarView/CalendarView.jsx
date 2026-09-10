import { useMemo } from 'react';
import MonthGrid from '@/components/calendar/MonthGrid/MonthGrid';
import { EmptyState } from '@/components/common';
import { useCalendarTasks, useUiActions } from '@/context/hooks';
import { buildProjectMonths, groupByDate } from '@/utils/calendar';
import { today } from '@/utils/date';
import './CalendarView.scss';

const CalendarView = ({ dragEnabled = true }) => {
  const tasks = useCalendarTasks();
  const { resetFilters } = useUiActions();
  const todayISO = today();
  const months = useMemo(() => buildProjectMonths(todayISO), [todayISO]);
  const tasksByDate = useMemo(() => groupByDate(tasks), [tasks]);

  return (
    <div className="calendar-view">
      {tasks.filter((task) => !task.dimmed).length === 0 && (
        <EmptyState message="조건에 맞는 업무가 없습니다" actionLabel="필터 초기화" onAction={resetFilters} />
      )}
      {months.map((month) => (
        <MonthGrid
          key={month.key}
          month={month}
          tasksByDate={tasksByDate}
          todayISO={todayISO}
          dragEnabled={dragEnabled}
        />
      ))}
    </div>
  );
};

export default CalendarView;

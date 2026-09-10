import { useMemo } from 'react';
import { PROJECT } from '@/config';
import DayColumn from '@/components/onsite/DayColumn/DayColumn';
import { EmptyState } from '@/components/common';
import { useVisibleTasks } from '@/context/hooks';
import { buildOnsiteDays, groupByDate } from '@/utils/calendar';
import { formatRange, today } from '@/utils/date';
import './OnsiteView.scss';

const OnsiteView = () => {
  const tasks = useVisibleTasks();
  const todayISO = today();
  const days = useMemo(() => buildOnsiteDays(), []);
  const tasksByDate = useMemo(() => groupByDate(tasks), [tasks]);
  const onsiteCount = days.reduce((sum, day) => sum + (tasksByDate[day.iso]?.length ?? 0), 0);

  return (
    <div className="onsite-view">
      <header className="onsite-view__header">
        <h2 className="onsite-view__title">{PROJECT.onsite.label}</h2>
        <p className="onsite-view__range numeric">
          {formatRange(PROJECT.onsite.start, PROJECT.onsite.end)}
        </p>
      </header>

      {onsiteCount === 0 ? (
        <EmptyState message="현장 기간에 배치된 업무가 없습니다" />
      ) : (
        <div className="onsite-view__columns" style={{ '--day-count': days.length }}>
          {days.map((day) => (
            <DayColumn
              key={day.iso}
              day={day}
              tasks={tasksByDate[day.iso] ?? []}
              todayISO={todayISO}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnsiteView;

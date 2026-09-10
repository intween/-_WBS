import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/common';
import { useVisibleTasks } from '@/context/hooks';
import { buildProjectWeeks, groupByDate } from '@/utils/calendar';
import { eachDay, formatFullDate, formatRange, formatWeekday, today } from '@/utils/date';
import AgendaTaskItem from './AgendaTaskItem';
import './AgendaView.scss';

const findCurrentWeekKey = (weeks, todayISO) =>
  weeks.find((week) => todayISO >= week.start && todayISO <= week.end)?.key ?? weeks[0].key;

const AgendaView = () => {
  const tasks = useVisibleTasks();
  const todayISO = today();
  const weeks = useMemo(() => buildProjectWeeks(), []);
  const [activeWeekKey, setActiveWeekKey] = useState(() => findCurrentWeekKey(weeks, todayISO));
  const tasksByDate = useMemo(() => groupByDate(tasks), [tasks]);

  const activeWeek = weeks.find((week) => week.key === activeWeekKey) ?? weeks[0];
  const days = eachDay(activeWeek.start, activeWeek.end);
  const weekCount = days.reduce((sum, iso) => sum + (tasksByDate[iso]?.length ?? 0), 0);

  return (
    <div className="agenda-view">
      <div className="agenda-view__weeks" role="tablist" aria-label="주차 선택">
        {weeks.map((week) => (
          <button
            key={week.key}
            type="button"
            role="tab"
            aria-selected={week.key === activeWeekKey}
            className={`agenda-view__week${week.key === activeWeekKey ? ' agenda-view__week--active' : ''}`}
            onClick={() => setActiveWeekKey(week.key)}
          >
            <span className="agenda-view__week-index">{week.index}주차</span>
            <span className="agenda-view__week-range numeric">
              {formatRange(week.start, week.end)}
            </span>
          </button>
        ))}
      </div>

      <div className="agenda-view__body">
        {weekCount === 0 ? (
          <EmptyState message="이 주에 마감인 업무가 없습니다" />
        ) : (
          days.map((iso) => {
            const dayTasks = tasksByDate[iso] ?? [];
            if (dayTasks.length === 0) return null;
            return (
              <section key={iso} className="agenda-view__day">
                <h2 className={`agenda-view__date${iso === todayISO ? ' agenda-view__date--today' : ''}`}>
                  {formatFullDate(iso)} ({formatWeekday(iso)})
                  <span className="agenda-view__day-count numeric">{dayTasks.length}건</span>
                </h2>
                <ul className="agenda-view__list">
                  {dayTasks.map((task) => (
                    <AgendaTaskItem key={task.id} task={task} todayISO={todayISO} />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgendaView;

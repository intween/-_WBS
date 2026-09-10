import { useMemo } from 'react';
import { STREAMS } from '@/config';
import TimelineRow from '@/components/timeline/TimelineRow/TimelineRow';
import { useVisibleTasks } from '@/context/hooks';
import { buildProjectWeeks } from '@/utils/calendar';
import { formatRange } from '@/utils/date';
import { isDueWithin, summarize } from '@/utils/progress';
import './TimelineView.scss';

const buildCells = (tasks, weeks) =>
  weeks.reduce((acc, week) => {
    const inWeek = tasks.filter((task) => isDueWithin(task, week.start, week.end));
    acc[week.key] = { ...summarize(inWeek), taskIds: inWeek.map((task) => task.id) };
    return acc;
  }, {});

const TimelineView = () => {
  const tasks = useVisibleTasks();
  const weeks = useMemo(() => buildProjectWeeks(), []);

  const rows = useMemo(
    () =>
      STREAMS.map((stream) => {
        const streamTasks = tasks.filter((task) => task.stream === stream.id);
        return {
          stream,
          progress: summarize(streamTasks),
          cells: buildCells(streamTasks, weeks),
        };
      }),
    [tasks, weeks],
  );

  return (
    <div className="timeline-view">
      <div
        className="timeline-view__grid"
        role="grid"
        aria-label="스트림별 주간 타임라인"
        style={{ '--week-count': weeks.length }}
      >
        <div className="timeline-view__corner" role="columnheader" />
        {weeks.map((week) => (
          <div key={week.key} className="timeline-view__head" role="columnheader">
            <span className="timeline-view__week">{week.index}주차</span>
            <span className="timeline-view__range numeric">{formatRange(week.start, week.end)}</span>
          </div>
        ))}

        {rows.map((row) => (
          <TimelineRow
            key={row.stream.id}
            stream={row.stream}
            weeks={weeks}
            cells={row.cells}
            progress={row.progress}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineView;

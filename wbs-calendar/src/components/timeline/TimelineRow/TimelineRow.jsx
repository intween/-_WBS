import { memo } from 'react';
import TimelineBar from '@/components/timeline/TimelineBar/TimelineBar';
import { useUiActions } from '@/context/hooks';
import { formatRange } from '@/utils/date';
import './TimelineRow.scss';

const TimelineRow = ({ stream, weeks, cells, progress }) => {
  const { openTaskListPanel } = useUiActions();

  return (
    <div className="timeline-row" role="row" data-stream={stream.id}>
      <div className="timeline-row__label" role="rowheader">
        <span className="timeline-row__name">{stream.name}</span>
        <span className="timeline-row__progress numeric">
          {progress.done}/{progress.total} · {progress.percent}%
        </span>
      </div>

      {weeks.map((week) => {
        const cell = cells[week.key];
        const label = `${stream.name} ${week.index}주차 ${formatRange(week.start, week.end)}`;

        if (cell.total === 0) {
          return (
            <div key={week.key} className="timeline-row__cell timeline-row__cell--empty" role="gridcell">
              <span className="sr-only">{label}, 업무 없음</span>
            </div>
          );
        }

        return (
          <button
            key={week.key}
            type="button"
            className="timeline-row__cell"
            role="gridcell"
            aria-label={`${label}, 업무 ${cell.total}건, ${cell.percent}퍼센트 완료`}
            onClick={() =>
              openTaskListPanel({
                title: `${stream.name} · ${week.index}주차`,
                taskIds: cell.taskIds,
              })
            }
          >
            <TimelineBar total={cell.total} percent={cell.percent} />
          </button>
        );
      })}
    </div>
  );
};

export default memo(TimelineRow);

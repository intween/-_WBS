/**
 * 데스크탑 스윔레인 보드.
 * 행 = 워크스트림(7), 열 = 기간(9) 매트릭스.
 *
 * 좌측 첫 열과 헤더 행을 각각 sticky 로 고정하고,
 * 가로 스크롤은 이 컨테이너 안에서만 일어난다.
 */
import { useMemo } from 'react';
import { EmptyState } from '@/components/common';
import { PERIODS, PERIOD_IDS } from '@/data/periods';
import { STREAMS, STREAM_IDS } from '@/data/streams';
import { TASKS, getCellTasks } from '@/data';
import { calcProgressByPeriod, calcProgressByStream } from '@/utils/progress';
import { groupTasksByCell } from '@/utils/filter';
import { useUi, useWbs } from '@/context/hooks';
import PeriodHeader from '../PeriodHeader/PeriodHeader';
import StreamLabel from '../StreamLabel/StreamLabel';
import TaskCell from '../TaskCell/TaskCell';
import './SwimlaneBoard.scss';

/**
 * @param {Object} props
 * @param {Array} props.tasks - 필터가 적용된 업무 목록
 */
function SwimlaneBoard({ tasks }) {
  const { stateMap, memberMap, commentCounts, highlights } = useWbs();
  const { selectedTaskId, selectTask, resetFilters } = useUi();

  // 진행률은 필터와 무관하게 전체 기준으로 보여준다.
  const periodProgress = useMemo(
    () => calcProgressByPeriod(TASKS, stateMap, PERIOD_IDS),
    [stateMap]
  );
  const streamProgress = useMemo(
    () => calcProgressByStream(TASKS, stateMap, STREAM_IDS),
    [stateMap]
  );

  const cellMap = useMemo(() => groupTasksByCell(tasks), [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="swimlane-board swimlane-board--empty">
        <EmptyState
          iconName="search"
          title="조건에 맞는 업무가 없습니다"
          description="검색어나 필터를 바꿔보세요."
          action={
            <button type="button" className="swimlane-board__reset" onClick={resetFilters}>
              필터 초기화
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="swimlane-board">
      <div
        className="swimlane-board__grid"
        style={{ '--period-count': PERIODS.length }}
        role="grid"
        aria-label="워크스트림별 기간 보드"
      >
        <div className="swimlane-board__head" role="row">
          <div className="swimlane-board__corner" role="columnheader">
            워크스트림
          </div>
          {PERIODS.map((period) => (
            <PeriodHeader key={period.id} period={period} progress={periodProgress[period.id]} />
          ))}
        </div>

        {STREAMS.map((stream) => (
          <div className="swimlane-board__row" role="row" key={stream.id}>
            <StreamLabel stream={stream} progress={streamProgress[stream.id]} />
            {PERIODS.map((period) => (
              <TaskCell
                key={`${stream.id}:${period.id}`}
                tasks={cellMap[`${stream.id}:${period.id}`] || []}
                hasAnyTask={getCellTasks(stream.id, period.id).length > 0}
                stateMap={stateMap}
                memberMap={memberMap}
                commentCounts={commentCounts}
                highlights={highlights}
                selectedTaskId={selectedTaskId}
                onSelect={selectTask}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SwimlaneBoard;

/**
 * 모바일 보드.
 * 표를 축소하지 않고, 기간 탭 + 스트림 아코디언 구조로 완전히 다르게 그린다.
 */
import { useMemo } from 'react';
import { EmptyState } from '@/components/common';
import { PERIODS, PERIOD_IDS, PERIOD_MAP } from '@/data/periods';
import { STREAMS } from '@/data/streams';
import { TASKS } from '@/data/tasks';
import { calcProgressByPeriod } from '@/utils/progress';
import { groupTasksByPeriod, groupTasksByStream } from '@/utils/filter';
import { useUi, useWbs } from '@/context/hooks';
import PeriodTabs from '../PeriodTabs/PeriodTabs';
import StreamSection from '../StreamSection/StreamSection';
import './MobileBoard.scss';

/**
 * @param {Object} props
 * @param {Array} props.tasks - 필터가 적용된 업무 목록
 */
function MobileBoard({ tasks }) {
  const { stateMap, memberMap, commentCounts, highlights } = useWbs();
  const { selectedPeriodId, setPeriod, selectedTaskId, selectTask, resetFilters } = useUi();

  // 탭의 진행률은 필터와 무관하게 전체 기준으로 보여준다.
  const periodProgress = useMemo(
    () => calcProgressByPeriod(TASKS, stateMap, PERIOD_IDS),
    [stateMap]
  );

  const byPeriod = useMemo(() => groupTasksByPeriod(tasks), [tasks]);
  const periodTasks = byPeriod[selectedPeriodId] || [];
  const byStream = useMemo(() => groupTasksByStream(periodTasks), [periodTasks]);

  const period = PERIOD_MAP[selectedPeriodId];

  return (
    <div className="mobile-board">
      <PeriodTabs
        periods={PERIODS}
        selectedId={selectedPeriodId}
        progressMap={periodProgress}
        onSelect={setPeriod}
      />

      <div className="mobile-board__content">
        <p className="mobile-board__range">
          {period?.label} · {period?.range}
        </p>

        {periodTasks.length === 0 ? (
          <EmptyState
            iconName="search"
            title="이 기간에 표시할 업무가 없습니다"
            description={
              tasks.length === 0
                ? '검색어나 필터를 바꿔보세요.'
                : '다른 기간 탭을 확인해보세요.'
            }
            action={
              tasks.length === 0 ? (
                <button type="button" className="mobile-board__reset" onClick={resetFilters}>
                  필터 초기화
                </button>
              ) : null
            }
          />
        ) : (
          STREAMS.map((stream) => (
            <StreamSection
              key={stream.id}
              stream={stream}
              tasks={byStream[stream.id] || []}
              stateMap={stateMap}
              memberMap={memberMap}
              commentCounts={commentCounts}
              highlights={highlights}
              selectedTaskId={selectedTaskId}
              onSelect={selectTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default MobileBoard;

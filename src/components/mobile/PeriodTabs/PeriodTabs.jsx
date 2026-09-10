/**
 * 모바일 기간 탭 — 가로 스크롤.
 * 선택된 탭을 강조하고, 각 탭에 진행률 점을 표시한다.
 */
import { useEffect, useRef } from 'react';
import { C_SURFACE } from '@/constants/colors';
import './PeriodTabs.scss';

/**
 * @param {Object} props
 * @param {Array} props.periods
 * @param {string} props.selectedId
 * @param {Object} props.progressMap - 기간 id → calcProgress 결과
 * @param {Function} props.onSelect - (periodId) => void
 */
function PeriodTabs({ periods = [], selectedId, progressMap = {}, onSelect }) {
  const listRef = useRef(null);

  // 선택된 탭이 화면 밖에 있으면 보이도록 스크롤한다.
  useEffect(() => {
    const container = listRef.current;
    const active = container?.querySelector('[aria-selected="true"]');
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  return (
    <div className="period-tabs" ref={listRef} role="tablist" aria-label="기간 선택">
      {periods.map((period) => {
        const progress = progressMap[period.id] || { percent: 0, done: 0, total: 0 };
        const selected = period.id === selectedId;

        return (
          <button
            key={period.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`period-tabs__tab${selected ? ' period-tabs__tab--active' : ''}`}
            style={selected ? { backgroundColor: period.color, borderColor: period.color } : undefined}
            onClick={() => onSelect(period.id)}
          >
            <span className="period-tabs__label">{period.label}</span>
            <span className="period-tabs__meta">
              <span
                className="period-tabs__dot"
                style={{ backgroundColor: selected ? C_SURFACE : period.color, opacity: progress.percent === 0 ? 0.3 : 1 }}
                aria-hidden="true"
              />
              <span className="period-tabs__count is-numeric">
                {progress.done}/{progress.total}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PeriodTabs;

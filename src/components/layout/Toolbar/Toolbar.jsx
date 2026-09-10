/**
 * 툴바 — 검색 / 필터 / 내보내기.
 * 모바일에서는 검색만 보이고 필터는 접어둔다.
 */
import { useCallback, useState } from 'react';
import { Button } from '@/components/common';
import { PERIOD_MAP } from '@/data/periods';
import { STREAM_MAP } from '@/data/streams';
import { TASKS } from '@/data/tasks';
import { exportCsv, exportJson } from '@/utils/export';
import { useUi, useWbs } from '@/context/hooks';
import FilterPanel from './FilterPanel';
import SearchField from './SearchField';
import './Toolbar.scss';

/**
 * @param {Object} props
 * @param {number} props.visibleCount - 현재 필터로 보이는 업무 수
 */
function Toolbar({ visibleCount = 0 }) {
  const { stateMap, memberMap } = useWbs();
  const { hasActiveFilter, showToast } = useUi();
  const [filterOpen, setFilterOpen] = useState(false);

  const handleExport = useCallback(
    (format) => {
      const lookup = { streamMap: STREAM_MAP, periodMap: PERIOD_MAP, memberMap };
      const ok =
        format === 'csv'
          ? exportCsv(TASKS, stateMap, lookup)
          : exportJson(TASKS, stateMap, lookup);

      const name = format.toUpperCase();
      showToast(
        ok ? `${name} 파일을 내려받았습니다.` : `${name} 내보내기에 실패했습니다.`,
        ok ? 'success' : 'error'
      );
    },
    [stateMap, memberMap, showToast]
  );

  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <SearchField />

        <Button
          className="toolbar__filter-toggle"
          size="sm"
          variant="secondary"
          iconName="filter"
          active={filterOpen || hasActiveFilter}
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((open) => !open)}
        >
          필터
        </Button>

        <span className="toolbar__count is-numeric">
          {visibleCount}
          <span className="toolbar__count-unit">건</span>
        </span>

        <div className="toolbar__export">
          <Button size="sm" variant="secondary" iconName="download" onClick={() => handleExport('csv')}>
            CSV
          </Button>
          <Button size="sm" variant="secondary" iconName="download" onClick={() => handleExport('json')}>
            JSON
          </Button>
        </div>
      </div>

      <div className={`toolbar__filters${filterOpen ? ' toolbar__filters--open' : ''}`}>
        <FilterPanel />
      </div>
    </div>
  );
}

export default Toolbar;

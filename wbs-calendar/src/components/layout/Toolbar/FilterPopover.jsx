import { useState } from 'react';
import { STREAMS } from '@/config';
import { Button, Icon, Popover } from '@/components/common';
import { STATUS_FILTER_OPTIONS } from '@/constants/status';
import { useUi, useUiActions } from '@/context/hooks';
import { countActiveFacets } from '@/utils/filter';
import './FilterPopover.scss';

const FilterPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters } = useUi();
  const { setFilters, toggleStreamFilter, resetFilters } = useUiActions();
  const activeCount = countActiveFacets(filters);

  return (
    <div className="filter-popover">
      <Button
        active={activeCount > 0}
        aria-expanded={isOpen}
        aria-label="필터"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name="filter" size={16} />
        필터
        {activeCount > 0 && <span className="filter-popover__count numeric">{activeCount}</span>}
      </Button>

      <Popover isOpen={isOpen} label="필터" onClose={() => setIsOpen(false)}>
        <div className="popover__group">
          <p className="popover__label">상태</p>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`popover__item${filters.status === option.value ? ' popover__item--active' : ''}`}
              onClick={() => setFilters({ status: option.value })}
            >
              {option.label}
              {filters.status === option.value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>

        <div className="popover__group">
          <p className="popover__label">스트림</p>
          {STREAMS.map((stream) => (
            <button
              key={stream.id}
              type="button"
              className={`popover__item${filters.streams.includes(stream.id) ? ' popover__item--active' : ''}`}
              data-stream={stream.id}
              onClick={() => toggleStreamFilter(stream.id)}
            >
              <span className="filter-popover__stream">
                <span className="filter-popover__dot" aria-hidden="true" />
                {stream.name}
              </span>
              {filters.streams.includes(stream.id) && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>

        <div className="popover__group">
          <button
            type="button"
            className={`popover__item${filters.delayedOnly ? ' popover__item--active' : ''}`}
            onClick={() => setFilters({ delayedOnly: !filters.delayedOnly })}
          >
            지연만 보기
            {filters.delayedOnly && <Icon name="check" size={14} />}
          </button>
          <button type="button" className="popover__item" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
      </Popover>
    </div>
  );
};

export default FilterPopover;

/**
 * 필터 묶음 — 상태 / 담당자 / 스트림 / 지연.
 * Toolbar 안에서만 쓰인다. (모바일에서는 접었다 펼침)
 */
import { Button, Select } from '@/components/common';
import { OWNER_FILTER_ALL, OWNER_FILTER_NONE } from '@/constants/config';
import { STATUS_FILTER_ALL, STATUS_LIST } from '@/constants/status';
import { STREAMS } from '@/data/streams';
import { useCurrentMember, useUi, useWbs } from '@/context/hooks';
import './FilterPanel.scss';

function FilterPanel() {
  const { members } = useWbs();
  const { memberId } = useCurrentMember();
  const {
    statusFilter,
    setStatusFilter,
    ownerFilter,
    setOwnerFilter,
    streamFilter,
    toggleStream,
    onlyOverdue,
    toggleOverdue,
    resetFilters,
    hasActiveFilter,
  } = useUi();

  const isMine = Boolean(memberId) && ownerFilter === memberId;

  const ownerOptions = [
    { value: OWNER_FILTER_ALL, label: '담당자 전체' },
    { value: OWNER_FILTER_NONE, label: '미지정' },
    ...members.map((member) => ({ value: member.id, label: member.name })),
  ];

  return (
    <div className="filter-panel">
      <div className="filter-panel__group" role="group" aria-label="상태 필터">
        <button
          type="button"
          className={`filter-panel__chip${statusFilter === STATUS_FILTER_ALL ? ' filter-panel__chip--active' : ''}`}
          aria-pressed={statusFilter === STATUS_FILTER_ALL}
          onClick={() => setStatusFilter(STATUS_FILTER_ALL)}
        >
          전체
        </button>
        {STATUS_LIST.map((status) => (
          <button
            key={status.key}
            type="button"
            className={`filter-panel__chip${statusFilter === status.key ? ' filter-panel__chip--active' : ''}`}
            style={statusFilter === status.key ? { backgroundColor: status.color, borderColor: status.color } : undefined}
            aria-pressed={statusFilter === status.key}
            onClick={() => setStatusFilter(status.key)}
          >
            {status.label}
          </button>
        ))}
      </div>

      <div className="filter-panel__group">
        <Select
          size="sm"
          value={ownerFilter}
          options={ownerOptions}
          ariaLabel="담당자 필터"
          onChange={setOwnerFilter}
        />
        <Button
          size="sm"
          variant="secondary"
          active={isMine}
          disabled={!memberId}
          onClick={() => setOwnerFilter(isMine ? OWNER_FILTER_ALL : memberId)}
        >
          내 업무만
        </Button>
        <Button
          size="sm"
          variant="secondary"
          iconName="alert"
          active={onlyOverdue}
          onClick={toggleOverdue}
        >
          지연만
        </Button>
      </div>

      <div className="filter-panel__group" role="group" aria-label="워크스트림 필터">
        {STREAMS.map((stream) => {
          const active = streamFilter.includes(stream.id);
          return (
            <button
              key={stream.id}
              type="button"
              className={`filter-panel__chip${active ? ' filter-panel__chip--active' : ''}`}
              style={active ? { backgroundColor: stream.color, borderColor: stream.color } : undefined}
              aria-pressed={active}
              onClick={() => toggleStream(stream.id)}
            >
              {stream.name}
            </button>
          );
        })}
      </div>

      {hasActiveFilter && (
        <Button size="sm" variant="ghost" iconName="close" onClick={resetFilters}>
          필터 초기화
        </Button>
      )}
    </div>
  );
}

export default FilterPanel;

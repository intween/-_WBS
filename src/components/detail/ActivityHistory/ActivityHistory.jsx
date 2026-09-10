/**
 * 업무별 변경 이력 — 접기/펼치기.
 * 펼칠 때 서버에서 읽어온다. (항상 불러오면 낭비이므로)
 */
import { useCallback, useEffect, useState } from 'react';
import { EmptyState, Icon, Spinner } from '@/components/common';
import { fetchActivityByTask } from '@/lib/api';
import { describeActivity } from '@/utils/diff';
import { formatRelativeTime } from '@/utils/format';
import { useWbs } from '@/context/hooks';
import './ActivityHistory.scss';

/**
 * @param {Object} props
 * @param {string} props.taskId
 */
function ActivityHistory({ taskId }) {
  const { memberMap } = useWbs();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchActivityByTask(taskId));
    } catch (loadError) {
      setError(loadError.message || '변경 이력을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // 다른 업무로 옮기면 접힌 상태로 되돌린다.
  useEffect(() => {
    setOpen(false);
    setItems([]);
  }, [taskId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <div className="activity-history">
      <button
        type="button"
        className="activity-history__toggle"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} />
        변경 이력
      </button>

      {open && (
        <div className="activity-history__body">
          {loading && <Spinner label="변경 이력을 불러오는 중" />}

          {!loading && error && (
            <p className="activity-history__error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState size="sm" iconName="refresh" title="변경 이력이 없습니다" />
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="activity-history__list">
              {items.map((item) => (
                <li className="activity-history__item" key={item.id}>
                  <span className="activity-history__text">
                    {describeActivity(item, memberMap[item.member_id]?.name)}
                  </span>
                  <span className="activity-history__time">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityHistory;

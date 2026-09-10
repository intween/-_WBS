/**
 * 최근 변경 20건.
 * 다른 사람의 변경은 Realtime 대상이 아니므로, 탭에 들어올 때 한 번 새로 읽는다.
 */
import { useEffect } from 'react';
import { Button, EmptyState } from '@/components/common';
import { TASK_MAP } from '@/data';
import { describeActivity } from '@/utils/diff';
import { formatRelativeTime } from '@/utils/format';
import { useUi, useWbs } from '@/context/hooks';
import './RecentActivity.scss';

function RecentActivity() {
  const { activity, memberMap, refreshActivity } = useWbs();
  const { selectTask } = useUi();

  useEffect(() => {
    refreshActivity();
  }, [refreshActivity]);

  return (
    <div className="recent-activity">
      <div className="recent-activity__head">
        <h2 className="recent-activity__title">최근 변경</h2>
        <Button size="sm" variant="ghost" iconName="refresh" onClick={refreshActivity}>
          새로고침
        </Button>
      </div>

      {activity.length === 0 ? (
        <EmptyState size="sm" iconName="refresh" title="아직 변경 이력이 없습니다" />
      ) : (
        <ul className="recent-activity__list">
          {activity.map((item) => {
            const task = TASK_MAP[item.task_id];

            return (
              <li className="recent-activity__item" key={item.id}>
                <button
                  type="button"
                  className="recent-activity__button"
                  aria-label={`${task?.title || item.task_id} 상세 열기`}
                  onClick={() => task && selectTask(task.id)}
                >
                  <span className="recent-activity__task">{task?.title || item.task_id}</span>
                  <span className="recent-activity__text">
                    {describeActivity(item, memberMap[item.member_id]?.name)}
                  </span>
                  <span className="recent-activity__time">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;

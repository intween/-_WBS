/**
 * 내 담당 업무 목록 — 마감일 오름차순.
 * 대시보드와 '내 업무' 탭에서 함께 쓴다.
 */
import { useMemo } from 'react';
import { Badge, EmptyState } from '@/components/common';
import { DEFAULT_STATUS, isDoneStatus } from '@/constants/status';
import { PERIOD_MAP } from '@/data/periods';
import { STREAM_MAP } from '@/data/streams';
import { TASKS } from '@/data/tasks';
import { sortByDueDate } from '@/utils/progress';
import { getDueState } from '@/utils/dday';
import { formatDate } from '@/utils/format';
import { useCurrentMember, useUi, useWbs } from '@/context/hooks';
import './MyTasks.scss';

/** 마감 상태별 표시 문구 */
const DUE_LABELS = {
  overdue: '지연',
  today: '오늘 마감',
  soon: '마감 임박',
};

/**
 * @param {Object} props
 * @param {boolean} [props.includeDone] - 완료된 업무도 함께 볼지
 */
function MyTasks({ includeDone = false }) {
  const { stateMap } = useWbs();
  const { memberId, member } = useCurrentMember();
  const { selectTask } = useUi();

  const myTasks = useMemo(() => {
    if (!memberId) return [];

    const owned = TASKS.filter((task) => {
      const state = stateMap[task.id];
      if (state?.owner_id !== memberId) return false;
      return includeDone || !isDoneStatus(state?.status);
    });

    return sortByDueDate(owned, stateMap);
  }, [stateMap, memberId, includeDone]);

  if (!memberId) {
    return <EmptyState iconName="user" title="사용자를 먼저 선택해주세요" />;
  }

  if (myTasks.length === 0) {
    return (
      <EmptyState
        iconName="myTasks"
        title="담당 중인 업무가 없습니다"
        description={`${member?.name || '나'} 님에게 배정된 ${includeDone ? '' : '미완료 '}업무가 없습니다.`}
      />
    );
  }

  return (
    <ul className="my-tasks">
      {myTasks.map((task) => {
        const state = stateMap[task.id];
        const status = state?.status || DEFAULT_STATUS;
        const dueState = getDueState(state?.due_date, isDoneStatus(status));
        const dueLabel = DUE_LABELS[dueState];

        return (
          <li key={task.id}>
            <button
              type="button"
              className="my-tasks__item"
              aria-label={`${task.title} 상세 열기`}
              onClick={() => selectTask(task.id)}
            >
              <span
                className="my-tasks__accent"
                style={{ backgroundColor: STREAM_MAP[task.stream]?.color }}
                aria-hidden="true"
              />
              <span className="my-tasks__text">
                <span className="my-tasks__title">{task.title}</span>
                <span className="my-tasks__meta">
                  {STREAM_MAP[task.stream]?.name} · {PERIOD_MAP[task.period]?.label}
                </span>
              </span>

              <span className="my-tasks__right">
                {state?.due_date && (
                  <span
                    className={`my-tasks__due my-tasks__due--${dueState} is-numeric`}
                  >
                    {formatDate(state.due_date)}
                  </span>
                )}
                {dueLabel && (
                  <Badge size="sm" tone={dueState === 'overdue' ? 'danger' : 'info'}>
                    {dueLabel}
                  </Badge>
                )}
                <Badge size="sm" status={status} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default MyTasks;

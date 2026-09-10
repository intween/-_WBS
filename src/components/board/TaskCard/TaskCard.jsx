/**
 * 보드에 들어가는 업무 카드 — 압축 표시.
 * 상세 내용은 클릭 시 열리는 TaskDetailPanel 에서 다룬다.
 *
 * 67개가 한 번에 렌더되므로 React.memo 로 감싸고,
 * 부모는 핸들러를 useCallback 으로 고정해 넘긴다.
 */
import { memo } from 'react';
import { Avatar, Badge, Icon } from '@/components/common';
import { DEFAULT_STATUS, isDoneStatus } from '@/constants/status';
import { isOverdue } from '@/utils/dday';
import './TaskCard.scss';

/**
 * @param {Object} props
 * @param {Object} props.task - 정적 업무 정의
 * @param {Object} [props.state] - task_states 행
 * @param {Object} [props.member] - 담당자
 * @param {number} [props.commentCount]
 * @param {boolean} [props.highlighted] - 다른 사람이 방금 바꿈
 * @param {boolean} [props.selected] - 상세 패널에서 열려 있음
 * @param {Function} props.onSelect - (taskId) => void
 */
function TaskCard({
  task,
  state = null,
  member = null,
  commentCount = 0,
  highlighted = false,
  selected = false,
  onSelect,
}) {
  const status = state?.status || DEFAULT_STATUS;
  const done = isDoneStatus(status);
  const overdue = isOverdue(state?.due_date, done);

  const hasMemo = Boolean(state?.memo?.trim());
  const checklist = Array.isArray(state?.checklist) ? state.checklist : [];
  const checklistDone = checklist.filter((item) => item?.done).length;
  const linkCount = Array.isArray(state?.links) ? state.links.length : 0;

  const classNames = [
    'task-card',
    done && 'task-card--done',
    selected && 'task-card--selected',
    highlighted && 'task-card--highlighted',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      aria-label={`${task.title} 상세 열기`}
      aria-pressed={selected}
      onClick={() => onSelect(task.id)}
    >
      {overdue && <span className="task-card__overdue-dot" aria-label="마감 지남" role="img" />}

      <span className="task-card__title">{task.title}</span>

      <span className="task-card__foot">
        <Badge status={status} dot />
        <Avatar member={member} size="sm" />

        <span className="task-card__marks">
          {hasMemo && (
            <span className="task-card__mark" role="img" aria-label="메모 있음">
              <Icon name="memo" size={11} />
            </span>
          )}
          {commentCount > 0 && (
            <span className="task-card__mark" role="img" aria-label={`코멘트 ${commentCount}개`}>
              <Icon name="comment" size={11} />
              <span className="task-card__mark-count is-numeric">{commentCount}</span>
            </span>
          )}
          {checklist.length > 0 && (
            <span
              className="task-card__mark"
              role="img"
              aria-label={`체크리스트 ${checklistDone}/${checklist.length}`}
            >
              <Icon name="checklist" size={11} />
              <span className="task-card__mark-count is-numeric">
                {checklistDone}/{checklist.length}
              </span>
            </span>
          )}
          {linkCount > 0 && (
            <span className="task-card__mark" role="img" aria-label={`문서 링크 ${linkCount}개`}>
              <Icon name="link" size={11} />
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export default memo(TaskCard);

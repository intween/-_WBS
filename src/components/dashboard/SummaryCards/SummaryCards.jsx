/**
 * 대시보드 요약 카드 4개.
 * 전체 진행률 / 이번 주 마감 / 지연 / 내 담당 미완료
 */
import { useMemo } from 'react';
import { Icon, ProgressBar } from '@/components/common';
import { TASKS } from '@/data/tasks';
import {
  calcProgress,
  getDueThisWeekTasks,
  getMyOpenTasks,
  getOverdueTasks,
} from '@/utils/progress';
import { useCurrentMember, useWbs } from '@/context/hooks';
import './SummaryCards.scss';

function SummaryCards() {
  const { stateMap } = useWbs();
  const { memberId } = useCurrentMember();

  const summary = useMemo(() => {
    const today = new Date();
    return {
      progress: calcProgress(TASKS, stateMap),
      thisWeek: getDueThisWeekTasks(TASKS, stateMap, today).length,
      overdue: getOverdueTasks(TASKS, stateMap, today).length,
      mine: getMyOpenTasks(TASKS, stateMap, memberId).length,
    };
  }, [stateMap, memberId]);

  return (
    <div className="summary-cards">
      <article className="summary-card summary-card--progress">
        <p className="summary-card__label">전체 진행률</p>
        <p className="summary-card__value is-numeric">
          {summary.progress.percent}
          <span className="summary-card__unit">%</span>
        </p>
        <ProgressBar percent={summary.progress.percent} size="sm" />
        <p className="summary-card__sub is-numeric">
          {summary.progress.done} / {summary.progress.total} 완료
        </p>
      </article>

      <article className="summary-card">
        <p className="summary-card__label">
          <Icon name="calendar" size={13} />
          이번 주 마감
        </p>
        <p className="summary-card__value is-numeric">
          {summary.thisWeek}
          <span className="summary-card__unit">건</span>
        </p>
        <p className="summary-card__sub">완료되지 않은 업무 기준</p>
      </article>

      <article className={`summary-card${summary.overdue > 0 ? ' summary-card--danger' : ''}`}>
        <p className="summary-card__label">
          <Icon name="alert" size={13} />
          지연
        </p>
        <p className="summary-card__value is-numeric">
          {summary.overdue}
          <span className="summary-card__unit">건</span>
        </p>
        <p className="summary-card__sub">마감이 지난 미완료 업무</p>
      </article>

      <article className="summary-card">
        <p className="summary-card__label">
          <Icon name="user" size={13} />내 담당 미완료
        </p>
        <p className="summary-card__value is-numeric">
          {summary.mine}
          <span className="summary-card__unit">건</span>
        </p>
        <p className="summary-card__sub">
          {memberId ? '내가 담당한 업무 중' : '사용자를 먼저 선택해주세요'}
        </p>
      </article>
    </div>
  );
}

export default SummaryCards;

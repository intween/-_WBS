/**
 * 상단 헤더 — 프로젝트명 / 전체 진행률 / D-day / 현재 사용자 / 연결 상태.
 * 모바일에서는 진행률과 사용자만 남긴 압축 형태로 sticky 고정된다.
 */
import { useMemo } from 'react';
import { Avatar, Badge, Button, Icon, ProgressBar, Tooltip } from '@/components/common';
import { PROJECT, TAB_LABELS, TAB_LIST } from '@/constants/config';
import { TASKS } from '@/data/tasks';
import { PROGRAM_END, PROGRAM_START } from '@/data/periods';
import { REALTIME_STATUS } from '@/hooks/useRealtimeSync';
import { calcProgress } from '@/utils/progress';
import { formatDday, getDaysUntil } from '@/utils/dday';
import { formatShortDate } from '@/utils/format';
import { useCurrentMember, useUi, useUser, useWbs } from '@/context/hooks';
import './Header.scss';

/** 탭 아이콘 */
const TAB_ICONS = { board: 'board', dashboard: 'dashboard', 'my-tasks': 'myTasks' };

function Header() {
  const { stateMap, realtimeStatus, reconnect, isDemoMode } = useWbs();
  const { member } = useCurrentMember();
  const { clearMember } = useUser();
  const { tab, setTab, openMemberModal } = useUi();

  const progress = useMemo(() => calcProgress(TASKS, stateMap), [stateMap]);
  const dday = useMemo(() => formatDday(PROJECT.ddayDate), []);
  const isPast = useMemo(() => (getDaysUntil(PROJECT.ddayDate) ?? 0) < 0, []);
  const isOffline = realtimeStatus === REALTIME_STATUS.OFFLINE;

  return (
    <header className="header">
      <div className="header__main">
        <div className="header__identity">
          <p className="header__eyebrow">{PROJECT.title}</p>
          <h1 className="header__title">{PROJECT.subtitle}</h1>
          <p className="header__range">
            {formatShortDate(PROGRAM_START)} ~ {formatShortDate(PROGRAM_END)}
          </p>
        </div>

        <div className="header__progress">
          <ProgressBar
            percent={progress.percent}
            done={progress.done}
            total={progress.total}
            size="md"
            label="전체 진행률"
            showValue
          />
        </div>

        <div className="header__meta">
          <Tooltip text={`현지 수행 시작 ${PROJECT.ddayDate}`}>
            <span className={`header__dday${isPast ? ' header__dday--past' : ''}`}>{dday}</span>
          </Tooltip>

          {isDemoMode && (
            <Tooltip text="서버 연결 없이 이 브라우저에만 저장됩니다">
              <span className="header__demo">데모 모드</span>
            </Tooltip>
          )}

          {isOffline && (
            <button type="button" className="header__offline" onClick={reconnect}>
              <Icon name="offline" size={14} />
              오프라인 · 재연결 중
            </button>
          )}

          <div className="header__user">
            <Avatar member={member} size="md" />
            <span className="header__user-name">{member?.name || '알 수 없음'}</span>
            <Button
              size="sm"
              variant="ghost"
              iconName="users"
              iconOnly
              ariaLabel="팀원 관리"
              onClick={openMemberModal}
            />
            <Button
              size="sm"
              variant="ghost"
              iconName="logout"
              iconOnly
              ariaLabel="사용자 변경"
              onClick={clearMember}
            />
          </div>
        </div>
      </div>

      <nav className="header__tabs" aria-label="화면 전환">
        {TAB_LIST.map((key) => (
          <button
            key={key}
            type="button"
            className={`header__tab${tab === key ? ' header__tab--active' : ''}`}
            aria-current={tab === key ? 'page' : undefined}
            onClick={() => setTab(key)}
          >
            <Icon name={TAB_ICONS[key]} size={14} />
            {TAB_LABELS[key]}
          </button>
        ))}
      </nav>

      {/* 모바일 압축 헤더 */}
      <div className="header__compact">
        <div className="header__compact-top">
          <span className="header__compact-title">{PROJECT.subtitle}</span>
          <Badge tone={isPast ? 'danger' : 'info'} size="sm">
            {dday}
          </Badge>
          {isDemoMode && (
            <Badge tone="neutral" size="sm">
              데모
            </Badge>
          )}
          <span className="header__compact-count is-numeric">
            {progress.done}/{progress.total}
          </span>
          <button
            type="button"
            className="header__compact-user"
            aria-label={`사용자 변경 (현재 ${member?.name || '알 수 없음'})`}
            onClick={clearMember}
          >
            <Avatar member={member} size="sm" />
          </button>
        </div>
        <ProgressBar percent={progress.percent} size="xs" />
        {isOffline && (
          <p className="header__compact-offline" role="status">
            오프라인 · 재연결 중
          </p>
        )}
      </div>
    </header>
  );
}

export default Header;

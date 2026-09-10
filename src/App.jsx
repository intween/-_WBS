/**
 * 앱 셸 — 로딩/에러/사용자 선택 분기와 탭별 화면 조립.
 * Provider 중첩은 main.jsx 에서 처리한다.
 */
import { useEffect, useMemo } from 'react';
import { Button, EmptyState, Spinner, Toast } from '@/components/common';
import Dashboard from '@/components/dashboard/Dashboard/Dashboard';
import MyTasks from '@/components/dashboard/MyTasks/MyTasks';
import SwimlaneBoard from '@/components/board/SwimlaneBoard/SwimlaneBoard';
import TaskDetailPanel from '@/components/detail/TaskDetailPanel/TaskDetailPanel';
import Header from '@/components/layout/Header/Header';
import MemberModal from '@/components/layout/MemberModal/MemberModal';
import TabBar from '@/components/layout/TabBar/TabBar';
import Toolbar from '@/components/layout/Toolbar/Toolbar';
import UserGate from '@/components/layout/UserGate/UserGate';
import MobileBoard from '@/components/mobile/MobileBoard/MobileBoard';
import { TAB } from '@/constants/config';
import { TASKS } from '@/data/tasks';
import { buildCommentIndex, filterTasks } from '@/utils/filter';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useCurrentMember, useUi, useUser, useWbs } from '@/context/hooks';

function App() {
  const { loading, error, stateMap, comments, reload } = useWbs();
  const { hasSelected, clearMember } = useUser();
  const { isStale } = useCurrentMember();
  const { tab, search, statusFilter, ownerFilter, streamFilter, onlyOverdue } = useUi();
  const isMobile = useIsMobile();

  // 저장된 팀원이 삭제된 경우 선택을 비워 이름 선택 화면으로 되돌린다.
  useEffect(() => {
    if (isStale) clearMember();
  }, [isStale, clearMember]);

  const commentIndex = useMemo(() => buildCommentIndex(comments), [comments]);

  const filteredTasks = useMemo(
    () =>
      filterTasks(TASKS, {
        stateMap,
        commentIndex,
        search,
        statusFilter,
        ownerFilter,
        streamFilter,
        onlyOverdue,
      }),
    [stateMap, commentIndex, search, statusFilter, ownerFilter, streamFilter, onlyOverdue]
  );

  // --- 최초 로딩 ---
  if (loading) {
    return (
      <div className="app app--message">
        <Spinner block size={28} label="업무 데이터를 불러오는 중" />
      </div>
    );
  }

  // --- 로딩 실패 ---
  if (error) {
    return (
      <div className="app app--message">
        <EmptyState
          iconName="alert"
          title="데이터를 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="primary" iconName="refresh" onClick={reload}>
              다시 시도
            </Button>
          }
        />
        <Toast />
        <MemberModal />
      </div>
    );
  }

  // --- 이름 선택 ---
  if (!hasSelected) {
    return (
      <div className="app">
        <UserGate />
        <MemberModal />
        <Toast />
      </div>
    );
  }

  // --- 본 화면 ---
  return (
    <div className="app">
      <Header />

      <main className="app__main">
        {tab === TAB.BOARD && (
          <>
            <Toolbar visibleCount={filteredTasks.length} />
            {isMobile ? (
              <MobileBoard tasks={filteredTasks} />
            ) : (
              <div className="app__board">
                <SwimlaneBoard tasks={filteredTasks} />
              </div>
            )}
          </>
        )}

        {tab === TAB.DASHBOARD && <Dashboard />}

        {tab === TAB.MY_TASKS && (
          <section className="app__panel">
            <h2 className="app__panel-title">내 담당 업무</h2>
            <MyTasks includeDone />
          </section>
        )}
      </main>

      <TabBar />
      <TaskDetailPanel />
      <MemberModal />
      <Toast />
    </div>
  );
}

export default App;

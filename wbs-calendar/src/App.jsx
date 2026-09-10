import Header from '@/components/layout/Header/Header';
import SidePanel from '@/components/layout/SidePanel/SidePanel';
import Toolbar from '@/components/layout/Toolbar/Toolbar';
import ViewTabs from '@/components/layout/ViewTabs/ViewTabs';
import ShortcutsModal from '@/components/layout/ShortcutsModal/ShortcutsModal';
import CalendarView from '@/components/calendar/CalendarView/CalendarView';
import TimelineView from '@/components/timeline/TimelineView/TimelineView';
import OnsiteView from '@/components/onsite/OnsiteView/OnsiteView';
import AgendaView from '@/components/mobile/AgendaView/AgendaView';
import BottomSheet from '@/components/mobile/BottomSheet/BottomSheet';
import MobileTabBar from '@/components/mobile/MobileTabBar/MobileTabBar';
import TaskDetail from '@/components/detail/TaskDetail/TaskDetail';
import { CalendarSkeleton, EmptyState, ToastStack } from '@/components/common';
import { VIEWS } from '@/constants/views';
import { TaskProvider } from '@/context/TaskProvider';
import { UiProvider } from '@/context/UiProvider';
import { useTaskActions, useTasks, useUi, useUiActions } from '@/context/hooks';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useShortcuts } from '@/hooks/useShortcuts';
import './App.scss';

const ViewSwitch = ({ isMobile }) => {
  const { view } = useUi();

  if (view === VIEWS.timeline) return <TimelineView />;
  if (view === VIEWS.onsite) return <OnsiteView />;
  return isMobile ? <AgendaView /> : <CalendarView />;
};

const AppShell = () => {
  const { isLoading, hasError } = useTasks();
  const { reload } = useTaskActions();
  const { toasts } = useUi();
  const { dismissToast } = useUiActions();
  const isMobile = useIsMobile();
  useShortcuts(isMobile);

  return (
    <div className="app">
      <Header />

      <div className="app__bar">
        <ViewTabs />
        <Toolbar />
      </div>

      <div className="app__body">
        <SidePanel />
        <main className="app__main">
          {isLoading && <CalendarSkeleton />}
          {hasError && (
            <EmptyState
              message="데이터를 불러오지 못했습니다"
              actionLabel="다시 시도"
              onAction={reload}
            />
          )}
          {!isLoading && !hasError && <ViewSwitch isMobile={isMobile} />}
        </main>
      </div>

      <MobileTabBar />
      {isMobile ? <BottomSheet /> : <TaskDetail />}
      <ShortcutsModal />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

const App = () => (
  <UiProvider>
    <TaskProvider>
      <AppShell />
    </TaskProvider>
  </UiProvider>
);

export default App;

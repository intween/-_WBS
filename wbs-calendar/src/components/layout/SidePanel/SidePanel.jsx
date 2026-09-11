import { useMemo } from 'react';
import { Button } from '@/components/common';
import { useDeadlineBuckets, useUi, useUiActions, useVisibleTasks } from '@/context/hooks';
import SideSection from './SideSection';
import './SidePanel.scss';

const SidePanel = () => {
  const { dueToday, dueThisWeek, delayed, todayISO } = useDeadlineBuckets();
  const { taskListPanel } = useUi();
  const { closeTaskListPanel } = useUiActions();
  const tasks = useVisibleTasks();

  const panelTasks = useMemo(() => {
    if (!taskListPanel) return [];
    return tasks.filter((task) => taskListPanel.taskIds.includes(task.id));
  }, [taskListPanel, tasks]);

  if (taskListPanel) {
    return (
      <aside className="side-panel side-panel--list" aria-label="선택한 구간 업무">
        <div className="side-panel__header">
          <h2 className="side-panel__heading">{taskListPanel.title}</h2>
          <Button size="sm" onClick={closeTaskListPanel}>
            닫기
          </Button>
        </div>
        <SideSection title="업무" tasks={panelTasks} todayISO={todayISO} />
      </aside>
    );
  }

  return (
    <aside className="side-panel" aria-label="마감 요약">
      <SideSection title="오늘 마감" tasks={dueToday} todayISO={todayISO} />
      <SideSection title="이번 주 마감" tasks={dueThisWeek} todayISO={todayISO} />
      <SideSection title="지연" tasks={delayed} todayISO={todayISO} tone="danger" delayed />
    </aside>
  );
};

export default SidePanel;

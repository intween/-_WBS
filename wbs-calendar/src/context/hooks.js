import { useContext, useMemo } from 'react';
import { applyFilters, applySearchOnly, matchesFacets } from '@/utils/filter';
import { endOfWeek, startOfWeek, today } from '@/utils/date';
import { isDelayed, isDueToday, isDueWithin, summarize, summarizeByStream } from '@/utils/progress';
import { TaskActionsContext, TaskStateContext } from './TaskProvider';
import { UiActionsContext, UiStateContext } from './UiProvider';

const useRequiredContext = (context, name) => {
  const value = useContext(context);
  if (value === null) throw new Error(`${name}가 Provider 밖에서 호출되었습니다.`);
  return value;
};

export const useTasks = () => useRequiredContext(TaskStateContext, 'TaskStateContext');

export const useTaskActions = () => useRequiredContext(TaskActionsContext, 'TaskActionsContext');

export const useUi = () => useContext(UiStateContext);

export const useUiActions = () => useRequiredContext(UiActionsContext, 'UiActionsContext');

export const useVisibleTasks = () => {
  const { tasks } = useTasks();
  const { filters } = useUi();
  return useMemo(() => applyFilters(tasks, filters), [tasks, filters]);
};

export const useCalendarTasks = () => {
  const { tasks } = useTasks();
  const { filters } = useUi();
  return useMemo(() => {
    const todayISO = today();
    return applySearchOnly(tasks, filters).map((task) => ({
      ...task,
      dimmed: !matchesFacets(task, filters, todayISO),
    }));
  }, [tasks, filters]);
};

export const useTaskById = (taskId) => {
  const { tasks } = useTasks();
  return useMemo(() => tasks.find((task) => task.id === taskId) ?? null, [tasks, taskId]);
};

export const useSelectedTask = () => {
  const { selectedTaskId } = useUi();
  return useTaskById(selectedTaskId);
};

export const useOverallProgress = () => {
  const { tasks } = useTasks();
  return useMemo(() => summarize(tasks), [tasks]);
};

export const useStreamProgress = () => {
  const { tasks } = useTasks();
  return useMemo(() => summarizeByStream(tasks), [tasks]);
};

export const useDeadlineBuckets = () => {
  const tasks = useVisibleTasks();
  return useMemo(() => {
    const todayISO = today();
    const weekStart = startOfWeek(todayISO);
    const weekEnd = endOfWeek(todayISO);
    return {
      todayISO,
      dueToday: tasks.filter((task) => isDueToday(task, todayISO)),
      dueThisWeek: tasks.filter(
        (task) =>
          isDueWithin(task, weekStart, weekEnd) &&
          !isDueToday(task, todayISO) &&
          !isDelayed(task, todayISO),
      ),
      delayed: tasks.filter((task) => isDelayed(task, todayISO)),
    };
  }, [tasks]);
};

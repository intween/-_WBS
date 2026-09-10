import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { STREAM_MAP, TASKS } from '@/config';
import { LOAD_STATE } from '@/constants/views';
import { store } from '@/lib/store';
import { createTaskState } from '@/lib/store/types';
import { TASK_ACTIONS, initialTaskState, taskReducer } from './taskReducer';
import { UiActionsContext } from './UiProvider';

const mergeTask = (definition, state) => {
  const stream = STREAM_MAP[definition.stream];
  const base = state ?? createTaskState(definition.id, definition.due);
  return {
    id: definition.id,
    stream: definition.stream,
    streamName: stream.name,
    title: definition.title,
    status: base.status,
    dueDate: base.dueDate ?? definition.due,
    memo: base.memo,
    links: base.links,
    checklist: base.checklist,
    assignee: base.assignee,
    updatedAt: base.updatedAt,
  };
};

export const TaskStateContext = createContext(null);
export const TaskActionsContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);
  const { pushToast } = useContext(UiActionsContext);

  const load = useCallback(async () => {
    dispatch({ type: TASK_ACTIONS.loadStart });
    try {
      const states = await store.loadAll();
      dispatch({ type: TASK_ACTIONS.loadSuccess, states });
    } catch (error) {
      dispatch({ type: TASK_ACTIONS.loadError, error: error.message });
    }
  }, []);

  useEffect(() => {
    load();
    return store.subscribe((states) => {
      if (states) dispatch({ type: TASK_ACTIONS.sync, states });
    });
  }, [load]);

  const updateTask = useCallback(
    async (taskId, patch) => {
      const previous = state.statesById[taskId];
      const definition = TASKS.find((task) => task.id === taskId);
      dispatch({ type: TASK_ACTIONS.patch, taskId, patch });
      try {
        const next = await store.update(taskId, patch);
        dispatch({ type: TASK_ACTIONS.replace, state: next });
        return next;
      } catch {
        dispatch({
          type: TASK_ACTIONS.replace,
          state: previous ?? createTaskState(taskId, definition?.due ?? null),
        });
        pushToast('저장 실패', 'error');
        return null;
      }
    },
    [state.statesById, pushToast],
  );

  const resetAll = useCallback(async () => {
    try {
      await store.reset();
      dispatch({ type: TASK_ACTIONS.clear });
    } catch {
      pushToast('초기화 실패', 'error');
    }
  }, [pushToast]);

  const tasks = useMemo(
    () => TASKS.map((definition) => mergeTask(definition, state.statesById[definition.id])),
    [state.statesById],
  );

  const value = useMemo(
    () => ({
      tasks,
      isLoading: state.loadState === LOAD_STATE.loading,
      hasError: state.loadState === LOAD_STATE.error,
      error: state.error,
    }),
    [tasks, state.loadState, state.error],
  );

  const actions = useMemo(
    () => ({ updateTask, resetAll, reload: load }),
    [updateTask, resetAll, load],
  );

  return (
    <TaskStateContext.Provider value={value}>
      <TaskActionsContext.Provider value={actions}>{children}</TaskActionsContext.Provider>
    </TaskStateContext.Provider>
  );
};

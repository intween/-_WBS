import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { STREAM_MAP, STREAMS } from '@/config';
import { LOAD_STATE } from '@/constants/views';
import { store } from '@/lib/store';
import { createTaskState } from '@/lib/store/types';
import { TASK_ACTIONS, initialTaskState, taskReducer } from './taskReducer';
import { UiActionsContext } from './UiProvider';

const FALLBACK_STREAM = { id: '', name: '미분류' };

const mergeTask = (definition, state) => {
  const stream = STREAM_MAP[definition.stream] ?? FALLBACK_STREAM;
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
      const [definitions, states] = await Promise.all([store.loadTasks(), store.loadAll()]);
      dispatch({ type: TASK_ACTIONS.loadSuccess, definitions, states });
    } catch (error) {
      dispatch({ type: TASK_ACTIONS.loadError, error: error.message });
    }
  }, []);

  useEffect(() => {
    load();
    return store.subscribe((payload) => {
      if (!payload) return;
      // 어댑터는 { tasks, states } 를 넘긴다.
      dispatch({ type: TASK_ACTIONS.sync, states: payload.states, definitions: payload.tasks });
    });
  }, [load]);

  const updateTask = useCallback(
    async (taskId, patch) => {
      const previous = state.statesById[taskId];
      const definition = state.definitions.find((item) => item.id === taskId);
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
    [state.statesById, state.definitions, pushToast],
  );

  const resetAll = useCallback(async () => {
    try {
      await store.reset();
      dispatch({ type: TASK_ACTIONS.clear });
    } catch {
      pushToast('초기화 실패', 'error');
    }
  }, [pushToast]);

  const createTask = useCallback(
    async (draft) => {
      try {
        const definition = await store.createTaskDef({
          stream: draft.stream ?? STREAMS[0].id,
          title: draft.title,
          due: draft.due ?? null,
          sortOrder: draft.sortOrder ?? 0,
        });
        dispatch({ type: TASK_ACTIONS.upsertDef, definition });
        pushToast('업무를 추가했습니다');
        return definition;
      } catch {
        pushToast('업무 추가 실패', 'error');
        return null;
      }
    },
    [pushToast],
  );

  const editTask = useCallback(
    async (taskId, patch) => {
      const previous = state.definitions.find((item) => item.id === taskId);
      // 입력 즉시 반영하고, 실패하면 되돌린다.
      if (previous) dispatch({ type: TASK_ACTIONS.upsertDef, definition: { ...previous, ...patch } });
      try {
        const definition = await store.updateTaskDef(taskId, patch);
        dispatch({ type: TASK_ACTIONS.upsertDef, definition });
        return definition;
      } catch {
        if (previous) dispatch({ type: TASK_ACTIONS.upsertDef, definition: previous });
        pushToast('업무 저장 실패', 'error');
        return null;
      }
    },
    [state.definitions, pushToast],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      try {
        await store.deleteTaskDef(taskId);
        dispatch({ type: TASK_ACTIONS.removeDef, taskId });
        pushToast('업무를 삭제했습니다');
        return true;
      } catch {
        pushToast('업무 삭제 실패', 'error');
        return false;
      }
    },
    [pushToast],
  );

  const tasks = useMemo(
    () => state.definitions.map((definition) => mergeTask(definition, state.statesById[definition.id])),
    [state.definitions, state.statesById],
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
    () => ({ updateTask, resetAll, reload: load, createTask, editTask, deleteTask }),
    [updateTask, resetAll, load, createTask, editTask, deleteTask],
  );

  return (
    <TaskStateContext.Provider value={value}>
      <TaskActionsContext.Provider value={actions}>{children}</TaskActionsContext.Provider>
    </TaskStateContext.Provider>
  );
};

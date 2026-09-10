import { createContext, useCallback, useMemo, useReducer, useRef } from 'react';
import { DEFAULT_VIEW } from '@/constants/views';
import { createDefaultFilters, toggleStream } from '@/utils/filter';

const UI_ACTIONS = {
  setView: 'setView',
  selectTask: 'selectTask',
  closeDetail: 'closeDetail',
  setFilters: 'setFilters',
  resetFilters: 'resetFilters',
  setDragging: 'setDragging',
  setTaskListPanel: 'setTaskListPanel',
  setConfirm: 'setConfirm',
  setShortcuts: 'setShortcuts',
  pushToast: 'pushToast',
  dismissToast: 'dismissToast',
};

const initialUiState = {
  view: DEFAULT_VIEW,
  selectedTaskId: null,
  taskListPanel: null,
  filters: createDefaultFilters(),
  draggingTaskId: null,
  confirm: null,
  shortcutsOpen: false,
  toasts: [],
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case UI_ACTIONS.setView:
      return { ...state, view: action.view, taskListPanel: null };
    case UI_ACTIONS.selectTask:
      return { ...state, selectedTaskId: action.taskId, taskListPanel: null };
    case UI_ACTIONS.closeDetail:
      return { ...state, selectedTaskId: null };
    case UI_ACTIONS.setFilters:
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case UI_ACTIONS.resetFilters:
      return { ...state, filters: createDefaultFilters() };
    case UI_ACTIONS.setDragging:
      return { ...state, draggingTaskId: action.taskId };
    case UI_ACTIONS.setTaskListPanel:
      return { ...state, taskListPanel: action.panel, selectedTaskId: null };
    case UI_ACTIONS.setConfirm:
      return { ...state, confirm: action.confirm };
    case UI_ACTIONS.setShortcuts:
      return { ...state, shortcutsOpen: action.open };
    case UI_ACTIONS.pushToast:
      return { ...state, toasts: [...state.toasts, action.toast] };
    case UI_ACTIONS.dismissToast:
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    default:
      return state;
  }
};

export const UiStateContext = createContext(initialUiState);
export const UiActionsContext = createContext(null);

export const UiProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState);
  const toastSeq = useRef(0);

  const dismissToast = useCallback((id) => {
    dispatch({ type: UI_ACTIONS.dismissToast, id });
  }, []);

  const pushToast = useCallback((message, tone = 'info') => {
    toastSeq.current += 1;
    dispatch({ type: UI_ACTIONS.pushToast, toast: { id: toastSeq.current, message, tone } });
  }, []);

  const actions = useMemo(
    () => ({
      setView: (view) => dispatch({ type: UI_ACTIONS.setView, view }),
      selectTask: (taskId) => dispatch({ type: UI_ACTIONS.selectTask, taskId }),
      closeDetail: () => dispatch({ type: UI_ACTIONS.closeDetail }),
      setFilters: (filters) => dispatch({ type: UI_ACTIONS.setFilters, filters }),
      resetFilters: () => dispatch({ type: UI_ACTIONS.resetFilters }),
      toggleStreamFilter: (streamId) =>
        dispatch({
          type: UI_ACTIONS.setFilters,
          filters: { streams: toggleStream(state.filters.streams, streamId) },
        }),
      setDragging: (taskId) => dispatch({ type: UI_ACTIONS.setDragging, taskId }),
      openTaskListPanel: (panel) => dispatch({ type: UI_ACTIONS.setTaskListPanel, panel }),
      closeTaskListPanel: () => dispatch({ type: UI_ACTIONS.setTaskListPanel, panel: null }),
      openConfirm: (confirm) => dispatch({ type: UI_ACTIONS.setConfirm, confirm }),
      setShortcutsOpen: (open) => dispatch({ type: UI_ACTIONS.setShortcuts, open }),
      closeConfirm: () => dispatch({ type: UI_ACTIONS.setConfirm, confirm: null }),
      pushToast,
      dismissToast,
    }),
    [state.filters.streams, pushToast, dismissToast],
  );

  return (
    <UiStateContext.Provider value={state}>
      <UiActionsContext.Provider value={actions}>{children}</UiActionsContext.Provider>
    </UiStateContext.Provider>
  );
};

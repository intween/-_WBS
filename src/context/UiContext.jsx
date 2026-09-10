/**
 * 화면 상태 Provider — 탭 / 검색 / 필터 / 상세 패널 / Toast.
 * 업무 데이터는 다루지 않는다. (WbsContext 담당)
 */
import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  OWNER_FILTER_ALL,
  STORAGE_KEY_PERIOD,
  STORAGE_KEY_TAB,
  TAB,
  TAB_LIST,
  TOAST_DURATION_MS,
} from '@/constants/config';
import { STATUS_FILTER_ALL } from '@/constants/status';
import { PERIOD_IDS } from '@/data/periods';
import { readStorage, writeStorage } from '@/hooks/useLocalStorage';

export const UiContext = createContext(null);

/** 액션 타입 */
const UI_ACTION = {
  SET_TAB: 'SET_TAB',
  SET_SEARCH: 'SET_SEARCH',
  SET_STATUS_FILTER: 'SET_STATUS_FILTER',
  SET_OWNER_FILTER: 'SET_OWNER_FILTER',
  TOGGLE_STREAM: 'TOGGLE_STREAM',
  TOGGLE_OVERDUE: 'TOGGLE_OVERDUE',
  RESET_FILTERS: 'RESET_FILTERS',
  SELECT_TASK: 'SELECT_TASK',
  SET_PERIOD: 'SET_PERIOD',
  SET_MEMBER_MODAL: 'SET_MEMBER_MODAL',
  PUSH_TOAST: 'PUSH_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
};

/** 필터 기본값 (초기화 버튼이 되돌릴 지점) */
const defaultFilters = {
  search: '',
  statusFilter: STATUS_FILTER_ALL,
  ownerFilter: OWNER_FILTER_ALL,
  /** 빈 배열이면 전체 표시 */
  streamFilter: [],
  onlyOverdue: false,
};

/** localStorage 에 저장된 화면 상태를 반영한 초기값 */
const createInitialState = () => {
  const savedTab = readStorage(STORAGE_KEY_TAB, TAB.BOARD);
  const savedPeriod = readStorage(STORAGE_KEY_PERIOD, PERIOD_IDS[0]);

  return {
    ...defaultFilters,
    tab: TAB_LIST.includes(savedTab) ? savedTab : TAB.BOARD,
    selectedPeriodId: PERIOD_IDS.includes(savedPeriod) ? savedPeriod : PERIOD_IDS[0],
    selectedTaskId: null,
    memberModalOpen: false,
    toasts: [],
  };
};

function uiReducer(state, action) {
  switch (action.type) {
    case UI_ACTION.SET_TAB:
      return { ...state, tab: action.payload.tab };

    case UI_ACTION.SET_SEARCH:
      return { ...state, search: action.payload.search };

    case UI_ACTION.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload.status };

    case UI_ACTION.SET_OWNER_FILTER:
      return { ...state, ownerFilter: action.payload.ownerId };

    case UI_ACTION.TOGGLE_STREAM: {
      const { streamId } = action.payload;
      const selected = state.streamFilter.includes(streamId);
      return {
        ...state,
        streamFilter: selected
          ? state.streamFilter.filter((id) => id !== streamId)
          : [...state.streamFilter, streamId],
      };
    }

    case UI_ACTION.TOGGLE_OVERDUE:
      return { ...state, onlyOverdue: !state.onlyOverdue };

    case UI_ACTION.RESET_FILTERS:
      return { ...state, ...defaultFilters };

    case UI_ACTION.SELECT_TASK:
      return { ...state, selectedTaskId: action.payload.taskId };

    case UI_ACTION.SET_PERIOD:
      return { ...state, selectedPeriodId: action.payload.periodId };

    case UI_ACTION.SET_MEMBER_MODAL:
      return { ...state, memberModalOpen: action.payload.open };

    case UI_ACTION.PUSH_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload.toast] };

    case UI_ACTION.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload.id),
      };

    default:
      return state;
  }
}

export function UiProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, undefined, createInitialState);
  const toastSeq = useRef(0);
  const toastTimers = useRef(new Map());

  // 탭 / 선택 기간은 다음 접속 때도 유지한다.
  useEffect(() => {
    writeStorage(STORAGE_KEY_TAB, state.tab);
  }, [state.tab]);

  useEffect(() => {
    writeStorage(STORAGE_KEY_PERIOD, state.selectedPeriodId);
  }, [state.selectedPeriodId]);

  const dismissToast = useCallback((id) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    dispatch({ type: UI_ACTION.DISMISS_TOAST, payload: { id } });
  }, []);

  /** Toast 표시 — type: 'success' | 'error' | 'info' */
  const showToast = useCallback(
    (message, type = 'info') => {
      const text = String(message ?? '').trim();
      if (!text) return null;

      toastSeq.current += 1;
      const id = `toast-${toastSeq.current}`;
      dispatch({ type: UI_ACTION.PUSH_TOAST, payload: { toast: { id, type, message: text } } });

      const timer = setTimeout(() => {
        toastTimers.current.delete(id);
        dispatch({ type: UI_ACTION.DISMISS_TOAST, payload: { id } });
      }, TOAST_DURATION_MS);
      toastTimers.current.set(id, timer);

      return id;
    },
    []
  );

  // 언마운트 시 남은 타이머 정리
  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const actions = useMemo(
    () => ({
      setTab: (tab) => dispatch({ type: UI_ACTION.SET_TAB, payload: { tab } }),
      setSearch: (search) => dispatch({ type: UI_ACTION.SET_SEARCH, payload: { search } }),
      setStatusFilter: (status) =>
        dispatch({ type: UI_ACTION.SET_STATUS_FILTER, payload: { status } }),
      setOwnerFilter: (ownerId) =>
        dispatch({ type: UI_ACTION.SET_OWNER_FILTER, payload: { ownerId } }),
      toggleStream: (streamId) =>
        dispatch({ type: UI_ACTION.TOGGLE_STREAM, payload: { streamId } }),
      toggleOverdue: () => dispatch({ type: UI_ACTION.TOGGLE_OVERDUE }),
      resetFilters: () => dispatch({ type: UI_ACTION.RESET_FILTERS }),
      selectTask: (taskId) => dispatch({ type: UI_ACTION.SELECT_TASK, payload: { taskId } }),
      closeTask: () => dispatch({ type: UI_ACTION.SELECT_TASK, payload: { taskId: null } }),
      setPeriod: (periodId) => dispatch({ type: UI_ACTION.SET_PERIOD, payload: { periodId } }),
      openMemberModal: () =>
        dispatch({ type: UI_ACTION.SET_MEMBER_MODAL, payload: { open: true } }),
      closeMemberModal: () =>
        dispatch({ type: UI_ACTION.SET_MEMBER_MODAL, payload: { open: false } }),
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  /** 기본값에서 하나라도 벗어났는지 — 툴바의 '필터 초기화' 노출 판단용 */
  const hasActiveFilter = useMemo(
    () =>
      state.search !== defaultFilters.search ||
      state.statusFilter !== defaultFilters.statusFilter ||
      state.ownerFilter !== defaultFilters.ownerFilter ||
      state.streamFilter.length > 0 ||
      state.onlyOverdue,
    [state.search, state.statusFilter, state.ownerFilter, state.streamFilter, state.onlyOverdue]
  );

  const value = useMemo(
    () => ({ ...state, hasActiveFilter, ...actions }),
    [state, hasActiveFilter, actions]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export default UiProvider;

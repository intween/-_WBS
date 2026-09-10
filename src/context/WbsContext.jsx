/**
 * 업무 데이터 Provider.
 *
 * - 최초 진입 시 상태/팀원/코멘트/이력을 불러오고, 없는 업무 행은 자동 seed 한다.
 * - Supabase Realtime 으로 다른 사람의 변경을 받아 반영한다.
 * - 쓰기 동작은 wbsActions.js 로 분리했다. (낙관적 업데이트 + 롤백)
 *
 * Supabase 호출은 전부 lib/api 를 거친다.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  fetchComments,
  fetchMembers,
  fetchRecentActivity,
  initTaskStates,
  isDemoMode,
} from '@/lib/api';
import { HIGHLIGHT_DURATION_MS } from '@/constants/config';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { UiContext } from './UiContext';
import { UserContext } from './UserContext';
import { WBS_ACTION, initialWbsState, wbsReducer } from './wbsReducer';
import { createWbsActions } from './wbsActions';

export const WbsContext = createContext(null);

export function WbsProvider({ children }) {
  const [state, dispatch] = useReducer(wbsReducer, initialWbsState);
  const { run } = useOptimisticUpdate();

  const ui = useContext(UiContext);
  const user = useContext(UserContext);
  const showToast = ui?.showToast;

  // 콜백 정체성을 유지하면서 최신 값을 읽기 위한 ref
  const stateRef = useRef(state);
  stateRef.current = state;

  const memberIdRef = useRef(user?.memberId ?? null);
  memberIdRef.current = user?.memberId ?? null;

  /** 지금 입력 중인 필드 — 외부 변경이 덮어쓰지 않도록 보호한다. */
  const editingRef = useRef(null);
  const highlightTimers = useRef(new Map());

  const notifyError = useCallback(
    (error) => {
      const message = error?.message || '알 수 없는 오류가 발생했습니다.';
      if (showToast) showToast(message, 'error');
      else console.error('[wbs]', message);
    },
    [showToast]
  );

  // ---------------------------------------------
  // 최초 로딩
  // ---------------------------------------------
  const load = useCallback(async () => {
    dispatch({ type: WBS_ACTION.LOAD_START });
    try {
      const [taskResult, members, comments, activity] = await Promise.all([
        initTaskStates(),
        fetchMembers(),
        fetchComments(),
        fetchRecentActivity(),
      ]);

      dispatch({
        type: WBS_ACTION.LOAD_SUCCESS,
        payload: { taskStates: taskResult.rows, members, comments, activity },
      });
    } catch (error) {
      console.error('[wbs] 초기 로딩 실패', error);
      dispatch({
        type: WBS_ACTION.LOAD_ERROR,
        payload: { error: error.message || '데이터를 불러오지 못했습니다.' },
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------------------------------------
  // Realtime 수신
  // ---------------------------------------------
  const scheduleHighlightClear = useCallback((taskId) => {
    const timers = highlightTimers.current;
    if (timers.has(taskId)) clearTimeout(timers.get(taskId));

    timers.set(
      taskId,
      setTimeout(() => {
        timers.delete(taskId);
        dispatch({ type: WBS_ACTION.CLEAR_HIGHLIGHT, payload: { taskId } });
      }, HIGHLIGHT_DURATION_MS)
    );
  }, []);

  const handleRemoteTaskState = useCallback(
    (row) => {
      // 내가 방금 저장한 변경이 돌아온 것이면 깜빡이지 않는다.
      const isMine = Boolean(row.updated_by) && row.updated_by === memberIdRef.current;

      // 입력 중인 필드는 덮어쓰지 않고 보류한다.
      const editing = editingRef.current;
      const protectedField = editing && editing.taskId === row.task_id ? editing.field : null;

      dispatch({
        type: WBS_ACTION.REMOTE_TASK_STATE,
        payload: { row, protectedField, highlight: !isMine },
      });

      if (!isMine) scheduleHighlightClear(row.task_id);
    },
    [scheduleHighlightClear]
  );

  const handleRemoteComment = useCallback((row, event) => {
    dispatch({ type: WBS_ACTION.REMOTE_COMMENT, payload: { row, event } });
  }, []);

  const realtime = useRealtimeSync({
    onTaskState: handleRemoteTaskState,
    onComment: handleRemoteComment,
  });

  // 언마운트 시 깜빡임 타이머 정리
  useEffect(() => {
    const timers = highlightTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // ---------------------------------------------
  // 쓰기 동작
  // ---------------------------------------------
  const actions = useMemo(
    () => createWbsActions({ dispatch, stateRef, memberIdRef, run, notifyError, showToast }),
    [run, notifyError, showToast]
  );

  /** 입력 중인 필드 등록 — 외부 변경으로 덮어쓰지 않게 한다. */
  const beginEditing = useCallback((taskId, field) => {
    editingRef.current = { taskId, field };
  }, []);

  /**
   * 편집 종료 — 보호만 해제한다.
   * 보류된 외부 변경은 사용자가 직접 선택하도록 그대로 남겨둔다.
   */
  const endEditing = useCallback(() => {
    editingRef.current = null;
  }, []);

  /**
   * 보류해둔 외부 변경을 처리한다.
   * @param {string} taskId
   * @param {boolean} apply - true 면 최신 값으로 덮어쓰고, false 면 버린다.
   */
  const resolvePendingRemote = useCallback((taskId, apply = false) => {
    if (!taskId) return;
    dispatch({
      type: WBS_ACTION.RESOLVE_PENDING_REMOTE,
      payload: { taskId, apply },
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isDemoMode,
      realtimeStatus: realtime.status,
      isOnline: realtime.isOnline,
      reconnect: realtime.reconnect,
      reload: load,
      beginEditing,
      endEditing,
      resolvePendingRemote,
      ...actions,
    }),
    [
      state,
      realtime.status,
      realtime.isOnline,
      realtime.reconnect,
      load,
      beginEditing,
      endEditing,
      resolvePendingRemote,
      actions,
    ]
  );

  return <WbsContext.Provider value={value}>{children}</WbsContext.Provider>;
}

export default WbsProvider;

/**
 * 업무 데이터 쓰기 동작 모음.
 *
 * WbsContext.jsx 가 Provider 배선에 집중할 수 있도록 분리했다.
 * ref 로 최신 상태를 읽으므로 반환되는 함수들의 정체성은 유지된다.
 */
import {
  createComment,
  createMember,
  deleteComment,
  deleteMember,
  fetchMembers,
  fetchRecentActivity,
  initTaskStates,
  logActivity,
  updateMember,
  updateTaskState,
} from '@/lib/api';
import { RECENT_ACTIVITY_LIMIT } from '@/constants/config';
import { buildActivityEntries } from '@/utils/diff';
import { WBS_ACTION } from './wbsReducer';

/** 두 값이 실질적으로 같은지 (객체/배열 포함) */
const isSameValue = (a, b) => {
  if (a === b) return true;
  if (typeof a === 'object' || typeof b === 'object') {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  }
  return (a ?? null) === (b ?? null);
};

/**
 * @param {Object} deps
 * @param {Function} deps.dispatch
 * @param {{ current: Object }} deps.stateRef      - 최신 리듀서 상태
 * @param {{ current: string|null }} deps.memberIdRef - 현재 사용자 id
 * @param {Function} deps.run                      - useOptimisticUpdate 의 run
 * @param {Function} deps.notifyError              - 실패 알림
 * @param {Function} [deps.showToast]
 */
export const createWbsActions = ({
  dispatch,
  stateRef,
  memberIdRef,
  run,
  notifyError,
  showToast,
}) => {
  /** 실제로 바뀐 필드만 변경 이력으로 남긴다. */
  const recordActivity = ({ taskId, memberId, before, row, changedKeys }) => {
    const after = changedKeys.reduce((acc, key) => {
      acc[key] = row[key];
      return acc;
    }, {});

    const entries = buildActivityEntries({
      taskId,
      memberId,
      before,
      after,
      memberMap: stateRef.current.memberMap,
    });
    if (entries.length === 0) return;

    // 화면에는 즉시 반영하고, 서버 기록은 뒤에서 처리한다.
    const now = new Date().toISOString();
    dispatch({
      type: WBS_ACTION.PREPEND_ACTIVITY,
      payload: {
        entries: entries.map((entry, index) => ({
          ...entry,
          id: `local-${now}-${index}`,
          created_at: now,
        })),
        limit: RECENT_ACTIVITY_LIMIT,
      },
    });

    logActivity(entries);
  };

  /**
   * 업무 상태 부분 수정 — 낙관적 업데이트.
   * 값이 그대로면 서버를 부르지 않고, 변경 이력도 남기지 않는다.
   */
  const updateTask = async (taskId, patch) => {
    const before = stateRef.current.stateMap[taskId];
    if (!before) {
      notifyError(new Error('업무를 찾을 수 없습니다.'));
      return { ok: false };
    }

    const changedKeys = Object.keys(patch).filter(
      (key) => !isSameValue(before[key], patch[key])
    );
    if (changedKeys.length === 0) return { ok: true, data: before };

    const memberId = memberIdRef.current;
    const rollbackPatch = changedKeys.reduce((acc, key) => {
      acc[key] = before[key];
      return acc;
    }, {});

    return run({
      optimistic: () =>
        dispatch({ type: WBS_ACTION.PATCH_TASK_STATE, payload: { taskId, patch } }),
      commit: () => updateTaskState(taskId, patch, memberId),
      rollback: () =>
        dispatch({
          type: WBS_ACTION.PATCH_TASK_STATE,
          payload: { taskId, patch: rollbackPatch },
        }),
      onSuccess: (row) => {
        dispatch({ type: WBS_ACTION.REPLACE_TASK_STATE, payload: { row } });
        recordActivity({ taskId, memberId, before, row, changedKeys });
      },
      onError: notifyError,
    });
  };

  // --- 코멘트 ---

  const addComment = async (taskId, body) => {
    try {
      const comment = await createComment({
        taskId,
        memberId: memberIdRef.current,
        body,
      });
      dispatch({ type: WBS_ACTION.ADD_COMMENT, payload: { comment } });
      return { ok: true, data: comment };
    } catch (error) {
      notifyError(error);
      return { ok: false, error };
    }
  };

  const removeComment = async (id) => {
    const snapshot = stateRef.current.comments;

    return run({
      optimistic: () => dispatch({ type: WBS_ACTION.REMOVE_COMMENT, payload: { id } }),
      commit: () => deleteComment(id),
      rollback: () =>
        dispatch({ type: WBS_ACTION.SET_COMMENTS, payload: { comments: snapshot } }),
      onError: notifyError,
    });
  };

  // --- 팀원 관리 ---

  const refreshMembers = async () => {
    const members = await fetchMembers();
    dispatch({ type: WBS_ACTION.SET_MEMBERS, payload: { members } });
    return members;
  };

  const addMember = async ({ name, role, color }) => {
    try {
      await createMember({ name, role, color, index: stateRef.current.members.length });
      await refreshMembers();
      showToast?.('팀원을 추가했습니다.', 'success');
      return { ok: true };
    } catch (error) {
      notifyError(error);
      return { ok: false, error };
    }
  };

  const editMember = async (id, patch) => {
    try {
      await updateMember(id, patch);
      await refreshMembers();
      showToast?.('팀원 정보를 수정했습니다.', 'success');
      return { ok: true };
    } catch (error) {
      notifyError(error);
      return { ok: false, error };
    }
  };

  /** 팀원 삭제 — 담당 업무는 DB 에서 미지정으로 바뀌므로 상태도 다시 읽는다. */
  const removeMember = async (id) => {
    try {
      await deleteMember(id);
      const [members, taskResult] = await Promise.all([fetchMembers(), initTaskStates()]);

      dispatch({ type: WBS_ACTION.SET_MEMBERS, payload: { members } });
      taskResult.rows.forEach((row) =>
        dispatch({ type: WBS_ACTION.REPLACE_TASK_STATE, payload: { row } })
      );

      showToast?.('팀원을 삭제했습니다. 담당 업무는 미지정으로 바뀝니다.', 'success');
      return { ok: true };
    } catch (error) {
      notifyError(error);
      return { ok: false, error };
    }
  };

  // --- 변경 이력 ---

  const refreshActivity = async () => {
    try {
      const activity = await fetchRecentActivity();
      dispatch({ type: WBS_ACTION.SET_ACTIVITY, payload: { activity } });
      return activity;
    } catch (error) {
      console.warn('[wbs] 변경 이력 새로고침 실패', error);
      return stateRef.current.activity;
    }
  };

  return {
    updateTask,
    addComment,
    removeComment,
    refreshMembers,
    addMember,
    editMember,
    removeMember,
    refreshActivity,
  };
};

export default createWbsActions;

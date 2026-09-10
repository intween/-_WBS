/**
 * 업무 상태 리듀서 — 순수 함수.
 * 네트워크 호출은 여기서 하지 않는다. (Provider 담당)
 */

/** 액션 타입 */
export const WBS_ACTION = {
  LOAD_START: 'LOAD_START',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_ERROR: 'LOAD_ERROR',

  SET_MEMBERS: 'SET_MEMBERS',
  SET_ACTIVITY: 'SET_ACTIVITY',
  PREPEND_ACTIVITY: 'PREPEND_ACTIVITY',

  PATCH_TASK_STATE: 'PATCH_TASK_STATE',
  REPLACE_TASK_STATE: 'REPLACE_TASK_STATE',
  REMOTE_TASK_STATE: 'REMOTE_TASK_STATE',
  RESOLVE_PENDING_REMOTE: 'RESOLVE_PENDING_REMOTE',

  SET_COMMENTS: 'SET_COMMENTS',
  ADD_COMMENT: 'ADD_COMMENT',
  REMOVE_COMMENT: 'REMOVE_COMMENT',
  REMOTE_COMMENT: 'REMOTE_COMMENT',

  CLEAR_HIGHLIGHT: 'CLEAR_HIGHLIGHT',
};

/** 초기 상태 */
export const initialWbsState = {
  loading: true,
  error: null,
  /** taskId → task_states 행 */
  stateMap: {},
  members: [],
  /** member id → member */
  memberMap: {},
  /** 전체 코멘트 (최신순) */
  comments: [],
  /** taskId → 코멘트 수 */
  commentCounts: {},
  /** 최근 변경 이력 */
  activity: [],
  /** taskId → 깜빡임 토큰 (외부 변경 알림) */
  highlights: {},
  /** taskId → { field, value } — 편집 중이라 반영을 미룬 외부 변경 */
  pendingRemote: {},
};

// ---------------------------------------------
// 파생 값 계산 헬퍼
// ---------------------------------------------

/** 배열을 id 기준 맵으로 */
const toMap = (rows, key) =>
  rows.reduce((acc, row) => {
    acc[row[key]] = row;
    return acc;
  }, {});

/** 코멘트 배열 → 업무별 개수 */
const countComments = (comments) =>
  comments.reduce((acc, comment) => {
    acc[comment.task_id] = (acc[comment.task_id] || 0) + 1;
    return acc;
  }, {});

/** 코멘트를 최신순으로 정렬 */
const sortNewestFirst = (comments) =>
  [...comments].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

/** 코멘트 목록 교체 시 개수도 함께 갱신 */
const withComments = (state, comments) => ({
  ...state,
  comments,
  commentCounts: countComments(comments),
});

// ---------------------------------------------
// 리듀서
// ---------------------------------------------

export function wbsReducer(state, action) {
  switch (action.type) {
    case WBS_ACTION.LOAD_START:
      return { ...state, loading: true, error: null };

    case WBS_ACTION.LOAD_SUCCESS: {
      const { taskStates = [], members = [], comments = [], activity = [] } = action.payload;
      return {
        ...state,
        loading: false,
        error: null,
        stateMap: toMap(taskStates, 'task_id'),
        members,
        memberMap: toMap(members, 'id'),
        comments: sortNewestFirst(comments),
        commentCounts: countComments(comments),
        activity,
      };
    }

    case WBS_ACTION.LOAD_ERROR:
      return { ...state, loading: false, error: action.payload.error };

    case WBS_ACTION.SET_MEMBERS: {
      const { members } = action.payload;
      return { ...state, members, memberMap: toMap(members, 'id') };
    }

    case WBS_ACTION.SET_ACTIVITY:
      return { ...state, activity: action.payload.activity };

    /**
     * 내가 만든 변경 이력을 목록 앞에 바로 붙인다.
     * 매번 서버를 다시 조회하지 않고도 대시보드에 즉시 보이게 하기 위함이다.
     */
    case WBS_ACTION.PREPEND_ACTIVITY: {
      const { entries = [], limit } = action.payload;
      if (entries.length === 0) return state;
      return { ...state, activity: [...entries, ...state.activity].slice(0, limit) };
    }

    /** 낙관적 업데이트 / 롤백 — 일부 필드만 덮어쓴다. */
    case WBS_ACTION.PATCH_TASK_STATE: {
      const { taskId, patch } = action.payload;
      const current = state.stateMap[taskId];
      if (!current) return state;

      return {
        ...state,
        stateMap: { ...state.stateMap, [taskId]: { ...current, ...patch } },
      };
    }

    /** 서버 응답으로 행 전체 교체 */
    case WBS_ACTION.REPLACE_TASK_STATE: {
      const { row } = action.payload;
      if (!row?.task_id) return state;

      return {
        ...state,
        stateMap: { ...state.stateMap, [row.task_id]: row },
      };
    }

    /**
     * 다른 사람의 변경 반영.
     * protectedField 가 있으면 그 필드만 현재 값을 지키고,
     * 들어온 값은 pendingRemote 에 보관했다가 편집이 끝난 뒤 처리한다.
     */
    case WBS_ACTION.REMOTE_TASK_STATE: {
      const { row, protectedField = null, highlight = false } = action.payload;
      if (!row?.task_id) return state;

      const taskId = row.task_id;
      const current = state.stateMap[taskId];
      let nextRow = row;
      let nextPending = state.pendingRemote;

      if (protectedField && current && row[protectedField] !== current[protectedField]) {
        nextRow = { ...row, [protectedField]: current[protectedField] };
        nextPending = {
          ...state.pendingRemote,
          [taskId]: { field: protectedField, value: row[protectedField] },
        };
      }

      return {
        ...state,
        stateMap: { ...state.stateMap, [taskId]: nextRow },
        pendingRemote: nextPending,
        highlights: highlight
          ? { ...state.highlights, [taskId]: (state.highlights[taskId] || 0) + 1 }
          : state.highlights,
      };
    }

    /** 보류했던 외부 변경을 반영하거나 버린다. */
    case WBS_ACTION.RESOLVE_PENDING_REMOTE: {
      const { taskId, apply = false } = action.payload;
      const pending = state.pendingRemote[taskId];
      if (!pending) return state;

      const { [taskId]: _removed, ...restPending } = state.pendingRemote;
      const current = state.stateMap[taskId];

      return {
        ...state,
        pendingRemote: restPending,
        stateMap:
          apply && current
            ? { ...state.stateMap, [taskId]: { ...current, [pending.field]: pending.value } }
            : state.stateMap,
      };
    }

    case WBS_ACTION.SET_COMMENTS:
      return withComments(state, sortNewestFirst(action.payload.comments));

    case WBS_ACTION.ADD_COMMENT: {
      const { comment } = action.payload;
      if (!comment?.id) return state;
      // 내가 넣은 코멘트가 Realtime 으로 다시 돌아오는 경우를 대비해 중복을 막는다.
      if (state.comments.some((item) => item.id === comment.id)) return state;

      return withComments(state, sortNewestFirst([comment, ...state.comments]));
    }

    case WBS_ACTION.REMOVE_COMMENT: {
      const { id } = action.payload;
      const next = state.comments.filter((comment) => comment.id !== id);
      if (next.length === state.comments.length) return state;

      return withComments(state, next);
    }

    /** 다른 사람의 코멘트 변경 반영 */
    case WBS_ACTION.REMOTE_COMMENT: {
      const { row, event } = action.payload;
      if (!row?.id) return state;

      if (event === 'DELETE') {
        return wbsReducer(state, {
          type: WBS_ACTION.REMOVE_COMMENT,
          payload: { id: row.id },
        });
      }

      const exists = state.comments.some((comment) => comment.id === row.id);
      const next = exists
        ? state.comments.map((comment) => (comment.id === row.id ? row : comment))
        : [row, ...state.comments];

      return withComments(state, sortNewestFirst(next));
    }

    case WBS_ACTION.CLEAR_HIGHLIGHT: {
      const { taskId } = action.payload;
      if (!(taskId in state.highlights)) return state;

      const { [taskId]: _removed, ...rest } = state.highlights;
      return { ...state, highlights: rest };
    }

    default:
      return state;
  }
}

export default wbsReducer;

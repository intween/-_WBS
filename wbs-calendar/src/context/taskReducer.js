import { LOAD_STATE } from '@/constants/views';
import { normalizeTaskDef, normalizeTaskState } from '@/lib/store/types';

export const TASK_ACTIONS = {
  loadStart: 'loadStart',
  loadSuccess: 'loadSuccess',
  loadError: 'loadError',
  sync: 'sync',
  patch: 'patch',
  replace: 'replace',
  clear: 'clear',
  upsertDef: 'upsertDef',
  removeDef: 'removeDef',
};

export const initialTaskState = {
  loadState: LOAD_STATE.idle,
  error: null,
  statesById: {},
  definitions: [],
};

const toMap = (states) =>
  states.reduce((acc, state) => {
    acc[state.taskId] = normalizeTaskState(state);
    return acc;
  }, {});

const toDefs = (definitions) => definitions.map(normalizeTaskDef);

// 낙관적 업데이트용. 아직 상태가 없는 업무를 처음 수정하면 statesById[taskId] 가
// undefined 라서, 그대로 펼치면 links/checklist 가 빠진 채로 화면에 내려간다.
// 저장이 끝나기 전 이 값으로 렌더링되므로 여기서 기본값을 채워준다.
const mergePatch = (statesById, taskId, patch) => ({
  ...statesById,
  [taskId]: normalizeTaskState({ ...statesById[taskId], ...patch, taskId }),
});

const upsertDef = (definitions, definition) => {
  const next = normalizeTaskDef(definition);
  const index = definitions.findIndex((item) => item.id === next.id);
  if (index === -1) return [...definitions, next];
  return definitions.map((item, i) => (i === index ? next : item));
};

export const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.loadStart:
      return { ...state, loadState: LOAD_STATE.loading, error: null };
    case TASK_ACTIONS.loadSuccess:
      return {
        loadState: LOAD_STATE.ready,
        error: null,
        statesById: toMap(action.states),
        definitions: toDefs(action.definitions),
      };
    case TASK_ACTIONS.loadError:
      return { ...state, loadState: LOAD_STATE.error, error: action.error };
    case TASK_ACTIONS.sync:
      return {
        ...state,
        statesById: toMap(action.states),
        definitions: action.definitions ? toDefs(action.definitions) : state.definitions,
      };
    case TASK_ACTIONS.patch:
      return { ...state, statesById: mergePatch(state.statesById, action.taskId, action.patch) };
    case TASK_ACTIONS.replace:
      return {
        ...state,
        statesById: { ...state.statesById, [action.state.taskId]: action.state },
      };
    case TASK_ACTIONS.clear:
      return { ...state, statesById: {} };
    case TASK_ACTIONS.upsertDef:
      return { ...state, definitions: upsertDef(state.definitions, action.definition) };
    case TASK_ACTIONS.removeDef:
      return {
        ...state,
        definitions: state.definitions.filter((item) => item.id !== action.taskId),
        statesById: Object.fromEntries(
          Object.entries(state.statesById).filter(([taskId]) => taskId !== action.taskId),
        ),
      };
    default:
      return state;
  }
};

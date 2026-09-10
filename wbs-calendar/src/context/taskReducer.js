import { LOAD_STATE } from '@/constants/views';
import { normalizeTaskState } from '@/lib/store/types';

export const TASK_ACTIONS = {
  loadStart: 'loadStart',
  loadSuccess: 'loadSuccess',
  loadError: 'loadError',
  sync: 'sync',
  patch: 'patch',
  replace: 'replace',
  clear: 'clear',
};

export const initialTaskState = {
  loadState: LOAD_STATE.idle,
  error: null,
  statesById: {},
};

const toMap = (states) =>
  states.reduce((acc, state) => {
    acc[state.taskId] = normalizeTaskState(state);
    return acc;
  }, {});

const mergePatch = (statesById, taskId, patch) => ({
  ...statesById,
  [taskId]: { ...statesById[taskId], ...patch, taskId },
});

export const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.loadStart:
      return { ...state, loadState: LOAD_STATE.loading, error: null };
    case TASK_ACTIONS.loadSuccess:
      return { loadState: LOAD_STATE.ready, error: null, statesById: toMap(action.states) };
    case TASK_ACTIONS.loadError:
      return { ...state, loadState: LOAD_STATE.error, error: action.error };
    case TASK_ACTIONS.sync:
      return { ...state, statesById: toMap(action.states) };
    case TASK_ACTIONS.patch:
      return { ...state, statesById: mergePatch(state.statesById, action.taskId, action.patch) };
    case TASK_ACTIONS.replace:
      return {
        ...state,
        statesById: { ...state.statesById, [action.state.taskId]: action.state },
      };
    case TASK_ACTIONS.clear:
      return { ...state, statesById: {} };
    default:
      return state;
  }
};

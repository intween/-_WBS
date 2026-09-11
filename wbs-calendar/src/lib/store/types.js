import { DEFAULT_STATUS, STATUS_KEYS } from '@/constants/status';
import { isValidISO } from '@/utils/date';

export const STORE_MODES = { local: 'local', http: 'http', supabase: 'supabase' };

export const STORE_METHODS = [
  'loadAll',
  'update',
  'reset',
  'subscribe',
  'loadTasks',
  'createTaskDef',
  'updateTaskDef',
  'deleteTaskDef',
];

/** 업무 정의. 예전에는 config/tasks.js 에 고정돼 있었고 지금은 저장소에서 온다. */
export const TASK_DEF_SHAPE = {
  id: 'string',
  stream: 'string',
  title: 'string',
  due: 'YYYY-MM-DD | null',
  sortOrder: 'number',
};

export const TASK_DEF_PATCHABLE = ['stream', 'title', 'due', 'sortOrder'];

export const normalizeTaskDef = (raw) => ({
  id: String(raw.id),
  stream: String(raw.stream ?? ''),
  title: String(raw.title ?? ''),
  due: isValidISO(raw.due) ? raw.due : null,
  sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : 0,
});

export const applyTaskDefPatch = (definition, patch) =>
  normalizeTaskDef({
    ...definition,
    ...TASK_DEF_PATCHABLE.reduce((acc, field) => {
      if (field in patch) acc[field] = patch[field];
      return acc;
    }, {}),
    id: definition.id,
  });

export const TASK_STATE_SHAPE = {
  taskId: 'string',
  status: 'todo | doing | done | hold',
  dueDate: 'YYYY-MM-DD | null',
  memo: 'string',
  links: '{ id, label, url }[]',
  checklist: '{ id, text, done }[]',
  assignee: 'string | null',
  updatedAt: 'ISO datetime',
};

export const PATCHABLE_FIELDS = ['status', 'dueDate', 'memo', 'links', 'checklist', 'assignee'];

export const createTaskState = (taskId, dueDate = null) => ({
  taskId,
  status: DEFAULT_STATUS,
  dueDate,
  memo: '',
  links: [],
  checklist: [],
  assignee: null,
  updatedAt: new Date().toISOString(),
});

const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeLink = (link, index) => ({
  id: String(link?.id ?? `link-${index}`),
  label: String(link?.label ?? ''),
  url: String(link?.url ?? ''),
});

const normalizeChecklistItem = (item, index) => ({
  id: String(item?.id ?? `check-${index}`),
  text: String(item?.text ?? ''),
  done: Boolean(item?.done),
});

export const normalizeTaskState = (raw) => ({
  taskId: String(raw.taskId),
  status: STATUS_KEYS.includes(raw.status) ? raw.status : DEFAULT_STATUS,
  dueDate: isValidISO(raw.dueDate) ? raw.dueDate : null,
  memo: typeof raw.memo === 'string' ? raw.memo : '',
  links: asArray(raw.links).map(normalizeLink),
  checklist: asArray(raw.checklist).map(normalizeChecklistItem),
  assignee: raw.assignee ?? null,
  updatedAt: raw.updatedAt ?? new Date().toISOString(),
});

export const applyPatch = (state, patch) =>
  normalizeTaskState({
    ...state,
    ...PATCHABLE_FIELDS.reduce((acc, field) => {
      if (field in patch) acc[field] = patch[field];
      return acc;
    }, {}),
    taskId: state.taskId,
    updatedAt: new Date().toISOString(),
  });

export const createId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

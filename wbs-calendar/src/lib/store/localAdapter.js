import { TASKS as SEED_TASKS } from '@/config/tasks';
import {
  applyPatch,
  applyTaskDefPatch,
  createId,
  createTaskState,
  normalizeTaskDef,
  normalizeTaskState,
} from './types';

const STATE_KEY = 'wbs-calendar:task-states:v3';
const TASK_KEY = 'wbs-calendar:tasks:v1';

const readRaw = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const writeRaw = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

/* --- 업무 정의 ------------------------------------------------------------ */

// 처음 실행이면 config/tasks.js 를 그대로 심는다. 이후에는 저장된 쪽이 원본이다.
const seedTasks = () => {
  const map = SEED_TASKS.reduce((acc, task, index) => {
    acc[task.id] = normalizeTaskDef({ ...task, sortOrder: (index + 1) * 10 });
    return acc;
  }, {});
  writeRaw(TASK_KEY, map);
  return map;
};

const readTaskMap = () => readRaw(TASK_KEY) ?? seedTasks();

const sortTasks = (list) =>
  [...list].sort((a, b) => (a.due ?? '').localeCompare(b.due ?? '') || a.sortOrder - b.sortOrder);

/* --- 진행 상태 ------------------------------------------------------------ */

const readStateMap = () => readRaw(STATE_KEY) ?? {};

export const createLocalAdapter = () => {
  const listeners = new Set();

  const loadTasks = async () => sortTasks(Object.values(readTaskMap()).map(normalizeTaskDef));

  const loadAll = async () => Object.values(readStateMap()).map(normalizeTaskState);

  const notify = () => {
    if (listeners.size === 0) return;
    const tasks = sortTasks(Object.values(readTaskMap()).map(normalizeTaskDef));
    const states = Object.values(readStateMap()).map(normalizeTaskState);
    listeners.forEach((listener) => listener({ tasks, states }));
  };

  const handleStorageEvent = (event) => {
    if (event.key === STATE_KEY || event.key === TASK_KEY || event.key === null) notify();
  };

  const update = async (taskId, patch) => {
    const map = readStateMap();
    const current = map[taskId] ? normalizeTaskState(map[taskId]) : createTaskState(taskId);
    const next = applyPatch(current, patch);
    map[taskId] = next;
    writeRaw(STATE_KEY, map);
    notify();
    return next;
  };

  const reset = async () => {
    window.localStorage.removeItem(STATE_KEY);
    notify();
  };

  const createTaskDef = async (draft) => {
    const map = readTaskMap();
    const definition = normalizeTaskDef({ ...draft, id: draft.id || createId('task') });
    map[definition.id] = definition;
    writeRaw(TASK_KEY, map);
    notify();
    return definition;
  };

  const updateTaskDef = async (taskId, patch) => {
    const map = readTaskMap();
    if (!map[taskId]) throw new Error('없는 업무입니다');
    const next = applyTaskDefPatch(normalizeTaskDef(map[taskId]), patch);
    map[taskId] = next;
    writeRaw(TASK_KEY, map);
    notify();
    return next;
  };

  const deleteTaskDef = async (taskId) => {
    const map = readTaskMap();
    delete map[taskId];
    writeRaw(TASK_KEY, map);

    // 업무가 사라지면 그 진행 상태도 남겨둘 이유가 없다. (Supabase 의 cascade 와 동일)
    const states = readStateMap();
    delete states[taskId];
    writeRaw(STATE_KEY, states);

    notify();
  };

  const subscribe = (listener) => {
    if (listeners.size === 0) window.addEventListener('storage', handleStorageEvent);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener('storage', handleStorageEvent);
    };
  };

  return { loadAll, update, reset, subscribe, loadTasks, createTaskDef, updateTaskDef, deleteTaskDef };
};

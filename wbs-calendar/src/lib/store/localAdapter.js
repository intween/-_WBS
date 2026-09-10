import { applyPatch, createTaskState, normalizeTaskState } from './types';

const STORAGE_KEY = 'wbs-calendar:task-states:v3';

const readRaw = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeRaw = (map) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

const readStates = () => {
  const map = readRaw();
  return Object.values(map).map(normalizeTaskState);
};

export const createLocalAdapter = () => {
  const listeners = new Set();

  const notify = () => {
    const states = readStates();
    listeners.forEach((listener) => listener(states));
  };

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) notify();
  };

  const loadAll = async () => readStates();

  const update = async (taskId, patch) => {
    const map = readRaw();
    const current = map[taskId] ? normalizeTaskState(map[taskId]) : createTaskState(taskId);
    const next = applyPatch(current, patch);
    map[taskId] = next;
    writeRaw(map);
    notify();
    return next;
  };

  const reset = async () => {
    window.localStorage.removeItem(STORAGE_KEY);
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

  return { loadAll, update, reset, subscribe };
};

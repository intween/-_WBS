import { normalizeTaskState } from './types';

const RESOURCE = '/task-states';

const resolveBaseUrl = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const buildUrl = (path = '') => `${resolveBaseUrl()}${RESOURCE}${path}`;

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const createHttpAdapter = () => {
  const listeners = new Set();

  const loadAll = async () => {
    const payload = await request(buildUrl());
    return (payload?.items ?? []).map(normalizeTaskState);
  };

  const update = async (taskId, patch) => {
    const payload = await request(buildUrl(`/${encodeURIComponent(taskId)}`), {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return normalizeTaskState(payload);
  };

  const reset = async () => {
    await request(buildUrl('/reset'), { method: 'POST' });
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { loadAll, update, reset, subscribe };
};

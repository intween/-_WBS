import { ALL_STATUS_FILTER } from '@/constants/status';
import { isDelayed } from './progress';
import { today } from './date';

export const createDefaultFilters = () => ({
  query: '',
  status: ALL_STATUS_FILTER,
  streams: [],
  delayedOnly: false,
});

export const normalizeQuery = (query) => query.trim().toLowerCase();

export const matchesQuery = (task, query) => {
  const needle = normalizeQuery(query);
  if (!needle) return true;
  return (
    task.title.toLowerCase().includes(needle) || (task.memo ?? '').toLowerCase().includes(needle)
  );
};

export const matchesFacets = (task, filters, todayISO = today()) =>
  (filters.status === ALL_STATUS_FILTER || task.status === filters.status) &&
  (filters.streams.length === 0 || filters.streams.includes(task.stream)) &&
  (!filters.delayedOnly || isDelayed(task, todayISO));

export const applyFilters = (tasks, filters, todayISO = today()) =>
  tasks.filter((task) => matchesQuery(task, filters.query) && matchesFacets(task, filters, todayISO));

export const applySearchOnly = (tasks, filters) =>
  tasks.filter((task) => matchesQuery(task, filters.query));

export const countActiveFacets = (filters) =>
  (filters.status !== ALL_STATUS_FILTER ? 1 : 0) +
  filters.streams.length +
  (filters.delayedOnly ? 1 : 0);

export const isFilterActive = (filters) =>
  Boolean(filters.query) || countActiveFacets(filters) > 0;

export const toggleStream = (streams, streamId) =>
  streams.includes(streamId)
    ? streams.filter((id) => id !== streamId)
    : [...streams, streamId];

export const splitByQuery = (text, query) => {
  const needle = normalizeQuery(query);
  if (!needle) return [{ text, matched: false }];
  const parts = [];
  const haystack = text.toLowerCase();
  let cursor = 0;
  let index = haystack.indexOf(needle, cursor);
  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), matched: false });
    parts.push({ text: text.slice(index, index + needle.length), matched: true });
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), matched: false });
  return parts;
};

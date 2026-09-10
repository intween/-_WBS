import { PROJECT, STREAMS } from '@/config';
import { COMPLETED_STATUS } from '@/constants/status';
import { diffDays, today } from './date';

export const toPercent = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

export const summarize = (tasks) => {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === COMPLETED_STATUS).length;
  return { total, done, percent: toPercent(done, total) };
};

export const summarizeByStream = (tasks) =>
  STREAMS.map((stream) => ({
    stream,
    ...summarize(tasks.filter((task) => task.stream === stream.id)),
  }));

export const isDelayed = (task, todayISO = today()) =>
  Boolean(task.dueDate) && task.dueDate < todayISO && task.status !== COMPLETED_STATUS;

export const isDueToday = (task, todayISO = today()) => task.dueDate === todayISO;

export const isDueWithin = (task, startISO, endISO) =>
  Boolean(task.dueDate) && task.dueDate >= startISO && task.dueDate <= endISO;

export const checklistProgress = (checklist = []) => ({
  total: checklist.length,
  done: checklist.filter((item) => item.done).length,
});

export const hasDetail = (task) =>
  Boolean(task.memo) || task.links.length > 0 || task.checklist.length > 0;

export const detailSummary = (task) => {
  const parts = [];
  if (task.checklist.length > 0) {
    const checklist = checklistProgress(task.checklist);
    parts.push(`체크리스트 ${checklist.done}/${checklist.total}`);
  }
  if (task.links.length > 0) parts.push(`링크 ${task.links.length}`);
  if (task.memo) parts.push('메모');
  return parts.join(' · ');
};

export const milestoneDday = (todayISO = today()) => diffDays(todayISO, PROJECT.milestone.date);

export const formatDday = (value) => {
  if (value === 0) return 'D-DAY';
  return value > 0 ? `D-${value}` : `D+${Math.abs(value)}`;
};

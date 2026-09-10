import { PROJECT } from '@/config';
import {
  addDays,
  eachDay,
  endOfMonth,
  endOfWeek,
  formatMonth,
  formatMonthShort,
  isWeekend,
  isWithin,
  mondayIndex,
  monthKey,
  startOfMonth,
  startOfWeek,
  toDate,
  toISO,
} from './date';

const WEEK_LENGTH = 7;

const buildDay = (iso, monthPrefix, todayISO) => ({
  iso,
  day: toDate(iso).getDate(),
  monthKey: monthKey(iso),
  isCurrentMonth: monthKey(iso) === monthPrefix,
  isWeekend: isWeekend(iso),
  isWeekStart: mondayIndex(toDate(iso)) === 0,
  isTodayColumn: mondayIndex(toDate(iso)) === mondayIndex(toDate(todayISO)),
  isToday: iso === todayISO,
  isInProject: isWithin(iso, PROJECT.startDate, PROJECT.endDate),
  isOnsite: isWithin(iso, PROJECT.onsite.start, PROJECT.onsite.end),
  isMilestone: iso === PROJECT.milestone.date,
});

const chunkWeeks = (days) => {
  const weeks = [];
  for (let index = 0; index < days.length; index += WEEK_LENGTH) {
    weeks.push(days.slice(index, index + WEEK_LENGTH));
  }
  return weeks;
};

export const buildMonthGrid = (anchorISO, todayISO) => {
  const first = startOfMonth(anchorISO);
  const last = endOfMonth(anchorISO);
  const days = eachDay(startOfWeek(first), endOfWeek(last)).map((iso) =>
    buildDay(iso, monthKey(anchorISO), todayISO),
  );
  return {
    key: monthKey(anchorISO),
    label: formatMonthShort(anchorISO),
    fullLabel: formatMonth(anchorISO),
    weeks: chunkWeeks(days),
  };
};

export const buildProjectMonths = (todayISO) => {
  const months = [];
  let cursor = startOfMonth(PROJECT.startDate);
  const limit = startOfMonth(PROJECT.endDate);
  while (cursor <= limit) {
    months.push(buildMonthGrid(cursor, todayISO));
    const next = toDate(endOfMonth(cursor));
    next.setDate(next.getDate() + 1);
    cursor = toISO(next);
  }
  return months;
};

export const buildProjectWeeks = () => {
  const weeks = [];
  let cursor = startOfWeek(PROJECT.startDate);
  const limit = startOfWeek(PROJECT.endDate);
  let index = 1;
  while (cursor <= limit) {
    const end = endOfWeek(cursor);
    weeks.push({ key: cursor, start: cursor, end, index, days: eachDay(cursor, end) });
    cursor = addDays(cursor, WEEK_LENGTH);
    index += 1;
  }
  return weeks;
};

export const buildOnsiteDays = () =>
  eachDay(PROJECT.onsite.start, PROJECT.onsite.end).map((iso, index) => ({
    iso,
    label: `D${index + 1}`,
  }));

export const groupByDate = (items) =>
  items.reduce((acc, item) => {
    const key = item.dueDate;
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

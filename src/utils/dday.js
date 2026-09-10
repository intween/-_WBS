/**
 * D-day / 마감일 판정 — 전부 순수 함수.
 * '오늘' 은 인자로 주입받아 테스트 가능하게 한다.
 */
import { toLocalDate, toDateKey } from './format';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 오늘(로컬 자정) */
export const getToday = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate());

/**
 * 기준일로부터 목표일까지 남은 일수. (양수면 아직 남음)
 * @returns {number|null}
 */
export const getDaysUntil = (targetDate, fromDate = new Date()) => {
  const target = toLocalDate(targetDate);
  const from = toLocalDate(fromDate);
  if (!target || !from) return null;
  return Math.round((target.getTime() - from.getTime()) / MS_PER_DAY);
};

/**
 * D-day 라벨.
 * @returns {string} 'D-42' | 'D-DAY' | 'D+3'
 */
export const formatDday = (targetDate, fromDate = new Date()) => {
  const days = getDaysUntil(targetDate, fromDate);
  if (days === null) return '';
  if (days === 0) return 'D-DAY';
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
};

/**
 * 마감이 지났는데 완료되지 않았는지 판정한다.
 * 마감일 당일은 지연이 아니다. (다음 날부터 지연)
 * @param {string|null} dueDate
 * @param {boolean} isDone
 */
export const isOverdue = (dueDate, isDone, fromDate = new Date()) => {
  if (isDone || !dueDate) return false;
  const days = getDaysUntil(dueDate, fromDate);
  return days !== null && days < 0;
};

/** 마감이 오늘인지 */
export const isDueToday = (dueDate, fromDate = new Date()) =>
  Boolean(dueDate) && getDaysUntil(dueDate, fromDate) === 0;

/**
 * 이번 주(월~일) 범위를 구한다.
 * @returns {{ start: string, end: string }} 'YYYY-MM-DD'
 */
export const getThisWeekRange = (fromDate = new Date()) => {
  const today = getToday(toLocalDate(fromDate) || new Date());
  // getDay(): 0=일 … 6=토. 월요일 시작으로 보정한다.
  const offsetToMonday = (today.getDay() + 6) % 7;

  const start = new Date(today);
  start.setDate(today.getDate() - offsetToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start: toDateKey(start), end: toDateKey(end) };
};

/** 마감일이 이번 주 안에 있는지 */
export const isDueThisWeek = (dueDate, fromDate = new Date()) => {
  if (!dueDate) return false;
  const key = toDateKey(dueDate);
  if (!key) return false;
  const { start, end } = getThisWeekRange(fromDate);
  return key >= start && key <= end;
};

/**
 * 마감일 표시용 상태.
 * @returns {'none'|'overdue'|'today'|'soon'|'later'|'done'}
 */
export const getDueState = (dueDate, isDone, fromDate = new Date()) => {
  if (!dueDate) return 'none';
  if (isDone) return 'done';

  const days = getDaysUntil(dueDate, fromDate);
  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'later';
};

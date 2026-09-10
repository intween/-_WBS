const MS_PER_DAY = 86400000;

const pad = (value) => String(value).padStart(2, '0');

export const toDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const toISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const today = () => toISO(new Date());

export const addDays = (iso, amount) => {
  const date = toDate(iso);
  date.setDate(date.getDate() + amount);
  return toISO(date);
};

export const diffDays = (fromISO, toISOValue) =>
  Math.round((toDate(toISOValue) - toDate(fromISO)) / MS_PER_DAY);

export const isBefore = (a, b) => a < b;

export const isAfter = (a, b) => a > b;

export const isSameDay = (a, b) => a === b;

export const isWithin = (iso, startISO, endISO) => iso >= startISO && iso <= endISO;

export const mondayIndex = (date) => (date.getDay() + 6) % 7;

export const startOfWeek = (iso) => addDays(iso, -mondayIndex(toDate(iso)));

export const endOfWeek = (iso) => addDays(startOfWeek(iso), 6);

export const isWeekend = (iso) => mondayIndex(toDate(iso)) >= 5;

export const startOfMonth = (iso) => `${iso.slice(0, 7)}-01`;

export const endOfMonth = (iso) => {
  const date = toDate(iso);
  return toISO(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};

export const monthKey = (iso) => iso.slice(0, 7);

export const formatMonth = (iso) => {
  const date = toDate(iso);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
};

export const formatMonthShort = (iso) => `${toDate(iso).getMonth() + 1}월`;

export const formatShortDate = (iso) => {
  const date = toDate(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatFullDate = (iso) => {
  const date = toDate(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export const formatWeekday = (iso) => ['일', '월', '화', '수', '목', '금', '토'][toDate(iso).getDay()];

export const formatRange = (startISO, endISO) =>
  `${formatShortDate(startISO)} ~ ${formatShortDate(endISO)}`;

export const eachDay = (startISO, endISO) => {
  const days = [];
  let cursor = startISO;
  while (cursor <= endISO) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
};

export const dayNumber = (iso) => toDate(iso).getDate();

export const isValidISO = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export const formatRelativeDue = (iso, todayISO) => {
  if (!iso) return '';
  const gap = diffDays(todayISO, iso);
  if (gap === 0) return '오늘';
  if (gap === 1) return '내일';
  if (gap === -1) return '어제';
  if (gap < 0) return `${Math.abs(gap)}일 지남`;
  if (gap <= 7) return `${gap}일 남음`;
  return formatShortDate(iso);
};

export const clampToRange = (iso, startISO, endISO) => {
  if (iso < startISO) return startISO;
  if (iso > endISO) return endISO;
  return iso;
};

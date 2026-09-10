import { VIEWS } from './views';

export const SHORTCUT_KEYS = {
  search: '/',
  close: 'Escape',
  prevMonth: 'ArrowLeft',
  nextMonth: 'ArrowRight',
  today: 't',
  help: '?',
};

export const VIEW_HOTKEYS = {
  1: VIEWS.calendar,
  2: VIEWS.timeline,
  3: VIEWS.onsite,
};

export const SHORTCUT_GUIDE = [
  { keys: ['/'], label: '검색으로 이동' },
  { keys: ['1', '2', '3'], label: '캘린더 · 타임라인 · 현장' },
  { keys: ['←', '→'], label: '이전 달 · 다음 달' },
  { keys: ['T'], label: '오늘로 이동' },
  { keys: ['Esc'], label: '패널 닫기' },
  { keys: ['?'], label: '단축키 목록' },
];

export const SEARCH_INPUT_SELECTOR = '.search-field__input';

export const MONTH_SECTION_SELECTOR = '[data-month]';

export const TODAY_CELL_SELECTOR = '.day-cell--today';

export const VIEWS = {
  calendar: 'calendar',
  timeline: 'timeline',
  onsite: 'onsite',
};

export const VIEW_LIST = [
  { key: VIEWS.calendar, label: '캘린더' },
  { key: VIEWS.timeline, label: '타임라인' },
  { key: VIEWS.onsite, label: '현장' },
];

export const DEFAULT_VIEW = VIEWS.calendar;

export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export const MOBILE_BREAKPOINT = 768;

export const MOBILE_LANDSCAPE_HEIGHT = 500;

export const MAX_CHIPS_PER_DAY = 4;

export const MEMO_SAVE_DELAY = 800;

export const SEARCH_INPUT_DELAY = 200;

export const SIDE_ITEMS_COLLAPSED = 6;

export const TOAST_DURATION = 3000;

export const DRAG_DATA_TYPE = 'text/plain';

export const SAVE_STATE = {
  idle: 'idle',
  saving: 'saving',
  saved: 'saved',
};

export const SAVE_STATE_LABEL = {
  [SAVE_STATE.saving]: '저장 중…',
  [SAVE_STATE.saved]: '저장됨',
};

export const LOAD_STATE = {
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  error: 'error',
};

export const EXPORT_FORMATS = {
  csv: 'csv',
  json: 'json',
};

/**
 * 프로젝트 메타 / 동작 설정 상수.
 * 매직넘버·매직스트링은 전부 여기에 모은다.
 */
import { PROGRAM_START, PROGRAM_END } from '@/data/periods';

// --- 프로젝트 메타 ---
export const PROJECT = {
  title: '환동해 소셜벤처 글로벌 진출 프로그램',
  subtitle: 'WBS 협업 관리 보드',
  /** 현지 수행 시작일 — D-day 기준 */
  ddayDate: '2026-10-21',
  /** 현지 수행 종료일 */
  localEndDate: '2026-10-24',
  /** 전체 일정 (periods.js 에서 파생) */
  startDate: PROGRAM_START,
  endDate: PROGRAM_END,
};

// --- localStorage 키 ---
/** 선택한 팀원 id 저장 키 */
export const STORAGE_KEY_MEMBER = 'wbs-donghae:member-id';
/** 마지막으로 본 탭 저장 키 */
export const STORAGE_KEY_TAB = 'wbs-donghae:tab';
/** 모바일에서 마지막으로 본 기간 저장 키 */
export const STORAGE_KEY_PERIOD = 'wbs-donghae:period';

// --- 타이밍 (ms) ---
/** 메모 자동 저장 디바운스 */
export const MEMO_DEBOUNCE_MS = 800;
/** 검색어 입력 디바운스 */
export const SEARCH_DEBOUNCE_MS = 200;
/** 외부 변경 카드 깜빡임 시간 ($highlight-duration 과 일치) */
export const HIGHLIGHT_DURATION_MS = 1500;
/** Toast 표시 시간 */
export const TOAST_DURATION_MS = 3000;
/** "저장됨" 표시가 사라지기까지 */
export const SAVED_INDICATOR_MS = 1600;
/** Realtime 재연결 시도 간격 */
export const REALTIME_RETRY_MS = 3000;

// --- 화면 탭 ---
export const TAB = {
  BOARD: 'board',
  DASHBOARD: 'dashboard',
  MY_TASKS: 'my-tasks',
};

export const TAB_LABELS = {
  [TAB.BOARD]: '보드',
  [TAB.DASHBOARD]: '대시보드',
  [TAB.MY_TASKS]: '내 업무',
};

export const TAB_LIST = [TAB.BOARD, TAB.DASHBOARD, TAB.MY_TASKS];

// --- 필터 ---
/** 담당자 필터의 '전체' / '미지정' 특수값 (uuid 와 겹치지 않게 지정) */
export const OWNER_FILTER_ALL = 'all';
export const OWNER_FILTER_NONE = 'none';

// --- 저장 상태 표시 ---
export const SAVE_STATE = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
};

export const SAVE_STATE_LABELS = {
  [SAVE_STATE.SAVING]: '저장 중…',
  [SAVE_STATE.SAVED]: '저장됨',
  [SAVE_STATE.ERROR]: '저장 실패',
};

// --- 변경 이력 필드 (activity_log.field 값) ---
export const ACTIVITY_FIELD = {
  STATUS: 'status',
  OWNER: 'owner',
  DUE_DATE: 'due_date',
  MEMO: 'memo',
  CHECKLIST: 'checklist',
  LINK: 'link',
};

/** 변경 이력 문구에 쓰는 필드 이름 */
export const ACTIVITY_FIELD_LABELS = {
  [ACTIVITY_FIELD.STATUS]: '상태',
  [ACTIVITY_FIELD.OWNER]: '담당자',
  [ACTIVITY_FIELD.DUE_DATE]: '마감일',
  [ACTIVITY_FIELD.MEMO]: '메모',
  [ACTIVITY_FIELD.CHECKLIST]: '체크리스트',
  [ACTIVITY_FIELD.LINK]: '문서 링크',
};

// --- 표시 한도 ---
/** 대시보드 최근 변경 건수 */
export const RECENT_ACTIVITY_LIMIT = 20;
/** 상세 패널 변경 이력 건수 */
export const TASK_ACTIVITY_LIMIT = 30;
/** 변경 이력에 저장할 텍스트 요약 길이 */
export const ACTIVITY_VALUE_PREVIEW = 60;
/** 카드 메모 미리보기 길이 */
export const MEMO_PREVIEW_LENGTH = 40;
/** 메모 최대 길이 */
export const MEMO_MAX_LENGTH = 2000;
/** 코멘트 최대 길이 */
export const COMMENT_MAX_LENGTH = 1000;
/** textarea auto-resize 최소/최대 높이 (px) */
export const TEXTAREA_MIN_HEIGHT = 64;
export const TEXTAREA_MAX_HEIGHT = 280;

// --- 반응형 (SCSS $bp-mobile / $bp-tablet 과 값 일치 유지) ---
export const BP_MOBILE = 768;
export const BP_TABLET = 1024;
export const MQ_MOBILE = `(max-width: ${BP_MOBILE}px)`;

// --- 모바일 하단 시트 ---
/** 아래로 스와이프해서 닫히는 최소 이동 거리 (px) */
export const SHEET_CLOSE_THRESHOLD = 120;

// --- 내보내기 ---
export const EXPORT_FILE_PREFIX = 'wbs-donghae';
export const EXPORT_MIME_JSON = 'application/json';
export const EXPORT_MIME_CSV = 'text/csv;charset=utf-8';

// --- Realtime 채널 이름 ---
export const CHANNEL_TASK_STATES = 'wbs:task_states';
export const CHANNEL_COMMENTS = 'wbs:comments';

// --- DB 테이블 이름 ---
export const TABLE = {
  MEMBERS: 'members',
  TASK_STATES: 'task_states',
  COMMENTS: 'comments',
  ACTIVITY_LOG: 'activity_log',
};

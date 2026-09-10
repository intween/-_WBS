/**
 * 업무 상태 정의.
 * 진행률 집계 시에는 'done' 만 완료로 센다.
 * color 값은 _variables.scss 의 $status-colors 와 일치시킨다.
 */
export const STATUS = {
  todo:  { key: 'todo',  label: '대기',   color: '#9A958C', order: 0 },
  doing: { key: 'doing', label: '진행중', color: '#2E6DA4', order: 1 },
  done:  { key: 'done',  label: '완료',   color: '#1A6B5A', order: 2 },
  hold:  { key: 'hold',  label: '보류',   color: '#993C1D', order: 3 },
};

/** 상태 key 목록 (order 순) */
export const STATUS_KEYS = Object.values(STATUS)
  .sort((a, b) => a.order - b.order)
  .map((item) => item.key);

/** 상태 목록 (세그먼트 버튼 렌더용, order 순) */
export const STATUS_LIST = STATUS_KEYS.map((key) => STATUS[key]);

/** 신규/미설정 업무의 기본 상태 */
export const DEFAULT_STATUS = STATUS.todo.key;

/** 완료로 집계하는 상태 */
export const DONE_STATUS = STATUS.done.key;

/** 완료 여부 판정 */
export const isDoneStatus = (status) => status === DONE_STATUS;

/** 알 수 없는 값이 들어와도 안전하게 상태 객체를 돌려준다. */
export const getStatus = (key) => STATUS[key] || STATUS[DEFAULT_STATUS];

/** 상태 라벨 */
export const getStatusLabel = (key) => getStatus(key).label;

/** 상태 색상 */
export const getStatusColor = (key) => getStatus(key).color;

/** 필터 UI 의 '전체' 옵션 key (실제 상태값과 겹치지 않게 별도 지정) */
export const STATUS_FILTER_ALL = 'all';

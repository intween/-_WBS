/**
 * 기간(스윔레인 컬럼) 정의 — 정적 데이터.
 * 진행 상태는 여기에 담지 않는다. (DB task_states 로 분리)
 */
export const PERIODS = [
  { id: 'w1', label: '9월 2주차',  range: '9/8-9/14',    start: '2026-09-08', end: '2026-09-14', color: '#185FA5' },
  { id: 'w2', label: '9월 3주차',  range: '9/15-9/21',   start: '2026-09-15', end: '2026-09-21', color: '#085041' },
  { id: 'w3', label: '9월 4주차',  range: '9/22-9/28',   start: '2026-09-22', end: '2026-09-28', color: '#854F0B' },
  { id: 'w4', label: '9월 5주차',  range: '9/29-10/5',   start: '2026-09-29', end: '2026-10-05', color: '#534AB7' },
  { id: 'w5', label: '10월 1주차', range: '10/6-10/12',  start: '2026-10-06', end: '2026-10-12', color: '#27500A' },
  { id: 'w6', label: '10월 2주차', range: '10/13-10/16', start: '2026-10-13', end: '2026-10-16', color: '#993C1D' },
  { id: 'w7', label: '10월 후반',  range: '10/17-10/19', start: '2026-10-17', end: '2026-10-19', color: '#791F1F' },
  { id: 'w8', label: '10월 3주차', range: '10/20 D-1',   start: '2026-10-20', end: '2026-10-20', color: '#0C447C' },
  { id: 'wf', label: '현지 수행',  range: '10/21-10/24', start: '2026-10-21', end: '2026-10-24', color: '#1F3B5A' },
];

/** 기간 id → 기간 객체 */
export const PERIOD_MAP = PERIODS.reduce((acc, period) => {
  acc[period.id] = period;
  return acc;
}, {});

/** 기간 id 목록 (컬럼 순서) */
export const PERIOD_IDS = PERIODS.map((period) => period.id);

/** 전체 일정 시작일 / 종료일 */
export const PROGRAM_START = PERIODS[0].start;
export const PROGRAM_END = PERIODS[PERIODS.length - 1].end;

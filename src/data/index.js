/**
 * data 배럴 export.
 * 정적 데이터와 그 파생 인덱스만 제공한다. (진행 상태는 DB task_states 담당)
 */
export { PERIODS, PERIOD_MAP, PERIOD_IDS, PROGRAM_START, PROGRAM_END } from './periods';
export { STREAMS, STREAM_MAP, STREAM_IDS } from './streams';
export { TASKS, TASK_COUNT, TASK_IDS } from './tasks';

import { TASKS } from './tasks';
import { PERIOD_IDS } from './periods';
import { STREAM_IDS } from './streams';

/** 업무 id → 업무 객체 */
export const TASK_MAP = TASKS.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {});

/** 기간 id → 해당 기간 업무 배열 */
export const TASKS_BY_PERIOD = PERIOD_IDS.reduce((acc, periodId) => {
  acc[periodId] = TASKS.filter((task) => task.period === periodId);
  return acc;
}, {});

/** 스트림 id → 해당 스트림 업무 배열 */
export const TASKS_BY_STREAM = STREAM_IDS.reduce((acc, streamId) => {
  acc[streamId] = TASKS.filter((task) => task.stream === streamId);
  return acc;
}, {});

/**
 * '{streamId}:{periodId}' → 해당 셀의 업무 배열.
 * 스윔레인 한 칸을 그릴 때 사용한다.
 */
export const TASKS_BY_CELL = TASKS.reduce((acc, task) => {
  const key = `${task.stream}:${task.period}`;
  if (!acc[key]) acc[key] = [];
  acc[key].push(task);
  return acc;
}, {});

/** 셀 조회 키 생성 */
export const cellKey = (streamId, periodId) => `${streamId}:${periodId}`;

/** 특정 셀의 업무 배열 조회 (없으면 빈 배열) */
export const getCellTasks = (streamId, periodId) =>
  TASKS_BY_CELL[cellKey(streamId, periodId)] || [];

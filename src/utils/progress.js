/**
 * 진행률 집계 — 전부 순수 함수.
 * 컴포넌트에서는 useMemo 로 감싸서 사용한다.
 *
 * 인자로 받는 stateMap 은 { [taskId]: task_states 행 } 형태다.
 * 정적 업무 정의(TASKS)와 DB 상태를 여기서 조인해 계산한다.
 */
import { DEFAULT_STATUS, isDoneStatus } from '@/constants/status';
import { isOverdue, isDueThisWeek } from './dday';

/** 업무 하나의 상태 값 (없으면 기본 상태) */
export const getTaskStatus = (stateMap, taskId) =>
  stateMap?.[taskId]?.status || DEFAULT_STATUS;

/** 업무 하나가 완료인지 */
export const isTaskDone = (stateMap, taskId) =>
  isDoneStatus(getTaskStatus(stateMap, taskId));

/** 업무 배열 중 완료 건수 */
export const countDone = (tasks, stateMap) =>
  tasks.reduce((sum, task) => (isTaskDone(stateMap, task.id) ? sum + 1 : sum), 0);

/**
 * 진행률 집계 결과.
 * @returns {{ total: number, done: number, remaining: number, percent: number, ratio: number }}
 */
export const calcProgress = (tasks = [], stateMap = {}) => {
  const total = tasks.length;
  const done = countDone(tasks, stateMap);
  const ratio = total === 0 ? 0 : done / total;

  return {
    total,
    done,
    remaining: total - done,
    percent: Math.round(ratio * 100),
    ratio,
  };
};

/** 상태별 건수 — { todo, doing, done, hold } */
export const countByStatus = (tasks = [], stateMap = {}) =>
  tasks.reduce((acc, task) => {
    const status = getTaskStatus(stateMap, task.id);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

/**
 * 기간별 진행률 맵.
 * @returns {Object} 기간 id → 진행률
 */
export const calcProgressByPeriod = (tasks = [], stateMap = {}, periodIds = []) => {
  const buckets = groupBy(tasks, (task) => task.period);
  return periodIds.reduce((acc, id) => {
    acc[id] = calcProgress(buckets[id] || [], stateMap);
    return acc;
  }, {});
};

/**
 * 스트림별 진행률 맵.
 * @returns {Object} 스트림 id → 진행률
 */
export const calcProgressByStream = (tasks = [], stateMap = {}, streamIds = []) => {
  const buckets = groupBy(tasks, (task) => task.stream);
  return streamIds.reduce((acc, id) => {
    acc[id] = calcProgress(buckets[id] || [], stateMap);
    return acc;
  }, {});
};

/**
 * 담당자별 진행률 맵. 미지정 업무는 제외한다.
 * @returns {Object} member id → 진행률
 */
export const calcProgressByOwner = (tasks = [], stateMap = {}, memberIds = []) => {
  const buckets = tasks.reduce((acc, task) => {
    const ownerId = stateMap?.[task.id]?.owner_id;
    if (!ownerId) return acc;
    if (!acc[ownerId]) acc[ownerId] = [];
    acc[ownerId].push(task);
    return acc;
  }, {});

  return memberIds.reduce((acc, id) => {
    acc[id] = calcProgress(buckets[id] || [], stateMap);
    return acc;
  }, {});
};

/** 지연(마감 경과 + 미완료) 업무 목록 */
export const getOverdueTasks = (tasks = [], stateMap = {}, today = new Date()) =>
  tasks.filter((task) => {
    const state = stateMap?.[task.id];
    return isOverdue(state?.due_date, isTaskDone(stateMap, task.id), today);
  });

/** 이번 주 마감 업무 목록 (완료 제외) */
export const getDueThisWeekTasks = (tasks = [], stateMap = {}, today = new Date()) =>
  tasks.filter((task) => {
    const state = stateMap?.[task.id];
    if (isTaskDone(stateMap, task.id)) return false;
    return isDueThisWeek(state?.due_date, today);
  });

/** 특정 담당자의 미완료 업무 목록 */
export const getMyOpenTasks = (tasks = [], stateMap = {}, memberId = null) => {
  if (!memberId) return [];
  return tasks.filter(
    (task) =>
      stateMap?.[task.id]?.owner_id === memberId && !isTaskDone(stateMap, task.id)
  );
};

/** 마감일 오름차순 정렬 (마감 없는 업무는 뒤로) */
export const sortByDueDate = (tasks = [], stateMap = {}) =>
  [...tasks].sort((a, b) => {
    const dueA = stateMap?.[a.id]?.due_date || '';
    const dueB = stateMap?.[b.id]?.due_date || '';
    if (!dueA && !dueB) return 0;
    if (!dueA) return 1;
    if (!dueB) return -1;
    return dueA.localeCompare(dueB);
  });

/**
 * 진행률 구간 라벨 — 게이지 색상 분기용.
 * @returns {'none'|'low'|'mid'|'high'|'complete'}
 */
export const getProgressLevel = (percent) => {
  if (percent <= 0) return 'none';
  if (percent >= 100) return 'complete';
  if (percent < 34) return 'low';
  if (percent < 67) return 'mid';
  return 'high';
};

/** 배열을 키 함수 기준으로 묶는다. */
function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

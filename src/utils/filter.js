/**
 * 업무 목록 필터링 — 순수 함수.
 * 보드 / 모바일 / 대시보드가 같은 규칙을 쓰도록 한 곳에 모은다.
 */
import { OWNER_FILTER_ALL, OWNER_FILTER_NONE } from '@/constants/config';
import { STATUS_FILTER_ALL, isDoneStatus } from '@/constants/status';
import { isOverdue } from './dday';

/**
 * 코멘트 배열을 업무별 검색용 텍스트로 묶는다.
 * @param {Array} comments
 * @returns {Object} taskId → 소문자로 이어붙인 코멘트 본문
 */
export const buildCommentIndex = (comments = []) =>
  comments.reduce((acc, comment) => {
    if (!comment?.task_id) return acc;
    const body = String(comment.body ?? '').toLowerCase();
    acc[comment.task_id] = acc[comment.task_id] ? `${acc[comment.task_id]} ${body}` : body;
    return acc;
  }, {});

/**
 * 검색어 일치 여부 — 업무명 + 메모 + 코멘트를 대상으로 한다.
 * @param {Object} task
 * @param {Object} state - task_states 행
 * @param {string} commentText - buildCommentIndex 결과
 * @param {string} keyword - 이미 소문자로 정규화된 검색어
 */
export const matchesSearch = (task, state, commentText, keyword) => {
  if (!keyword) return true;

  const haystack = [
    task.title,
    state?.memo ?? '',
    commentText ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(keyword);
};

/**
 * 필터 조건에 맞는 업무만 골라낸다.
 *
 * @param {Array} tasks - 정적 업무 배열
 * @param {Object} options
 * @param {Object} options.stateMap
 * @param {Object} [options.commentIndex]
 * @param {string} [options.search]
 * @param {string} [options.statusFilter] - 'all' | 상태 key
 * @param {string} [options.ownerFilter]  - 'all' | 'none' | member id
 * @param {string[]} [options.streamFilter] - 빈 배열이면 전체
 * @param {boolean} [options.onlyOverdue]
 * @param {Date|string} [options.today]
 * @returns {Array}
 */
export const filterTasks = (
  tasks = [],
  {
    stateMap = {},
    commentIndex = {},
    search = '',
    statusFilter = STATUS_FILTER_ALL,
    ownerFilter = OWNER_FILTER_ALL,
    streamFilter = [],
    onlyOverdue = false,
    today = new Date(),
  } = {}
) => {
  const keyword = String(search ?? '').trim().toLowerCase();
  const useStreamFilter = streamFilter.length > 0;

  return tasks.filter((task) => {
    const state = stateMap[task.id];

    if (useStreamFilter && !streamFilter.includes(task.stream)) return false;

    if (statusFilter !== STATUS_FILTER_ALL && state?.status !== statusFilter) return false;

    if (ownerFilter === OWNER_FILTER_NONE) {
      if (state?.owner_id) return false;
    } else if (ownerFilter !== OWNER_FILTER_ALL) {
      if (state?.owner_id !== ownerFilter) return false;
    }

    if (onlyOverdue && !isOverdue(state?.due_date, isDoneStatus(state?.status), today)) {
      return false;
    }

    return matchesSearch(task, state, commentIndex[task.id], keyword);
  });
};

/**
 * 업무 배열을 '{stream}:{period}' 키의 셀 맵으로 묶는다.
 * 보드가 칸을 그릴 때 사용한다.
 */
export const groupTasksByCell = (tasks = []) =>
  tasks.reduce((acc, task) => {
    const key = `${task.stream}:${task.period}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

/** 업무 배열을 기간별로 묶는다. */
export const groupTasksByPeriod = (tasks = []) =>
  tasks.reduce((acc, task) => {
    if (!acc[task.period]) acc[task.period] = [];
    acc[task.period].push(task);
    return acc;
  }, {});

/** 업무 배열을 스트림별로 묶는다. */
export const groupTasksByStream = (tasks = []) =>
  tasks.reduce((acc, task) => {
    if (!acc[task.stream]) acc[task.stream] = [];
    acc[task.stream].push(task);
    return acc;
  }, {});

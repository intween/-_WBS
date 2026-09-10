/**
 * 업무 진행 상태(task_states) 데이터 접근 계층.
 *
 * 정적 업무 정의(src/data/tasks.js)는 여기서 다루지 않는다.
 * 이 모듈은 오직 DB 의 "진행 상태"만 읽고 쓴다.
 */
import { requireClient, unwrap } from '@/lib/supabaseClient';
import { TABLE, CHANNEL_TASK_STATES } from '@/constants/config';
import { DEFAULT_STATUS } from '@/constants/status';
import { TASKS } from '@/data/tasks';

/** 조회에 사용할 컬럼 목록 */
const COLUMNS =
  'task_id, status, owner_id, due_date, memo, links, checklist, updated_at, updated_by';

/** 업무 진행 상태 전체 조회 */
export const fetchTaskStates = async () => {
  const response = await requireClient().from(TABLE.TASK_STATES).select(COLUMNS);
  return unwrap(response, '업무 진행 상태를 불러오지 못했습니다.') || [];
};

/**
 * DB 에 없는 업무의 행을 채워 넣는다. (기존 행은 절대 건드리지 않음)
 * @param {string[]} existingIds - 이미 존재하는 task_id 목록
 * @returns {Promise<Array>} 새로 생성된 행 (없으면 빈 배열)
 */
export const seedMissingTaskStates = async (existingIds = []) => {
  const existing = new Set(existingIds);
  const missing = TASKS.filter((task) => !existing.has(task.id));
  if (missing.length === 0) return [];

  const rows = missing.map((task) => ({
    task_id: task.id,
    status: DEFAULT_STATUS,
    memo: '',
    links: [],
    checklist: [],
  }));

  const response = await requireClient()
    .from(TABLE.TASK_STATES)
    // 다른 사람이 동시에 seed 하더라도 충돌하지 않도록 중복은 무시한다.
    .upsert(rows, { onConflict: 'task_id', ignoreDuplicates: true })
    .select(COLUMNS);

  return unwrap(response, '업무 진행 상태를 초기화하지 못했습니다.') || [];
};

/**
 * 앱 시작 시 호출. 상태를 불러오고 누락된 행은 자동으로 만든다.
 * @returns {Promise<{ rows: Array, seededCount: number }>}
 */
export const initTaskStates = async () => {
  const rows = await fetchTaskStates();
  const seeded = await seedMissingTaskStates(rows.map((row) => row.task_id));

  return {
    rows: seeded.length > 0 ? [...rows, ...seeded] : rows,
    seededCount: seeded.length,
  };
};

/**
 * 업무 상태 부분 수정.
 * updated_at / updated_by 는 이 계층에서 항상 함께 갱신한다.
 *
 * @param {string} taskId
 * @param {Object} patch - status | owner_id | due_date | memo | links | checklist
 * @param {string|null} memberId - 수정한 팀원 id
 * @returns {Promise<Object>} 갱신된 행
 */
export const updateTaskState = async (taskId, patch, memberId = null) => {
  if (!taskId) throw new Error('수정할 업무를 찾을 수 없습니다.');

  const response = await requireClient()
    .from(TABLE.TASK_STATES)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
      updated_by: memberId,
    })
    .eq('task_id', taskId)
    .select(COLUMNS)
    .single();

  return unwrap(response, '업무 상태를 저장하지 못했습니다.');
};

/**
 * task_states 변경 실시간 구독.
 *
 * @param {Object} handlers
 * @param {(row: Object, event: string) => void} handlers.onChange - INSERT/UPDATE 수신
 * @param {(status: string) => void} [handlers.onStatus] - 채널 연결 상태 변화
 * @returns {() => void} 구독 해제 함수
 */
export const subscribeTaskStates = ({ onChange, onStatus }) => {
  const client = requireClient();

  const channel = client
    .channel(CHANNEL_TASK_STATES)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE.TASK_STATES },
      (payload) => {
        const row = payload.new && payload.new.task_id ? payload.new : payload.old;
        if (row) onChange?.(row, payload.eventType);
      }
    )
    .subscribe((status) => onStatus?.(status));

  return () => {
    client.removeChannel(channel);
  };
};

/**
 * 변경 이력(activity_log) 데이터 접근 계층.
 *
 * 기록할 행은 utils/diff.js 의 buildActivityEntries 로 만든다.
 * 실제로 값이 바뀐 경우에만 행이 만들어지므로, 여기서는 그대로 저장만 한다.
 */
import { requireClient, unwrap } from '@/lib/supabaseClient';
import { TABLE, RECENT_ACTIVITY_LIMIT, TASK_ACTIVITY_LIMIT } from '@/constants/config';

const COLUMNS = 'id, task_id, member_id, field, before_value, after_value, created_at';

/** 최근 변경 이력 조회 (전체 업무 대상, 최신순) */
export const fetchRecentActivity = async (limit = RECENT_ACTIVITY_LIMIT) => {
  const response = await requireClient()
    .from(TABLE.ACTIVITY_LOG)
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);

  return unwrap(response, '변경 이력을 불러오지 못했습니다.') || [];
};

/** 특정 업무의 변경 이력 조회 (최신순) */
export const fetchActivityByTask = async (taskId, limit = TASK_ACTIVITY_LIMIT) => {
  if (!taskId) return [];

  const response = await requireClient()
    .from(TABLE.ACTIVITY_LOG)
    .select(COLUMNS)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return unwrap(response, '변경 이력을 불러오지 못했습니다.') || [];
};

/**
 * 변경 이력 기록.
 * 이력 저장 실패가 본 작업(상태 변경)을 되돌리게 만들면 안 되므로,
 * 실패해도 예외를 던지지 않고 콘솔 경고만 남긴다.
 *
 * @param {Array} entries - buildActivityEntries 결과
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export const logActivity = async (entries = []) => {
  if (!Array.isArray(entries) || entries.length === 0) return true;

  try {
    const response = await requireClient().from(TABLE.ACTIVITY_LOG).insert(entries);
    unwrap(response, '변경 이력을 기록하지 못했습니다.');
    return true;
  } catch (error) {
    console.warn('[activity] 변경 이력 기록 실패 (본 작업은 정상 처리됨)', error);
    return false;
  }
};

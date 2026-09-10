/**
 * 코멘트 데이터 접근 계층.
 */
import { requireClient, unwrap } from '@/lib/supabaseClient';
import { TABLE, CHANNEL_COMMENTS, COMMENT_MAX_LENGTH } from '@/constants/config';

const COLUMNS = 'id, task_id, member_id, body, created_at';

/** 전체 코멘트 조회 — 카드 뱃지 표시와 검색에 사용 (최신순) */
export const fetchComments = async () => {
  const response = await requireClient()
    .from(TABLE.COMMENTS)
    .select(COLUMNS)
    .order('created_at', { ascending: false });

  return unwrap(response, '코멘트를 불러오지 못했습니다.') || [];
};

/** 특정 업무의 코멘트만 조회 (최신순) */
export const fetchCommentsByTask = async (taskId) => {
  if (!taskId) return [];

  const response = await requireClient()
    .from(TABLE.COMMENTS)
    .select(COLUMNS)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  return unwrap(response, '코멘트를 불러오지 못했습니다.') || [];
};

/** 코멘트 작성 */
export const createComment = async ({ taskId, memberId, body }) => {
  const text = String(body ?? '').trim();
  if (!taskId) throw new Error('업무를 찾을 수 없습니다.');
  if (!text) throw new Error('코멘트 내용을 입력해주세요.');
  if (text.length > COMMENT_MAX_LENGTH) {
    throw new Error(`코멘트는 ${COMMENT_MAX_LENGTH}자까지 작성할 수 있습니다.`);
  }

  const response = await requireClient()
    .from(TABLE.COMMENTS)
    .insert({ task_id: taskId, member_id: memberId || null, body: text })
    .select(COLUMNS)
    .single();

  return unwrap(response, '코멘트를 등록하지 못했습니다.');
};

/** 코멘트 삭제 */
export const deleteComment = async (id) => {
  if (!id) throw new Error('삭제할 코멘트를 찾을 수 없습니다.');

  const response = await requireClient().from(TABLE.COMMENTS).delete().eq('id', id);
  unwrap(response, '코멘트를 삭제하지 못했습니다.');
  return true;
};

/**
 * 코멘트 변경 실시간 구독.
 *
 * @param {Object} handlers
 * @param {(row: Object, event: string) => void} handlers.onChange
 * @param {(status: string) => void} [handlers.onStatus]
 * @returns {() => void} 구독 해제 함수
 */
export const subscribeComments = ({ onChange, onStatus }) => {
  const client = requireClient();

  const channel = client
    .channel(CHANNEL_COMMENTS)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE.COMMENTS },
      (payload) => {
        const row = payload.eventType === 'DELETE' ? payload.old : payload.new;
        if (row) onChange?.(row, payload.eventType);
      }
    )
    .subscribe((status) => onStatus?.(status));

  return () => {
    client.removeChannel(channel);
  };
};

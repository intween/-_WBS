import { applyPatch, createTaskState, normalizeTaskState } from './types';
import { supabase } from './supabaseClient';

const TABLE = 'task_states';

/** DB 행(snake_case) -> 앱 상태(camelCase) */
const fromRow = (row) =>
  normalizeTaskState({
    taskId: row.task_id,
    status: row.status,
    dueDate: row.due_date,
    memo: row.memo,
    links: row.links,
    checklist: row.checklist,
    assignee: row.assignee,
    updatedAt: row.updated_at,
  });

/** 앱 상태 -> DB 행 */
const toRow = (state) => ({
  task_id: state.taskId,
  status: state.status,
  due_date: state.dueDate,
  memo: state.memo,
  links: state.links,
  checklist: state.checklist,
  assignee: state.assignee,
  updated_at: state.updatedAt,
});

const unwrap = ({ data, error }, context) => {
  if (error) {
    console.error(`[supabase] ${context}`, error);
    throw new Error(`${context}: ${error.message}`);
  }
  return data;
};

export const createSupabaseAdapter = () => {
  if (!supabase) {
    throw new Error(
      'Supabase 설정이 없습니다. .env 에 VITE_SUPABASE_URL / VITE_SUPABASE_KEY 를 넣어주세요.'
    );
  }

  const listeners = new Set();
  let channel = null;

  const loadAll = async () => {
    const rows = unwrap(await supabase.from(TABLE).select('*'), '업무 상태를 불러오지 못했습니다');
    return (rows ?? []).map(fromRow);
  };

  const notify = async () => {
    if (listeners.size === 0) return;
    try {
      const states = await loadAll();
      listeners.forEach((listener) => listener(states));
    } catch (error) {
      // 실시간 갱신 실패는 화면을 깨뜨리지 않는다. 다음 변경 때 다시 시도된다.
      console.error('[supabase] 실시간 갱신 실패', error);
    }
  };

  const update = async (taskId, patch) => {
    // 부분 수정이므로 현재 값을 먼저 읽어와 합친다. 없으면 새로 만든다.
    const existing = unwrap(
      await supabase.from(TABLE).select('*').eq('task_id', taskId).maybeSingle(),
      '업무 상태를 읽지 못했습니다'
    );
    const current = existing ? fromRow(existing) : createTaskState(taskId);
    const next = applyPatch(current, patch);

    const saved = unwrap(
      await supabase.from(TABLE).upsert(toRow(next), { onConflict: 'task_id' }).select().single(),
      '업무 상태를 저장하지 못했습니다'
    );
    return fromRow(saved);
  };

  const reset = async () => {
    // .neq 로 전체 행을 지정한다. Supabase 는 조건 없는 delete 를 거부한다.
    unwrap(await supabase.from(TABLE).delete().neq('task_id', ''), '초기화하지 못했습니다');
    await notify();
  };

  const subscribe = (listener) => {
    listeners.add(listener);

    if (!channel) {
      channel = supabase
        .channel('task-states')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, notify)
        .subscribe();
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  };

  return { loadAll, update, reset, subscribe };
};

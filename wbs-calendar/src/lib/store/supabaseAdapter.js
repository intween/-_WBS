import {
  applyPatch,
  applyTaskDefPatch,
  createId,
  createTaskState,
  normalizeTaskDef,
  normalizeTaskState,
} from './types';
import { supabase } from './supabaseClient';

const STATES = 'task_states';
const TASKS = 'tasks';

/* --- 행 <-> 앱 상태 변환 -------------------------------------------------- */

const stateFromRow = (row) =>
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

const stateToRow = (state) => ({
  task_id: state.taskId,
  status: state.status,
  due_date: state.dueDate,
  memo: state.memo,
  links: state.links,
  checklist: state.checklist,
  assignee: state.assignee,
  updated_at: state.updatedAt,
});

const defFromRow = (row) =>
  normalizeTaskDef({
    id: row.id,
    stream: row.stream,
    title: row.title,
    due: row.due,
    sortOrder: row.sort_order,
  });

const defToRow = (definition) => ({
  id: definition.id,
  stream: definition.stream,
  title: definition.title,
  due: definition.due,
  sort_order: definition.sortOrder,
  updated_at: new Date().toISOString(),
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

  /* --- 진행 상태 --------------------------------------------------------- */

  const loadAll = async () => {
    const rows = unwrap(await supabase.from(STATES).select('*'), '업무 상태를 불러오지 못했습니다');
    return (rows ?? []).map(stateFromRow);
  };

  const update = async (taskId, patch) => {
    // 부분 수정이므로 현재 값을 먼저 읽어와 합친다. 없으면 새로 만든다.
    const existing = unwrap(
      await supabase.from(STATES).select('*').eq('task_id', taskId).maybeSingle(),
      '업무 상태를 읽지 못했습니다'
    );
    const current = existing ? stateFromRow(existing) : createTaskState(taskId);
    const next = applyPatch(current, patch);

    const saved = unwrap(
      await supabase.from(STATES).upsert(stateToRow(next), { onConflict: 'task_id' }).select().single(),
      '업무 상태를 저장하지 못했습니다'
    );
    return stateFromRow(saved);
  };

  const reset = async () => {
    // .neq 로 전체 행을 지정한다. Supabase 는 조건 없는 delete 를 거부한다.
    unwrap(await supabase.from(STATES).delete().neq('task_id', ''), '초기화하지 못했습니다');
    await notify();
  };

  /* --- 업무 정의 --------------------------------------------------------- */

  const loadTasks = async () => {
    const rows = unwrap(
      await supabase.from(TASKS).select('*').order('due', { ascending: true, nullsFirst: false })
        .order('sort_order', { ascending: true }),
      '업무 목록을 불러오지 못했습니다'
    );
    return (rows ?? []).map(defFromRow);
  };

  const createTaskDef = async (draft) => {
    const definition = normalizeTaskDef({ ...draft, id: draft.id || createId('task') });
    const saved = unwrap(
      await supabase.from(TASKS).insert(defToRow(definition)).select().single(),
      '업무를 추가하지 못했습니다'
    );
    return defFromRow(saved);
  };

  const updateTaskDef = async (taskId, patch) => {
    const existing = unwrap(
      await supabase.from(TASKS).select('*').eq('id', taskId).maybeSingle(),
      '업무를 읽지 못했습니다'
    );
    if (!existing) throw new Error('없는 업무입니다');

    const next = applyTaskDefPatch(defFromRow(existing), patch);
    const saved = unwrap(
      await supabase.from(TASKS).update(defToRow(next)).eq('id', taskId).select().single(),
      '업무를 저장하지 못했습니다'
    );
    return defFromRow(saved);
  };

  const deleteTaskDef = async (taskId) => {
    // task_states 는 외래키 on delete cascade 로 같이 지워진다.
    unwrap(await supabase.from(TASKS).delete().eq('id', taskId), '업무를 삭제하지 못했습니다');
  };

  /* --- 실시간 ------------------------------------------------------------ */

  const notify = async () => {
    if (listeners.size === 0) return;
    try {
      const [tasks, states] = await Promise.all([loadTasks(), loadAll()]);
      listeners.forEach((listener) => listener({ tasks, states }));
    } catch (error) {
      // 실시간 갱신 실패는 화면을 깨뜨리지 않는다. 다음 변경 때 다시 시도된다.
      console.error('[supabase] 실시간 갱신 실패', error);
    }
  };

  const subscribe = (listener) => {
    listeners.add(listener);

    if (!channel) {
      channel = supabase
        .channel('wbs-calendar')
        .on('postgres_changes', { event: '*', schema: 'public', table: STATES }, notify)
        .on('postgres_changes', { event: '*', schema: 'public', table: TASKS }, notify)
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

  return { loadAll, update, reset, subscribe, loadTasks, createTaskDef, updateTaskDef, deleteTaskDef };
};

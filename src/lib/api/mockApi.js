/**
 * 데모용 목(mock) 데이터 계층.
 *
 * .env 에 Supabase 설정이 없을 때 자동으로 이 구현이 쓰인다.
 * 백엔드가 준비되면 .env 만 채우면 되고, 이 파일은 건드릴 필요가 없다.
 *
 * - 데이터는 브라우저 localStorage 에 저장된다. (새로고침해도 유지)
 * - 같은 브라우저의 다른 탭과는 BroadcastChannel 로 실시간 동기화된다.
 *   (Realtime 동작을 실제로 확인해볼 수 있다)
 */
import { DEFAULT_STATUS } from '@/constants/status';
import { pickAvatarColor } from '@/constants/colors';
import { RECENT_ACTIVITY_LIMIT, TASK_ACTIVITY_LIMIT } from '@/constants/config';
import { TASKS } from '@/data/tasks';

/** 데모 데이터 저장 키 */
const DEMO_STORAGE_KEY = 'wbs-donghae:demo:v1';
/** 탭 간 동기화 채널 이름 */
const DEMO_CHANNEL = 'wbs-donghae:demo';
/** 서버 왕복을 흉내 내는 지연 (ms) */
const LATENCY = 120;

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY));
const clone = (value) => JSON.parse(JSON.stringify(value));

// ---------------------------------------------
// 초기 샘플 데이터
// ---------------------------------------------

/** 데모 팀원 */
const createSampleMembers = () =>
  ['김서연', '박준호', '이하늘', '최민지'].map((name, index) => ({
    id: `demo-member-${index + 1}`,
    name,
    role: ['총괄', '기업지원', '현지섭외', '디자인'][index],
    color: pickAvatarColor(index),
    created_at: new Date(2026, 8, 1 + index).toISOString(),
  }));

/** 화면이 비어 보이지 않도록 일부 업무에 진행 상황을 넣어둔다. */
const DEMO_TASK_SEED = {
  a_w1_0: { status: 'done', owner_id: 'demo-member-1', due_date: '2026-09-12' },
  a_w1_1: { status: 'done', owner_id: 'demo-member-1', due_date: '2026-09-14' },
  a_w2_0: { status: 'doing', owner_id: 'demo-member-1', due_date: '2026-09-18' },
  a_w2_1: { status: 'todo', owner_id: 'demo-member-1' },
  b_w1_0: { status: 'done', owner_id: 'demo-member-2', due_date: '2026-09-11' },
  b_w1_1: { status: 'done', owner_id: 'demo-member-2', due_date: '2026-09-12' },
  b_w1_2: { status: 'doing', owner_id: 'demo-member-2', due_date: '2026-09-08' },
  b_w2_0: {
    status: 'doing',
    owner_id: 'demo-member-2',
    due_date: '2026-09-19',
    memo: '5개사 중 3개사 응답 완료. 나머지 2개사는 9/17까지 회신 예정.',
    checklist: [
      { id: 'c1', text: 'A사 응답 정리', done: true },
      { id: 'c2', text: 'B사 응답 정리', done: true },
      { id: 'c3', text: 'C사 리마인드', done: false },
    ],
  },
  c_w2_0: {
    status: 'doing',
    owner_id: 'demo-member-3',
    due_date: '2026-09-20',
    memo: '통역사 후보 3명 확보. 단가 협의 필요.',
    links: [{ label: '통역사 후보 정리', url: 'https://drive.google.com/' }],
  },
  c_w2_1: { status: 'hold', owner_id: 'demo-member-3', due_date: '2026-09-21' },
  d_w2_0: { status: 'done', owner_id: 'demo-member-4', due_date: '2026-09-16' },
  d_w2_1: { status: 'doing', owner_id: 'demo-member-4', due_date: '2026-09-19' },
  d_w2_2: { status: 'todo', owner_id: 'demo-member-4', due_date: '2026-09-21' },
  f_w5_0: { status: 'todo', owner_id: 'demo-member-1', due_date: '2026-10-08' },
};

/** 업무 진행 상태 초기값 */
const createSampleTaskStates = () =>
  TASKS.map((task) => ({
    task_id: task.id,
    status: DEFAULT_STATUS,
    owner_id: null,
    due_date: null,
    memo: '',
    links: [],
    checklist: [],
    updated_at: null,
    updated_by: null,
    ...(DEMO_TASK_SEED[task.id] || {}),
  }));

/** 데모 코멘트 */
const createSampleComments = () => [
  {
    id: 'demo-comment-1',
    task_id: 'c_w2_0',
    member_id: 'demo-member-1',
    body: '단가는 하루 기준으로 받아주세요. 예산 협의 후 회신드립니다.',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-comment-2',
    task_id: 'b_w2_0',
    member_id: 'demo-member-3',
    body: 'C사는 담당자 변경돼서 연락처 다시 확인이 필요합니다.',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const createInitialData = () => ({
  members: createSampleMembers(),
  task_states: createSampleTaskStates(),
  comments: createSampleComments(),
  activity_log: [],
});

// ---------------------------------------------
// 저장소
// ---------------------------------------------

let store = null;

const readStore = () => {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('[demo] 저장된 데모 데이터를 읽지 못했습니다.', error);
  }
  return createInitialData();
};

const persist = () => {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn('[demo] 데모 데이터를 저장하지 못했습니다.', error);
  }
};

const getStore = () => {
  if (!store) store = readStore();
  return store;
};

/** 데모 데이터를 초기 상태로 되돌린다. (콘솔에서 호출 가능) */
export const resetDemoData = () => {
  store = createInitialData();
  persist();
  return true;
};

// ---------------------------------------------
// 탭 간 동기화
// ---------------------------------------------

const subscribers = { task_states: [], comments: [] };
let channel = null;

const getChannel = () => {
  if (channel !== null) return channel;
  channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(DEMO_CHANNEL) : false;

  if (channel) {
    channel.onmessage = (event) => {
      const { table, eventType, row } = event.data || {};
      if (!table) return;
      // 다른 탭의 변경을 내 저장소에도 반영한다.
      store = readStore();
      subscribers[table]?.forEach((handler) => handler(row, eventType));
    };
  }
  return channel;
};

const broadcast = (table, eventType, row) => {
  const bus = getChannel();
  if (bus) bus.postMessage({ table, eventType, row: clone(row) });
};

// ---------------------------------------------
// 팀원
// ---------------------------------------------

export const fetchMembers = async () => {
  await delay();
  return clone(getStore().members);
};

export const createMember = async ({ name, role = null, color = null, index = 0 }) => {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) throw new Error('팀원 이름을 입력해주세요.');

  await delay();
  const member = {
    id: uid(),
    name: trimmed,
    role: role ? String(role).trim() : null,
    color: color || pickAvatarColor(index),
    created_at: new Date().toISOString(),
  };
  getStore().members.push(member);
  persist();
  return clone(member);
};

export const updateMember = async (id, patch) => {
  await delay();
  const member = getStore().members.find((item) => item.id === id);
  if (!member) throw new Error('수정할 팀원을 찾을 수 없습니다.');

  if ('name' in patch) {
    const trimmed = String(patch.name ?? '').trim();
    if (!trimmed) throw new Error('팀원 이름을 입력해주세요.');
    member.name = trimmed;
  }
  if ('role' in patch) member.role = patch.role ? String(patch.role).trim() : null;
  if ('color' in patch) member.color = patch.color || null;

  persist();
  return clone(member);
};

export const deleteMember = async (id) => {
  await delay();
  const data = getStore();
  data.members = data.members.filter((item) => item.id !== id);
  // 실제 스키마의 on delete set null 과 같은 결과를 만든다.
  data.task_states.forEach((row) => {
    if (row.owner_id === id) row.owner_id = null;
    if (row.updated_by === id) row.updated_by = null;
  });
  data.comments.forEach((row) => {
    if (row.member_id === id) row.member_id = null;
  });
  persist();
  return true;
};

// ---------------------------------------------
// 업무 진행 상태
// ---------------------------------------------

export const fetchTaskStates = async () => {
  await delay();
  return clone(getStore().task_states);
};

export const seedMissingTaskStates = async (existingIds = []) => {
  const existing = new Set(existingIds);
  const missing = TASKS.filter((task) => !existing.has(task.id));
  if (missing.length === 0) return [];

  const rows = missing.map((task) => ({
    task_id: task.id,
    status: DEFAULT_STATUS,
    owner_id: null,
    due_date: null,
    memo: '',
    links: [],
    checklist: [],
    updated_at: null,
    updated_by: null,
  }));

  getStore().task_states.push(...rows);
  persist();
  return clone(rows);
};

export const initTaskStates = async () => {
  const rows = await fetchTaskStates();
  const seeded = await seedMissingTaskStates(rows.map((row) => row.task_id));
  return { rows: seeded.length > 0 ? [...rows, ...seeded] : rows, seededCount: seeded.length };
};

export const updateTaskState = async (taskId, patch, memberId = null) => {
  await delay();
  const row = getStore().task_states.find((item) => item.task_id === taskId);
  if (!row) throw new Error('수정할 업무를 찾을 수 없습니다.');

  Object.assign(row, patch, {
    updated_at: new Date().toISOString(),
    updated_by: memberId,
  });
  persist();
  broadcast('task_states', 'UPDATE', row);
  return clone(row);
};

export const subscribeTaskStates = ({ onChange, onStatus }) => {
  subscribers.task_states.push(onChange);
  getChannel();
  // 데모 모드에서도 헤더가 '온라인' 으로 보이도록 알린다.
  setTimeout(() => onStatus?.('SUBSCRIBED'), 0);

  return () => {
    subscribers.task_states = subscribers.task_states.filter((item) => item !== onChange);
  };
};

// ---------------------------------------------
// 코멘트
// ---------------------------------------------

export const fetchComments = async () => {
  await delay();
  return clone(getStore().comments);
};

export const fetchCommentsByTask = async (taskId) => {
  await delay();
  return clone(getStore().comments.filter((item) => item.task_id === taskId));
};

export const createComment = async ({ taskId, memberId, body }) => {
  const text = String(body ?? '').trim();
  if (!text) throw new Error('코멘트 내용을 입력해주세요.');

  await delay();
  const comment = {
    id: uid(),
    task_id: taskId,
    member_id: memberId || null,
    body: text,
    created_at: new Date().toISOString(),
  };
  getStore().comments.push(comment);
  persist();
  broadcast('comments', 'INSERT', comment);
  return clone(comment);
};

export const deleteComment = async (id) => {
  await delay();
  const data = getStore();
  const removed = data.comments.find((item) => item.id === id);
  data.comments = data.comments.filter((item) => item.id !== id);
  persist();
  if (removed) broadcast('comments', 'DELETE', removed);
  return true;
};

export const subscribeComments = ({ onChange, onStatus }) => {
  subscribers.comments.push(onChange);
  getChannel();
  setTimeout(() => onStatus?.('SUBSCRIBED'), 0);

  return () => {
    subscribers.comments = subscribers.comments.filter((item) => item !== onChange);
  };
};

// ---------------------------------------------
// 변경 이력
// ---------------------------------------------

const sortNewestFirst = (rows) =>
  [...rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

export const fetchRecentActivity = async (limit = RECENT_ACTIVITY_LIMIT) => {
  await delay();
  return clone(sortNewestFirst(getStore().activity_log).slice(0, limit));
};

export const fetchActivityByTask = async (taskId, limit = TASK_ACTIVITY_LIMIT) => {
  await delay();
  const rows = getStore().activity_log.filter((item) => item.task_id === taskId);
  return clone(sortNewestFirst(rows).slice(0, limit));
};

export const logActivity = async (entries = []) => {
  if (entries.length === 0) return true;

  const now = new Date().toISOString();
  getStore().activity_log.push(
    ...entries.map((entry) => ({ ...entry, id: uid(), created_at: now }))
  );
  persist();
  return true;
};

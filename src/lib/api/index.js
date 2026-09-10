/**
 * 데이터 접근 계층 배럴 export.
 *
 * 컴포넌트/훅은 항상 이 모듈을 통해 데이터에 접근한다.
 * 백엔드 교체 시에도 이 계층만 바꾸면 된다.
 *
 * .env 에 Supabase 설정이 없으면 자동으로 데모용 목 데이터로 동작한다.
 * (백엔드 준비 전에 화면을 확인하기 위한 모드)
 */
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import * as mockApi from './mockApi';
import * as membersApi from './membersApi';
import * as tasksApi from './tasksApi';
import * as commentsApi from './commentsApi';
import * as activityApi from './activityApi';

/** Supabase 없이 목 데이터로 동작 중인지 */
export const isDemoMode = !isSupabaseConfigured;

const supabaseImpl = { ...membersApi, ...tasksApi, ...commentsApi, ...activityApi };
const impl = isDemoMode ? mockApi : supabaseImpl;

if (isDemoMode) {
  console.info(
    '[wbs] 데모 모드로 실행 중입니다. 데이터는 이 브라우저에만 저장됩니다.\n' +
      '실제 서버에 연결하려면 .env 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 넣어주세요.'
  );
}

// --- 팀원 ---
export const fetchMembers = (...args) => impl.fetchMembers(...args);
export const createMember = (...args) => impl.createMember(...args);
export const updateMember = (...args) => impl.updateMember(...args);
export const deleteMember = (...args) => impl.deleteMember(...args);

// --- 업무 진행 상태 ---
export const fetchTaskStates = (...args) => impl.fetchTaskStates(...args);
export const seedMissingTaskStates = (...args) => impl.seedMissingTaskStates(...args);
export const initTaskStates = (...args) => impl.initTaskStates(...args);
export const updateTaskState = (...args) => impl.updateTaskState(...args);
export const subscribeTaskStates = (...args) => impl.subscribeTaskStates(...args);

// --- 코멘트 ---
export const fetchComments = (...args) => impl.fetchComments(...args);
export const fetchCommentsByTask = (...args) => impl.fetchCommentsByTask(...args);
export const createComment = (...args) => impl.createComment(...args);
export const deleteComment = (...args) => impl.deleteComment(...args);
export const subscribeComments = (...args) => impl.subscribeComments(...args);

// --- 변경 이력 ---
export const fetchRecentActivity = (...args) => impl.fetchRecentActivity(...args);
export const fetchActivityByTask = (...args) => impl.fetchActivityByTask(...args);
export const logActivity = (...args) => impl.logActivity(...args);

// --- 데모 데이터 초기화 (브라우저 콘솔에서 호출) ---
export const resetDemoData = isDemoMode ? mockApi.resetDemoData : () => false;

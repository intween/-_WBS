/**
 * Supabase 클라이언트.
 *
 * 환경변수는 .env 의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 사용한다.
 * 값이 없으면 앱을 죽이지 않고 isSupabaseConfigured 를 false 로 두어
 * 화면에서 설정 안내를 보여준다.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** .env 설정이 완료되었는지 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] .env 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다. ' +
      '.env.example 을 복사해 값을 채운 뒤 개발 서버를 다시 시작하세요.'
  );
}

/** Supabase 클라이언트 (설정 전에는 null) */
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // 이메일/비밀번호 인증을 쓰지 않으므로 세션 유지가 필요 없다.
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        // 소규모 팀이므로 초당 이벤트 수를 낮게 잡아둔다.
        params: { eventsPerSecond: 5 },
      },
    })
  : null;

/**
 * 클라이언트를 꺼내되, 설정이 없으면 명확한 한국어 에러를 던진다.
 * api 계층에서만 사용한다.
 */
export const requireClient = () => {
  if (!supabase) {
    throw new Error('Supabase 설정이 없습니다. .env 파일을 확인해주세요.');
  }
  return supabase;
};

/**
 * supabase-js 응답에서 data 를 꺼내고, error 면 예외로 바꾼다.
 * @param {{ data: any, error: any }} response
 * @param {string} context - 실패 시 보여줄 한국어 문구
 */
export const unwrap = ({ data, error }, context) => {
  if (error) {
    console.error(`[supabase] ${context}`, error);
    const reason = error.message ? ` (${error.message})` : '';
    throw new Error(`${context}${reason}`);
  }
  return data;
};

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

/** .env 에 Supabase 값이 채워져 있는지 */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * Supabase 클라이언트 (설정이 없으면 null).
 *
 * 이 앱은 로그인이 없으므로 세션 관련 기능은 모두 끈다.
 */
export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;

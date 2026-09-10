/**
 * Supabase Realtime 채널 구독/해제.
 *
 * task_states 와 comments 두 채널을 함께 관리하고,
 * 둘 다 연결됐을 때만 '온라인' 으로 본다.
 * 구독 자체는 lib/api 를 거친다. (컴포넌트가 Supabase 를 직접 만지지 않도록)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeTaskStates, subscribeComments } from '@/lib/api';
import { REALTIME_RETRY_MS } from '@/constants/config';

/** 연결 상태 */
export const REALTIME_STATUS = {
  CONNECTING: 'connecting',
  ONLINE: 'online',
  OFFLINE: 'offline',
};

/** Supabase 채널 상태 문자열 → 앱 상태로 변환 */
const toAppStatus = (channelStatus) => {
  if (channelStatus === 'SUBSCRIBED') return REALTIME_STATUS.ONLINE;
  if (channelStatus === 'CHANNEL_ERROR' || channelStatus === 'TIMED_OUT') {
    return REALTIME_STATUS.OFFLINE;
  }
  if (channelStatus === 'CLOSED') return REALTIME_STATUS.CONNECTING;
  return REALTIME_STATUS.CONNECTING;
};

/**
 * @param {Object} params
 * @param {(row: Object, event: string) => void} params.onTaskState
 * @param {(row: Object, event: string) => void} params.onComment
 * @param {boolean} [params.enabled] - Supabase 설정이 없으면 false
 * @returns {{ status: string, isOnline: boolean, reconnect: Function }}
 */
export const useRealtimeSync = ({ onTaskState, onComment, enabled = true }) => {
  const [status, setStatus] = useState(
    enabled ? REALTIME_STATUS.CONNECTING : REALTIME_STATUS.OFFLINE
  );

  // 핸들러가 매 렌더 바뀌어도 재구독하지 않도록 ref 로 붙잡는다.
  const taskHandlerRef = useRef(onTaskState);
  const commentHandlerRef = useRef(onComment);
  useEffect(() => {
    taskHandlerRef.current = onTaskState;
    commentHandlerRef.current = onComment;
  });

  // 채널별 상태를 모아 하나로 계산한다.
  const channelStatusRef = useRef({ tasks: null, comments: null });
  const [retryToken, setRetryToken] = useState(0);

  /** 수동 재연결 */
  const reconnect = useCallback(() => setRetryToken((token) => token + 1), []);

  useEffect(() => {
    if (!enabled) {
      setStatus(REALTIME_STATUS.OFFLINE);
      return undefined;
    }

    let retryTimer = null;
    channelStatusRef.current = { tasks: null, comments: null };

    const applyStatus = (key, channelStatus) => {
      channelStatusRef.current[key] = toAppStatus(channelStatus);
      const { tasks, comments } = channelStatusRef.current;

      if (tasks === REALTIME_STATUS.ONLINE && comments === REALTIME_STATUS.ONLINE) {
        setStatus(REALTIME_STATUS.ONLINE);
        return;
      }
      if (tasks === REALTIME_STATUS.OFFLINE || comments === REALTIME_STATUS.OFFLINE) {
        setStatus(REALTIME_STATUS.OFFLINE);
        // 잠시 뒤 자동으로 다시 붙는다.
        if (!retryTimer) {
          retryTimer = setTimeout(() => {
            retryTimer = null;
            setRetryToken((token) => token + 1);
          }, REALTIME_RETRY_MS);
        }
        return;
      }
      setStatus(REALTIME_STATUS.CONNECTING);
    };

    let unsubscribeTasks = () => {};
    let unsubscribeComments = () => {};

    try {
      unsubscribeTasks = subscribeTaskStates({
        onChange: (row, event) => taskHandlerRef.current?.(row, event),
        onStatus: (channelStatus) => applyStatus('tasks', channelStatus),
      });

      unsubscribeComments = subscribeComments({
        onChange: (row, event) => commentHandlerRef.current?.(row, event),
        onStatus: (channelStatus) => applyStatus('comments', channelStatus),
      });
    } catch (error) {
      console.warn('[realtime] 구독에 실패했습니다.', error);
      setStatus(REALTIME_STATUS.OFFLINE);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribeTasks();
      unsubscribeComments();
    };
  }, [enabled, retryToken]);

  return {
    status,
    isOnline: status === REALTIME_STATUS.ONLINE,
    reconnect,
  };
};

export default useRealtimeSync;

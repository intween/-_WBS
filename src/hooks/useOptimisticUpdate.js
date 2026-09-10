/**
 * 낙관적 업데이트 실행 훅.
 *
 * 화면을 먼저 바꾸고 서버에 저장한 뒤, 실패하면 되돌린다.
 * 되돌리는 방법(rollback)과 실패 알림(onError)은 호출부가 정한다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @returns {{ run: Function, isPending: boolean, pendingCount: number }}
 */
export const useOptimisticUpdate = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const bump = useCallback((delta) => {
    if (!mountedRef.current) return;
    setPendingCount((count) => Math.max(0, count + delta));
  }, []);

  /**
   * @param {Object} params
   * @param {Function} params.optimistic - 화면을 먼저 바꾸는 동작
   * @param {Function} params.commit     - 서버 저장 (async, 결과 반환)
   * @param {Function} [params.rollback] - 실패 시 되돌리는 동작
   * @param {Function} [params.onSuccess]- 성공 후 후처리 (서버 응답을 받음)
   * @param {Function} [params.onError]  - 실패 알림 (Toast 등)
   * @returns {Promise<{ ok: boolean, data?: *, error?: Error }>}
   */
  const run = useCallback(
    async ({ optimistic, commit, rollback, onSuccess, onError }) => {
      optimistic?.();
      bump(1);

      try {
        const data = await commit();
        onSuccess?.(data);
        return { ok: true, data };
      } catch (error) {
        rollback?.();
        onError?.(error);
        return { ok: false, error };
      } finally {
        bump(-1);
      }
    },
    [bump]
  );

  return { run, isPending: pendingCount > 0, pendingCount };
};

export default useOptimisticUpdate;

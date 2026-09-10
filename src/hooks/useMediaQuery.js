/**
 * 미디어쿼리 매칭 훅.
 * React 18 의 useSyncExternalStore 로 구독해 렌더 중 값이 어긋나지 않게 한다.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { MQ_MOBILE } from '@/constants/config';

const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * @param {string} query - 예: '(max-width: 768px)'
 * @returns {boolean}
 */
export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onStoreChange) => {
      if (!canMatch()) return () => {};
      const mql = window.matchMedia(query);

      // 구형 Safari 는 addEventListener 를 지원하지 않는다.
      if (mql.addEventListener) {
        mql.addEventListener('change', onStoreChange);
        return () => mql.removeEventListener('change', onStoreChange);
      }
      mql.addListener(onStoreChange);
      return () => mql.removeListener(onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => (canMatch() ? window.matchMedia(query).matches : false),
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};

/** 모바일 여부 (768px 이하) */
export const useIsMobile = () => useMediaQuery(MQ_MOBILE);

export default useMediaQuery;

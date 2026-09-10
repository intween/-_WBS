import { useCallback, useRef, useState } from 'react';

const DISMISS_THRESHOLD = 90;

export const useSwipeDismiss = (onDismiss) => {
  const startYRef = useRef(null);
  const [offset, setOffset] = useState(0);

  const onTouchStart = useCallback((event) => {
    startYRef.current = event.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((event) => {
    if (startYRef.current === null) return;
    const distance = event.touches[0].clientY - startYRef.current;
    setOffset(Math.max(distance, 0));
  }, []);

  const onTouchEnd = useCallback(() => {
    if (offset > DISMISS_THRESHOLD) onDismiss();
    startYRef.current = null;
    setOffset(0);
  }, [offset, onDismiss]);

  return { offset, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
};

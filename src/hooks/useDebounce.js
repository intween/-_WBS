/**
 * 디바운스 훅.
 * - useDebounce: 값이 잠잠해진 뒤의 값을 돌려준다 (검색어 등)
 * - useDebouncedCallback: 호출을 늦춘다 (메모 자동 저장 등)
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 값 디바운스.
 * @param {*} value
 * @param {number} delay - ms
 */
export const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

/**
 * 콜백 디바운스.
 *
 * @param {Function} callback
 * @param {number} delay - ms
 * @param {Object} [options]
 * @param {boolean} [options.flushOnUnmount] - 언마운트 시 대기 중인 호출을 실행할지
 *        (메모 자동 저장처럼 입력 도중 패널이 닫혀도 저장돼야 하는 경우 true)
 * @returns {{ run: Function, flush: Function, cancel: Function, isPending: Function }}
 */
export const useDebouncedCallback = (callback, delay, { flushOnUnmount = false } = {}) => {
  const callbackRef = useRef(callback);
  const timerRef = useRef(null);
  const argsRef = useRef(null);

  // 최신 콜백을 참조하되, run 의 정체성은 유지한다.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 대기 중인 호출을 버린다. */
  const cancel = useCallback(() => {
    clearTimer();
    argsRef.current = null;
  }, [clearTimer]);

  /** 대기 중인 호출을 지금 즉시 실행한다. */
  const flush = useCallback(() => {
    if (!timerRef.current) return;
    clearTimer();
    const args = argsRef.current;
    argsRef.current = null;
    if (args) callbackRef.current(...args);
  }, [clearTimer]);

  const run = useCallback(
    (...args) => {
      argsRef.current = args;
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const pending = argsRef.current;
        argsRef.current = null;
        if (pending) callbackRef.current(...pending);
      }, delay);
    },
    [clearTimer, delay]
  );

  const isPending = useCallback(() => timerRef.current !== null, []);

  // 언마운트 정리
  const flushOnUnmountRef = useRef(flushOnUnmount);
  flushOnUnmountRef.current = flushOnUnmount;

  useEffect(
    () => () => {
      if (flushOnUnmountRef.current && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const pending = argsRef.current;
        argsRef.current = null;
        if (pending) callbackRef.current(...pending);
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { run, flush, cancel, isPending };
};

export default useDebounce;

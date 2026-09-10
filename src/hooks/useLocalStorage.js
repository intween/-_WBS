/**
 * localStorage 연동 훅.
 * 프라이빗 모드/용량 초과 등으로 접근이 막혀도 앱이 죽지 않도록 전부 try-catch 로 감싼다.
 *
 * 업무 데이터는 여기에 저장하지 않는다. (정본은 Supabase)
 * 화면 상태(선택한 팀원, 마지막 탭 등)만 보관한다.
 */
import { useCallback, useRef, useState } from 'react';

/** 브라우저 저장소를 쓸 수 있는 환경인지 */
const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

/** 저장된 값 읽기 */
export const readStorage = (key, fallback = null) => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] '${key}' 를 읽지 못했습니다.`, error);
    return fallback;
  }
};

/** 값 저장 */
export const writeStorage = (key, value) => {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] '${key}' 를 저장하지 못했습니다.`, error);
    return false;
  }
};

/** 값 삭제 */
export const removeStorage = (key) => {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] '${key}' 를 삭제하지 못했습니다.`, error);
    return false;
  }
};

/**
 * @param {string} key
 * @param {*} initialValue
 * @returns {[*, Function, Function]} [값, 설정, 삭제]
 */
export const useLocalStorage = (key, initialValue = null) => {
  const initialRef = useRef(initialValue);
  const [value, setValue] = useState(() => readStorage(key, initialRef.current));

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    removeStorage(key);
    setValue(initialRef.current);
  }, [key]);

  return [value, set, remove];
};

export default useLocalStorage;

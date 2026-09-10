/**
 * 오버레이(모달·상세 패널)용 접근성 훅.
 * Modal 과 TaskDetailPanel 이 함께 쓴다.
 */
import { useEffect } from 'react';

/** 포커스를 받을 수 있는 요소 선택자 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusable = (container) =>
  Array.from(container?.querySelectorAll(FOCUSABLE) || []).filter(
    (element) => element.offsetParent !== null || element === document.activeElement
  );

/**
 * 포커스를 오버레이 안에 가둔다.
 * 열릴 때 첫 요소로 포커스를 옮기고, 닫히면 원래 위치로 되돌린다.
 * ESC 키는 onEscape 로 전달한다.
 *
 * @param {{ current: HTMLElement|null }} containerRef
 * @param {Object} options
 * @param {boolean} options.active
 * @param {Function} [options.onEscape]
 * @param {boolean} [options.autoFocus] - 열릴 때 첫 요소에 포커스할지
 */
export const useFocusTrap = (containerRef, { active, onEscape, autoFocus = true }) => {
  useEffect(() => {
    if (!active) return undefined;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;

    if (autoFocus && container) {
      const [first] = getFocusable(container);
      (first || container).focus?.();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape?.();
        return;
      }

      if (event.key !== 'Tab' || !container) return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // 마지막에서 Tab → 처음으로, 처음에서 Shift+Tab → 마지막으로
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [active, autoFocus, containerRef, onEscape]);
};

/** 오버레이가 열려 있는 동안 배경 스크롤을 잠근다. */
export const useScrollLock = (active) => {
  useEffect(() => {
    if (!active) return undefined;

    document.body.classList.add('is-scroll-locked');
    return () => document.body.classList.remove('is-scroll-locked');
  }, [active]);
};

import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusableWithin = (container) =>
  Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null,
  );

export const useFocusTrap = (containerRef, isActive, onEscape) => {
  useEffect(() => {
    if (!isActive) return undefined;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;
    const initial = focusableWithin(container)[0] ?? container;
    initial.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = focusableWithin(container);
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [containerRef, isActive, onEscape]);
};

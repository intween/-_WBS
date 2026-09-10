import { useEffect } from 'react';
import {
  MONTH_SECTION_SELECTOR,
  SEARCH_INPUT_SELECTOR,
  SHORTCUT_KEYS,
  TODAY_CELL_SELECTOR,
  VIEW_HOTKEYS,
} from '@/constants/shortcuts';
import { VIEWS } from '@/constants/views';
import { useUi, useUiActions } from '@/context/hooks';

const isTypingTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const scrollToElement = (element) => {
  if (element) element.scrollIntoView({ block: 'start', behavior: 'smooth' });
};

const stepMonth = (direction) => {
  const sections = Array.from(document.querySelectorAll(MONTH_SECTION_SELECTOR));
  if (sections.length === 0) return;
  const current = sections.findIndex((section) => section.getBoundingClientRect().bottom > 80);
  const next = Math.min(Math.max((current < 0 ? 0 : current) + direction, 0), sections.length - 1);
  scrollToElement(sections[next]);
};

export const useShortcuts = (isMobile) => {
  const { view, selectedTaskId, shortcutsOpen } = useUi();
  const { setView, closeDetail, setShortcutsOpen, closeTaskListPanel } = useUiActions();

  useEffect(() => {
    if (isMobile) return undefined;

    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === SHORTCUT_KEYS.close) {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (selectedTaskId) closeDetail();
        else closeTaskListPanel();
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === SHORTCUT_KEYS.search) {
        event.preventDefault();
        document.querySelector(SEARCH_INPUT_SELECTOR)?.focus();
        return;
      }

      if (event.key === SHORTCUT_KEYS.help) {
        event.preventDefault();
        setShortcutsOpen(!shortcutsOpen);
        return;
      }

      if (VIEW_HOTKEYS[event.key]) {
        setView(VIEW_HOTKEYS[event.key]);
        return;
      }

      if (view !== VIEWS.calendar) return;

      if (event.key === SHORTCUT_KEYS.prevMonth) {
        event.preventDefault();
        stepMonth(-1);
      } else if (event.key === SHORTCUT_KEYS.nextMonth) {
        event.preventDefault();
        stepMonth(1);
      } else if (event.key.toLowerCase() === SHORTCUT_KEYS.today) {
        scrollToElement(document.querySelector(TODAY_CELL_SELECTOR));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, view, selectedTaskId, shortcutsOpen, setView, closeDetail, setShortcutsOpen, closeTaskListPanel]);
};

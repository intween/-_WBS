import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_THEME,
  THEMES,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from '@/constants/theme';

const readStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored in THEMES ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === THEMES.system) {
    root.removeAttribute(THEME_ATTRIBUTE);
    return;
  }
  root.setAttribute(THEME_ATTRIBUTE, theme);
};

export const useTheme = () => {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      applyTheme(next);
    }
  }, []);

  return { theme, setTheme };
};

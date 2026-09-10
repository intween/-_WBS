export const THEMES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
};

export const THEME_LIST = [
  { key: THEMES.light, label: '라이트', icon: 'sun' },
  { key: THEMES.dark, label: '다크', icon: 'moon' },
  { key: THEMES.system, label: '시스템', icon: 'system' },
];

export const DEFAULT_THEME = THEMES.system;

export const THEME_STORAGE_KEY = 'wbs-calendar:theme';

export const THEME_ATTRIBUTE = 'data-theme';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

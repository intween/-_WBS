export const DENSITIES = {
  comfortable: 'comfortable',
  compact: 'compact',
};

export const DENSITY_LIST = [
  { key: DENSITIES.comfortable, label: '보통' },
  { key: DENSITIES.compact, label: '좁게' },
];

export const DEFAULT_DENSITY = DENSITIES.comfortable;

export const DENSITY_STORAGE_KEY = 'wbs-calendar:density';

export const DENSITY_ATTRIBUTE = 'data-density';

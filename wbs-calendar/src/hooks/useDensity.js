import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_DENSITY,
  DENSITIES,
  DENSITY_ATTRIBUTE,
  DENSITY_STORAGE_KEY,
} from '@/constants/density';

const readStoredDensity = () => {
  try {
    const stored = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    return stored in DENSITIES ? stored : DEFAULT_DENSITY;
  } catch {
    return DEFAULT_DENSITY;
  }
};

const applyDensity = (density) => {
  const root = document.documentElement;
  if (density === DEFAULT_DENSITY) {
    root.removeAttribute(DENSITY_ATTRIBUTE);
    return;
  }
  root.setAttribute(DENSITY_ATTRIBUTE, density);
};

export const useDensity = () => {
  const [density, setDensityState] = useState(readStoredDensity);

  useEffect(() => {
    applyDensity(density);
  }, [density]);

  const setDensity = useCallback((next) => {
    setDensityState(next);
    try {
      window.localStorage.setItem(DENSITY_STORAGE_KEY, next);
    } catch {
      applyDensity(next);
    }
  }, []);

  return { density, setDensity };
};

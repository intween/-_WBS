import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '@/constants/views';

const getMatches = (query) =>
  typeof window === 'undefined' ? false : window.matchMedia(query).matches;

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getMatches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`;

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

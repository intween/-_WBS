const PATHS = {
  close: 'M6 6l12 12M18 6L6 18',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  check: 'M5 13l4 4 10-10',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1',
  memo: 'M5 4h11l4 4v12H5zM15 4v5h5M8 13h8M8 17h5',
  calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  timeline: 'M4 7h10M4 12h16M4 17h7',
  onsite: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11zM12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  alert: 'M12 4l9 16H3zM12 10v4M12 17.2v.1',
  download: 'M12 4v11M8 11l4 4 4-4M4 20h16',
  refresh: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5',
  filter: 'M4 6h16l-6 7v5l-4 2v-7z',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  bang: 'M12 5v8M12 17.5v.1',
  document: 'M6 3h8l4 4v14H6zM14 3v5h5',
  density: 'M4 6h16M4 12h16M4 18h16',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  system: 'M4 5h16v10H4zM9 19h6M12 15v4',
};

export const ICON_NAMES = Object.keys(PATHS);

const Icon = ({ name, size = 16, strokeWidth = 1.8, className = '', title }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : 'true'}
    role={title ? 'img' : undefined}
    focusable="false"
  >
    {title && <title>{title}</title>}
    <path d={PATHS[name]} />
  </svg>
);

export default Icon;

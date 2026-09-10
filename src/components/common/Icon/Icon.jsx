/**
 * 인라인 SVG 아이콘.
 * 외부 아이콘 라이브러리를 쓰지 않고 여기서 직접 그린다.
 * 선 색상은 currentColor 를 따르므로 부모의 color 로 제어한다.
 */
import './Icon.scss';

/** name → SVG 내부 요소 */
const PATHS = {
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m20 6-11 11-5-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="m14 6 4 4" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
    </>
  ),
  memo: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  comment: <path d="M4 5h16v11H9l-5 4V5Z" />,
  checklist: (
    <>
      <path d="m4 7 2 2 3-3M4 16l2 2 3-3" />
      <path d="M13 8h7M13 17h7" />
    </>
  ),
  calendar: (
    <>
      <path d="M4 6h16v14H4zM4 10h16" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 7M18 20c0-2.6-.8-4.3-2-5.3" />
    </>
  ),
  board: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M9 5v14M15 5v14" />
    </>
  ),
  dashboard: (
    <>
      <path d="M3 4h7v7H3zM14 4h7v4h-7zM14 12h7v8h-7zM3 15h7v5H3z" />
    </>
  ),
  myTasks: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="m8.5 11 2 2 4-4" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M8 11l4 4 4-4" />
      <path d="M4 19h16" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v5h-5" />
    </>
  ),
  offline: (
    <>
      <path d="M3 3l18 18" />
      <path d="M5 12.5a11 11 0 0 1 3.5-2.3M15.5 10.2a11 11 0 0 1 3.5 2.3" />
      <path d="M8.5 16a6 6 0 0 1 7 0" />
      <path d="M12 20v.01" />
    </>
  ),
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M19 14v6H5V5h6" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4H5v16h9" />
      <path d="M18 12H9M15 9l3 3-3 3" />
    </>
  ),
};

/** 사용할 수 있는 아이콘 이름 목록 */
export const ICON_NAMES = Object.keys(PATHS);

/**
 * @param {Object} props
 * @param {string} props.name - ICON_NAMES 중 하나
 * @param {number} [props.size] - px
 * @param {number} [props.strokeWidth]
 * @param {string} [props.className]
 */
function Icon({ name, size = 16, strokeWidth = 1.8, className = '' }) {
  const shape = PATHS[name];
  if (!shape) return null;

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
}

export default Icon;

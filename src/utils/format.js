/**
 * 날짜 / 숫자 / 텍스트 표시 포맷 — 전부 순수 함수.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 두 자리 0 채움 */
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * 'YYYY-MM-DD' 문자열이나 Date 를 로컬 자정 기준 Date 로 변환한다.
 * (타임존 때문에 하루가 밀리는 문제를 막기 위해 직접 파싱한다.)
 * @returns {Date|null}
 */
export const toLocalDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/** date input(value) 및 DB date 컬럼용 'YYYY-MM-DD' 문자열 */
export const toDateKey = (value) => {
  const date = toLocalDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

/** 날짜 표기 — 예: '2026.10.21' */
export const formatDate = (value) => {
  const date = toLocalDate(value);
  if (!date) return '';
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
};

/** 짧은 날짜 표기 — 예: '10.21' */
export const formatShortDate = (value) => {
  const date = toLocalDate(value);
  if (!date) return '';
  return `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
};

/** 날짜+시각 표기 — 예: '2026.09.09 17:30' */
export const formatDateTime = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return (
    `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}` +
    ` ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  );
};

/**
 * 상대시간 표기 — 예: '방금 전', '3시간 전', '2일 전'
 * 7일이 넘으면 날짜로 표시한다.
 */
export const formatRelativeTime = (value, now = new Date()) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diff = now.getTime() - date.getTime();

  // 서버/클라이언트 시계 차이로 미래가 나오면 '방금 전' 으로 처리한다.
  if (diff < MINUTE) return '방금 전';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;
  return formatDate(date);
};

/** 파일명용 타임스탬프 — 예: '20260909-1730' */
export const formatFileStamp = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return (
    `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}` +
    `-${pad2(date.getHours())}${pad2(date.getMinutes())}`
  );
};

/** 퍼센트 표기 — 예: 42 → '42%' */
export const formatPercent = (percent) => `${Math.round(Number(percent) || 0)}%`;

/** 완료/전체 표기 — 예: '12 / 67' */
export const formatRatio = (done, total) => `${done} / ${total}`;

/**
 * 텍스트를 지정 길이로 자르고 말줄임을 붙인다.
 * 줄바꿈은 공백으로 정리한다.
 */
export const truncateText = (text, length) => {
  const value = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  return value.length > length ? `${value.slice(0, length)}…` : value;
};

/**
 * 아바타에 표시할 이니셜.
 * 한글 이름은 성을 뺀 뒷글자(최대 2자), 영문은 단어 첫 글자를 쓴다.
 */
export const getInitials = (name) => {
  const value = String(name ?? '').trim();
  if (!value) return '?';

  const isHangul = /[가-힣]/.test(value);
  if (isHangul) {
    const compact = value.replace(/\s+/g, '');
    return compact.length >= 2 ? compact.slice(-2) : compact;
  }

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

/** 빈 값 표기 통일 */
export const orDash = (value, dash = '—') => {
  const text = String(value ?? '').trim();
  return text || dash;
};

/**
 * JS 에서 참조하는 색상 값.
 * src/styles/abstracts/_variables.scss 와 값을 반드시 일치시킨다.
 */

// --- Base ---
export const C_BG = '#E8E6E2';
export const C_SURFACE = '#FFFFFF';
export const C_PANEL = '#F5F3EF';
export const C_PANEL_ALT = '#EEEDE9';
export const C_BORDER = '#D5D0C8';
export const C_TEXT = '#1A1A18';
export const C_TEXT_MUTE = '#888888';
export const C_TEXT_FAINT = '#AAAAAA';

// --- Brand / Status ---
export const C_NAVY = '#1F3B5A';
export const C_TODO = '#9A958C';
export const C_DOING = '#2E6DA4';
export const C_DONE = '#1A6B5A';
export const C_HOLD = '#993C1D';
export const C_DANGER = '#B5341F';

/** 스트림 id → 색상 */
export const STREAM_COLORS = {
  a: '#185FA5',
  b: '#085041',
  c: '#854F0B',
  d: '#534AB7',
  e: '#27500A',
  f: '#993C1D',
  g: '#1F3B5A',
};

/** 기간 id → 색상 */
export const PERIOD_COLORS = {
  w1: '#185FA5',
  w2: '#085041',
  w3: '#854F0B',
  w4: '#534AB7',
  w5: '#27500A',
  w6: '#993C1D',
  w7: '#791F1F',
  w8: '#0C447C',
  wf: '#1F3B5A',
};

/**
 * 팀원 아바타 기본 색상 팔레트.
 * 팀원 추가 시 색상을 고르지 않으면 이 중에서 순서대로 배정한다.
 */
export const AVATAR_PALETTE = [
  '#185FA5',
  '#085041',
  '#854F0B',
  '#534AB7',
  '#27500A',
  '#993C1D',
  '#1F3B5A',
  '#791F1F',
];

/** 스트림 색상 조회 (미정의 시 네이비 폴백) */
export const getStreamColor = (streamId) => STREAM_COLORS[streamId] || C_NAVY;

/** 기간 색상 조회 (미정의 시 네이비 폴백) */
export const getPeriodColor = (periodId) => PERIOD_COLORS[periodId] || C_NAVY;

/** 순번으로 아바타 색상 배정 */
export const pickAvatarColor = (index = 0) =>
  AVATAR_PALETTE[Math.abs(index) % AVATAR_PALETTE.length];

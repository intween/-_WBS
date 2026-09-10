/**
 * 워크스트림(스윔레인 행) 정의 — 정적 데이터.
 */
export const STREAMS = [
  { id: 'a', name: '프로그램 기획',    color: '#185FA5' },
  { id: 'b', name: '기업 진단 컨설팅', color: '#085041' },
  { id: 'c', name: '현지 섭외 대관',   color: '#854F0B' },
  { id: 'd', name: '디자인 홍보',      color: '#534AB7' },
  { id: 'e', name: 'IR 고도화',        color: '#27500A' },
  { id: 'f', name: '운영 준비 물품',   color: '#993C1D' },
  { id: 'g', name: '현지 일정 Day별',  color: '#1F3B5A' },
];

/** 스트림 id → 스트림 객체 */
export const STREAM_MAP = STREAMS.reduce((acc, stream) => {
  acc[stream.id] = stream;
  return acc;
}, {});

/** 스트림 id 목록 (행 순서) */
export const STREAM_IDS = STREAMS.map((stream) => stream.id);

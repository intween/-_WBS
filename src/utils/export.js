/**
 * 내보내기 — CSV / JSON.
 * 팀 공유·보고용 스냅샷을 만든다. (가져오기는 없음: 정본은 항상 DB)
 */
import {
  EXPORT_FILE_PREFIX,
  EXPORT_MIME_CSV,
  EXPORT_MIME_JSON,
} from '@/constants/config';
import { getStatusLabel, isDoneStatus } from '@/constants/status';
import { formatDateTime, formatFileStamp, toDateKey } from './format';
import { isOverdue } from './dday';
import { UNASSIGNED_LABEL, summarizeChecklist } from './diff';

/** CSV 헤더 (열 순서) */
export const CSV_HEADERS = [
  '스트림',
  '기간',
  '업무ID',
  '업무명',
  '상태',
  '담당자',
  '마감일',
  '지연',
  '체크리스트',
  '문서링크',
  '메모',
  '최종수정',
];

/**
 * 정적 업무 정의와 DB 상태를 조인해 내보내기용 행을 만든다.
 * @param {Array} tasks - 정적 업무 배열
 * @param {Object} stateMap - taskId → task_states 행
 * @param {Object} lookup - { streamMap, periodMap, memberMap }
 * @param {Date} [today]
 */
export const buildExportRows = (tasks = [], stateMap = {}, lookup = {}, today = new Date()) => {
  const { streamMap = {}, periodMap = {}, memberMap = {} } = lookup;

  return tasks.map((task) => {
    const state = stateMap[task.id] || {};
    const status = state.status;
    const isDone = isDoneStatus(status);
    const links = Array.isArray(state.links) ? state.links : [];

    return {
      스트림: streamMap[task.stream]?.name || task.stream,
      기간: periodMap[task.period]?.label || task.period,
      업무ID: task.id,
      업무명: task.title,
      상태: getStatusLabel(status),
      담당자: memberMap[state.owner_id]?.name || UNASSIGNED_LABEL,
      마감일: toDateKey(state.due_date) || '',
      지연: isOverdue(state.due_date, isDone, today) ? 'Y' : '',
      체크리스트: summarizeChecklist(state.checklist),
      문서링크: links.map((link) => link?.url).filter(Boolean).join(' | '),
      메모: String(state.memo ?? '').trim(),
      최종수정: formatDateTime(state.updated_at),
    };
  });
};

/** CSV 셀 하나를 안전하게 감싼다. */
const escapeCsvCell = (value) => {
  const text = String(value ?? '');
  // 수식으로 해석되는 것을 막는다 (=, +, -, @ 로 시작하는 셀)
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
};

/**
 * 행 배열을 CSV 문자열로 만든다.
 * Excel 한글 깨짐 방지를 위해 UTF-8 BOM 을 붙인다.
 */
export const toCsv = (rows = [], headers = CSV_HEADERS) => {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((key) => escapeCsvCell(row[key])).join(',')),
  ];
  return `﻿${lines.join('\r\n')}`;
};

/** 내보내기 파일명 — 예: 'wbs-donghae-20260909-1730.csv' */
export const createExportFilename = (ext, date = new Date()) =>
  `${EXPORT_FILE_PREFIX}-${formatFileStamp(date)}.${ext}`;

/** Blob 을 파일로 내려받는다. */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * CSV 파일로 내보낸다.
 * @returns {boolean} 성공 여부
 */
export const exportCsv = (tasks, stateMap, lookup, today = new Date()) => {
  try {
    const csv = toCsv(buildExportRows(tasks, stateMap, lookup, today));
    downloadBlob(new Blob([csv], { type: EXPORT_MIME_CSV }), createExportFilename('csv'));
    return true;
  } catch (error) {
    console.warn('[export] CSV 내보내기에 실패했습니다.', error);
    return false;
  }
};

/**
 * JSON 파일로 내보낸다. (업무 정의 + 상태를 합친 스냅샷)
 * @returns {boolean} 성공 여부
 */
export const exportJson = (tasks, stateMap, lookup = {}) => {
  try {
    const { memberMap = {} } = lookup;
    const payload = {
      project: EXPORT_FILE_PREFIX,
      exportedAt: new Date().toISOString(),
      taskCount: tasks.length,
      members: Object.values(memberMap).map(({ id, name, role, color }) => ({
        id,
        name,
        role,
        color,
      })),
      tasks: tasks.map((task) => ({
        ...task,
        state: stateMap[task.id] || null,
      })),
    };

    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: EXPORT_MIME_JSON }),
      createExportFilename('json')
    );
    return true;
  } catch (error) {
    console.warn('[export] JSON 내보내기에 실패했습니다.', error);
    return false;
  }
};

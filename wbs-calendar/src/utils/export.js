import { PROJECT } from '@/config';
import { getStatus } from '@/constants/status';
import { EXPORT_FORMATS } from '@/constants/views';
import { checklistProgress } from './progress';
import { today } from './date';

const CSV_HEADERS = ['업무ID', '스트림', '업무명', '상태', '마감일', '체크리스트', '링크수', '메모'];

const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const toRow = (task) => {
  const checklist = checklistProgress(task.checklist);
  return [
    task.id,
    task.streamName,
    task.title,
    getStatus(task.status).label,
    task.dueDate ?? '',
    `${checklist.done}/${checklist.total}`,
    task.links.length,
    (task.memo ?? '').replace(/\n/g, ' '),
  ];
};

export const toCsv = (tasks) =>
  [CSV_HEADERS, ...tasks.map(toRow)].map((row) => row.map(escapeCell).join(',')).join('\r\n');

export const toJson = (tasks) =>
  JSON.stringify(
    {
      project: PROJECT.name,
      exportedAt: new Date().toISOString(),
      tasks: tasks.map((task) => ({
        id: task.id,
        stream: task.stream,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        memo: task.memo,
        links: task.links,
        checklist: task.checklist,
      })),
    },
    null,
    2,
  );

const BOM = '﻿';

const MIME = {
  [EXPORT_FORMATS.csv]: 'text/csv;charset=utf-8',
  [EXPORT_FORMATS.json]: 'application/json;charset=utf-8',
};

export const buildExportFilename = (format) => `${PROJECT.name}_WBS_${today()}.${format}`;

export const downloadExport = (tasks, format) => {
  const isCsv = format === EXPORT_FORMATS.csv;
  const content = isCsv ? BOM + toCsv(tasks) : toJson(tasks);
  const blob = new Blob([content], { type: MIME[format] });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = buildExportFilename(format);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

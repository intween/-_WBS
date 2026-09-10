export const STATUS = {
  todo: { key: 'todo', label: '대기', order: 0 },
  doing: { key: 'doing', label: '진행중', order: 1 },
  done: { key: 'done', label: '완료', order: 2 },
  hold: { key: 'hold', label: '보류', order: 3 },
};

export const STATUS_LIST = Object.values(STATUS).sort((a, b) => a.order - b.order);

export const STATUS_KEYS = STATUS_LIST.map((item) => item.key);

export const DEFAULT_STATUS = STATUS.todo.key;

export const COMPLETED_STATUS = STATUS.done.key;

export const OVERDUE_LABEL = '지연';

export const ALL_STATUS_FILTER = 'all';

export const STATUS_FILTER_OPTIONS = [
  { value: ALL_STATUS_FILTER, label: '전체' },
  ...STATUS_LIST.map((item) => ({ value: item.key, label: item.label })),
];

export const isCompleted = (status) => status === COMPLETED_STATUS;

export const getStatus = (key) => STATUS[key] ?? STATUS[DEFAULT_STATUS];

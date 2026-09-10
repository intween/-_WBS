/**
 * 변경 이력(activity_log) 생성과 문구 조립 — 전부 순수 함수.
 *
 * before_value / after_value 에는 "화면에 그대로 보여줄 문자열"을 저장한다.
 * (상태 key 대신 '완료', 담당자 uuid 대신 이름)
 * 팀원이 나중에 삭제되어도 이력 문구가 깨지지 않게 하기 위함이다.
 */
import {
  ACTIVITY_FIELD,
  ACTIVITY_FIELD_LABELS,
  ACTIVITY_VALUE_PREVIEW,
} from '@/constants/config';
import { getStatusLabel } from '@/constants/status';
import { formatDate, truncateText } from './format';

/** 값이 비어 있을 때 쓰는 표기 */
export const EMPTY_LABEL = '없음';
export const UNASSIGNED_LABEL = '미지정';

// ---------------------------------------------
// 한국어 조사 처리
// ---------------------------------------------

/** 마지막 글자에 받침이 있는지 */
const hasJongseong = (text) => {
  const value = String(text ?? '').trim();
  if (!value) return false;

  const code = value.charCodeAt(value.length - 1);
  // 한글 음절 영역
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  // 숫자로 끝나면 발음 기준으로 판단 (0,1,3,6,7,8 은 받침 있음)
  if (code >= 0x30 && code <= 0x39) return [0, 1, 3, 6, 7, 8].includes(code - 0x30);
  return true;
};

/** '을/를' */
export const josaEulReul = (text) => (hasJongseong(text) ? '을' : '를');

/** 받침 없이 읽히거나 'ㄹ' 로 끝나는 숫자 (1 일, 2 이, 4 사, 5 오, 7 칠, 8 팔, 9 구) */
const DIGITS_TAKING_RO = [1, 2, 4, 5, 7, 8, 9];

/** '으로/로' — 받침이 없거나 'ㄹ' 받침이면 '로' */
export const josaEuro = (text) => {
  const value = String(text ?? '').trim();
  if (!value) return '로';

  const code = value.charCodeAt(value.length - 1);

  // 한글: 받침 없음(0) 또는 'ㄹ'(8) 이면 '로'
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    return jong === 0 || jong === 8 ? '로' : '으로';
  }

  // 숫자: 읽는 소리 기준 (0 영, 3 삼, 6 육 만 '으로')
  if (code >= 0x30 && code <= 0x39) {
    return DIGITS_TAKING_RO.includes(code - 0x30) ? '로' : '으로';
  }

  return hasJongseong(value) ? '으로' : '로';
};

// ---------------------------------------------
// 값 → 표시 문자열
// ---------------------------------------------

/** 체크리스트 요약 — 예: '3/5' */
export const summarizeChecklist = (checklist) => {
  const list = Array.isArray(checklist) ? checklist : [];
  if (list.length === 0) return EMPTY_LABEL;
  const done = list.filter((item) => item?.done).length;
  return `${done}/${list.length}`;
};

/** 문서 링크 요약 — 예: '2개' */
export const summarizeLinks = (links) => {
  const list = Array.isArray(links) ? links : [];
  if (list.length === 0) return EMPTY_LABEL;
  return `${list.length}개`;
};

/** 메모 요약 — 앞부분만 잘라 보관 */
export const summarizeMemo = (memo) => {
  const text = String(memo ?? '').trim();
  return text ? truncateText(text, ACTIVITY_VALUE_PREVIEW) : EMPTY_LABEL;
};

/** 담당자 이름 조회 */
export const resolveOwnerName = (memberMap, ownerId) => {
  if (!ownerId) return UNASSIGNED_LABEL;
  return memberMap?.[ownerId]?.name || UNASSIGNED_LABEL;
};

/** 마감일 표시 */
export const formatDueValue = (dueDate) =>
  dueDate ? formatDate(dueDate) : EMPTY_LABEL;

// ---------------------------------------------
// 변경 감지 → activity_log 행 생성
// ---------------------------------------------

/** 두 값이 실질적으로 같은지 (JSON 구조 비교) */
const isSameJson = (a, b) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * 이전/이후 task_states 를 비교해 activity_log 에 넣을 행을 만든다.
 * 실제로 바뀐 필드만 반환하므로, 같은 값 재저장은 기록되지 않는다.
 *
 * @param {Object} params
 * @param {string} params.taskId
 * @param {string|null} params.memberId - 변경을 수행한 팀원 id
 * @param {Object} params.before - 변경 전 task_states 행
 * @param {Object} params.after  - 변경 후 task_states 행
 * @param {Object} params.memberMap - member id → member (담당자 이름 조회용)
 * @returns {Array<{task_id, member_id, field, before_value, after_value}>}
 */
export const buildActivityEntries = ({
  taskId,
  memberId = null,
  before = {},
  after = {},
  memberMap = {},
}) => {
  const entries = [];

  const push = (field, beforeValue, afterValue) => {
    entries.push({
      task_id: taskId,
      member_id: memberId,
      field,
      before_value: beforeValue,
      after_value: afterValue,
    });
  };

  // 상태
  if ('status' in after && before.status !== after.status) {
    push(
      ACTIVITY_FIELD.STATUS,
      getStatusLabel(before.status),
      getStatusLabel(after.status)
    );
  }

  // 담당자
  if ('owner_id' in after && (before.owner_id || null) !== (after.owner_id || null)) {
    push(
      ACTIVITY_FIELD.OWNER,
      resolveOwnerName(memberMap, before.owner_id),
      resolveOwnerName(memberMap, after.owner_id)
    );
  }

  // 마감일
  if ('due_date' in after && (before.due_date || null) !== (after.due_date || null)) {
    push(
      ACTIVITY_FIELD.DUE_DATE,
      formatDueValue(before.due_date),
      formatDueValue(after.due_date)
    );
  }

  // 메모 — 앞뒤 공백만 다른 경우는 변경으로 보지 않는다.
  if ('memo' in after) {
    const beforeMemo = String(before.memo ?? '').trim();
    const afterMemo = String(after.memo ?? '').trim();
    if (beforeMemo !== afterMemo) {
      push(ACTIVITY_FIELD.MEMO, summarizeMemo(beforeMemo), summarizeMemo(afterMemo));
    }
  }

  // 체크리스트
  if ('checklist' in after && !isSameJson(before.checklist, after.checklist)) {
    push(
      ACTIVITY_FIELD.CHECKLIST,
      summarizeChecklist(before.checklist),
      summarizeChecklist(after.checklist)
    );
  }

  // 문서 링크
  if ('links' in after && !isSameJson(before.links, after.links)) {
    push(
      ACTIVITY_FIELD.LINK,
      summarizeLinks(before.links),
      summarizeLinks(after.links)
    );
  }

  return entries;
};

// ---------------------------------------------
// 이력 문구 조립
// ---------------------------------------------

/**
 * 변경 이력 한 줄의 문구를 만든다.
 * 예: '김ㅇㅇ님이 상태를 진행중 → 완료로 변경'
 *
 * @param {Object} entry - activity_log 행
 * @param {string} [memberName] - 작성자 이름 (없으면 '알 수 없음')
 * @returns {string}
 */
export const describeActivity = (entry, memberName) => {
  if (!entry) return '';

  const who = `${memberName || '알 수 없음'}님이`;
  const fieldLabel = ACTIVITY_FIELD_LABELS[entry.field] || entry.field;
  const beforeValue = entry.before_value;
  const afterValue = entry.after_value;
  const particle = josaEulReul(fieldLabel);

  // 메모는 값이 길어 앞뒤 비교가 어색하므로 동작만 표기한다.
  if (entry.field === ACTIVITY_FIELD.MEMO) {
    if (!afterValue || afterValue === EMPTY_LABEL) return `${who} 메모를 지움`;
    if (!beforeValue || beforeValue === EMPTY_LABEL) return `${who} 메모를 작성`;
    return `${who} 메모를 수정`;
  }

  const isBeforeEmpty = !beforeValue || beforeValue === EMPTY_LABEL || beforeValue === UNASSIGNED_LABEL;
  const isAfterEmpty = !afterValue || afterValue === EMPTY_LABEL || afterValue === UNASSIGNED_LABEL;

  if (isBeforeEmpty && !isAfterEmpty) {
    return `${who} ${fieldLabel}${particle} ${afterValue}${josaEuro(afterValue)} 설정`;
  }
  if (!isBeforeEmpty && isAfterEmpty) {
    return `${who} ${fieldLabel}${particle} 지움`;
  }
  if (isBeforeEmpty && isAfterEmpty) {
    return `${who} ${fieldLabel}${particle} 수정`;
  }

  return `${who} ${fieldLabel}${particle} ${beforeValue} → ${afterValue}${josaEuro(afterValue)} 변경`;
};

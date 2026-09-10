/**
 * 메모 입력.
 *
 * - 별도 저장 버튼 없이 입력이 잠잠해지면(800ms) 자동 저장한다.
 * - 저장 중 / 저장됨 을 작은 글씨로 표시한다.
 * - 입력 중에는 다른 팀원의 변경이 내 글을 덮어쓰지 않도록 보호하고,
 *   보류된 최신 내용이 있으면 안내 문구로 알려준다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/common';
import { MEMO_DEBOUNCE_MS, MEMO_MAX_LENGTH, SAVED_INDICATOR_MS, SAVE_STATE, SAVE_STATE_LABELS } from '@/constants/config';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useWbs } from '@/context/hooks';
import './MemoField.scss';

/**
 * @param {Object} props
 * @param {string} props.taskId
 * @param {string} props.value - 서버에 저장된 메모
 * @param {Function} props.onSave - (memo) => Promise<{ ok: boolean }>
 */
function MemoField({ taskId, value = '', onSave }) {
  const { beginEditing, endEditing, resolvePendingRemote, pendingRemote } = useWbs();

  const [draft, setDraft] = useState(value);
  const [saveState, setSaveState] = useState(SAVE_STATE.IDLE);
  const focusedRef = useRef(false);
  const savedTimerRef = useRef(null);

  const pending = pendingRemote[taskId];
  const hasPendingMemo = pending?.field === 'memo';

  // 서버 값이 바뀌면 반영하되, 입력 중일 때는 건드리지 않는다.
  useEffect(() => {
    if (!focusedRef.current) setDraft(value ?? '');
  }, [value, taskId]);

  // 다른 업무로 옮기면 상태를 초기화한다.
  useEffect(() => {
    setSaveState(SAVE_STATE.IDLE);
  }, [taskId]);

  const markSaved = useCallback(() => {
    setSaveState(SAVE_STATE.SAVED);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaveState(SAVE_STATE.IDLE), SAVED_INDICATOR_MS);
  }, []);

  const save = useCallback(
    async (next) => {
      setSaveState(SAVE_STATE.SAVING);
      const result = await onSave(next);
      if (result?.ok === false) setSaveState(SAVE_STATE.ERROR);
      else markSaved();
    },
    [onSave, markSaved]
  );

  // 패널이 닫혀도 입력 중이던 내용이 저장되도록 언마운트 시 flush 한다.
  const debouncedSave = useDebouncedCallback(save, MEMO_DEBOUNCE_MS, { flushOnUnmount: true });

  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    []
  );

  const handleChange = (next) => {
    setDraft(next);
    setSaveState(SAVE_STATE.SAVING);
    debouncedSave.run(next);
  };

  const handleFocus = () => {
    focusedRef.current = true;
    beginEditing(taskId, 'memo');
  };

  const handleBlur = () => {
    focusedRef.current = false;
    endEditing();
    debouncedSave.flush();
  };

  /** 보류된 최신 내용을 가져온다. */
  const applyPending = () => {
    const nextValue = pending?.value ?? '';
    resolvePendingRemote(taskId, true);
    setDraft(nextValue);
  };

  const statusLabel = SAVE_STATE_LABELS[saveState];

  return (
    <div className="memo-field">
      <Textarea
        value={draft}
        maxLength={MEMO_MAX_LENGTH}
        placeholder="진행 상황, 특이사항 등을 자유롭게 적어주세요."
        ariaLabel="메모"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <div className="memo-field__foot">
        {statusLabel && (
          <span
            className={`memo-field__save memo-field__save--${saveState}`}
            role="status"
            aria-live="polite"
          >
            {statusLabel}
          </span>
        )}
        <span className="memo-field__length is-numeric">
          {draft.length}/{MEMO_MAX_LENGTH}
        </span>
      </div>

      {hasPendingMemo && (
        <div className="memo-field__pending" role="status">
          <p className="memo-field__pending-text">
            내가 입력하는 동안 다른 팀원이 이 메모를 수정했습니다.
          </p>
          <div className="memo-field__pending-actions">
            <button type="button" className="memo-field__pending-button" onClick={applyPending}>
              최신 내용 불러오기
            </button>
            <button
              type="button"
              className="memo-field__pending-button memo-field__pending-button--ghost"
              onClick={() => resolvePendingRemote(taskId, false)}
            >
              내 내용 유지
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoField;

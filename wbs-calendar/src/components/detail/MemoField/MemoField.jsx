import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/common';
import { MEMO_SAVE_DELAY, SAVE_STATE, SAVE_STATE_LABEL } from '@/constants/views';
import { useTaskActions } from '@/context/hooks';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import './MemoField.scss';

const SAVED_VISIBLE_DURATION = 1600;

const MemoField = ({ task }) => {
  const { updateTask } = useTaskActions();
  const [draft, setDraft] = useState(task.memo);
  const [saveState, setSaveState] = useState(SAVE_STATE.idle);
  const savedTimerRef = useRef(null);

  const memoRef = useRef(task.memo);
  memoRef.current = task.memo;

  useEffect(() => {
    setDraft(memoRef.current);
    setSaveState(SAVE_STATE.idle);
  }, [task.id]);

  useEffect(() => () => window.clearTimeout(savedTimerRef.current), []);

  const { run } = useDebouncedCallback(async (value) => {
    await updateTask(task.id, { memo: value });
    setSaveState(SAVE_STATE.saved);
    savedTimerRef.current = window.setTimeout(
      () => setSaveState(SAVE_STATE.idle),
      SAVED_VISIBLE_DURATION,
    );
  }, MEMO_SAVE_DELAY);

  const handleChange = (value) => {
    setDraft(value);
    setSaveState(SAVE_STATE.saving);
    run(value);
  };

  return (
    <div className="memo-field">
      <Textarea
        id="task-memo"
        value={draft}
        placeholder="진행 상황, 특이사항을 적어 두세요"
        ariaLabel="메모"
        onChange={handleChange}
      />
      <p className="memo-field__state" aria-live="polite">
        {SAVE_STATE_LABEL[saveState] ?? ''}
      </p>
    </div>
  );
};

export default MemoField;

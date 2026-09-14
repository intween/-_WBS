import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Select } from '@/components/common';
import { PROJECT, STREAMS } from '@/config';
import { useFocusTrap } from '@/components/common/Modal/useFocusTrap';
import './TaskFormModal.scss';

const STREAM_OPTIONS = STREAMS.map((stream) => ({ value: stream.id, label: stream.name }));

const emptyDraft = (due = PROJECT.startDate) => ({ title: '', stream: STREAMS[0].id, due });

const TaskFormModal = ({ isOpen, onSubmit, onClose, initialDue = PROJECT.startDate }) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  useFocusTrap(containerRef, isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setDraft(emptyDraft(initialDue));
      setIsSaving(false);
      // 열리자마자 바로 제목을 칠 수 있게 한다.
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [isOpen, initialDue]);

  if (!isOpen) return null;

  const title = draft.title.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || isSaving) return;
    setIsSaving(true);
    const created = await onSubmit({ ...draft, title });
    if (created) onClose();
    else setIsSaving(false);
  };

  const setField = (field) => (value) => setDraft((current) => ({ ...current, [field]: value }));

  return createPortal(
    <div className="modal" role="presentation" onMouseDown={onClose}>
      <form
        ref={containerRef}
        className="modal__dialog task-form"
        role="dialog"
        aria-modal="true"
        aria-label="업무 추가"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="modal__title">업무 추가</h2>

        <label className="task-form__field">
          <span className="task-form__label">업무명</span>
          <input
            ref={titleRef}
            type="text"
            className="task-form__input"
            value={draft.title}
            maxLength={80}
            placeholder="예: 참가기업 최종 명단 확정"
            onChange={(event) => setField('title')(event.target.value)}
          />
        </label>

        <label className="task-form__field">
          <span className="task-form__label">워크스트림</span>
          <Select
            value={draft.stream}
            options={STREAM_OPTIONS}
            ariaLabel="워크스트림"
            onChange={setField('stream')}
          />
        </label>

        <label className="task-form__field">
          <span className="task-form__label">마감일</span>
          <input
            type="date"
            className="task-form__input"
            value={draft.due ?? ''}
            min={PROJECT.startDate}
            max={PROJECT.endDate}
            onChange={(event) => setField('due')(event.target.value)}
          />
        </label>

        <div className="modal__actions">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" type="submit" disabled={!title || isSaving}>
            {isSaving ? '추가하는 중' : '추가'}
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default TaskFormModal;

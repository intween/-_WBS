import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { useTaskActions } from '@/context/hooks';

// 제목은 눌러서 바로 고친다. Enter 로 저장, Esc 로 되돌린다.
const TaskDetailHeader = ({ task, onClose, onRequestDelete }) => {
  const { editTask } = useTaskActions();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(task.title);
    setIsEditing(false);
  }, [task.id, task.title]);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const commit = () => {
    const title = draft.trim();
    setIsEditing(false);
    if (!title) {
      setDraft(task.title);
      return;
    }
    if (title !== task.title) editTask(task.id, { title });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      setDraft(task.title);
      setIsEditing(false);
    }
  };

  return (
    <header className="task-detail-header" data-stream={task.stream}>
      <span className="task-detail-header__bar" aria-hidden="true" />
      <div className="task-detail-header__text">
        <p className="task-detail-header__stream">{task.streamName}</p>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="task-detail-header__input"
            value={draft}
            maxLength={80}
            aria-label="업무명"
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h2
            className="task-detail-header__title"
            role="button"
            tabIndex={0}
            title="눌러서 업무명 수정"
            onClick={() => setIsEditing(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsEditing(true);
              }
            }}
          >
            {task.title}
          </h2>
        )}
      </div>
      <button
        type="button"
        className="task-detail-header__action"
        aria-label="업무 삭제"
        title="업무 삭제"
        onClick={onRequestDelete}
      >
        <Icon name="trash" size={16} />
      </button>
      <button type="button" className="task-detail-header__close" aria-label="상세 닫기" onClick={onClose}>
        <Icon name="close" size={16} />
      </button>
    </header>
  );
};

export default TaskDetailHeader;

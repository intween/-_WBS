import { useState } from 'react';
import { Checkbox, Icon } from '@/components/common';
import { useTaskActions } from '@/context/hooks';
import { createId } from '@/lib/store/types';
import { checklistProgress } from '@/utils/progress';
import './ChecklistEditor.scss';

const ChecklistEditor = ({ task }) => {
  const { updateTask } = useTaskActions();
  const [draft, setDraft] = useState('');
  const progress = checklistProgress(task.checklist);

  const commit = (checklist) => updateTask(task.id, { checklist });

  const handleAdd = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    commit([...task.checklist, { id: createId('check'), text, done: false }]);
    setDraft('');
  };

  const handleToggle = (id, done) =>
    commit(task.checklist.map((item) => (item.id === id ? { ...item, done } : item)));

  const handleEdit = (id, text) =>
    commit(task.checklist.map((item) => (item.id === id ? { ...item, text } : item)));

  const handleRemove = (id) => commit(task.checklist.filter((item) => item.id !== id));

  return (
    <div className="checklist-editor">
      <p className="checklist-editor__count numeric">
        {progress.done}/{progress.total}
      </p>

      <ul className="checklist-editor__list">
        {task.checklist.map((item) => (
          <li key={item.id} className="checklist-editor__item">
            <Checkbox
              id={`check-${item.id}`}
              checked={item.done}
              onChange={(done) => handleToggle(item.id, done)}
            />
            <input
              type="text"
              className="checklist-editor__text"
              value={item.text}
              aria-label="체크리스트 항목"
              onChange={(event) => handleEdit(item.id, event.target.value)}
            />
            <button
              type="button"
              className="checklist-editor__remove"
              aria-label="체크리스트 항목 삭제"
              onClick={() => handleRemove(item.id)}
            >
              <Icon name="trash" size={12} />
            </button>
          </li>
        ))}
      </ul>

      <form className="checklist-editor__add" onSubmit={handleAdd}>
        <input
          type="text"
          className="checklist-editor__input"
          value={draft}
          placeholder="항목 추가"
          aria-label="체크리스트 항목 추가"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="checklist-editor__submit" aria-label="체크리스트 항목 추가">
          <Icon name="plus" size={12} />
        </button>
      </form>
    </div>
  );
};

export default ChecklistEditor;

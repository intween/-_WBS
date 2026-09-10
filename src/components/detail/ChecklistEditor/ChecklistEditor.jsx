/**
 * 체크리스트 편집 — 추가 / 수정 / 삭제 / 체크.
 * 변경 즉시 저장된다. (배열 전체를 갈아끼운다)
 */
import { useState } from 'react';
import { Button, Checkbox, Icon } from '@/components/common';
import './ChecklistEditor.scss';

/** 새 항목 id — 브라우저가 지원하면 randomUUID 를 쓴다. */
const createItemId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * @param {Object} props
 * @param {Array} props.items - [{ id, text, done }]
 * @param {Function} props.onChange - (nextItems) => void
 * @param {boolean} [props.disabled]
 */
function ChecklistEditor({ items = [], onChange, disabled = false }) {
  const [draft, setDraft] = useState('');
  const doneCount = items.filter((item) => item?.done).length;

  const handleAdd = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    onChange([...items, { id: createItemId(), text, done: false }]);
    setDraft('');
  };

  const handleToggle = (id, done) => {
    onChange(items.map((item) => (item.id === id ? { ...item, done } : item)));
  };

  const handleEdit = (id, text) => {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleRemove = (id) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="checklist-editor">
      <div className="checklist-editor__head">
        <Icon name="checklist" size={14} />
        <span className="checklist-editor__count is-numeric">
          {doneCount}/{items.length}
        </span>
      </div>

      {items.length > 0 && (
        <ul className="checklist-editor__list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`checklist-editor__item${item.done ? ' checklist-editor__item--done' : ''}`}
            >
              <Checkbox
                size="sm"
                checked={Boolean(item.done)}
                ariaLabel={`${item.text} 완료 표시`}
                disabled={disabled}
                onChange={(next) => handleToggle(item.id, next)}
              />
              <input
                className="checklist-editor__text"
                value={item.text}
                maxLength={120}
                aria-label="할 일 내용"
                disabled={disabled}
                onChange={(event) => handleEdit(item.id, event.target.value)}
              />
              <Button
                size="sm"
                variant="ghost"
                iconName="trash"
                iconOnly
                ariaLabel={`${item.text} 삭제`}
                disabled={disabled}
                onClick={() => handleRemove(item.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <form className="checklist-editor__add" onSubmit={handleAdd}>
        <input
          className="checklist-editor__input"
          value={draft}
          maxLength={120}
          placeholder="하위 할 일 추가"
          aria-label="하위 할 일 추가"
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          iconName="plus"
          iconOnly
          ariaLabel="할 일 추가"
          disabled={disabled || !draft.trim()}
        />
      </form>
    </div>
  );
}

export default ChecklistEditor;

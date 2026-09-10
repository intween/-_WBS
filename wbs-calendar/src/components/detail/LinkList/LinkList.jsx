import { useState } from 'react';
import { Icon } from '@/components/common';
import { useTaskActions } from '@/context/hooks';
import { createId } from '@/lib/store/types';
import './LinkList.scss';

const EMPTY_DRAFT = { label: '', url: '' };

const LinkList = ({ task }) => {
  const { updateTask } = useTaskActions();
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const commit = (links) => updateTask(task.id, { links });

  const handleAdd = (event) => {
    event.preventDefault();
    const label = draft.label.trim();
    const url = draft.url.trim();
    if (!url) return;
    commit([...task.links, { id: createId('link'), label: label || url, url }]);
    setDraft(EMPTY_DRAFT);
  };

  const handleRemove = (id) => commit(task.links.filter((link) => link.id !== id));

  return (
    <div className="link-list">
      <p className="link-list__notice">문서 원본은 드라이브에 두고 링크만 등록하세요</p>

      <ul className="link-list__items">
        {task.links.map((link) => (
          <li key={link.id} className="link-list__item">
            <Icon name="link" size={12} className="link-list__icon" />
            <a
              className="link-list__anchor"
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {link.label}
            </a>
            <button
              type="button"
              className="link-list__remove"
              aria-label={`${link.label} 링크 삭제`}
              onClick={() => handleRemove(link.id)}
            >
              <Icon name="trash" size={12} />
            </button>
          </li>
        ))}
      </ul>

      <form className="link-list__form" onSubmit={handleAdd}>
        <input
          type="text"
          className="link-list__input"
          value={draft.label}
          placeholder="링크 이름"
          aria-label="링크 이름"
          onChange={(event) => setDraft({ ...draft, label: event.target.value })}
        />
        <input
          type="url"
          className="link-list__input link-list__input--url"
          value={draft.url}
          placeholder="https://"
          aria-label="링크 주소"
          onChange={(event) => setDraft({ ...draft, url: event.target.value })}
        />
        <button type="submit" className="link-list__submit" aria-label="링크 추가">
          <Icon name="plus" size={12} />
        </button>
      </form>
    </div>
  );
};

export default LinkList;

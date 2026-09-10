/**
 * 문서 링크 목록.
 * 파일 자체는 올리지 않고 구글드라이브 등의 링크만 등록한다.
 */
import { useState } from 'react';
import { Button, Icon } from '@/components/common';
import './LinkList.scss';

/** http(s) 로 시작하지 않으면 https:// 를 붙여준다. */
const normalizeUrl = (raw) => {
  const url = String(raw ?? '').trim();
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

/**
 * @param {Object} props
 * @param {Array} props.links - [{ label, url }]
 * @param {Function} props.onChange - (nextLinks) => void
 * @param {boolean} [props.disabled]
 */
function LinkList({ links = [], onChange, disabled = false }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = (event) => {
    event.preventDefault();
    const nextUrl = normalizeUrl(url);
    if (!nextUrl) return;

    onChange([...links, { label: label.trim() || nextUrl, url: nextUrl }]);
    setLabel('');
    setUrl('');
  };

  const handleRemove = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="link-list">
      {links.length > 0 && (
        <ul className="link-list__items">
          {links.map((link, index) => (
            <li className="link-list__item" key={`${link.url}-${index}`}>
              <Icon name="link" size={13} className="link-list__icon" />
              <a
                className="link-list__anchor"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.url}
              >
                {link.label || link.url}
                <Icon name="external" size={11} />
              </a>
              <Button
                size="sm"
                variant="ghost"
                iconName="trash"
                iconOnly
                ariaLabel={`${link.label || link.url} 링크 삭제`}
                disabled={disabled}
                onClick={() => handleRemove(index)}
              />
            </li>
          ))}
        </ul>
      )}

      <form className="link-list__add" onSubmit={handleAdd}>
        <input
          className="link-list__input link-list__input--label"
          value={label}
          maxLength={40}
          placeholder="이름 (예: 견적서)"
          aria-label="링크 이름"
          disabled={disabled}
          onChange={(event) => setLabel(event.target.value)}
        />
        <input
          className="link-list__input"
          value={url}
          type="url"
          inputMode="url"
          placeholder="https://..."
          aria-label="링크 주소"
          disabled={disabled}
          onChange={(event) => setUrl(event.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          iconName="plus"
          iconOnly
          ariaLabel="링크 추가"
          disabled={disabled || !url.trim()}
        />
      </form>

      <p className="link-list__note">문서 원본은 구글드라이브에 두고 링크만 등록하세요.</p>
    </div>
  );
}

export default LinkList;

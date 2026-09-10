/**
 * 검색 입력.
 * 타이핑마다 전체 목록을 다시 거르지 않도록 입력을 디바운스한다.
 * (업무명 + 메모 + 코멘트가 검색 대상)
 */
import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { SEARCH_DEBOUNCE_MS } from '@/constants/config';
import { useDebounce } from '@/hooks/useDebounce';
import { useUi } from '@/context/hooks';
import './SearchField.scss';

function SearchField() {
  const { search, setSearch } = useUi();
  const [value, setValue] = useState(search);
  const debounced = useDebounce(value, SEARCH_DEBOUNCE_MS);

  // 디바운스된 값만 전역 필터에 반영한다.
  useEffect(() => {
    setSearch(debounced);
  }, [debounced, setSearch]);

  // 외부에서 필터가 초기화되면 입력창도 비운다.
  useEffect(() => {
    if (search === '') setValue('');
  }, [search]);

  return (
    <div className="search-field">
      <Icon name="search" size={14} className="search-field__icon" />
      <input
        className="search-field__input"
        type="search"
        value={value}
        placeholder="업무명 · 메모 · 코멘트 검색"
        aria-label="업무 검색"
        onChange={(event) => setValue(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-field__clear"
          aria-label="검색어 지우기"
          onClick={() => setValue('')}
        >
          <Icon name="close" size={13} />
        </button>
      )}
    </div>
  );
}

export default SearchField;

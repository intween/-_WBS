import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { SEARCH_INPUT_DELAY } from '@/constants/views';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useUi, useUiActions } from '@/context/hooks';
import './SearchField.scss';

const SearchField = () => {
  const { filters } = useUi();
  const { setFilters } = useUiActions();
  const [draft, setDraft] = useState(filters.query);
  const { run } = useDebouncedCallback((value) => setFilters({ query: value }), SEARCH_INPUT_DELAY);

  useEffect(() => {
    if (filters.query === '') setDraft('');
  }, [filters.query]);

  const handleChange = (value) => {
    setDraft(value);
    run(value);
  };

  return (
    <div className="search-field">
      <Icon name="search" size={15} className="search-field__icon" />
      <input
        type="search"
        className="search-field__input"
        value={draft}
        placeholder="업무명 · 메모 검색"
        aria-label="업무 검색"
        onChange={(event) => handleChange(event.target.value)}
      />
    </div>
  );
};

export default SearchField;

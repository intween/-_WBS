/**
 * 네이티브 <select> 래퍼.
 * 외부 UI 라이브러리를 쓰지 않고 접근성을 그대로 살린다.
 */
import { useId } from 'react';
import Icon from '../Icon/Icon';
import './Select.scss';

/**
 * @param {Object} props
 * @param {string|null} props.value
 * @param {Function} props.onChange - (nextValue) => void
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} [props.label] - 위에 붙는 라벨
 * @param {string} [props.placeholder] - 값이 없을 때 보여줄 항목
 * @param {string} [props.size] - sm | md
 */
function Select({
  value = '',
  onChange,
  options = [],
  label = null,
  placeholder = null,
  size = 'md',
  disabled = false,
  ariaLabel,
  className = '',
  ...rest
}) {
  const autoId = useId();

  return (
    <div className={['select', `select--${size}`, className].filter(Boolean).join(' ')}>
      {label && (
        <label className="select__label" htmlFor={autoId}>
          {label}
        </label>
      )}

      <div className="select__control">
        <select
          id={autoId}
          className="select__field"
          value={value ?? ''}
          disabled={disabled}
          aria-label={label ? undefined : ariaLabel}
          onChange={(event) => onChange?.(event.target.value)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={14} className="select__chevron" />
      </div>
    </div>
  );
}

export default Select;

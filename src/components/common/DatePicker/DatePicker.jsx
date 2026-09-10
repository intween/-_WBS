/**
 * 네이티브 date input 래퍼.
 * 값이 있으면 지우기 버튼을 함께 보여준다.
 */
import { useId } from 'react';
import Icon from '../Icon/Icon';
import './DatePicker.scss';

/**
 * @param {Object} props
 * @param {string|null} props.value - 'YYYY-MM-DD'
 * @param {Function} props.onChange - (nextValue|null) => void
 * @param {string} [props.label]
 * @param {boolean} [props.invalid] - 지연 상태 강조
 * @param {string} [props.hint] - 아래 안내/경고 문구
 */
function DatePicker({
  value = '',
  onChange,
  label = null,
  invalid = false,
  hint = null,
  disabled = false,
  ariaLabel,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const hintId = `${autoId}-hint`;

  return (
    <div
      className={['date-picker', invalid && 'date-picker--invalid', className]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label className="date-picker__label" htmlFor={autoId}>
          {label}
        </label>
      )}

      <div className="date-picker__control">
        <input
          id={autoId}
          className="date-picker__field"
          type="date"
          value={value || ''}
          disabled={disabled}
          aria-label={label ? undefined : ariaLabel}
          aria-describedby={hint ? hintId : undefined}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange?.(event.target.value || null)}
          {...rest}
        />

        {value && !disabled && (
          <button
            type="button"
            className="date-picker__clear"
            aria-label="마감일 지우기"
            onClick={() => onChange?.(null)}
          >
            <Icon name="close" size={13} />
          </button>
        )}
      </div>

      {hint && (
        <p className="date-picker__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default DatePicker;

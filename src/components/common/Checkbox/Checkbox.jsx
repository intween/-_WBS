/**
 * 체크박스.
 * 실제 <input type="checkbox"> 를 쓰고 시각적으로만 감춘다.
 * (키보드 조작·스크린리더 지원을 그대로 유지하기 위함)
 */
import { useId } from 'react';
import Icon from '../Icon/Icon';
import './Checkbox.scss';

/**
 * @param {Object} props
 * @param {boolean} props.checked
 * @param {Function} props.onChange - (nextChecked) => void
 * @param {React.ReactNode} [props.children] - 라벨
 * @param {string} [props.ariaLabel] - 라벨이 없을 때 필수
 * @param {string} [props.size] - sm | md
 */
function Checkbox({
  checked = false,
  onChange,
  children = null,
  ariaLabel,
  size = 'md',
  disabled = false,
  className = '',
  ...rest
}) {
  const autoId = useId();

  return (
    <label
      className={[
        'checkbox',
        `checkbox--${size}`,
        checked && 'checkbox--checked',
        disabled && 'checkbox--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      htmlFor={autoId}
    >
      <input
        id={autoId}
        className="checkbox__input"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={children ? undefined : ariaLabel}
        onChange={(event) => onChange?.(event.target.checked)}
        {...rest}
      />
      <span className="checkbox__box" aria-hidden="true">
        {checked && <Icon name="check" size={size === 'sm' ? 10 : 12} strokeWidth={3} />}
      </span>
      {children && <span className="checkbox__label">{children}</span>}
    </label>
  );
}

export default Checkbox;

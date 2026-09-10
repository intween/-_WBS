/**
 * 공통 버튼.
 * variant: primary | secondary | ghost | danger
 * size: sm | md
 */
import Icon from '../Icon/Icon';
import './Button.scss';

/**
 * @param {Object} props
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.variant]
 * @param {string} [props.size]
 * @param {string} [props.iconName] - 왼쪽 아이콘 (Icon 의 name)
 * @param {boolean} [props.iconOnly] - 아이콘만 표시 (aria-label 필수)
 * @param {boolean} [props.fullWidth]
 * @param {boolean} [props.active] - 토글 버튼의 선택 상태
 * @param {string} [props.ariaLabel]
 */
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  iconName = null,
  iconOnly = false,
  fullWidth = false,
  active = false,
  disabled = false,
  ariaLabel,
  className = '',
  onClick,
  ...rest
}) {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    iconOnly && 'button--icon-only',
    fullWidth && 'button--full',
    active && 'button--active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active || undefined}
      onClick={onClick}
      {...rest}
    >
      {iconName && <Icon name={iconName} size={size === 'sm' ? 14 : 16} />}
      {!iconOnly && children && <span className="button__label">{children}</span>}
    </button>
  );
}

export default Button;

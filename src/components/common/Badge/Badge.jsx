/**
 * 뱃지.
 * - 상태 뱃지: <Badge status="doing" />
 * - 일반 뱃지: <Badge tone="danger">지연</Badge>
 */
import { getStatus } from '@/constants/status';
import Icon from '../Icon/Icon';
import './Badge.scss';

/**
 * @param {Object} props
 * @param {string} [props.status] - 상태 key. 주면 라벨/색상을 자동으로 채운다.
 * @param {string} [props.tone] - neutral | danger | info | done
 * @param {string} [props.iconName]
 * @param {boolean} [props.dot] - 점만 표시 (보드 카드용)
 * @param {string} [props.size] - sm | md
 */
function Badge({
  status = null,
  tone = 'neutral',
  iconName = null,
  dot = false,
  size = 'md',
  children,
  className = '',
  ...rest
}) {
  const statusInfo = status ? getStatus(status) : null;
  const label = children ?? statusInfo?.label ?? '';

  const classNames = [
    'badge',
    `badge--${size}`,
    statusInfo ? `badge--status-${statusInfo.key}` : `badge--${tone}`,
    dot && 'badge--dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 점만 표시할 때는 텍스트를 스크린리더에만 남긴다.
  if (dot) {
    return (
      <span className={classNames} {...rest}>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span className={classNames} {...rest}>
      {iconName && <Icon name={iconName} size={size === 'sm' ? 10 : 12} strokeWidth={2} />}
      {label}
    </span>
  );
}

export default Badge;

/**
 * 빈 상태 안내.
 * 목록이 비었을 때 왜 비었는지와 다음 행동을 알려준다.
 */
import Icon from '../Icon/Icon';
import './EmptyState.scss';

/**
 * @param {Object} props
 * @param {string} [props.iconName]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action] - 버튼 등
 * @param {string} [props.size] - sm | md
 */
function EmptyState({
  iconName = 'board',
  title,
  description = null,
  action = null,
  size = 'md',
  className = '',
}) {
  return (
    <div
      className={['empty-state', `empty-state--${size}`, className].filter(Boolean).join(' ')}
    >
      <span className="empty-state__icon">
        <Icon name={iconName} size={size === 'sm' ? 20 : 28} strokeWidth={1.4} />
      </span>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export default EmptyState;

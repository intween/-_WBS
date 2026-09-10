/**
 * 담당자 아바타 (이니셜 원형).
 * 미지정이면 회색 점선 원으로 표시한다.
 */
import { getInitials } from '@/utils/format';
import { C_TEXT_FAINT } from '@/constants/colors';
import './Avatar.scss';

/**
 * @param {Object} props
 * @param {Object} [props.member] - { name, color } — 없으면 미지정으로 본다
 * @param {string} [props.size] - sm | md | lg
 * @param {boolean} [props.showName] - 이름을 옆에 함께 표시
 */
function Avatar({ member = null, size = 'md', showName = false, className = '' }) {
  const isUnassigned = !member;
  const name = member?.name || '미지정';
  const label = isUnassigned ? '담당자 미지정' : `담당자 ${name}`;

  const classNames = [
    'avatar',
    `avatar--${size}`,
    isUnassigned && 'avatar--unassigned',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const circle = (
    <span
      className={classNames}
      style={isUnassigned ? undefined : { backgroundColor: member.color || C_TEXT_FAINT }}
      aria-hidden={showName ? 'true' : undefined}
      aria-label={showName ? undefined : label}
      role={showName ? undefined : 'img'}
      title={showName ? undefined : name}
    >
      {isUnassigned ? '' : getInitials(name)}
    </span>
  );

  if (!showName) return circle;

  return (
    <span className="avatar-with-name">
      {circle}
      <span className="avatar-with-name__label">{name}</span>
    </span>
  );
}

export default Avatar;

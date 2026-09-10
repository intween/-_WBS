/**
 * 툴팁.
 * JS 없이 CSS 로만 처리한다. (hover + 키보드 포커스 모두 대응)
 * 보조 설명이므로 내용은 aria-label 로도 함께 전달한다.
 */
import './Tooltip.scss';

/**
 * @param {Object} props
 * @param {string} props.text - 툴팁 내용
 * @param {string} [props.position] - top | bottom
 * @param {React.ReactNode} props.children - 툴팁을 붙일 대상
 */
function Tooltip({ text, position = 'top', children, className = '' }) {
  if (!text) return children;

  return (
    <span
      className={['tooltip', `tooltip--${position}`, className].filter(Boolean).join(' ')}
      tabIndex={-1}
    >
      {children}
      <span className="tooltip__bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

export default Tooltip;

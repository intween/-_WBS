/**
 * 진행률 게이지.
 * 계산은 utils/progress.js 가 하고, 여기서는 표시만 한다.
 */
import { getProgressLevel } from '@/utils/progress';
import { formatPercent, formatRatio } from '@/utils/format';
import './ProgressBar.scss';

/**
 * @param {Object} props
 * @param {number} props.percent - 0~100
 * @param {number} [props.done]
 * @param {number} [props.total]
 * @param {string} [props.size] - xs | sm | md
 * @param {string} [props.label] - 게이지 왼쪽 설명
 * @param {boolean} [props.showValue] - 퍼센트/완료수 표시
 * @param {string} [props.color] - 강제 지정 색상 (기간·스트림 색 등)
 */
function ProgressBar({
  percent = 0,
  done = null,
  total = null,
  size = 'sm',
  label = null,
  showValue = false,
  color = null,
  className = '',
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent) || 0));
  const level = getProgressLevel(safePercent);
  const hasCount = done !== null && total !== null;

  const classNames = [
    'progress-bar',
    `progress-bar--${size}`,
    `progress-bar--${level}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      {(label || showValue) && (
        <div className="progress-bar__head">
          {label && <span className="progress-bar__label">{label}</span>}
          {showValue && (
            <span className="progress-bar__value is-numeric">
              {hasCount && <span className="progress-bar__count">{formatRatio(done, total)}</span>}
              <span className="progress-bar__percent">{formatPercent(safePercent)}</span>
            </span>
          )}
        </div>
      )}

      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          label
            ? `${label} 진행률`
            : hasCount
              ? `진행률 ${formatRatio(done, total)}`
              : '진행률'
        }
      >
        <div
          className="progress-bar__fill"
          style={{
            width: `${safePercent}%`,
            ...(color ? { backgroundColor: color } : null),
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

/**
 * 컬럼 헤더 — 기간명 / 날짜 범위 / 해당 기간 진행률.
 * 기간 고유색을 배경으로 쓴다.
 */
import { memo } from 'react';
import { formatPercent } from '@/utils/format';
import './PeriodHeader.scss';

/**
 * @param {Object} props
 * @param {Object} props.period - { id, label, range, color }
 * @param {Object} props.progress - calcProgress 결과
 */
function PeriodHeader({ period, progress }) {
  return (
    <div
      className="period-header"
      style={{ backgroundColor: period.color }}
      role="columnheader"
    >
      <span className="period-header__label">{period.label}</span>
      <span className="period-header__range">{period.range}</span>

      <div className="period-header__progress">
        <div
          className="period-header__track"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${period.label} 진행률`}
        >
          <div className="period-header__fill" style={{ width: `${progress.percent}%` }} />
        </div>
        <span className="period-header__value is-numeric">
          {progress.done}/{progress.total} · {formatPercent(progress.percent)}
        </span>
      </div>
    </div>
  );
}

export default memo(PeriodHeader);

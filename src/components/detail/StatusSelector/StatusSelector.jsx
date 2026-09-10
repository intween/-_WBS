/**
 * 상태 선택 — 대기 / 진행중 / 완료 / 보류 세그먼트 버튼.
 * 선택 즉시 저장된다.
 */
import { STATUS_LIST } from '@/constants/status';
import { C_SURFACE } from '@/constants/colors';
import './StatusSelector.scss';

/**
 * @param {Object} props
 * @param {string} props.value - 현재 상태 key
 * @param {Function} props.onChange - (statusKey) => void
 * @param {boolean} [props.disabled]
 */
function StatusSelector({ value, onChange, disabled = false }) {
  return (
    <div className="status-selector" role="group" aria-label="업무 상태">
      {STATUS_LIST.map((status) => {
        const active = value === status.key;
        return (
          <button
            key={status.key}
            type="button"
            className={`status-selector__item${active ? ' status-selector__item--active' : ''}`}
            style={active ? { backgroundColor: status.color, borderColor: status.color } : undefined}
            aria-pressed={active}
            aria-label={`상태 ${status.label}`}
            disabled={disabled}
            onClick={() => onChange(status.key)}
          >
            <span
              className="status-selector__dot"
              style={{ backgroundColor: active ? C_SURFACE : status.color }}
            />
            {status.label}
          </button>
        );
      })}
    </div>
  );
}

export default StatusSelector;

/**
 * 마감일 입력.
 * 오늘이 지났는데 완료가 아니면 '지연' 으로 강조한다.
 */
import { DatePicker } from '@/components/common';
import { getDaysUntil, isOverdue } from '@/utils/dday';
import './DueDateField.scss';

/**
 * @param {Object} props
 * @param {string|null} props.value - 'YYYY-MM-DD'
 * @param {boolean} props.isDone
 * @param {Function} props.onChange - (value|null) => void
 * @param {boolean} [props.disabled]
 */
function DueDateField({ value, isDone = false, onChange, disabled = false }) {
  const overdue = isOverdue(value, isDone);
  const days = value ? getDaysUntil(value) : null;

  let hint = null;
  if (overdue) hint = `지연 · ${Math.abs(days)}일 지났습니다`;
  else if (days === 0) hint = '오늘 마감입니다';
  else if (days !== null && days > 0 && days <= 3) hint = `마감까지 ${days}일 남았습니다`;

  return (
    <div className="due-date-field">
      <DatePicker
        value={value || ''}
        invalid={overdue}
        hint={hint}
        ariaLabel="마감일"
        disabled={disabled}
        onChange={onChange}
      />
      {overdue && (
        <span className="due-date-field__badge" role="status">
          지연
        </span>
      )}
    </div>
  );
}

export default DueDateField;

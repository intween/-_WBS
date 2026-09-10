import { Badge } from '@/components/common';
import { PROJECT } from '@/config';
import { OVERDUE_LABEL } from '@/constants/status';
import { useTaskActions } from '@/context/hooks';
import { isValidISO } from '@/utils/date';
import { isDelayed } from '@/utils/progress';
import './DueDateField.scss';

const FIELD_ID = 'task-due-date';

const DueDateField = ({ task }) => {
  const { updateTask } = useTaskActions();

  const handleChange = (value) => {
    if (isValidISO(value)) updateTask(task.id, { dueDate: value });
  };

  return (
    <div className="due-date-field">
      <input
        id={FIELD_ID}
        type="date"
        className="due-date-field__input"
        value={task.dueDate ?? ''}
        min={PROJECT.startDate}
        max={PROJECT.endDate}
        aria-label="마감일"
        onChange={(event) => handleChange(event.target.value)}
      />
      {isDelayed(task) && <Badge overdue>{OVERDUE_LABEL}</Badge>}
    </div>
  );
};

export default DueDateField;

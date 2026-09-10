import { STATUS_LIST } from '@/constants/status';
import { useTaskActions } from '@/context/hooks';
import './StatusSelector.scss';

const StatusSelector = ({ task }) => {
  const { updateTask } = useTaskActions();

  return (
    <div className="status-selector" role="group" aria-label="업무 상태">
      {STATUS_LIST.map((status) => (
        <button
          key={status.key}
          type="button"
          className={`status-selector__option${task.status === status.key ? ' status-selector__option--active' : ''}`}
          data-status={status.key}
          aria-pressed={task.status === status.key}
          onClick={() => updateTask(task.id, { status: status.key })}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

export default StatusSelector;

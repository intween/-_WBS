import { Icon } from '@/components/common';

const TaskDetailHeader = ({ task, onClose }) => (
  <header className="task-detail-header" data-stream={task.stream}>
    <span className="task-detail-header__bar" aria-hidden="true" />
    <div className="task-detail-header__text">
      <p className="task-detail-header__stream">{task.streamName}</p>
      <h2 className="task-detail-header__title">{task.title}</h2>
    </div>
    <button type="button" className="task-detail-header__close" aria-label="상세 닫기" onClick={onClose}>
      <Icon name="close" size={16} />
    </button>
  </header>
);

export default TaskDetailHeader;

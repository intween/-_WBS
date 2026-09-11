import { useEffect, useId, useState } from 'react';
import { useTaskActions, useTasks } from '@/context/hooks';
import './AssigneeField.scss';

// 팀원 명단을 따로 관리하지 않는다. 이미 쓴 이름을 모아 추천으로만 보여주고,
// 새 이름은 그냥 입력하면 된다.
const useKnownAssignees = () => {
  const { tasks } = useTasks();
  return [...new Set(tasks.map((task) => task.assignee).filter(Boolean))].sort();
};

const AssigneeField = ({ task }) => {
  const { updateTask } = useTaskActions();
  const [draft, setDraft] = useState(task.assignee ?? '');
  const listId = useId();
  const known = useKnownAssignees();

  useEffect(() => {
    setDraft(task.assignee ?? '');
  }, [task.id, task.assignee]);

  const commit = () => {
    const assignee = draft.trim();
    const next = assignee || null;
    if (next !== (task.assignee ?? null)) updateTask(task.id, { assignee: next });
  };

  return (
    <div className="assignee-field">
      <input
        type="text"
        className="assignee-field__input"
        value={draft}
        list={listId}
        maxLength={30}
        placeholder="담당자 이름"
        aria-label="담당자"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <datalist id={listId}>
        {known.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      {draft && (
        <button
          type="button"
          className="assignee-field__clear"
          onClick={() => {
            setDraft('');
            if (task.assignee) updateTask(task.id, { assignee: null });
          }}
        >
          지우기
        </button>
      )}
    </div>
  );
};

export default AssigneeField;

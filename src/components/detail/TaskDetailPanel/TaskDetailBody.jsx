/**
 * 상세 패널의 본문 — 각 항목을 배치한다.
 * 저장은 전부 즉시 반영(낙관적 업데이트)이며 별도 저장 버튼이 없다.
 */
import { useCallback } from 'react';
import { isDoneStatus } from '@/constants/status';
import { useWbs } from '@/context/hooks';
import ActivityHistory from '../ActivityHistory/ActivityHistory';
import ChecklistEditor from '../ChecklistEditor/ChecklistEditor';
import CommentThread from '../CommentThread/CommentThread';
import DueDateField from '../DueDateField/DueDateField';
import LinkList from '../LinkList/LinkList';
import MemoField from '../MemoField/MemoField';
import OwnerSelector from '../OwnerSelector/OwnerSelector';
import StatusSelector from '../StatusSelector/StatusSelector';
import './TaskDetailBody.scss';

/**
 * @param {Object} props
 * @param {Object} props.task - 정적 업무 정의
 * @param {Object} props.state - task_states 행
 */
function TaskDetailBody({ task, state }) {
  const { members, updateTask } = useWbs();
  const taskId = task.id;

  const patch = useCallback((next) => updateTask(taskId, next), [updateTask, taskId]);

  const handleStatus = useCallback((status) => patch({ status }), [patch]);
  const handleOwner = useCallback((owner_id) => patch({ owner_id }), [patch]);
  const handleDueDate = useCallback((due_date) => patch({ due_date }), [patch]);
  const handleChecklist = useCallback((checklist) => patch({ checklist }), [patch]);
  const handleLinks = useCallback((links) => patch({ links }), [patch]);
  const handleMemo = useCallback((memo) => patch({ memo }), [patch]);

  const done = isDoneStatus(state?.status);

  return (
    <div className="task-detail-body">
      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">상태</h3>
        <StatusSelector value={state?.status} onChange={handleStatus} />
      </section>

      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">담당자</h3>
        <OwnerSelector value={state?.owner_id} members={members} onChange={handleOwner} />
      </section>

      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">마감일</h3>
        <DueDateField value={state?.due_date} isDone={done} onChange={handleDueDate} />
      </section>

      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">체크리스트</h3>
        <ChecklistEditor items={state?.checklist || []} onChange={handleChecklist} />
      </section>

      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">문서 링크</h3>
        <LinkList links={state?.links || []} onChange={handleLinks} />
      </section>

      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">메모</h3>
        <MemoField taskId={taskId} value={state?.memo || ''} onSave={handleMemo} />
      </section>

      <section className="task-detail-body__section">
        <h3 className="task-detail-body__label">코멘트</h3>
        <CommentThread taskId={taskId} />
      </section>

      <section className="task-detail-body__section task-detail-body__section--flush">
        <ActivityHistory taskId={taskId} />
      </section>
    </div>
  );
}

export default TaskDetailBody;

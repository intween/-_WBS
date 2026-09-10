import ChecklistEditor from '@/components/detail/ChecklistEditor/ChecklistEditor';
import DueDateField from '@/components/detail/DueDateField/DueDateField';
import LinkList from '@/components/detail/LinkList/LinkList';
import MemoField from '@/components/detail/MemoField/MemoField';
import StatusSelector from '@/components/detail/StatusSelector/StatusSelector';
import './TaskDetailBody.scss';

const Section = ({ title, children }) => (
  <section className="detail-section">
    <h3 className="detail-section__title">{title}</h3>
    {children}
  </section>
);

const TaskDetailBody = ({ task }) => (
  <div className="task-detail-body">
    <Section title="상태">
      <StatusSelector task={task} />
    </Section>

    <Section title="마감일">
      <DueDateField task={task} />
    </Section>

    <Section title="체크리스트">
      <ChecklistEditor task={task} />
    </Section>

    <Section title="문서 링크">
      <LinkList task={task} />
    </Section>

    <Section title="메모">
      <MemoField task={task} />
    </Section>
  </div>
);

export default TaskDetailBody;

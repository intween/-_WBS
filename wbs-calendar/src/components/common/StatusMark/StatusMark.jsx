import { STATUS } from '@/constants/status';
import './StatusMark.scss';

const SHAPES = {
  [STATUS.todo.key]: <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />,
  [STATUS.doing.key]: (
    <g>
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 2a5 5 0 0 1 0 10z" fill="currentColor" />
    </g>
  ),
  [STATUS.done.key]: (
    <path
      d="M3 7.4l2.8 2.8L11 4.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  [STATUS.hold.key]: (
    <path d="M2.6 7h8.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
};

const StatusMark = ({ status }) => (
  <svg className="status-mark" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" focusable="false">
    {SHAPES[status] ?? SHAPES[STATUS.todo.key]}
  </svg>
);

export default StatusMark;

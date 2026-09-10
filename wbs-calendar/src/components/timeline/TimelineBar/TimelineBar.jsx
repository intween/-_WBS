import './TimelineBar.scss';

const TimelineBar = ({ total, percent }) => (
  <span className="timeline-bar">
    <span className="timeline-bar__track">
      <span className="timeline-bar__fill" style={{ width: `${percent}%` }} />
    </span>
    <span className="timeline-bar__caption numeric">
      {total}건 · {percent}%
    </span>
  </span>
);

export default TimelineBar;

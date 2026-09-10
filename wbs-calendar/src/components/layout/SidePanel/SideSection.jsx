import { useState } from 'react';
import { SIDE_ITEMS_COLLAPSED } from '@/constants/views';
import SideTaskItem from './SideTaskItem';

const SideSection = ({ title, tasks, todayISO, tone = 'default', delayed = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hiddenCount = tasks.length - SIDE_ITEMS_COLLAPSED;
  const visible = isExpanded ? tasks : tasks.slice(0, SIDE_ITEMS_COLLAPSED);

  return (
    <section className={`side-section side-section--${tone}`}>
      <h2 className="side-section__title">
        {title}
        <span className="side-section__count numeric">{tasks.length}</span>
      </h2>

      {tasks.length === 0 ? (
        <p className="side-section__empty">없음</p>
      ) : (
        <ul className="side-section__list">
          {visible.map((task) => (
            <SideTaskItem key={task.id} task={task} todayISO={todayISO} isDelayed={delayed} />
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <button
          type="button"
          className="side-section__toggle"
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? '접기' : `+${hiddenCount}개 더`}
        </button>
      )}
    </section>
  );
};

export default SideSection;

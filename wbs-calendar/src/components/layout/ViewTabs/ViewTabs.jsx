import { VIEW_LIST } from '@/constants/views';
import { useUi, useUiActions } from '@/context/hooks';
import './ViewTabs.scss';

const ViewTabs = () => {
  const { view } = useUi();
  const { setView } = useUiActions();

  return (
    <nav className="view-tabs" aria-label="화면 전환">
      {VIEW_LIST.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`view-tabs__tab${view === item.key ? ' view-tabs__tab--active' : ''}`}
          aria-current={view === item.key ? 'page' : undefined}
          onClick={() => setView(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default ViewTabs;

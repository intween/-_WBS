import { Icon } from '@/components/common';
import { VIEWS, VIEW_LIST } from '@/constants/views';
import { useUi, useUiActions } from '@/context/hooks';
import './MobileTabBar.scss';

const TAB_ICONS = {
  [VIEWS.calendar]: 'calendar',
  [VIEWS.timeline]: 'timeline',
  [VIEWS.onsite]: 'onsite',
};

const MobileTabBar = () => {
  const { view } = useUi();
  const { setView } = useUiActions();

  return (
    <nav className="mobile-tab-bar" aria-label="화면 전환">
      {VIEW_LIST.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`mobile-tab-bar__tab${view === item.key ? ' mobile-tab-bar__tab--active' : ''}`}
          aria-current={view === item.key ? 'page' : undefined}
          onClick={() => setView(item.key)}
        >
          <Icon name={TAB_ICONS[item.key]} size={18} />
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default MobileTabBar;

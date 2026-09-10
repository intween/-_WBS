/**
 * 모바일 하단 탭바 — 보드 / 대시보드 / 내 업무.
 * 데스크탑에서는 헤더의 탭을 쓰므로 숨긴다.
 */
import { Icon } from '@/components/common';
import { TAB, TAB_LABELS, TAB_LIST } from '@/constants/config';
import { useUi } from '@/context/hooks';
import './TabBar.scss';

/** 탭별 아이콘 */
const TAB_ICONS = {
  [TAB.BOARD]: 'board',
  [TAB.DASHBOARD]: 'dashboard',
  [TAB.MY_TASKS]: 'myTasks',
};

function TabBar() {
  const { tab, setTab } = useUi();

  return (
    <nav className="tab-bar" aria-label="화면 전환">
      {TAB_LIST.map((key) => (
        <button
          key={key}
          type="button"
          className={`tab-bar__item${tab === key ? ' tab-bar__item--active' : ''}`}
          aria-current={tab === key ? 'page' : undefined}
          onClick={() => setTab(key)}
        >
          <Icon name={TAB_ICONS[key]} size={20} />
          <span className="tab-bar__label">{TAB_LABELS[key]}</span>
        </button>
      ))}
    </nav>
  );
}

export default TabBar;

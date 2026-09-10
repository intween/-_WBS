import { PROJECT } from '@/config';
import { useOverallProgress, useUiActions } from '@/context/hooks';
import { formatShortDate } from '@/utils/date';
import { formatDday, milestoneDday } from '@/utils/progress';
import './Header.scss';

const Header = () => {
  const progress = useOverallProgress();
  const { setShortcutsOpen } = useUiActions();

  return (
    <header className="header">
      <h1 className="header__name">{PROJECT.name}</h1>
      <span className="header__period numeric">
        {formatShortDate(PROJECT.startDate)}~{formatShortDate(PROJECT.endDate)}
      </span>

      <div className="header__spacer" />

      <div className="header__progress">
        <span className="header__figures numeric">
          {progress.done}/{progress.total} · {progress.percent}%
        </span>
        <span
          className="header__gauge"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="전체 진행률"
        >
          <span className="header__gauge-fill" style={{ width: `${progress.percent}%` }} />
        </span>
      </div>

      <span className="header__dday numeric">
        {formatDday(milestoneDday())} {PROJECT.milestone.label}
      </span>

      <button
        type="button"
        className="header__help"
        aria-label="단축키 목록"
        onClick={() => setShortcutsOpen(true)}
      >
        ?
      </button>
    </header>
  );
};

export default Header;

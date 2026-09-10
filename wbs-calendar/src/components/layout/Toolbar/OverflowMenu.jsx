import { useState } from 'react';
import { Button, Icon, Popover } from '@/components/common';
import { DENSITY_LIST } from '@/constants/density';
import { THEME_LIST } from '@/constants/theme';
import { EXPORT_FORMATS } from '@/constants/views';
import { useDensity } from '@/hooks/useDensity';
import { useTheme } from '@/hooks/useTheme';
import { useUiActions, useVisibleTasks } from '@/context/hooks';
import { downloadExport } from '@/utils/export';
import './OverflowMenu.scss';

const RESET_CONFIRM = 'reset';

const OverflowMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { density, setDensity } = useDensity();
  const { openConfirm } = useUiActions();
  const visibleTasks = useVisibleTasks();

  const close = () => setIsOpen(false);

  const handleExport = (format) => {
    downloadExport(visibleTasks, format);
    close();
  };

  return (
    <div className="overflow-menu">
      <Button aria-expanded={isOpen} aria-label="더 보기" onClick={() => setIsOpen((open) => !open)}>
        <Icon name="more" size={16} />
      </Button>

      <Popover isOpen={isOpen} label="더 보기" onClose={close}>
        <div className="popover__group">
          <p className="popover__label">내보내기</p>
          <button type="button" className="popover__item" onClick={() => handleExport(EXPORT_FORMATS.csv)}>
            CSV로 내보내기
          </button>
          <button type="button" className="popover__item" onClick={() => handleExport(EXPORT_FORMATS.json)}>
            JSON으로 내보내기
          </button>
        </div>

        <div className="popover__group">
          <p className="popover__label">테마</p>
          {THEME_LIST.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`popover__item${theme === option.key ? ' popover__item--active' : ''}`}
              onClick={() => setTheme(option.key)}
            >
              <span className="overflow-menu__entry">
                <Icon name={option.icon} size={14} />
                {option.label}
              </span>
              {theme === option.key && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>

        <div className="popover__group">
          <p className="popover__label">밀도</p>
          {DENSITY_LIST.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`popover__item${density === option.key ? ' popover__item--active' : ''}`}
              onClick={() => setDensity(option.key)}
            >
              <span className="overflow-menu__entry">
                <Icon name="density" size={14} />
                {option.label}
              </span>
              {density === option.key && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>

        <div className="popover__group">
          <button
            type="button"
            className="popover__item"
            onClick={() => {
              close();
              openConfirm(RESET_CONFIRM);
            }}
          >
            진행 상태 초기화
          </button>
        </div>
      </Popover>
    </div>
  );
};

export default OverflowMenu;

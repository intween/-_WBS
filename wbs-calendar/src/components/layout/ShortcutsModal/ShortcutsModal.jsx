import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { SHORTCUT_GUIDE } from '@/constants/shortcuts';
import { useFocusTrap } from '@/components/common/Modal/useFocusTrap';
import { Icon } from '@/components/common';
import { useUi, useUiActions } from '@/context/hooks';
import './ShortcutsModal.scss';

const ShortcutsModal = () => {
  const { shortcutsOpen } = useUi();
  const { setShortcutsOpen } = useUiActions();
  const containerRef = useRef(null);
  const close = () => setShortcutsOpen(false);
  useFocusTrap(containerRef, shortcutsOpen, close);

  if (!shortcutsOpen) return null;

  return createPortal(
    <div className="shortcuts" role="presentation" onMouseDown={close}>
      <div
        ref={containerRef}
        className="shortcuts__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="단축키"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="shortcuts__head">
          <h2 className="shortcuts__title">단축키</h2>
          <button type="button" className="shortcuts__close" aria-label="닫기" onClick={close}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <ul className="shortcuts__list">
          {SHORTCUT_GUIDE.map((item) => (
            <li key={item.label} className="shortcuts__row">
              <span className="shortcuts__label">{item.label}</span>
              <span className="shortcuts__keys">
                {item.keys.map((key) => (
                  <kbd key={key} className="shortcuts__key">
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
};

export default ShortcutsModal;

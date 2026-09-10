/**
 * 모달.
 * body 로 포털 렌더 · 포커스 트랩 · ESC/배경 클릭 닫기.
 */
import { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon';
import { useFocusTrap, useScrollLock } from './useFocusTrap';
import './Modal.scss';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} [props.footer]
 * @param {string} [props.size] - sm | md
 * @param {boolean} [props.closeOnBackdrop]
 */
function Modal({
  open = false,
  onClose,
  title,
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
  children,
}) {
  const panelRef = useRef(null);

  useFocusTrap(panelRef, { active: open, onEscape: onClose });
  useScrollLock(open);

  const handleBackdropClick = useCallback(
    (event) => {
      if (!closeOnBackdrop) return;
      if (event.target === event.currentTarget) onClose?.();
    },
    [closeOnBackdrop, onClose]
  );

  if (!open) return null;

  return createPortal(
    <div className="modal" onMouseDown={handleBackdropClick}>
      <div
        className={`modal__panel modal__panel--${size}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            aria-label="닫기"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;

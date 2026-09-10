import { useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/common/Button/Button';
import { useFocusTrap } from './useFocusTrap';
import './Modal.scss';

const Modal = ({ isOpen, title, description, confirmLabel, cancelLabel = '취소', tone = 'primary', onConfirm, onClose }) => {
  const containerRef = useRef(null);
  useFocusTrap(containerRef, isOpen, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal" role="presentation" onMouseDown={onClose}>
      <div
        ref={containerRef}
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="modal__title">{title}</h2>
        {description && <p className="modal__description">{description}</p>}
        <div className="modal__actions">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;

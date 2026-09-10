import { useEffect } from 'react';
import { TOAST_DURATION } from '@/constants/views';
import Icon from '@/components/common/Icon/Icon';
import './Toast.scss';

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast toast--${toast.tone}`} role="status">
      <span className="toast__message">{toast.message}</span>
      <button type="button" className="toast__close" aria-label="알림 닫기" onClick={() => onDismiss(toast.id)}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
};

const ToastStack = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastStack;

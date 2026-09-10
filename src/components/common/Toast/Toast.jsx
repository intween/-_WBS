/**
 * Toast 알림.
 * UiContext 의 toasts 를 읽어 화면 우측 하단(모바일은 상단)에 쌓아 보여준다.
 */
import { createPortal } from 'react-dom';
import { useUi } from '@/context/hooks';
import Icon from '../Icon/Icon';
import './Toast.scss';

/** 종류별 아이콘 */
const TOAST_ICONS = {
  success: 'check',
  error: 'alert',
  info: 'memo',
};

function Toast() {
  const { toasts, dismissToast } = useUi();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-stack" role="region" aria-label="알림">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        >
          <Icon name={TOAST_ICONS[toast.type] || 'memo'} size={15} />
          <p className="toast__message">{toast.message}</p>
          <button
            type="button"
            className="toast__close"
            aria-label="알림 닫기"
            onClick={() => dismissToast(toast.id)}
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export default Toast;

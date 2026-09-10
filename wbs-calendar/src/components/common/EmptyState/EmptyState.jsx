import Button from '@/components/common/Button/Button';
import './EmptyState.scss';

const EmptyState = ({ message, actionLabel, onAction }) => (
  <div className="empty-state">
    <span className="empty-state__message">{message}</span>
    {actionLabel && onAction && (
      <Button size="sm" variant="ghost" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;

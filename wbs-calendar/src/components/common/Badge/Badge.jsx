import './Badge.scss';

const Badge = ({ status, overdue = false, solid = false, dot = false, children }) => (
  <span
    className={`badge${solid ? ' badge--solid' : ''}`}
    data-status={status}
    data-overdue={overdue || undefined}
  >
    {dot && <span className="badge__dot" aria-hidden="true" />}
    {children}
  </span>
);

export default Badge;

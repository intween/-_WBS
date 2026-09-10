import './Checkbox.scss';

const Checkbox = ({ checked, onChange, label, id, disabled = false }) => (
  <label className={`checkbox${checked ? ' checkbox--checked' : ''}`} htmlFor={id}>
    <input
      id={id}
      type="checkbox"
      className="checkbox__input"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span className="checkbox__box" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4 10-10" />
      </svg>
    </span>
    {label && <span className="checkbox__label">{label}</span>}
  </label>
);

export default Checkbox;

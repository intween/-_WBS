import Icon from '@/components/common/Icon/Icon';
import './Select.scss';

const Select = ({ value, onChange, options, ariaLabel, id }) => (
  <div className="select">
    <select
      id={id}
      className="select__field"
      value={value}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <Icon name="chevronDown" size={12} className="select__arrow" />
  </div>
);

export default Select;

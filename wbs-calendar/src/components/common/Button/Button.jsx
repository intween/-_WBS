import './Button.scss';

const Button = ({
  children,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  active = false,
  block = false,
  className = '',
  ...rest
}) => {
  const classes = [
    'button',
    variant === 'ghost' ? '' : `button--${variant}`,
    size === 'md' ? '' : `button--${size}`,
    active ? 'button--active' : '',
    block ? 'button--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} aria-pressed={active || undefined} {...rest}>
      {children}
    </button>
  );
};

export default Button;

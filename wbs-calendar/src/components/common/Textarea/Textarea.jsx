import { useEffect, useRef } from 'react';
import './Textarea.scss';

const MIN_HEIGHT = 60;

const Textarea = ({ value, onChange, placeholder, ariaLabel, id }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.max(element.scrollHeight, MIN_HEIGHT)}px`;
  }, [value]);

  return (
    <textarea
      id={id}
      ref={elementRef}
      className="textarea"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

export default Textarea;

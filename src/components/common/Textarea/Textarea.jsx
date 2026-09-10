/**
 * 자동 높이 조절 textarea.
 * 모바일에서 iOS 자동 확대를 막기 위해 폰트 크기를 16px 이상으로 둔다. (SCSS)
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { TEXTAREA_MAX_HEIGHT, TEXTAREA_MIN_HEIGHT } from '@/constants/config';
import './Textarea.scss';

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {Function} props.onChange - (nextValue) => void
 * @param {number} [props.minHeight]
 * @param {number} [props.maxHeight]
 * @param {string} [props.ariaLabel]
 */
function Textarea({
  value = '',
  onChange,
  placeholder = '',
  minHeight = TEXTAREA_MIN_HEIGHT,
  maxHeight = TEXTAREA_MAX_HEIGHT,
  maxLength,
  ariaLabel,
  disabled = false,
  className = '',
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}) {
  const ref = useRef(null);

  /** 내용 높이에 맞춰 늘리고, 최대 높이를 넘으면 스크롤로 전환한다. */
  const resize = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    element.style.height = 'auto';
    const next = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight);
    element.style.height = `${next}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minHeight, maxHeight]);

  // 값이 바뀔 때마다 (외부에서 바뀐 경우 포함) 높이를 다시 계산한다.
  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  // 창 크기가 바뀌면 줄바꿈 위치가 달라지므로 다시 계산한다.
  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  return (
    <textarea
      ref={ref}
      className={`textarea ${className}`.trim()}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      aria-label={ariaLabel}
      rows={1}
      style={{ minHeight }}
      onChange={(event) => onChange?.(event.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      {...rest}
    />
  );
}

export default Textarea;

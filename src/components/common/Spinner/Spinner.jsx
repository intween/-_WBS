/**
 * 로딩 표시.
 * 인라인 SVG 를 CSS 로 회전시킨다.
 */
import './Spinner.scss';

/**
 * @param {Object} props
 * @param {number} [props.size] - px
 * @param {string} [props.label] - 스크린리더용 설명
 * @param {boolean} [props.block] - 영역 전체를 차지할지
 */
function Spinner({ size = 20, label = '불러오는 중', block = false }) {
  return (
    <div className={`spinner${block ? ' spinner--block' : ''}`} role="status" aria-live="polite">
      <svg
        className="spinner__icon"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle className="spinner__track" cx="12" cy="12" r="9" strokeWidth="2.5" />
        <path className="spinner__arc" d="M21 12a9 9 0 0 0-9-9" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;

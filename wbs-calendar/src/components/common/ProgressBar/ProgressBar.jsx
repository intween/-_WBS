import './ProgressBar.scss';

const ProgressBar = ({ percent, stream, size = 'md', label }) => (
  <div
    className={`progress-bar progress-bar--${size}`}
    data-stream={stream}
    role="progressbar"
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label}
  >
    <span className="progress-bar__fill" style={{ width: `${percent}%` }} />
  </div>
);

export default ProgressBar;

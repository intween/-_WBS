import { WEEKDAY_LABELS } from '@/constants/views';
import './Skeleton.scss';

const SKELETON_WEEKS = 5;
const CHIP_PATTERN = [2, 0, 1, 3, 1, 0, 2];

export const CalendarSkeleton = () => (
  <div className="skeleton" aria-busy="true" aria-label="캘린더 불러오는 중">
    <div className="skeleton__weekdays">
      {WEEKDAY_LABELS.map((label) => (
        <span key={label} className="skeleton__weekday">
          {label}
        </span>
      ))}
    </div>
    <div className="skeleton__grid">
      {Array.from({ length: SKELETON_WEEKS * WEEKDAY_LABELS.length }, (unused, index) => (
        <div key={index} className="skeleton__cell">
          {Array.from({ length: CHIP_PATTERN[index % CHIP_PATTERN.length] }, (chip, row) => (
            <span key={row} className="skeleton__chip" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default CalendarSkeleton;

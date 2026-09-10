/**
 * 좌측 고정 행 라벨 — 워크스트림 이름 + 진행률.
 */
import { memo } from 'react';
import { ProgressBar } from '@/components/common';
import './StreamLabel.scss';

/**
 * @param {Object} props
 * @param {Object} props.stream - { id, name, color }
 * @param {Object} props.progress - calcProgress 결과
 */
function StreamLabel({ stream, progress }) {
  return (
    <div
      className="stream-label"
      style={{ borderLeftColor: stream.color }}
      role="rowheader"
    >
      <span className="stream-label__name">{stream.name}</span>
      <ProgressBar
        percent={progress.percent}
        done={progress.done}
        total={progress.total}
        size="xs"
        color={stream.color}
      />
      <span className="stream-label__count is-numeric">
        {progress.done}/{progress.total}
      </span>
    </div>
  );
}

export default memo(StreamLabel);

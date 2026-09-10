/**
 * 담당자 선택.
 * 미지정을 허용하며, 선택 즉시 저장된다.
 */
import { Avatar, Select } from '@/components/common';
import './OwnerSelector.scss';

/** 미지정 항목의 값 (uuid 와 겹치지 않도록 빈 문자열 사용) */
const UNASSIGNED = '';

/**
 * @param {Object} props
 * @param {string|null} props.value - member id
 * @param {Array} props.members
 * @param {Function} props.onChange - (memberId|null) => void
 * @param {boolean} [props.disabled]
 */
function OwnerSelector({ value, members = [], onChange, disabled = false }) {
  const selected = value ? members.find((member) => member.id === value) : null;

  const options = [
    { value: UNASSIGNED, label: '미지정' },
    ...members.map((member) => ({
      value: member.id,
      label: member.role ? `${member.name} · ${member.role}` : member.name,
    })),
  ];

  return (
    <div className="owner-selector">
      <Avatar member={selected} size="md" />
      <Select
        className="owner-selector__select"
        size="md"
        value={value || UNASSIGNED}
        options={options}
        ariaLabel="담당자"
        disabled={disabled}
        onChange={(next) => onChange(next || null)}
      />
    </div>
  );
}

export default OwnerSelector;

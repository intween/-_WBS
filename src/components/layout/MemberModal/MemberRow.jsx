/**
 * 팀원 관리 모달의 한 줄.
 * 이름/역할 수정과 삭제를 처리한다.
 */
import { useState } from 'react';
import { Avatar, Button } from '@/components/common';
import './MemberRow.scss';

/**
 * @param {Object} props
 * @param {Object} props.member
 * @param {boolean} [props.isCurrentUser]
 * @param {Function} props.onSave - (id, { name, role }) => Promise
 * @param {Function} props.onDelete - (id) => Promise
 */
function MemberRow({ member, isCurrentUser = false, onSave, onDelete }) {
  const [mode, setMode] = useState('view'); // view | edit | confirm-delete
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role || '');
  const [busy, setBusy] = useState(false);

  const startEdit = () => {
    setName(member.name);
    setRole(member.role || '');
    setMode('edit');
  };

  const handleSave = async () => {
    setBusy(true);
    const result = await onSave(member.id, { name, role });
    setBusy(false);
    if (result?.ok) setMode('view');
  };

  const handleDelete = async () => {
    setBusy(true);
    await onDelete(member.id);
    setBusy(false);
  };

  if (mode === 'edit') {
    return (
      <li className="member-row member-row--edit">
        <Avatar member={member} size="md" />
        <div className="member-row__fields">
          <input
            className="member-row__input"
            value={name}
            maxLength={20}
            aria-label="팀원 이름"
            placeholder="이름"
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="member-row__input"
            value={role}
            maxLength={20}
            aria-label="역할"
            placeholder="역할 (선택)"
            onChange={(event) => setRole(event.target.value)}
          />
        </div>
        <div className="member-row__actions">
          <Button size="sm" variant="primary" disabled={busy} onClick={handleSave}>
            저장
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode('view')}>
            취소
          </Button>
        </div>
      </li>
    );
  }

  if (mode === 'confirm-delete') {
    return (
      <li className="member-row member-row--confirm">
        <p className="member-row__confirm-text">
          <strong>{member.name}</strong> 님을 삭제할까요? 담당 업무는 미지정으로 바뀝니다.
        </p>
        <div className="member-row__actions">
          <Button size="sm" variant="danger" disabled={busy} onClick={handleDelete}>
            삭제
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode('view')}>
            취소
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="member-row">
      <Avatar member={member} size="md" />
      <div className="member-row__text">
        <span className="member-row__name">
          {member.name}
          {isCurrentUser && <span className="member-row__me">나</span>}
        </span>
        {member.role && <span className="member-row__role">{member.role}</span>}
      </div>
      <div className="member-row__actions">
        <Button
          size="sm"
          variant="ghost"
          iconName="pencil"
          iconOnly
          ariaLabel={`${member.name} 정보 수정`}
          onClick={startEdit}
        />
        <Button
          size="sm"
          variant="ghost"
          iconName="trash"
          iconOnly
          ariaLabel={`${member.name} 삭제`}
          onClick={() => setMode('confirm-delete')}
        />
      </div>
    </li>
  );
}

export default MemberRow;

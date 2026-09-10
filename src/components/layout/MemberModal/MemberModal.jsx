/**
 * 팀원 관리 모달.
 * 추가 / 이름·역할 수정 / 삭제.
 */
import { useState } from 'react';
import { Button, EmptyState, Modal } from '@/components/common';
import { useUi, useUser, useWbs } from '@/context/hooks';
import MemberRow from './MemberRow';
import './MemberModal.scss';

function MemberModal() {
  const { memberModalOpen, closeMemberModal } = useUi();
  const { members, addMember, editMember, removeMember } = useWbs();
  const { memberId } = useUser();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!name.trim() || busy) return;

    setBusy(true);
    const result = await addMember({ name, role });
    setBusy(false);

    if (result?.ok) {
      setName('');
      setRole('');
    }
  };

  return (
    <Modal
      open={memberModalOpen}
      onClose={closeMemberModal}
      title="팀원 관리"
      footer={
        <Button variant="secondary" onClick={closeMemberModal}>
          닫기
        </Button>
      }
    >
      <form className="member-modal__form" onSubmit={handleAdd}>
        <input
          className="member-modal__input"
          value={name}
          maxLength={20}
          aria-label="추가할 팀원 이름"
          placeholder="이름"
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="member-modal__input member-modal__input--role"
          value={role}
          maxLength={20}
          aria-label="역할 (선택)"
          placeholder="역할 (선택)"
          onChange={(event) => setRole(event.target.value)}
        />
        <Button type="submit" variant="primary" iconName="plus" disabled={busy || !name.trim()}>
          추가
        </Button>
      </form>

      {members.length === 0 ? (
        <EmptyState
          size="sm"
          iconName="users"
          title="등록된 팀원이 없습니다"
          description="위 입력란에서 팀원을 추가해주세요."
        />
      ) : (
        <ul className="member-modal__list">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.id === memberId}
              onSave={editMember}
              onDelete={removeMember}
            />
          ))}
        </ul>
      )}

      <p className="member-modal__note">
        팀원을 삭제하면 그 사람이 담당하던 업무는 미지정으로 돌아갑니다.
        코멘트와 변경 이력은 남되 작성자 표시만 비워집니다.
      </p>
    </Modal>
  );
}

export default MemberModal;

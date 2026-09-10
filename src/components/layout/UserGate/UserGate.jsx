/**
 * 진입 화면 — 등록된 팀원 중에서 본인 이름을 고른다.
 * 보안 인증이 아니라 "누가 수정했는지" 기록하기 위한 것이다.
 */
import { Avatar, Button, EmptyState, Spinner } from '@/components/common';
import { PROJECT } from '@/constants/config';
import { useUi, useUser, useWbs } from '@/context/hooks';
import './UserGate.scss';

function UserGate() {
  const { members, loading, error, reload } = useWbs();
  const { selectMember } = useUser();
  const { openMemberModal } = useUi();

  return (
    <div className="user-gate">
      <div className="user-gate__card">
        <header className="user-gate__header">
          <p className="user-gate__eyebrow">{PROJECT.title}</p>
          <h1 className="user-gate__title">{PROJECT.subtitle}</h1>
          <p className="user-gate__description">본인 이름을 선택하면 바로 시작합니다.</p>
        </header>

        {loading && <Spinner block label="팀원 목록을 불러오는 중" />}

        {!loading && error && (
          <div className="user-gate__error" role="alert">
            <p className="user-gate__error-text">{error}</p>
            <Button variant="secondary" iconName="refresh" onClick={reload}>
              다시 시도
            </Button>
          </div>
        )}

        {!loading && !error && members.length === 0 && (
          <EmptyState
            iconName="users"
            title="등록된 팀원이 없습니다"
            description="먼저 팀원을 등록해야 시작할 수 있습니다."
            action={
              <Button variant="primary" iconName="plus" onClick={openMemberModal}>
                팀원 등록하기
              </Button>
            }
          />
        )}

        {!loading && !error && members.length > 0 && (
          <ul className="user-gate__list">
            {members.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  className="user-gate__member"
                  aria-label={`${member.name}(으)로 입장`}
                  onClick={() => selectMember(member.id)}
                >
                  <Avatar member={member} size="lg" />
                  <span className="user-gate__member-text">
                    <span className="user-gate__member-name">{member.name}</span>
                    {member.role && (
                      <span className="user-gate__member-role">{member.role}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="user-gate__footer">
          <Button variant="ghost" size="sm" iconName="users" onClick={openMemberModal}>
            팀원 관리
          </Button>
          <p className="user-gate__note">
            선택한 이름은 이 브라우저에 저장되며, 변경 내역을 남기는 용도로만 쓰입니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default UserGate;

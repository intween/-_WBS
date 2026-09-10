/**
 * 현재 사용자 Provider.
 *
 * 보안 인증이 아니라 "누가 수정했는지" 기록하기 위한 것이다.
 * 팀원 목록 자체는 WbsContext 가 들고 있고, 여기서는 선택한 id 만 관리한다.
 */
import { createContext, useCallback, useMemo } from 'react';
import { STORAGE_KEY_MEMBER } from '@/constants/config';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [memberId, setStoredMemberId, clearStoredMemberId] = useLocalStorage(
    STORAGE_KEY_MEMBER,
    null
  );

  /** 팀원 선택 (입장) */
  const selectMember = useCallback(
    (id) => {
      if (!id) return;
      setStoredMemberId(id);
    },
    [setStoredMemberId]
  );

  /** 사용자 변경 — 선택을 지우고 이름 선택 화면으로 되돌린다. */
  const clearMember = useCallback(() => {
    clearStoredMemberId();
  }, [clearStoredMemberId]);

  const value = useMemo(
    () => ({
      memberId: memberId || null,
      hasSelected: Boolean(memberId),
      selectMember,
      clearMember,
    }),
    [memberId, selectMember, clearMember]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserProvider;

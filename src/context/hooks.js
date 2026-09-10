/**
 * Context 소비 훅 모음.
 * Provider 밖에서 쓰면 바로 알 수 있도록 명확한 에러를 던진다.
 */
import { useContext, useMemo } from 'react';
import { WbsContext } from './WbsContext';
import { UserContext } from './UserContext';
import { UiContext } from './UiContext';

const consume = (context, name, providerName) => {
  const value = useContext(context);
  if (!value) {
    throw new Error(`${name} 는 ${providerName} 안에서만 사용할 수 있습니다.`);
  }
  return value;
};

/** 업무 데이터 / 팀원 / 코멘트 / 이력 */
export const useWbs = () => consume(WbsContext, 'useWbs()', '<WbsProvider>');

/** 현재 사용자 (선택한 팀원 id) */
export const useUser = () => consume(UserContext, 'useUser()', '<UserProvider>');

/** 탭 / 검색 / 필터 / 상세 패널 / Toast */
export const useUi = () => consume(UiContext, 'useUi()', '<UiProvider>');

/**
 * 현재 사용자의 팀원 정보를 합쳐서 돌려준다.
 * 저장된 id 가 이미 삭제된 팀원이면 member 는 null 이 된다.
 */
export const useCurrentMember = () => {
  const { memberId } = useUser();
  const { memberMap, loading } = useWbs();

  return useMemo(() => {
    const member = memberId ? memberMap[memberId] || null : null;
    return {
      memberId,
      member,
      /** 저장된 id 가 더 이상 유효하지 않은 상태 (로딩이 끝난 뒤에만 판단) */
      isStale: Boolean(memberId) && !loading && !member,
    };
  }, [memberId, memberMap, loading]);
};

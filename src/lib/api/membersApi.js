/**
 * 팀원 데이터 접근 계층.
 * 컴포넌트는 Supabase 를 직접 호출하지 말고 반드시 이 모듈을 거친다.
 */
import { requireClient, unwrap } from '@/lib/supabaseClient';
import { TABLE } from '@/constants/config';
import { pickAvatarColor } from '@/constants/colors';

/** 팀원 전체 조회 (등록순) */
export const fetchMembers = async () => {
  const response = await requireClient()
    .from(TABLE.MEMBERS)
    .select('id, name, role, color, created_at')
    .order('created_at', { ascending: true });

  return unwrap(response, '팀원 목록을 불러오지 못했습니다.') || [];
};

/**
 * 팀원 추가.
 * color 를 넘기지 않으면 현재 인원 수 기준으로 팔레트에서 배정한다.
 */
export const createMember = async ({ name, role = null, color = null, index = 0 }) => {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) throw new Error('팀원 이름을 입력해주세요.');

  const response = await requireClient()
    .from(TABLE.MEMBERS)
    .insert({
      name: trimmed,
      role: role ? String(role).trim() : null,
      color: color || pickAvatarColor(index),
    })
    .select()
    .single();

  return unwrap(response, '팀원을 추가하지 못했습니다.');
};

/** 팀원 정보 수정 (이름/역할/색상) */
export const updateMember = async (id, patch) => {
  if (!id) throw new Error('수정할 팀원을 찾을 수 없습니다.');

  const next = {};
  if ('name' in patch) {
    const trimmed = String(patch.name ?? '').trim();
    if (!trimmed) throw new Error('팀원 이름을 입력해주세요.');
    next.name = trimmed;
  }
  if ('role' in patch) next.role = patch.role ? String(patch.role).trim() : null;
  if ('color' in patch) next.color = patch.color || null;

  const response = await requireClient()
    .from(TABLE.MEMBERS)
    .update(next)
    .eq('id', id)
    .select()
    .single();

  return unwrap(response, '팀원 정보를 수정하지 못했습니다.');
};

/**
 * 팀원 삭제.
 * 담당 업무는 스키마의 on delete set null 로 자동 '미지정' 처리된다.
 */
export const deleteMember = async (id) => {
  if (!id) throw new Error('삭제할 팀원을 찾을 수 없습니다.');

  const response = await requireClient().from(TABLE.MEMBERS).delete().eq('id', id);
  unwrap(response, '팀원을 삭제하지 못했습니다.');
  return true;
};

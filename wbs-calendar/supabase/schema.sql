-- WBS 캘린더 (wbs-calendar) 스키마
-- Supabase SQL Editor 에 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.

-- 1. 업무 상태 테이블 --------------------------------------------------------
-- 업무 정의(제목/스트림/기간)는 프론트엔드 상수에 있고,
-- 여기에는 "사람이 바꾸는 값"만 저장한다. src/lib/store/types.js 의
-- TASK_STATE_SHAPE 와 1:1 로 대응한다.
create table if not exists task_states (
  task_id    text primary key,
  status     text        not null default 'todo'
                         check (status in ('todo', 'doing', 'done', 'hold')),
  due_date   date,
  memo       text        not null default '',
  links      jsonb       not null default '[]'::jsonb,
  checklist  jsonb       not null default '[]'::jsonb,
  assignee   text,
  updated_at timestamptz not null default now()
);

-- 2. RLS ---------------------------------------------------------------------
alter table task_states enable row level security;

-- 재실행 시 중복 생성을 피한다.
drop policy if exists "read for all"   on task_states;
drop policy if exists "insert for all" on task_states;
drop policy if exists "update for all" on task_states;
drop policy if exists "delete for all" on task_states;

-- 이 앱은 로그인이 없다. publishable key 를 가진 클라이언트(= 배포 URL 방문자)에게
-- 읽기와 수정을 허용한다. 팀 내부 공유 전제이며, URL 을 외부에 노출하지 말 것.
create policy "read for all"   on task_states for select using (true);
create policy "insert for all" on task_states for insert with check (true);
create policy "update for all" on task_states for update using (true) with check (true);

-- 삭제는 툴바의 "전체 초기화"(확인창 있음) 에서만 쓴다.
-- 그 기능이 필요 없으면 아래 한 줄을 지우면 전체 삭제가 원천 차단된다.
create policy "delete for all" on task_states for delete using (true);

-- 3. Data API 노출 -----------------------------------------------------------
-- "Automatically expose new tables" 를 꺼둔 프로젝트에서도 동작하도록 명시한다.
grant select, insert, update, delete on task_states to anon, authenticated;

-- 4. 실시간 동기화 -----------------------------------------------------------
-- 팀원 A 가 바꾸면 팀원 B 화면에도 즉시 반영되게 한다.
do $$
begin
  alter publication supabase_realtime add table task_states;
exception
  when duplicate_object then null;  -- 이미 추가돼 있으면 넘어간다
end
$$;

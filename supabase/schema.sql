-- =====================================================================
-- 환동해 소셜벤처 글로벌 진출 프로그램 WBS — Supabase 스키마
-- ---------------------------------------------------------------------
-- 실행 방법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run
-- 여러 번 실행해도 안전하도록 idempotent 하게 작성했습니다.
--
-- ⚠️ 보안 주의
--   이 스키마는 내부 소규모 팀(3~6명) 전용입니다.
--   anon 키로 전체 읽기/쓰기가 열려 있으므로 배포 URL 을 외부에 공유하지 마세요.
-- =====================================================================

-- gen_random_uuid() 사용을 위한 확장 (Supabase 는 기본 활성화되어 있음)
create extension if not exists pgcrypto;


-- ---------------------------------------------------------------------
-- 1. 팀원
-- ---------------------------------------------------------------------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,                       -- 직책/역할 (선택)
  color text,                      -- 아바타 색상
  created_at timestamptz default now()
);


-- ---------------------------------------------------------------------
-- 2. 업무 진행 상태
--    정적 업무 정의(제목/스트림/기간)는 프론트 src/data/tasks.js 에 있고,
--    여기에는 "진행 상태"만 저장합니다. task_id 로 조인해서 사용합니다.
-- ---------------------------------------------------------------------
create table if not exists task_states (
  task_id text primary key,        -- 예: 'a_w1_0'
  status text not null default 'todo',   -- todo | doing | done | hold
  owner_id uuid references members(id) on delete set null,
  due_date date,
  memo text default '',
  links jsonb default '[]'::jsonb,       -- [{label, url}]
  checklist jsonb default '[]'::jsonb,   -- [{id, text, done}]
  updated_at timestamptz default now(),
  updated_by uuid references members(id) on delete set null
);

-- 상태 값 오염 방지 (src/constants/status.js 의 4종과 일치)
-- 상태를 추가하려면 이 제약도 함께 수정해야 합니다.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'task_states_status_check'
  ) then
    alter table task_states
      add constraint task_states_status_check
      check (status in ('todo', 'doing', 'done', 'hold'));
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 3. 업무별 코멘트 (스레드)
-- ---------------------------------------------------------------------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id text not null,
  member_id uuid references members(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);


-- ---------------------------------------------------------------------
-- 4. 변경 이력
-- ---------------------------------------------------------------------
create table if not exists activity_log (
  id bigserial primary key,
  task_id text not null,
  member_id uuid references members(id) on delete set null,
  field text not null,             -- status | owner | due_date | memo | checklist | link
  before_value text,
  after_value text,
  created_at timestamptz default now()
);


-- ---------------------------------------------------------------------
-- 5. 인덱스
-- ---------------------------------------------------------------------
create index if not exists comments_task_created_idx
  on comments (task_id, created_at desc);

create index if not exists activity_log_task_created_idx
  on activity_log (task_id, created_at desc);

create index if not exists activity_log_created_idx
  on activity_log (created_at desc);

create index if not exists task_states_owner_idx
  on task_states (owner_id);


-- ---------------------------------------------------------------------
-- 6. RLS — 내부 전용이므로 anon 전체 허용
--    (RLS 자체는 켜두고, 모든 작업을 허용하는 정책을 붙입니다.
--     RLS 를 끄면 Supabase 가 경고를 띄우고 Realtime 설정도 헷갈리기 쉽습니다.)
-- ---------------------------------------------------------------------
alter table members     enable row level security;
alter table task_states enable row level security;
alter table comments    enable row level security;
alter table activity_log enable row level security;

drop policy if exists "anon full access" on members;
create policy "anon full access" on members
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon full access" on task_states;
create policy "anon full access" on task_states
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon full access" on comments;
create policy "anon full access" on comments
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon full access" on activity_log;
create policy "anon full access" on activity_log
  for all to anon, authenticated using (true) with check (true);


-- ---------------------------------------------------------------------
-- 7. Realtime 구독 대상 등록 (task_states, comments)
--    이 두 테이블의 변경이 다른 팀원 화면에 즉시 반영됩니다.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'task_states'
  ) then
    alter publication supabase_realtime add table task_states;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table comments;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 8. 팀원 초기 등록 (선택)
--    아래 주석을 풀고 이름을 바꿔서 실행하면 됩니다.
--    앱의 "팀원 관리" 모달에서도 추가/수정/삭제할 수 있습니다.
-- ---------------------------------------------------------------------
-- insert into members (name, role, color) values
--   ('홍길동', '총괄',     '#185FA5'),
--   ('김철수', '기업지원', '#085041'),
--   ('이영희', '현지섭외', '#854F0B'),
--   ('박민수', '디자인',   '#534AB7');


-- ---------------------------------------------------------------------
-- 참고: 업무 진행 상태 행(task_states, 67건)은 앱이 최초 실행될 때
--       src/data/tasks.js 의 id 기준으로 자동 seed 합니다. (수동 INSERT 불필요)
-- ---------------------------------------------------------------------

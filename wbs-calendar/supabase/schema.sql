-- WBS 캘린더 (wbs-calendar) 스키마
-- Supabase SQL Editor 에 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.
-- 실행 순서: schema.sql -> seed.sql

-- 1. 업무 정의 -------------------------------------------------------------
-- 예전에는 src/config/tasks.js 에 하드코딩돼 있었다. 웹에서 추가·수정·삭제할 수
-- 있어야 해서 DB 로 옮긴다. sort_order 는 같은 날짜 안에서의 표시 순서다.
create table if not exists tasks (
  id         text primary key,
  stream     text        not null,
  title      text        not null,
  due        date,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 업무 진행 상태 --------------------------------------------------------
-- 사람이 바꾸는 값만 담는다. src/lib/store/types.js 의 TASK_STATE_SHAPE 와 대응.
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

-- 3. RLS -------------------------------------------------------------------
alter table tasks       enable row level security;
alter table task_states enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['tasks', 'task_states'] loop
    execute format('drop policy if exists "read for all"   on %I', t);
    execute format('drop policy if exists "insert for all" on %I', t);
    execute format('drop policy if exists "update for all" on %I', t);
    execute format('drop policy if exists "delete for all" on %I', t);

    -- 이 앱은 로그인이 없다. publishable key 를 가진 클라이언트(= 배포 URL 방문자)
    -- 에게 읽기와 수정을 허용한다. 팀 내부 공유 전제이며 URL 을 외부에 노출하지 말 것.
    execute format('create policy "read for all"   on %I for select using (true)', t);
    execute format('create policy "insert for all" on %I for insert with check (true)', t);
    execute format('create policy "update for all" on %I for update using (true) with check (true)', t);
    execute format('create policy "delete for all" on %I for delete using (true)', t);
  end loop;
end
$$;

-- 4. Data API 노출 ---------------------------------------------------------
-- "Automatically expose new tables" 를 꺼둔 프로젝트에서도 동작하도록 명시한다.
grant select, insert, update, delete on tasks       to anon, authenticated;
grant select, insert, update, delete on task_states to anon, authenticated;

-- 5. 실시간 동기화 ---------------------------------------------------------
-- 팀원 A 가 바꾸면 팀원 B 화면에도 즉시 반영되게 한다.
do $$
begin
  alter publication supabase_realtime add table tasks;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table task_states;
exception when duplicate_object then null;
end
$$;

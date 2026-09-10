# 환동해 소셜벤처 글로벌 진출 프로그램 — WBS 협업 관리 플랫폼

팀원 3~6명이 각자 브라우저로 접속해 담당 업무를 확인·수정하면 다른 팀원 화면에도
실시간으로 반영되는 내부용 진행상황 추적 도구입니다.

- 프로그램 기간: 2026-09-08 ~ 2026-10-24 (현지 수행 10/21~10/24)
- 업무 정의: 7개 워크스트림 × 9개 기간, 총 **67건**
- 스택: React 18 + Vite · SCSS · Context API + useReducer · Supabase(Postgres + Realtime)

---

## 1. 빠른 시작 — 서버 없이 화면부터 보기

**백엔드(Supabase) 없이도 바로 실행됩니다.**

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env` 가 없으면 앱이 자동으로 **데모 모드**로 뜹니다.
샘플 팀원 4명과 일부 진행 상황이 채워진 상태로 전체 화면을 확인할 수 있습니다.
헤더에 `데모 모드` 배지가 보이면 이 상태입니다.

데모 모드에서 되는 것 / 안 되는 것:

| 항목 | 데모 모드 | Supabase 연결 후 |
|---|---|---|
| 전체 화면·기능 | ✅ 동일 | ✅ |
| 데이터 저장 위치 | 내 브라우저 `localStorage` | 서버(Postgres) |
| 다른 **탭**과 실시간 동기화 | ✅ (BroadcastChannel) | ✅ |
| 다른 **사람**과 공유 | ❌ | ✅ |

데모 데이터를 처음 상태로 되돌리려면 브라우저 콘솔에서:

```js
localStorage.removeItem('wbs-donghae:demo:v1'); location.reload();
```

> 데모 모드는 `src/lib/api/mockApi.js` 한 파일로 구현되어 있습니다.
> `.env` 를 채우면 `src/lib/api/index.js` 가 자동으로 Supabase 구현으로 전환하므로,
> **화면 코드는 한 줄도 고칠 필요가 없습니다.**

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 로컬 확인 |

요구사항: Node.js 18 이상 (권장 20+), npm 9 이상

---

## 2. ⚠️ 보안 주의 — 서버에 연결해 배포하기 전에 반드시 읽어주세요

**이 앱은 외부 공개용이 아닙니다.**

- 로그인은 "등록된 팀원 목록에서 이름 선택"뿐이며, **보안 인증이 아니라 협업 추적용**입니다.
- Supabase `anon` 키는 브라우저 번들에 그대로 포함되고, RLS 정책은 전체 허용으로 열려 있습니다.
- 즉, **배포 URL을 아는 사람은 누구나 모든 데이터를 읽고 수정할 수 있습니다.**
- 배포 URL과 `.env` 값을 외부에 공유하지 마세요. 팀 내부 채널로만 전달하세요.
- `.env` 는 `.gitignore` 에 포함되어 있습니다. 절대 커밋하지 마세요.
- 개인정보·계약 금액 등 민감 정보는 이 앱에 직접 적지 말고, 구글드라이브 원본에 두고
  **링크만 등록**하세요.

---

## 3. Supabase 연결하기

### 3-1. 프로젝트 생성

1. <https://supabase.com> 접속 → 로그인 → **New project**
2. 입력값
   - **Name**: `wbs-donghae` (자유)
   - **Database Password**: 임의 생성 후 안전한 곳에 보관 (앱에서는 쓰지 않습니다)
   - **Region**: `Northeast Asia (Seoul)` 권장 — 지연시간이 가장 짧습니다
3. 생성까지 1~2분 정도 걸립니다.

### 3-2. 스키마 실행

1. 좌측 메뉴 **SQL Editor** → **New query**
2. 이 저장소의 [`supabase/schema.sql`](supabase/schema.sql) **전체 내용을 붙여넣고 Run**
3. `Success. No rows returned` 가 뜨면 완료입니다.

이 스크립트는 아래를 한 번에 처리합니다.

- 테이블 4개 생성 — `members`, `task_states`, `comments`, `activity_log`
- 인덱스 생성
- RLS 활성화 + `anon` 전체 허용 정책 부여
- `task_states`, `comments` 를 **Realtime 발행 대상에 등록**

> 여러 번 실행해도 안전하도록 작성되어 있습니다(idempotent).
> 스키마를 수정한 뒤 다시 실행해도 기존 데이터는 지워지지 않습니다.

### 3-3. API 키를 `.env` 에 넣기

```bash
cp .env.example .env
```

1. Supabase 좌측 메뉴 **Project Settings** → **API**
2. 아래 두 값을 복사해 `.env` 에 붙여넣습니다.

```dotenv
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| Supabase 화면의 항목 | `.env` 키 |
|---|---|
| Project URL | `VITE_SUPABASE_URL` |
| Project API keys → `anon` `public` | `VITE_SUPABASE_ANON_KEY` |

> `service_role` 키는 **절대 사용하지 마세요.** 브라우저에 노출되면 DB 전체 권한이 넘어갑니다.

`.env` 를 수정한 뒤에는 개발 서버를 **재시작**해야 반영됩니다.
재시작 후 헤더에서 `데모 모드` 배지가 사라지면 서버에 연결된 것입니다.

### 3-4. Realtime 동작 확인

브라우저 두 개(또는 시크릿 창)로 같은 주소를 열고, 한쪽에서 업무 상태를 바꿨을 때
다른 쪽 카드 테두리가 잠깐 깜빡이면 정상입니다.

반영되지 않는다면 Supabase 대시보드 **Database → Replication** 에서
`supabase_realtime` 발행 목록에 `task_states`, `comments` 가 있는지 확인하세요.

---

## 4. 팀원 초기 등록

두 가지 방법 중 편한 쪽을 쓰면 됩니다.

**방법 A — 앱에서 등록 (권장)**
앱 실행 → 이름 선택 화면 하단의 **팀원 관리** → 이름/역할 입력 후 추가.

**방법 B — SQL 로 한 번에 등록**
`supabase/schema.sql` 마지막의 `insert into members ...` 주석을 풀어 이름을 바꾼 뒤
SQL Editor 에서 실행합니다.

```sql
insert into members (name, role, color) values
  ('홍길동', '총괄',     '#185FA5'),
  ('김철수', '기업지원', '#085041');
```

팀원을 삭제하면 그 사람이 담당하던 업무는 **미지정으로 되돌아갑니다**
(`on delete set null`). 지금까지의 코멘트와 변경 이력은 남되 작성자만 비워집니다.

> 데모 모드의 샘플 팀원(김서연·박준호·이하늘·최민지)은 실제 DB 와 무관합니다.
> Supabase 를 연결하면 사라지고, 위 방법으로 실제 팀원을 등록하면 됩니다.

---

## 5. 업무 진행 상태 행 자동 생성(seed)

`task_states` 는 **수동으로 INSERT 할 필요가 없습니다.**

앱이 처음 실행될 때 `src/data/tasks.js` 의 67개 `task_id` 를 기준으로,
DB에 없는 행만 골라 자동으로 채워 넣습니다(기존 행은 건드리지 않음).
업무를 추가한 뒤 새로고침하면 그 업무의 행도 자동으로 생깁니다.

---

## 6. 업무 데이터 수정 방법

업무의 **정적 정의**(제목·소속 스트림·기간)와 **진행 상태**(상태·담당자·메모 등)는
완전히 분리되어 있습니다. 진행 상태는 DB(`task_states`)에, 정의는 코드에 있습니다.

| 수정 대상 | 파일 |
|---|---|
| 업무 제목 / 추가 / 삭제 | `src/data/tasks.js` |
| 기간(컬럼) 정의 · 날짜 | `src/data/periods.js` |
| 워크스트림(행) 정의 | `src/data/streams.js` |
| 상태 4종의 라벨·색상 | `src/constants/status.js` |
| 프로젝트명 · D-day 기준일 | `src/constants/config.js` |
| 색상 · 폰트 · 간격 토큰 | `src/styles/abstracts/_variables.scss` |
| 데모 모드 샘플 데이터 | `src/lib/api/mockApi.js` |

### 업무를 추가할 때

`src/data/tasks.js` 에 아래 형식으로 추가합니다. **id 규칙은 `{streamId}_{periodId}_{index}`** 입니다.

```js
{ id: 'a_w4_0', stream: 'a', period: 'w4', title: '신규 업무명' },
```

- `stream` 은 `src/data/streams.js` 의 id(`a`~`g`), `period` 는 `src/data/periods.js` 의 id(`w1`~`w8`, `wf`) 여야 합니다.
- 저장 후 새로고침하면 `task_states` 행이 자동 생성됩니다.

### 업무를 삭제할 때

`tasks.js` 에서 해당 항목을 지우면 화면에서 사라집니다.
DB의 `task_states` 행은 남지만 참조되지 않습니다. 정리하려면:

```sql
delete from task_states where task_id = 'a_w4_0';
```

### 상태를 추가/변경할 때

`src/constants/status.js` 와 `supabase/schema.sql` 의 `task_states_status_check`
제약조건, `_variables.scss` 의 `$status-colors` 를 **함께** 맞춰야 합니다.

### 색상·간격을 바꿀 때

`_variables.scss` 와 `src/constants/colors.js` 의 값을 **함께** 맞춰주세요.
SCSS 변수는 스타일에, JS 상수는 인라인 SVG·동적 스타일에 쓰입니다.

---

## 7. Vercel 배포

1. GitHub 저장소에 푸시합니다 (`.env` 가 빠졌는지 확인).
2. <https://vercel.com> → **Add New → Project** → 저장소 선택
3. 빌드 설정 — 자동 인식되지만 확인해두세요.
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables** 에 두 개를 추가합니다.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   > Vite 는 빌드 시점에 환경변수를 번들에 넣습니다. 값을 바꾸면 **재배포**해야 반영됩니다.
   > 환경변수를 넣지 않고 배포하면 배포본이 **데모 모드**로 동작합니다.
     (사람마다 데이터가 따로 놀게 되니, 공유용 배포에는 반드시 값을 넣으세요.)
5. **Deploy** → 발급된 URL을 팀 내부에만 공유합니다.

> 검색엔진 노출이 걱정된다면 Vercel 프로젝트 설정에서 **Deployment Protection**(비밀번호 보호)을
> 켜두는 것을 권합니다.

---

## 8. 폴더 구조

```
src/
├── data/        정적 업무 정의 (67건) — DB와 섞지 않음
├── lib/
│   ├── supabaseClient.js
│   └── api/     데이터 접근 계층 — 컴포넌트는 여기만 호출
│       ├── index.js     Supabase / 데모 구현을 골라 내보냄
│       ├── mockApi.js   데모 모드 (localStorage + BroadcastChannel)
│       └── *Api.js      Supabase 구현
├── context/     전역 상태 (업무 / 사용자 / UI)
├── hooks/       재사용 훅 (미디어쿼리, 디바운스, Realtime, 낙관적 업데이트)
├── utils/       순수 함수 (진행률, D-day, 포맷, 변경이력 문구, 필터, 내보내기)
├── constants/   색상 · 상태 정의 · 설정값
├── components/  common / layout / board / mobile / detail / dashboard
└── styles/      abstracts(변수·믹스인·함수) + base
```

Supabase 호출은 **반드시 `src/lib/api/` 를 거칩니다.** 컴포넌트에서 직접 호출하지 마세요.
백엔드를 교체하더라도 이 계층만 바꾸면 됩니다. (데모 모드가 그 예시입니다)

---

## 9. 문제 해결

| 증상 | 확인할 것 |
|---|---|
| 헤더에 `데모 모드` 가 계속 보임 | `.env` 파일 존재 여부, 키 이름 오타, **개발 서버 재시작** |
| 팀원 목록이 비어 있음 | `members` 테이블에 행이 있는지 (4번 항목 참고) |
| 업무가 하나도 안 보임 | `schema.sql` 실행 여부, 브라우저 콘솔의 seed 에러 |
| 다른 사람 변경이 안 보임 | Database → Replication 에 `task_states`, `comments` 등록 여부 |
| 헤더에 "오프라인 · 재연결 중" 지속 | 네트워크, Supabase 프로젝트 일시정지(무료 플랜 7일 미사용 시) 여부 |
| 데모 데이터가 이상해짐 | 콘솔에서 `localStorage.removeItem('wbs-donghae:demo:v1')` 후 새로고침 |

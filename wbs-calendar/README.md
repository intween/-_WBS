# WBS 캘린더

프로젝트 일정을 캘린더로 보고 관리하는 WBS 웹앱 (프론트엔드 전용).

- React 18 + Vite, JavaScript, SCSS
- 외부 UI / 캘린더 / 상태관리 라이브러리 없음 (캘린더 그리드는 CSS Grid 직접 구현)
- 데이터는 어댑터 계층 뒤에 있어서, 지금은 브라우저 localStorage로 동작하고 나중에 REST API로 교체 가능
- 담당자(멤버) 개념 없음. 업무 단위로 다루는 것은 상태 / 마감일 / 체크리스트 / 링크 / 메모 다섯 가지

## 실행

```bash
npm install
cp .env.example .env
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

`.env` 없이도 동작합니다. 값이 없으면 `local` 모드로 떨어집니다.

| 환경변수 | 값 | 기본값 | 설명 |
|---|---|---|---|
| `VITE_STORE_MODE` | `local` \| `http` | `local` | 어떤 저장소 어댑터를 쓸지 |
| `VITE_API_BASE_URL` | URL | (없음) | `http` 모드일 때 API 베이스 주소 |

## 화면

| 뷰 | 설명 |
|---|---|
| 캘린더 | 프로젝트 기간을 월 단위로 세로 나열. 주 시작은 월요일. 업무 칩을 다른 날짜로 드래그하면 마감일이 바뀝니다 |
| 타임라인 | 스트림 7행 × 주 단위 열. 셀 하나에 막대 + "N건 · N%". 셀을 클릭하면 좌측 사이드에 해당 업무 목록이 뜹니다 |
| 현장 | 현장 수행 구간만 D1~D4 4열 시간표로 |

- 좌측 사이드: 오늘 마감 / 이번 주 마감 / 지연
- 상세 패널: 데스크탑은 우측 슬라이드, 모바일(768px 이하)은 하단 시트 (아래로 스와이프하면 닫힘)
- 모바일에서는 캘린더 대신 주차별 아젠다 뷰로 바뀌고, 드래그 이동은 비활성화됩니다 (상세에서 날짜 변경)
- 저장 버튼은 없습니다. 상태·마감일·체크리스트·링크는 즉시 저장, 메모는 800ms 디바운스 자동 저장
- 앱 셸 구조입니다. `body`는 스크롤되지 않고, 헤더(48px) / 뷰탭+툴바(40px)는 고정, 사이드와 본문만 각자 스크롤합니다
- 상세 패널은 **비모달**입니다. 열려 있어도 캘린더는 계속 보이고 클릭할 수 있습니다 (딤 오버레이 없음)
- 툴바 `⋯` 메뉴에서 테마(라이트/다크/시스템)와 밀도(보통/좁게)를 바꿉니다. 선택값은 localStorage(`wbs-calendar:theme`, `wbs-calendar:density`)에 저장되고, `index.html`의 인라인 스크립트가 앱 로드 전에 `data-theme` / `data-density`를 심어 깜빡임을 막습니다
- 툴바에 항상 보이는 컨트롤은 넷입니다 — 뷰 탭, 검색, 필터 버튼, `⋯`. 상태·스트림·지연 토글은 필터 팝오버 안에 모여 있고, 적용된 개수가 버튼에 배지로 표시됩니다
- **스트림·상태 필터는 칩을 지우지 않고 흐리게(opacity .18) 남깁니다.** 캘린더 레이아웃이 흔들리지 않고, 그 날 다른 업무가 있다는 것도 보입니다. 검색만 예외로 매칭된 것만 남기고 일치 구간을 하이라이트합니다

## 단축키

| 키 | 동작 |
|---|---|
| `/` | 검색 입력으로 포커스 |
| `1` `2` `3` | 캘린더 / 타임라인 / 현장 |
| `←` `→` | 이전 달 / 다음 달로 스크롤 (캘린더 뷰에서만) |
| `T` | 오늘 날짜로 스크롤 |
| `Esc` | 상세 패널 · 모달 닫기 |
| `?` | 단축키 목록 |

캘린더 스캔 보조: 주 시작(월요일) 칸 왼쪽에 `--border-strong` 세로선, 오늘이 속한 열 전체에 옅은 브랜드 배경, 오늘 칸만 링 강조, 월이 바뀌는 지점에 2px 구분선.

입력 필드에 포커스가 있을 때는 `Esc`를 제외한 단축키가 동작하지 않습니다. 모바일에서는 전부 비활성입니다.

## 다음 프로젝트에서 재사용하기

프로젝트마다 달라지는 값은 **`src/config/` 세 파일에만** 있습니다. 이 폴더 바깥에는 특정 프로젝트 이름, 날짜, 업무명이 등장하지 않습니다.

### 1. `src/config/project.js` — 프로젝트 기본값

```js
export const PROJECT = {
  name: '프로젝트 이름',
  startDate: '2027-03-02',            // 캘린더 시작일
  endDate: '2027-04-30',              // 캘린더 종료일
  milestone: { date: '2027-04-20', label: '헤더 D-day 기준' },
  onsite: { start: '2027-04-20', end: '2027-04-23', label: '현장 뷰 구간' },
};
```

- `startDate` ~ `endDate` 구간이 통째로 캘린더에 그려집니다. 몇 달이든 상관없습니다
- `onsite` 구간이 현장 뷰의 D1, D2, D3… 열이 됩니다. 4일이 아니어도 됩니다 (열 개수는 자동)
- `onsite` 구간은 캘린더 날짜 칸 상단에 색 띠로도 표시됩니다

### 2. `src/config/streams.js` — 업무 분류

```js
export const STREAMS = [
  { id: 'a', name: '스트림 이름' },
  ...
];
```

- 개수 제한 없음. 타임라인 행 수가 자동으로 따라갑니다
- `id`는 `tasks.js`의 `stream` 값과 연결됩니다
- **색상은 여기 없습니다.** JS는 `data-stream="a"` 속성만 내보내고, 색은 CSS가 붙입니다
- 스트림을 추가하려면 `src/styles/base/_tokens.scss`에 `--stream-h-ink` / `--stream-h-bg` / `--stream-h-border` 세 쌍을 라이트·다크 양쪽에 추가하고, `src/styles/abstracts/_mixins.scss`의 `stream-tokens` 믹스인 `@each` 목록에 `h`를 넣으면 됩니다. JS는 건드릴 필요 없습니다

### 3. `src/config/tasks.js` — 업무 목록

```js
export const TASKS = [
  { id: 'a1', stream: 'a', title: '업무명', due: '2027-03-04' },
  ...
];
```

- `id`는 프로젝트 안에서 고유해야 합니다. 저장된 진행 상태가 이 `id`로 연결됩니다
- `due`는 **초기 배치용 기본 마감일**입니다. 사용자가 드래그하거나 상세에서 날짜를 바꾸면 저장소 값이 이 값을 덮어씁니다
- 정적 정의(`TASKS`)와 진행 상태는 분리되어 있습니다. `tasks.js`를 고쳐도 저장된 상태는 그대로 남습니다

### 4. 교체 절차 요약

1. `src/config/project.js`, `streams.js`, `tasks.js` 세 파일 교체
2. 스트림을 바꿨다면 `src/styles/abstracts/_variables.scss`의 `$stream-colors` 맵도 맞추기
3. 스트림 개수가 7개를 넘으면 `_tokens.scss`의 스트림 토큰과 `_mixins.scss`의 `stream-tokens` 목록 확장
4. `index.html`의 `<title>` 정도만 필요하면 수정
5. 기존 진행 상태가 남아 있으면 앱 툴바의 **초기화**를 한 번 눌러서 비우기
6. `npm run build`

## 백엔드 연동

**`src/lib/store/httpAdapter.js`만 구현하면 됩니다. 화면 코드는 수정 불필요합니다.**

### 구조

```
컴포넌트  →  context/TaskProvider  →  lib/store/index.js  →  localAdapter  (VITE_STORE_MODE=local)
                                                          →  httpAdapter   (VITE_STORE_MODE=http)
```

컴포넌트는 저장소를 직접 건드리지 않습니다. 모든 접근은 아래 네 개 메서드를 통해서만 일어납니다.

```js
createStore() => {
  loadAll(): Promise<TaskState[]>
  update(taskId, patch): Promise<TaskState>
  reset(): Promise<void>
  subscribe(listener): () => void
}
```

- `TaskProvider`가 낙관적 업데이트를 담당합니다. `update()`가 reject하면 화면을 이전 상태로 되돌리고 Toast를 띄웁니다
- `subscribe(listener)`는 **외부에서 데이터가 바뀐 경우**에만 호출하면 됩니다 (다른 탭, 다른 사용자). 자기 자신이 방금 보낸 `update()` 결과로는 호출하지 마세요. `listener(states)`에 전체 `TaskState[]`를 넘기고, 해제 함수를 반환합니다
- localAdapter는 `window.storage` 이벤트로 다른 탭의 변경을 반영합니다. httpAdapter는 SSE / WebSocket / 폴링 중 편한 방식으로 채우면 되고, 비워 둬도 앱은 정상 동작합니다

### TaskState

```json
{
  "taskId": "a1",
  "status": "todo",
  "dueDate": "2026-09-09",
  "memo": "",
  "links": [{ "id": "link-1", "label": "기획안", "url": "https://..." }],
  "checklist": [{ "id": "check-1", "text": "초안 작성", "done": false }],
  "assignee": null,
  "updatedAt": "2026-09-10T04:00:00.000Z"
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `taskId` | string | `config/tasks.js`의 `id`. 진행 상태의 기본키 |
| `status` | `todo` \| `doing` \| `done` \| `hold` | 진행률은 `done`만 완료로 집계 |
| `dueDate` | `YYYY-MM-DD` \| null | null이면 `tasks.js`의 `due`를 사용 |
| `memo` | string | |
| `links` | `{ id, label, url }[]` | |
| `checklist` | `{ id, text, done }[]` | |
| `assignee` | string \| null | **현재 UI에 노출되지 않음.** 나중에 담당자 기능을 붙일 자리 |
| `updatedAt` | ISO datetime | 서버에서 갱신 |

프론트엔드는 응답을 `normalizeTaskState()`로 한 번 걸러서 씁니다. 필드가 빠지거나 타입이 어긋나도 기본값으로 채워지므로, 부분 응답이어도 화면이 깨지지는 않습니다.

### API 스펙

베이스 주소는 `VITE_API_BASE_URL`입니다. 아래 경로는 그 뒤에 붙습니다.

| 메서드 | 엔드포인트 | 호출 시점 | 요청 | 응답 |
|---|---|---|---|---|
| `GET` | `/task-states` | 앱 최초 로드, 재시도 | 없음 | `200` `{ "items": TaskState[] }` |
| `PATCH` | `/task-states/:taskId` | 상태·마감일·체크리스트·링크·메모 변경 | 변경된 필드만 담은 부분 객체 | `200` 갱신된 `TaskState` 전체 |
| `POST` | `/task-states/reset` | 툴바 "초기화" 확인 | 없음 | `204` 또는 `200` |

**`GET /task-states`**

저장된 진행 상태만 반환하면 됩니다. 아직 아무도 건드리지 않은 업무는 **포함하지 않아도 됩니다.** 프론트엔드가 `config/tasks.js`와 조인하면서 없는 것은 기본값으로 채웁니다.

```json
{ "items": [ { "taskId": "a1", "status": "doing", "dueDate": "2026-09-11", "memo": "", "links": [], "checklist": [], "assignee": null, "updatedAt": "2026-09-10T04:00:00.000Z" } ] }
```

**`PATCH /task-states/:taskId`**

요청 본문에는 바뀐 필드만 들어옵니다. 해당 `taskId`의 행이 없으면 만들고, 있으면 병합하는 upsert로 처리해 주세요. 받을 수 있는 필드는 `status`, `dueDate`, `memo`, `links`, `checklist`, `assignee` 여섯 개입니다.

```
PATCH /task-states/a1
Content-Type: application/json

{ "status": "done" }
```

```json
{ "taskId": "a1", "status": "done", "dueDate": "2026-09-09", "memo": "", "links": [], "checklist": [], "assignee": null, "updatedAt": "2026-09-11T02:13:44.000Z" }
```

메모는 타이핑이 멈춘 뒤 800ms에 한 번만 전송됩니다. 체크리스트와 링크는 배열 전체가 통째로 전송됩니다 (부분 갱신 아님).

**`POST /task-states/reset`**

모든 진행 상태를 지웁니다. 되돌릴 수 없는 동작이라 프론트엔드에서 확인 모달을 한 번 거칩니다.

**오류 처리**

`2xx`가 아니면 프론트엔드가 reject으로 처리하고 화면을 롤백한 뒤 Toast를 띄웁니다. 본문 형식은 자유입니다.

### 연동 순서

1. 위 세 엔드포인트를 서버에 구현
2. `src/lib/store/httpAdapter.js`의 `RESOURCE` 상수와 각 메서드를 실제 스펙에 맞게 조정 (경로가 위와 같다면 그대로 써도 됩니다)
3. `.env`에 `VITE_STORE_MODE=http`, `VITE_API_BASE_URL=https://...` 설정
4. 필요하면 `subscribe()`에 실시간 반영 로직 추가

## 폴더 구조

```
src/
├── config/      프로젝트 고유값 (여기만 교체하면 다음 프로젝트에 재사용)
├── constants/   상태·뷰·매직넘버
├── lib/store/   저장소 어댑터 (백엔드 교체 지점)
├── context/     TaskProvider / UiProvider + useReducer
├── hooks/       미디어쿼리, 디바운스, 드래그앤드롭, 테마, 단축키
├── utils/       날짜·캘린더 그리드·진행률·필터·내보내기
├── components/
│   ├── common/    Button Badge Checkbox Select Modal ProgressBar Textarea Toast EmptyState Skeleton Icon
│   ├── layout/    Header ThemeToggle ViewTabs Toolbar SidePanel ShortcutsModal
│   ├── calendar/  CalendarView MonthGrid DayCell TaskChip DayOverflowPopover
│   ├── timeline/  TimelineView TimelineRow TimelineBar
│   ├── onsite/    OnsiteView DayColumn
│   ├── detail/    TaskDetail StatusSelector DueDateField ChecklistEditor LinkList MemoField
│   └── mobile/    AgendaView BottomSheet MobileTabBar
└── styles/
    ├── base/_tokens.scss   색상·간격·폰트·레디우스 CSS 커스텀 프로퍼티 (라이트/다크 단일 원천)
    ├── base/               reset, typography, global
    └── abstracts/          SCSS 믹스인·브레이크포인트·모드 무관 상수
```

### 디자인 토큰

- 색상 값은 **`src/styles/base/_tokens.scss` 한 파일에만** 있습니다. 컴포넌트 SCSS에는 hex도 `rgba()`도 없습니다
- 다크모드는 `:root[data-theme='dark']`와 `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) }` 두 경로를 모두 정의합니다. 사용자가 라이트를 명시적으로 고르면 시스템 설정을 무시합니다
- `--on-solid`은 채도 높은 솔리드 배경 위 고정 흰색입니다. 다크모드에서도 바뀌지 않습니다. 배경/전경이 뒤집히는 `--text-inverse`와 다릅니다
- 밀도 토큰(`--h-control` 30px, `--fs-body` 13.5px, `--radius-control` 5px 등)도 같은 파일에 있습니다. **본문 최소 폰트는 11.5px**이고 그 아래는 쓰지 않습니다
- 밀도 토글은 `:root[data-density='compact']`에서 토큰만 덮어쓰는 방식이라 컴포넌트 코드는 건드리지 않습니다 여백이 아니라 1px 헤어라인으로 구분하는 것이 기본입니다
- 그림자는 **실제로 떠 있는 것에만** 씁니다 — 상세 패널, 팝오버, 모달, 토스트. 카드·칩·날짜 칸·사이드 항목에는 그림자가 없습니다
- 스트림·상태 색은 `data-stream` / `data-status` / `data-overdue` 속성으로 붙습니다. `_mixins.scss`의 `stream-tokens` / `status-tokens` 믹스인이 `--stream-ink|bg|border`, `--status-ink|bg|border`를 채워 줍니다
- **지연은 상태가 아니라 파생값**입니다. `dueDate < today && status !== 'done'`으로 계산해 `data-overdue="true"`로 표시합니다

## 코드 규칙

- 코드에 주석을 달지 않습니다. 의도는 함수명과 변수명으로 드러냅니다 (이 README와 `src/config/project.js`의 설정 안내만 예외)
- 색상·폰트크기·간격·레디우스는 하드코딩하지 않고 `var(--토큰)`을 씁니다. 컴포넌트 SCSS에 hex / `rgba()` 금지 (그림자·오버레이 토큰만 예외)
- 그림자는 `--shadow-sm`(카드) / `--shadow-md`(패널·팝오버) 두 단계, 레디우스는 컨트롤 8 / 카드 12 / 패널 16 / 필 999만 씁니다
- 색만으로 정보를 전달하지 않습니다. 상태는 **색 + 도형**으로 구분합니다 — 대기 = 빈 원, 진행중 = 반쯤 찬 원, 완료 = 체크, 보류 = 가로줄. 지연은 좌측 바가 `--danger`로 덮이고 우측에 `!` 아이콘이 붙습니다
- `--text-tertiary`는 비활성 정보에만 씁니다 — 다른 달 날짜, 플레이스홀더, `+N`, 장식용 아이콘. 라벨과 값은 `--text-secondary` 이상
- 클래스명은 BEM (`.task-chip`, `.task-chip__title`, `.task-chip--done`)
- 폰트 굵기는 400과 500 두 가지만 씁니다
- 문구는 문장형, 마침표 없음. "성공적으로 저장되었습니다"가 아니라 "저장됨"
- 저장 성공은 토스트로 알리지 않습니다. 상세 패널 안 11px "저장됨" 텍스트로만 표시하고, 토스트는 실패했을 때만 띄웁니다
- 로딩은 스피너가 아니라 캘린더 골격 스켈레톤입니다
- 저장소 접근은 반드시 `lib/store/`를 거칩니다

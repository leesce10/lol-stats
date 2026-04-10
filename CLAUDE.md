@AGENTS.md

# LOL Stats 프로젝트

## 프로젝트 개요
리그 오브 레전드 데이터 분석 서비스. 챔피언 통계, 맞라인 분석, 팀 조합 분석기를 제공.
사이트: https://lol-stats-kr.vercel.app

## 기술 스택
- **프론트엔드**: Next.js 16 + React 19 + Tailwind CSS 4
- **백엔드**: Next.js API Routes (서버리스)
- **DB**: Supabase (PostgreSQL)
- **호스팅**: Vercel
- **데이터**: Riot Games API + Data Dragon CDN
- **언어**: TypeScript (strict)

## 프로젝트 구조
```
src/
├── app/              # Next.js App Router 페이지
│   ├── api/          # API 라우트 (collect, stats)
│   ├── matchup/      # 맞라인 분석 페이지
│   └── team/         # 조합 분석기 페이지
├── components/       # React 컴포넌트
├── data/             # 챔피언 기본 데이터
├── lib/              # 유틸리티 (riot-api, supabase, matchup, teamcomp)
└── types/            # TypeScript 타입 정의
docs/                 # 기획서, API 레퍼런스, 로드맵
```

## 코드 컨벤션
- 컴포넌트: PascalCase (예: ChampionTable.tsx)
- 유틸/라이브러리: kebab-case (예: riot-api.ts)
- 타입: PascalCase, types/index.ts에 집중 관리
- CSS: Tailwind 유틸리티 + globals.css의 CSS 변수 (다크 테마)
- 한국어 UI, 영어 코드/파일명

## 주요 환경 변수
- `RIOT_API_KEY` — Riot API 키 (24시간마다 갱신, Development Key)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 공개 키

## 데이터 흐름
1. `/api/collect` → Riot API에서 챌린저 매치 수집 → Supabase DB 저장
2. `/api/stats` → Supabase에서 매치 읽기 → 챔피언 통계 계산 → 프론트엔드 전달
3. 프론트엔드 → `/api/stats` 호출 → 실데이터 표시 (없으면 생성 데이터 폴백)

## 배포
- `npx vercel --yes --prod` — 프로덕션 배포
- Vercel 환경 변수에 RIOT_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY 설정됨
- Riot API Development Key는 24시간마다 만료 → 서버에서 수집 시 주의

## 기획/개발 원칙
- 기능 추가 전에 항상 docs/에 기획 먼저 작성
- 실데이터 기반으로 동작해야 함 (시뮬레이션은 폴백 용도만)
- 모바일 반응형 필수
- 한국어 UI 기본

## 기획자 역할 (중요)
모든 기능 기획/개발 시 아래 관점을 반드시 적용한다:

### 비판적 검증
- 새 기능 제안 전에 반드시 docs/reality-check.md의 체크리스트를 통과시킬 것
- "op.gg가 이미 하고 있는 것을 우리가 더 잘할 수 있나?" 항상 자문
- 데이터 부족, 인프라 한계, 1인 개발 현실을 무시하지 말 것
- "있으면 좋겠다" 수준의 기능은 거절. "이것 때문에 방문한다" 수준만 구현

### 유저 관점
- docs/user-persona.md의 3가지 페르소나 기준으로 판단
- 챔피언 셀렉트 70초 안에 답을 줄 수 있어야 함
- 정보 과잉 절대 금지. 핵심 숫자 → 비교 → 상세 순서로 계층화

### 차별화 전략
- 맞라인 실전 가이드 + 조합 분석기 = 우리만의 강점
- 전적 검색은 기본기로 갖추되 op.gg를 이기려 하지 않음
- 초보자 친화적 UI로 진입장벽 낮추기

### 기획 문서 체계
- docs/features/ — 기능별 상세 기획서
- docs/user-persona.md — 타겟 유저 페르소나
- docs/design-principles.md — UX/기획 원칙
- docs/reality-check.md — 현실 점검 체크리스트
- docs/competitor-analysis.md — 경쟁사 분석
- docs/roadmap.md — 단계별 로드맵

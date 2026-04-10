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

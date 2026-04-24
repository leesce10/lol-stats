# Riot Games Production API Key 신청서 (초안)

신청 제출 위치: https://developer.riotgames.com/app-type

---

## Application Type
**Personal API Key** (무료, 트래픽이 제한적인 개인 프로젝트)

> Personal Key로 먼저 신청 → 유저 유입 증가 후 Production Key로 재신청 권장.
> Personal Key 승인까지 통상 **1~4주** 소요.

---

## Project Details

### Product name
LOL Stats

### Product URL
https://lol-stats-kr.vercel.app

### Product logo
> 업로드 필요: 128×128 PNG. 현재 사이트 로고(그라데이션 L) 추출해서 업로드.

### Product category
- **Game Analytics / Statistics**
- Champion matchup & team composition analyzer

### Rate limit requirements
- 현재 예상: 20 req/sec, 100 req/2min (기본값으로 충분)
- 사유: 하루 1회 챌린저+그랜드마스터 매치 수집(약 300경기), 그 외는 소환사 검색 on-demand

---

## Product Description (영문, 신청서 Description 필드에 붙여넣기용)

```
LOL Stats is a Korean-language League of Legends matchup analyzer
focused on the champion select decision phase. Unlike aggregator sites
that focus on post-game review, LOL Stats provides positioning and
combo-denial guidance in the ~70 seconds players have before the game
starts.

Primary features:
1. Matchup Guide — a rule-based engine that produces lane-aware
   (top/jungle/mid/ADC/support) L0~L4 tactical guides for any champion
   pair: verdict, 3-line summary, threat response cards, power spike
   comparison, build adaptations, phase-by-phase tactics, and
   matchup-specific tips.

2. Team Composition Analyzer — a 5v5 composition evaluator that scores
   balance (tank/AD/AP/CC), identifies strengths and weaknesses, and
   predicts relative win probability.

3. Champion Statistics — tier list with win rate, pick rate, ban rate
   by position; detailed per-champion guide pages with builds and runes.

Data needs:
- Match-V5 endpoints: fetch Challenger/Grandmaster match IDs daily
  (~300 matches) for Korean server statistics.
- Summoner-V4 / League-V4: power the high-tier player lookup for
  match collection.
- Future: Spectator-V5 for live-game composition detection (stretch
  goal, not yet implemented).

Compliance:
- Privacy policy: https://lol-stats-kr.vercel.app/privacy
- Terms of service: https://lol-stats-kr.vercel.app/terms
- Footer carries the mandated "not endorsed by Riot Games" disclaimer
  in Korean and English on every page.
- No monetization at this time (no ads, no paid tier).
- No scraping of Riot APIs or third-party services. All data either
  comes from the official Data Dragon CDN, direct Riot API calls, or
  static patch-tagged content I author manually.

Audience: Korean solo queue players, primarily Gold-Diamond tier.
Mobile-first responsive UI.

Development status: MVP deployed on Vercel, open source on GitHub.
Single developer (hobbyist). Patch 15.7.
```

---

## Compliance Checklist

아래 항목 모두 통과한 상태 (Production Key 신청 전 필수):

- [x] **작동하는 공개 사이트** — Vercel 배포, 모든 핵심 라우트 200 OK
- [x] **Privacy Policy 페이지** — `/privacy` (한국어)
- [x] **Terms of Service 페이지** — `/terms` (한국어 + 영문 Riot 면책)
- [x] **Riot 면책 문구** — 모든 페이지 Footer에 한/영 병기
  ```
  LOL Stats isn't endorsed by Riot Games and doesn't reflect the views
  or opinions of Riot Games or anyone officially involved in producing
  or managing Riot Games properties.
  ```
- [x] **타 서비스 브랜드 언급 제거** — op.gg, lol.ps 등 문자열 0건 확인
- [x] **타 서비스 데이터 직접 사용 표기 제거** — 데이터 출처 라벨을 중립적인 "KR Emerald+ 벤치마크"로 교체
- [x] **연락 가능한 이메일** — hobbying.dev1@gmail.com (Privacy/Terms에 명시)
- [x] **명확한 사용 용도** — 챔셀 의사결정 도구 (op.gg 대체가 아닌 보완)
- [x] **Rate limit 준수 로직** — `src/lib/riot-api.ts`에 내장된 재시도 + backoff

---

## 신청 전 마지막 체크

1. **로고 파일 준비** — Vercel 사이트의 L 아이콘을 128×128 PNG로 추출
2. **신청서 영문 검수** — 위 Description 필드 그대로 붙여 넣을 준비됨
3. **Riot 계정 Developer Portal 로그인** — https://developer.riotgames.com/
4. **신청 후 대기 기간 동안 Development Key로 수집 계속** — 24시간 갱신 작업 지속

---

## 신청 후 예상 리스크

| 리스크 | 대응 |
|---|---|
| 승인 거절: "기능이 op.gg와 유사" | 신청서 Description에 **"positioning + combo-denial pre-game tool"** 프레임 강조. matchup 가이드 페이지 스크린샷 첨부 권장 |
| 승인 거절: "데이터 소스 불명확" | 현재 비어있는 `/stats` 페이지를 Development Key로 수집한 소량 데이터(50~100경기)라도 채워 표시 |
| 승인 거절: "활성 유저 없음" | Personal Key는 유저 수 요구 없음. Production Key 신청 시엔 필요 |

---

## 재신청 시 조건

Personal Key가 부족해지는 시점 (일 활성 유저 수백 명 또는 수집 주기 시간 단위):
1. Production Key 재신청
2. 신청서에 **사용자 트래픽 지표** (GA4 or Vercel Analytics 스크린샷)
3. 요구 Rate limit 명시

---

최종 수정: 2026-04-25

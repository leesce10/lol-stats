# `/api/live/*` — 오버레이용 백엔드 API 설계

> 오버레이 데스크톱 앱([lol-overlay](https://github.com/leesce10/lol-overlay))이 호출하는 서버 API.
> 인게임/게임시작 시 **남의 전적 분석**을 백엔드에서 처리해 돌려준다.
> 관련: [ingame-overlay.md](./ingame-overlay.md)

---

## 1. 왜 백엔드가 필요한가

- **Riot API 키를 데스크톱 앱에 넣으면 안 된다**(설치파일에서 추출됨). 키는 서버에만 둔다.
- 라인 평가·티어 계산 로직(`src/lib/stats-calculator.ts`, `matchup.ts` 등)을 재사용.
- 캐싱·레이트리밋을 서버에서 통제(같은 게임 참가자를 여러 유저가 조회 → 캐시 히트).

```
[lol-overlay]  --(participants)-->  [lol-stats /api/live/team-analysis]
   LCU/Live Client Data에서             Riot API로 각자 최근 전적 조회
   참가자 명단 수집                      → 라인별 폼 + 팀운 계산 → JSON
```

---

## 2. 엔드포인트

### `POST /api/live/team-analysis`

게임 시작 시 양팀(또는 우리팀) 참가자 명단을 받아 라인별 평가 + 팀운을 반환.

**Request**
```jsonc
{
  "region": "kr",
  "participants": [
    {
      "riotId": "소환사명#KR1",   // LCU에서 획득 (없으면 puuid)
      "puuid": null,              // 있으면 우선 사용
      "championId": 103,
      "teamId": 100,              // 100=블루(ORDER), 200=레드(CHAOS)
      "position": "MIDDLE"        // TOP|JUNGLE|MIDDLE|BOTTOM|UTILITY
    }
    // ... 최대 10명
  ]
}
```

**Response** (`200`)
```jsonc
{
  "ok": true,
  "generatedAt": "2026-06-11T05:00:00.000Z",
  "source": "mock",              // "mock" | "live" — 프로덕션 키 승인 전엔 항상 mock
  "team": {
    "luck": {
      "score": -1,               // -2..+2
      "label": "팀운 나쁜 편",
      "reason": "우리팀 평균 최근 폼이 상대보다 낮음"
    },
    "lanes": [
      {
        "teamId": 100,
        "position": "TOP",
        "riotId": "소환사명#KR1",
        "championName": "Aatrox",
        "recentGames": 20,
        "winRate": 0.55,
        "form": "good",          // "good" | "neutral" | "struggling"
        "note": "최근 20판 승률 55% — 폼 좋음",
        "onChampion": { "games": 8, "winRate": 0.62 }  // 해당 챔피언 숙련도
      }
      // ...
    ]
  }
}
```

**상태코드**: `200` 성공 / `400` 잘못된 body / `429` 레이트리밋 / `503` 라이브 비활성(프로덕션 키 없음 → mock 폴백이므로 실제로는 거의 안 씀)

**CORS**: 오버레이는 다른 origin(overwolf-extension://…)에서 호출 → `Access-Control-Allow-Origin` + `OPTIONS` 프리플라이트 지원.

---

## 3. 평가 로직 (heuristic 초안)

- **form (라인별)**: 최근 N판(기본 20) 승률 기준.
  - `≥ 0.55` → `good`, `≤ 0.45` → `struggling`, 그 외 `neutral`.
  - 표본 부족(< 5판)은 `neutral` + "표본 적음" 표기.
- **onChampion**: 같은 챔피언 최근 전적 승률/판수.
- **luck (팀운)**: 우리팀 라인 form 평균 − 상대팀 평균 → -2..+2 버킷.
  - ⚠️ "팀운"은 근거 약한 멘트 위험(reality-check). **데이터로 뒷받침되는 표현만** 사용하고, 단정("진다") 금지 — "상대 라인들이 폼이 더 좋은 편" 수준으로.

> 정밀 튜닝은 실데이터 확보 후. 1차는 위 단순 규칙으로 충분.

---

## 4. 구현 단계

| 단계 | 내용 | Riot 키 |
|------|------|---------|
| **지금** | `team-analysis` 스텁 — `source:"mock"` 반환. 오버레이가 계약에 맞춰 통합 개발 시작 가능. | 불필요 |
| **프로덕션 키 승인 후** | 실제 구현: riot-id→puuid, 최근 매치 조회, form 계산 → `source:"live"`. | **필수** |

### 라이브 구현에 추가로 필요한 `src/lib/riot-api.ts` 함수 (아직 없음 → TODO)
- `getAccountByRiotId(gameName, tagLine)` — account-v1, riot-id → puuid
- `getActiveGameByPuuid(puuid)` — spectator-v5 (게임 중 참가자/챔피언 확인용, 선택)
- 기존 `getMatchIds` / `getMatchDetail`은 그대로 재사용

### 캐싱
- 참가자 puuid 단위로 분석 결과를 단기 캐시(예: 게임당 1회). Supabase 또는 메모리.

---

## 5. 현재 구현 상태

- ✅ `POST /api/live/team-analysis` 스텁 ([src/app/api/live/team-analysis/route.ts](../../src/app/api/live/team-analysis/route.ts)) — mock 반환, CORS·OPTIONS 지원, body 검증.
- ✅ 평가 타입 + mock 빌더 ([src/lib/live-analysis.ts](../../src/lib/live-analysis.ts)).
- ⏳ 라이브 경로(실제 Riot 조회)는 프로덕션 키 승인 후. 코드에 `TODO(live)` 표시.

*작성: 2026-06-11.*

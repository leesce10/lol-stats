# Riot Games League of Legends API 레퍼런스

---

## 공통 기본 정보

### API 키 종류

| 키 종류 | 용도 | Rate Limit |
|---------|------|-----------|
| **Development Key** | 개인 개발/테스트, 24시간마다 갱신 | 20 req/1초, 100 req/2분 |
| **Personal Key** | 개인 사이트, 학교 프로젝트 | Riot 승인 후 발급, 제한 완화 |
| **Production Key** | 실제 서비스 운영, Riot 심사 필요 | 용도별 협의 (보통 3,000 req/10초) |

### 라우팅

**플랫폼 라우팅** (Summoner, League, Mastery 등):
- 한국: `kr.api.riotgames.com`

**지역 라우팅** (Match, Account):
- 한국: `asia.api.riotgames.com`

---

## 1. Account V1 — 계정 조회

Riot ID(닉네임#태그)로 플레이어를 찾는 진입점.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}` | Riot ID로 조회 |
| GET | `/riot/account/v1/accounts/by-puuid/{puuid}` | PUUID로 조회 |

### 응답 데이터
```json
{
  "puuid": "string (78자)",
  "gameName": "Hide on bush",
  "tagLine": "KR1"
}
```

### 활용
- 소환사 검색 기능의 첫 번째 단계
- PUUID 획득 → 다른 모든 API의 키로 사용

---

## 2. Summoner V4 — 소환사 정보

레벨, 프로필 아이콘 등 LoL 계정 기본 정보.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/summoner/v4/summoners/by-puuid/{puuid}` | PUUID로 조회 |

### 응답 데이터
```json
{
  "puuid": "string",
  "profileIconId": 4568,
  "revisionDate": 1712345678000,
  "summonerLevel": 312
}
```

### 활용
- 프로필 페이지 (레벨, 아이콘 표시)

---

## 3. League V4 — 랭크 정보

티어, LP, 승패 등 랭크 데이터.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/league/v4/entries/by-puuid/{puuid}` | 개인 랭크 조회 |
| GET | `/lol/league/v4/entries/{queue}/{tier}/{division}` | 티어별 목록 |
| GET | `/lol/league/v4/challengerleagues/by-queue/{queue}` | 챌린저 전체 |
| GET | `/lol/league/v4/grandmasterleagues/by-queue/{queue}` | 그랜드마스터 전체 |
| GET | `/lol/league/v4/masterleagues/by-queue/{queue}` | 마스터 전체 |

`queue` 값: `RANKED_SOLO_5x5`, `RANKED_FLEX_SR`

### 응답 데이터 (개인 랭크)
```json
{
  "puuid": "string",
  "queueType": "RANKED_SOLO_5x5",
  "tier": "DIAMOND",
  "rank": "I",
  "leaguePoints": 75,
  "wins": 120,
  "losses": 98,
  "hotStreak": false,
  "veteran": true,
  "freshBlood": false,
  "inactive": false
}
```

### 활용
- 소환사 랭크 표시 (op.gg 스타일)
- 챌린저 랭킹보드
- **우리 서비스**: 챌린저 플레이어 목록 → 매치 수집 시작점

---

## 4. Match V5 — 매치 데이터 (핵심)

모든 게임 결과, 참가자 상세 통계. **가장 중요한 API.**

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/match/v5/matches/by-puuid/{puuid}/ids` | 매치 ID 목록 |
| GET | `/lol/match/v5/matches/{matchId}` | 매치 상세 |
| GET | `/lol/match/v5/matches/{matchId}/timeline` | 타임라인 (분 단위 이벤트) |

### 매치 ID 목록 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `queue` | int | 큐 ID (420=솔랭, 440=자랭, 450=칼바람) |
| `type` | string | `ranked`, `normal`, `tourney` |
| `start` | int | 시작 오프셋 (기본 0) |
| `count` | int | 결과 수 (기본 20, 최대 100) |
| `startTime` | long | 시작 시간 (epoch seconds) |
| `endTime` | long | 종료 시간 (epoch seconds) |

### 매치 상세 응답 — 참가자 데이터 (1명 기준)

```json
{
  // === 기본 정보 ===
  "puuid": "string",
  "riotIdGameName": "Hide on bush",
  "riotIdTagline": "KR1",
  "teamId": 100,
  "win": true,

  // === 챔피언 ===
  "championId": 157,
  "championName": "Yasuo",
  "champLevel": 18,

  // === 포지션 ===
  "teamPosition": "MIDDLE",    // TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY

  // === KDA ===
  "kills": 12,
  "deaths": 3,
  "assists": 7,

  // === 데미지 ===
  "totalDamageDealtToChampions": 38500,
  "physicalDamageDealtToChampions": 35000,
  "magicDamageDealtToChampions": 2500,
  "trueDamageDealtToChampions": 1000,
  "totalDamageTaken": 22000,

  // === 경제 ===
  "goldEarned": 15800,
  "totalMinionsKilled": 245,
  "neutralMinionsKilled": 12,

  // === 시야 ===
  "visionScore": 42,
  "wardsPlaced": 25,
  "wardsKilled": 12,

  // === 아이템 (슬롯 0~6) ===
  "item0": 3031,
  "item1": 6672,
  "item2": 3036,
  "item3": 3033,
  "item4": 3046,
  "item5": 1038,
  "item6": 3340,

  // === 소환사 주문 ===
  "summoner1Id": 4,      // 점멸
  "summoner2Id": 14,     // 점화

  // === 룬 ===
  "perks": {
    "statPerks": { "defense": 5002, "flex": 5008, "offense": 5005 },
    "styles": [
      {
        "description": "primaryStyle",
        "style": 8000,
        "selections": [
          { "perk": 8021, "var1": 1800, "var2": 0, "var3": 0 }
        ]
      },
      {
        "description": "subStyle",
        "style": 8200,
        "selections": [...]
      }
    ]
  },

  // === 오브젝트 기여 ===
  "baronKills": 1,
  "dragonKills": 2,
  "turretKills": 3,
  "inhibitorKills": 1
}
```

### 매치 상세 응답 — 팀 데이터

```json
{
  "teamId": 100,
  "win": true,
  "bans": [
    { "championId": 157, "pickTurn": 1 }
  ],
  "objectives": {
    "baron":      { "first": true, "kills": 2 },
    "dragon":     { "first": true, "kills": 3 },
    "riftHerald": { "first": true, "kills": 1 },
    "tower":      { "first": true, "kills": 9 },
    "inhibitor":  { "first": true, "kills": 2 },
    "champion":   { "first": true, "kills": 45 }
  }
}
```

### 활용
- **전적 검색** (KDA, 아이템, 룬, 데미지 등)
- **챔피언 통계** (승률, 픽률, 밴률 계산)
- **빌드 추천** (가장 많이 사용되는 아이템/룬 조합)
- **AI 게임 예측 모델** 훈련 데이터
- **우리 서비스**: 챔피언별 승률/포지션 통계 계산

---

## 5. Champion Mastery V4 — 챔피언 숙련도

플레이어의 챔피언별 숙련도(마스터리) 정보.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}` | 전체 마스터리 |
| GET | `.../by-puuid/{puuid}/by-champion/{championId}` | 특정 챔피언 |
| GET | `.../by-puuid/{puuid}/top?count=5` | 상위 N개 |
| GET | `/lol/champion-mastery/v4/scores/by-puuid/{puuid}` | 총 점수 |

### 응답 데이터
```json
{
  "championId": 157,
  "championLevel": 10,
  "championPoints": 258000,
  "chestGranted": true,
  "lastPlayTime": 1712345678000,
  "tokensEarned": 1
}
```

### 활용
- 주력 챔피언 표시
- "원챔" 분석

---

## 6. Champion V3 — 무료 로테이션

이번 주 무료 챔피언 목록.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/platform/v3/champion-rotations` | 무료 챔피언 목록 |

### 응답 데이터
```json
{
  "freeChampionIds": [17, 20, 23, 35, 54, 55, 86, 98, 134, 141, 222, 238, 518, 777],
  "freeChampionIdsForNewPlayers": [12, 32, 80, 86, 121, 150, 154, 238, 350, 516],
  "maxNewPlayerLevel": 10
}
```

### 활용
- 이번 주 무료 챔피언 알림

---

## 7. Spectator V5 — 실시간 게임

현재 진행 중인 라이브 게임 정보.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/spectator/v5/active-games/by-summoner/{puuid}` | 실시간 게임 조회 |
| GET | `/lol/spectator/v5/featured-games` | 주목할만한 게임 목록 |

### 응답 데이터 (실시간 게임)
```json
{
  "gameId": 7234567890,
  "gameStartTime": 1712345678000,
  "gameLength": 823,
  "gameMode": "CLASSIC",
  "gameQueueConfigId": 420,
  "bannedChampions": [
    { "championId": 157, "teamId": 100, "pickTurn": 1 }
  ],
  "participants": [
    {
      "puuid": "string",
      "championId": 157,
      "teamId": 100,
      "spell1Id": 4,
      "spell2Id": 14,
      "perks": {
        "perkIds": [8021, 9111, 9104, 8014, 8009, 8299],
        "perkStyle": 8000,
        "perkSubStyle": 8200
      }
    }
  ]
}
```

### 활용
- "지금 게임 중" 표시
- 인게임 상대방 룬/스펠 확인
- 실시간 매치 분석 오버레이

---

## 8. Clash V1 — 클래시 토너먼트

정기 토너먼트 정보.

### 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/lol/clash/v1/players/by-puuid/{puuid}` | 플레이어 Clash 정보 |
| GET | `/lol/clash/v1/teams/{teamId}` | 팀 정보 |
| GET | `/lol/clash/v1/tournaments` | 전체 토너먼트 목록 |

### 활용
- Clash 일정 알림
- 팀 구성 도우미

---

## 9. Data Dragon (CDN) — 정적 데이터 & 이미지

**API 키 불필요. Rate Limit 없음.**

### 버전 확인
```
GET https://ddragon.leagueoflegends.com/api/versions.json
→ ["15.7.1", "15.6.1", ...]
```

### 데이터 파일

| 리소스 | URL | 설명 |
|--------|-----|------|
| 챔피언 목록 | `/cdn/{ver}/data/ko_KR/champion.json` | 이름, 태그, 기본 스탯 |
| 챔피언 상세 | `/cdn/{ver}/data/ko_KR/champion/{Name}.json` | 스킬, 스킨, 상세 스탯 |
| 아이템 | `/cdn/{ver}/data/ko_KR/item.json` | 모든 아이템 정보 |
| 소환사 주문 | `/cdn/{ver}/data/ko_KR/summoner.json` | 소환사 스펠 정보 |
| 룬 | `/cdn/{ver}/data/ko_KR/runesReforged.json` | 룬 트리 및 상세 |

### 이미지 URL

| 종류 | URL 패턴 |
|------|---------|
| 챔피언 아이콘 | `/cdn/{ver}/img/champion/{Name}.png` |
| 챔피언 스플래시 | `/cdn/img/champion/splash/{Name}_0.jpg` |
| 로딩 화면 | `/cdn/img/champion/loading/{Name}_0.jpg` |
| 스킬 아이콘 | `/cdn/{ver}/img/spell/{SpellName}.png` |
| 아이템 아이콘 | `/cdn/{ver}/img/item/{ItemId}.png` |
| 프로필 아이콘 | `/cdn/{ver}/img/profileicon/{IconId}.png` |

### champion.json 주요 필드
```json
{
  "Yasuo": {
    "id": "Yasuo",
    "key": "157",
    "name": "야스오",
    "title": "용서받지 못한 자",
    "tags": ["Fighter", "Assassin"],
    "info": { "attack": 8, "defense": 4, "magic": 3, "difficulty": 10 },
    "stats": {
      "hp": 500, "hpperlevel": 95,
      "armor": 30, "armorperlevel": 4.7,
      "attackdamage": 60, "attackdamageperlevel": 3,
      "attackrange": 175,
      "attackspeed": 0.67
    }
  }
}
```

---

## 부록: 큐 ID 참조표

| Queue ID | 설명 |
|---------|------|
| 420 | 솔로 랭크 |
| 440 | 자유 랭크 |
| 450 | 칼바람 나락 (ARAM) |
| 430 | 일반 (블라인드) |
| 400 | 일반 (드래프트) |
| 490 | 빠른 대전 |
| 700 | Clash |
| 900 | ARURF |
| 1700 | 아레나 |

---

## 부록: 전형적인 API 호출 흐름

플레이어 검색: `"Hide on bush#KR1"` → 전적 조회

```
1. Account V1  →  Riot ID로 PUUID 획득
2. Summoner V4 →  레벨, 프로필 아이콘
3. League V4   →  솔로랭크 티어, LP, 승패
4. Mastery V4  →  주력 챔피언 TOP 5
5. Match V5    →  최근 20게임 ID 목록 → 각 매치 상세 조회
6. Spectator V5→  현재 게임 중 여부
7. Data Dragon →  챔피언/아이템 이미지 (API 키 불필요)
```

---

## 우리 서비스에서 현재 사용 중인 API

| API | 용도 |
|-----|------|
| League V4 (챌린저) | 상위 플레이어 PUUID 수집 |
| Match V5 (매치 ID) | 최근 솔로랭크 매치 목록 |
| Match V5 (매치 상세) | 챔피언, 승패, KDA, 포지션 추출 |
| Data Dragon | 챔피언 이미지 로딩 |

## 추가 활용 가능한 API

| API | 추가할 수 있는 기능 |
|-----|-------------------|
| Account V1 + Summoner V4 | 소환사 전적 검색 |
| League V4 (개인) | 검색한 소환사의 랭크 표시 |
| Mastery V4 | 주력 챔피언 표시 |
| Spectator V5 | "지금 게임 중" + 실시간 상대 분석 |
| Match V5 (타임라인) | 분 단위 골드차, 킬 타이밍 분석 |
| Match V5 (아이템/룬) | 챔피언별 추천 빌드/룬 |

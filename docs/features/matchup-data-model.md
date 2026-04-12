# 맞라인 v2 — 데이터 모델 설계

> 이 문서는 `matchup-v2.md` 기획서의 데이터 계층을 상세 정의한다.
> 타입 정의: `src/types/matchup-engine.ts`

---

## 1. 아키텍처 개요

```
[입력 데이터]                    [룰 엔진]              [출력]
                              
champion-profiles/*.json  ──→  matchup-engine.ts  ──→  MatchupGuide
  (JungleChampionProfile)       (순수 결정론적)          (L0~L4 전부)
                                     ↑
ddragon/champions/*.json  ──→  (쿨타임/사거리 보정)
  (DDragon 원본)
```

- **입력**: 챔피언 프로파일 JSON + DDragon 원본
- **처리**: 룰 엔진 (LLM 호출 없음)
- **출력**: MatchupGuide 구조체 → 프론트엔드 렌더

---

## 2. 챔피언 프로파일 스키마 (JungleChampionProfile)

### 2.1 메타 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 챔피언 ID. ChampionData.id와 동일 |
| `name` | string | 한국어 이름 |
| `nameEn` | string | 영어 이름 |
| `position` | "jungle" | v2.0은 정글만 |
| `patch` | string | 이 프로파일이 태깅된 패치 |

### 2.2 프로파일 (profile)

정량적 능력 등급. 모든 필드는 **다른 챔피언과의 상대 비교**에 사용됨.

| 필드 | 타입 | 룰 엔진 사용처 | 티어 기준 |
|---|---|---|---|
| `clearSpeed` | Tier | L0 승률, L3 동선 | S=왕겐, A=빠름, B=보통, C=느림, D=매우느림 |
| `earlyDuel` | Tier | L0 판정, L1 요약, L2 파워스파이크 | S=3렙 듀얼 최강, D=3렙 1:1 못함 |
| `midDuel` | Tier | L0 판정, L3 중반 | S=6~11렙 듀얼 최강, D=못함 |
| `lateDuel` | Tier | L0 판정, L3 후반 | S=풀빌드 1:1 최강, D=못함 |
| `gankPower` | Tier | L3 갱 가이드 | S=리신/엘리스급, D=샤이바나급 |
| `scaling` | ScalingPhase | L1 3번째 줄, L3 전체 | early/mid/late 중 피크 구간 |
| `mobility` | IntensityLevel | L2 반격 윈도우 action, L4-B | high/medium/low |
| `burst` | IntensityLevel | L2 빌드, L4-B | high/medium/low |
| `sustain` | IntensityLevel | L2 빌드, L3 페이즈 | high/medium/low |
| `ccTypes` | string[] | L2 빌드 추천, L4-B 변형 | slow/knockup/stun/knockback/suppress 등 |

**티어 숫자 매핑** (룰 엔진 내부):
```
S=5, A=4, B=3, C=2, D=1
티어 차이 2 이상 = "압도적" 유불리
티어 차이 1 = "약간" 유불리
티어 차이 0 = "비등"
```

### 2.3 파워 커브

| 필드 | 타입 | 설명 |
|---|---|---|
| `powerSpikes` | number[] | 파워 스파이크 레벨 (예: [3, 6, 11]) |
| `weakAfter` | number \| null | 이 레벨 이후 약화 (null = 계속 강함) |

**사용처**: L2 카드 3 (파워 스파이크 타임라인), L1 3번째 줄, L3 페이즈 분류

### 2.4 핵심 스킬 (keySkills)

전투에 핵심적인 스킬만 기재. 패시브(P)는 전투 관련 시만.

| 필드 | 타입 | 설명 | 룰 사용처 |
|---|---|---|---|
| `key` | SkillKey | Q/W/E/R/P | 식별자 |
| `name` | string | 한국어 스킬명 | UI 표시 |
| `type` | SkillType | 스킬 유형 | L2 카드 1 표시 |
| `roles` | SkillRole[] | 스킬 역할 (복수) | 룰 매칭 |
| `missPenalty` | MissPenalty | 빗나감 패널티 | **핵심**. L0 본질, L1 1번줄, L2 카드 1 |
| `hitEnables` | string[] | 적중 시 활성화 | L2 카드 1 hit_consequence 생성 |
| `counterMethod` | string | 피하는 법 | L2 카드 1 직접 출력 |
| `range` | number? | 사거리 (DDragon) | L2 카드 1 표시 |
| `cooldownEarly` | number? | 1렙 쿨타임 (DDragon) | L2 카드 1/2 표시 |
| `cooldownMaxRank` | number? | 만렙 쿨타임 (DDragon) | 참고용 |

**missPenalty 판정 기준**:
- `critical`: 이 스킬 빗나가면 다른 핵심 스킬이 연계 불가 (리신 Q → Q2 봉인)
- `high`: 주요 딜 or 유틸 대폭 손실이지만 다른 수단 있음 (블리츠 Q)
- `medium`: 딜 감소지만 다른 스킬로 보완 (제드 Q)
- `low`: 영향 적음 (대부분 E급 보조 스킬)
- `none`: 빗나갈 수 없음 (논타겟, 자가버프)

### 2.5 반격 트리거 (punishTriggers)

**시스템의 차별화 핵심.** "이 스킬 빠지면 N초 동안 기회"를 구조화.

| 필드 | 타입 | 설명 |
|---|---|---|
| `condition` | string | 설명적 ID (Q_missed, W_used, R_used 등) |
| `skillKey` | SkillKey? | 어떤 스킬 기반인지 |
| `windowSec` | number | 반격 가능 시간 (초). 보통 해당 스킬 쿨타임 기반 |
| `severity` | "critical" \| "high" \| "medium" | 기회의 크기 |
| `explanation` | string | 왜 이게 기회인지 서술 |

**severity 기준**:
- `critical`: 상대 풀콤보 자체가 성립 안 됨 (리신 Q 빗나감)
- `high`: 중요 능력 빠짐 (이동기, 실드 등)
- `medium`: 일부 능력 감소

### 2.6 페이즈 전략 (phases)

각 페이즈(early/mid/late)마다 6개 필드. L3 생성의 주 입력.

| 필드 | 설명 | 출력 매핑 |
|---|---|---|
| `goal` | 이 구간에서 본인이 달성해야 할 것 | L3 "핵심 목표" |
| `danger` | 이 구간의 위험 요소 | L3 "상대의 의도" 생성에 참조 |
| `opportunity` | 이 구간의 기회 | L3 "활용 타이밍" 생성에 참조 |
| `pathing` | 추천 동선 (정글 전용) | L3 "동선/오브젝트" |
| `objective` | 오브젝트 우선순위 (정글 전용) | L3 "동선/오브젝트" |
| `gank` | 갱/카정 가이드 (정글 전용) | L3 "카정/갱 가이드" |

**룰 엔진의 역할**: 양 챔프의 phase 필드를 **교차 조합**해서 L3 출력 생성.
- 예: 내 early.goal + 상대 early.danger → L3 early의 "핵심 목표" + "상대의 의도"
- 예: 내 early.opportunity + 상대 punishTriggers → L3 early의 "활용 타이밍"

### 2.7 빌드 적응 (buildAdaptations)

매치업에 따른 빌드 변형 추천.

| 필드 | 설명 |
|---|---|
| `condition` | 조건 ID. 룰 엔진이 상대 프로파일과 매칭 |
| `recommendation` | 추천 아이템/룬/스펠 |
| `reason` | 왜 이 변형인지 1줄 |

**조건 ID 표준 목록** (확장 가능):
```
enemy_burst_high       — 상대 burst가 high
enemy_sustain_high     — 상대 sustain이 high
enemy_cc_hard          — 상대 ccTypes에 stun/knockup/suppress 포함
enemy_mobility_high    — 상대 mobility가 high
enemy_scaling_late     — 상대 scaling이 late
enemy_tank_heavy       — 상대 classes에 tank 포함
enemy_range_ranged     — 상대 range가 ranged
enemy_duel_early_S     — 상대 earlyDuel이 S
```

### 2.8 약점/강점 태그

룰 엔진이 양 챔프 태그를 교차 매칭해 L4-B 변형 생성.

**vulnerabilities 표준 태그**:
```
cc_locked        — CC에 매우 취약
no_sustain       — 자가 회복 없음
slow_first_clear — 첫 클리어 느림
r_dependent      — R 쿨에 존재감 의존
squishy          — 방어력 낮음
falls_off_late   — 후반 약화
q_dependent      — Q 적중에 콤보 의존
ward_hop_dependent — 와드홉에 이동 의존
skill_ceiling_high — 숙련도 요구 높음
```

**keyStrengths 표준 태그**:
```
wall_cross_gank  — 벽 넘어 갱 가능
execute_burst    — 처형 버스트
splitpush_threat — 스플릿 위협
high_mobility    — 높은 이동성
early_invade     — 초반 카정 강함
lvl3_gank        — 3렙 갱 강함
insec_engage     — 인섹 이니시 가능
tower_dive       — 타워 다이브 강함
objective_control — 오브젝트 컨트롤 강함
early_duel_king  — 초반 1:1 최강
ad_assassin      — AD 암살자
ap_assassin      — AP 암살자
```

---

## 3. 출력 스키마 (MatchupGuide)

룰 엔진이 두 챔프 프로파일을 받아 생성하는 최종 결과물.

```
MatchupGuide
├── verdict (L0)      — MatchupVerdict
├── summary (L1)      — MatchupSummary
├── mustDodge (L2-1)  — MustDodgeSkill[]
├── punishWindows (L2-2) — PunishWindow[]
├── powerSpikes (L2-3) — PowerSpikeSummary
├── buildAdvice (L2-4) — BuildAdvice
├── phases (L3)       — { early, mid, late: PhaseGuide }
└── champOverride (L4-B) — string[]
```

상세 필드는 `src/types/matchup-engine.ts` 참조.

---

## 4. 파일 구조

```
src/
├── types/
│   └── matchup-engine.ts          # 전체 타입 정의
├── data/
│   └── champion-profiles/
│       ├── zed.json               # 파일럿
│       ├── leesin.json            # 파일럿
│       └── ... (40개 정글 챔프)
├── lib/
│   └── matchup-engine/
│       ├── index.ts               # 진입점: generateMatchupGuide(my, enemy)
│       ├── rules/
│       │   ├── verdict.ts         # L0 판정
│       │   ├── summary.ts         # L1 요약
│       │   ├── must-dodge.ts      # L2 카드 1
│       │   ├── punish-windows.ts  # L2 카드 2
│       │   ├── power-spikes.ts    # L2 카드 3
│       │   ├── build-advice.ts    # L2 카드 4
│       │   ├── phase-guide.ts     # L3
│       │   └── champ-override.ts  # L4-B
│       └── utils.ts               # 공통 유틸 (티어 비교, 텍스트 템플릿)
```

---

## 5. 데이터 흐름

### 5.1 프로파일 작성 (1회성)
```
DDragon JSON → Claude 1회성 태깅 → champion-profiles/*.json → 수동 검수 → 커밋
```

### 5.2 런타임 (매 요청)
```
유저: [내 챔프=Zed] [상대=LeeSin] [정글]
  ↓
프론트엔드: import zed.json, leesin.json
  ↓
matchup-engine/index.ts: generateMatchupGuide(zedProfile, leesinProfile)
  ↓
각 룰 함수 실행 (순수 결정론적)
  ↓
MatchupGuide 반환 → 렌더링
```

**LLM 호출 없음. API 호출 없음. 순수 import + 연산.**

### 5.3 패치 대응
```
패치 노트 확인 → 영향받는 챔프 프로파일 수정 (JSON 편집) → 커밋
룰 엔진은 수정 불필요 (프로파일만 바뀌면 출력 자동 변경)
```

---

## 6. 태깅 가이드라인 (프로파일 작성 규칙)

### 6.1 티어 판정 기준 (clearSpeed 예시)
- **S**: 세계 최상급 클리어. 3:05 이전 풀클 (그레이브즈, 니달리)
- **A**: 빠른 편. 3:10~3:20 (리 신, 헤카림)
- **B**: 보통. 3:20~3:30 (바이, 자르반)
- **C**: 느린 편. 3:30~3:45 (제드, 엘리스)
- **D**: 매우 느림. 3:45+ (이블린 레벨 1~3)

### 6.2 punishTrigger 작성 규칙
- `windowSec`은 **해당 스킬의 레벨 1~3 기준 쿨타임에서 약간 짧게** 설정. (쿨감 고려)
- `explanation`은 **"왜 이 스킬이 빠지면 기회인지"**를 1~2문장으로.
- 모든 챔프에 최소 1개, 최대 4개.

### 6.3 phaseStrategy 작성 규칙
- 각 필드 1~2문장.
- **일반론 금지**. "잘 파밍하세요" 대신 "3캠프 후 바텀 갱 우선".
- 정글 전용 필드(pathing, objective, gank)는 반드시 채울 것.

---

## 7. 다음 단계

1. ✅ 데이터 모델 문서 작성 (이 문서)
2. ✅ 타입 정의 (`src/types/matchup-engine.ts`)
3. ✅ 파일럿 프로파일 2개 (제드, 리신)
4. → **룰 엔진 핵심 함수 구현** (verdict, summary, must-dodge, punish-windows)
5. → **샘플 출력 생성** (제드 vs 리신) → 퀄 검증
6. → 나머지 룰 함수 + 프론트엔드

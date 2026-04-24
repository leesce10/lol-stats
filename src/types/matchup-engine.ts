// ============================================================
// 맞라인 분석 v2 — 룰 엔진 타입 정의
// docs/features/matchup-v2.md, matchup-data-model.md 참조
// ============================================================

// --- 기본 등급 타입 ---

/** 챔피언 능력 5단 티어. S가 최상, D가 최하. */
export type Tier = "S" | "A" | "B" | "C" | "D";

/** 강도 레벨 (범용). */
export type IntensityLevel = "high" | "medium" | "low";

/** 스케일링 피크 구간. */
export type ScalingPhase = "early" | "mid" | "late";

// --- 스킬 관련 ---

export type SkillKey = "Q" | "W" | "E" | "R" | "P";

export type SkillType =
  | "skillshot"
  | "point_click"
  | "self_buff"
  | "aoe"
  | "dash"
  | "toggle"
  | "summon";

export type SkillRole =
  | "primary_damage"
  | "secondary_damage"
  | "mobility"
  | "cc"
  | "defense"
  | "execute"
  | "engage"
  | "utility";

/**
 * 스킬 빗나감 패널티.
 * critical = 이 스킬 빗나가면 풀콤보 자체가 불발 (리신 Q)
 * high = 주요 딜/유틸 손실 (블리츠 Q)
 * medium = 일부 딜 손실이지만 다른 스킬로 보완 가능
 * low = 큰 영향 없음
 * none = 빗나갈 수 없는 스킬 (논타겟, 자가버프 등)
 */
export type MissPenalty = "critical" | "high" | "medium" | "low" | "none";

/** 챔피언 개별 스킬 프로파일. 전투 핵심 스킬만 기재. */
export interface ChampionSkill {
  key: SkillKey;
  name: string;
  type: SkillType;
  roles: SkillRole[]; // 복수 역할 가능 (Q = primary_damage + execute)
  missPenalty: MissPenalty;
  hitEnables: string[]; // 적중 시 활성화되는 것 (gap_close, execute, cc_chain 등)
  counterMethod: string; // 피하는 법 (한국어 서술)
  // Data Dragon 원본값 (태깅 스크립트가 주입)
  range?: number;
  cooldownEarly?: number; // 1렙 쿨타임
  cooldownMaxRank?: number; // 5렙 쿨타임
}

// --- Punish Trigger ---

export interface PunishTrigger {
  condition: string; // 설명적 ID (Q_missed, W_used, R_used 등)
  skillKey?: SkillKey; // 어떤 스킬이 트리거인가
  windowSec: number; // 반격 가능 시간 (초)
  severity: "critical" | "high" | "medium";
  explanation: string; // 왜 이게 기회인지 (한국어 서술)
}

// --- 빌드 적응 ---

export interface BuildAdaptation {
  /** 조건 식별자. 룰 엔진이 enemy 프로파일과 매칭. */
  condition: string; // 예: "enemy_burst_high", "enemy_sustain_high"
  recommendation: string;
  reason: string;
}

// --- 라인 ---

export type Lane = "top" | "jungle" | "mid" | "adc" | "support";

// --- 페이즈 전략 ---

/**
 * 모든 라인 공통 페이즈 전략.
 * 필드 의미는 라인에 따라 약간 다르게 해석된다:
 * - pathing: 정글=동선, 솔로라인=웨이브 관리, 바텀=포지셔닝, 서폿=시야/와드
 * - objective: 모든 라인 공통 (우선 순위 오브젝트)
 * - gank: 정글=갱/카정, 솔로라인=텔/로밍, 바텀=듀오 콤보, 서폿=로밍/어시스트
 */
export interface PhaseStrategy {
  goal: string;
  danger: string;
  opportunity: string;
  pathing?: string;
  objective?: string;
  gank?: string;
}

// ============================================================
// 챔피언 프로파일 (입력 데이터)
// ============================================================

/** 챔피언 프로파일. 룰 엔진의 입력 데이터. 라인별로 position 값만 다르다. */
export interface ChampionProfile {
  id: string;
  name: string;
  nameEn: string;
  position: Lane;
  patch: string; // 태깅 시점 패치 (예: "15.7")

  // --- 추천 정글 동선 (정글 챔프 한정) ---
  junglePath?: string[];

  // --- 정량 프로파일 ---
  profile: {
    clearSpeed: Tier;
    earlyDuel: Tier;
    midDuel: Tier;
    lateDuel: Tier;
    gankPower: Tier;
    scaling: ScalingPhase;
    mobility: IntensityLevel;
    burst: IntensityLevel;
    sustain: IntensityLevel;
    ccTypes: string[]; // 보유 CC 종류 (slow, knockup, stun, knockback, suppress 등)
  };

  // --- 파워 커브 ---
  powerSpikes: number[]; // 파워 스파이크 레벨
  weakAfter?: number; // 이 레벨 이후 약화 (undefined = 후반까지 유지)

  // --- 핵심 스킬 (전투 관련만, 보통 2~4개) ---
  keySkills: ChampionSkill[];

  // --- 반격 트리거 ---
  punishTriggers: PunishTrigger[];

  // --- 페이즈별 전략 ---
  phases: {
    early: PhaseStrategy;
    mid: PhaseStrategy;
    late: PhaseStrategy;
  };

  // --- 빌드 ---
  defaultSpells: string; // 기본 소환사 주문 (예: "점멸 + 강타")
  defaultRunes: string; // 기본 룬 (예: "감전")
  buildAdaptations: BuildAdaptation[];

  // --- 약점/강점 태그 (룰 매칭용) ---
  vulnerabilities: string[];
  keyStrengths: string[];
}

/** @deprecated ChampionProfile을 사용하라. 타입 호환용 별칭. */
export type JungleChampionProfile = ChampionProfile;

// ============================================================
// 룰 엔진 출력 타입 (MatchupGuide)
// ============================================================

// --- L0: 한 줄 판정 ---
export interface MatchupVerdict {
  winRate: number;
  label: "유리" | "비등" | "불리";
  essence: string; // 본질 한 문장
}

// --- L1: 3줄 요약 ---
export interface MatchupSummary {
  line1: string; // 매치업의 본질
  line2: string; // 이기는/지는 조건
  line3: string; // 큰 그림 운영 방향
}

// --- L2 카드 1: 필수 회피 스킬 ---
export interface MustDodgeSkill {
  skillKey: string;
  skillName: string;
  type: SkillType;
  range?: number;
  cooldown?: number;
  hitConsequence: string; // 맞으면 뭐가 일어나는지
  counterMethod: string; // 피하는 법
}

// --- L2 카드 2: 반격 윈도우 ---
export interface PunishWindow {
  condition: string;
  windowSec: number;
  reason: string;
  action: string; // 유저 챔프 기반 권장 행동
}

// --- L2 카드 3: 파워 스파이크 ---
export interface PowerSpikeSummary {
  mySpikes: number[];
  enemySpikes: number[];
  myWeakAfter?: number;
  enemyWeakAfter?: number;
  summary: string; // "14렙 이전 수비, 이후 교전 유도"
}

// --- L2 카드 4: 빌드 추천 ---
export interface BuildAdvice {
  spells: string;
  spellReason: string;
  runes: string;
  runeReason: string;
  coreItem?: string;
  itemReason?: string;
}

// --- L3: 페이즈별 운영 가이드 ---
export interface PhaseGuide {
  goal: string; // 이 구간 본인 목표
  enemyIntent: string; // 상대가 노리는 것
  dangerTiming: string; // 언제가 위험한가
  opportunityTiming: string; // 언제가 기회인가
  /** 라벨은 position에 따라 UI에서 달라진다 (정글=동선/오브젝트, 솔로=웨이브 관리, 바텀=포지셔닝, 서폿=시야). */
  pathing: string;
  /** 라벨은 position에 따라 UI에서 달라진다 (정글=카정/갱, 솔로=텔/로밍, 바텀=듀오 콤보, 서폿=로밍/어시스트). */
  gankCounterjungle: string;
}

// --- 최종 출력: 매치업 가이드 ---
export interface MatchupGuide {
  myChampion: string;
  enemyChampion: string;
  position: Lane;

  // L0
  verdict: MatchupVerdict;
  // L1
  summary: MatchupSummary;
  // L2
  mustDodge: MustDodgeSkill[];
  punishWindows: PunishWindow[];
  powerSpikes: PowerSpikeSummary;
  buildAdvice: BuildAdvice;
  // L3
  phases: {
    early: PhaseGuide;
    mid: PhaseGuide;
    late: PhaseGuide;
  };
  // L4-B (매치업 한정 변형)
  champOverride: string[];
}

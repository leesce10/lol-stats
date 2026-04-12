import type { Tier, IntensityLevel, JungleChampionProfile } from "@/types/matchup-engine";

// --- 티어를 숫자로 변환 ---
const TIER_MAP: Record<Tier, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

export function tierToNum(tier: Tier): number {
  return TIER_MAP[tier];
}

export function tierDiff(my: Tier, enemy: Tier): number {
  return tierToNum(my) - tierToNum(enemy);
}

/**
 * 두 티어의 차이를 판정어로 변환.
 * diff >= 2: "압도적 유리", diff 1: "약간 유리", diff 0: "비등", ...
 */
export function tierDiffLabel(diff: number): string {
  if (diff >= 2) return "압도적 유리";
  if (diff === 1) return "약간 유리";
  if (diff === 0) return "비등";
  if (diff === -1) return "약간 불리";
  return "압도적 불리";
}

// --- 강도 레벨 숫자 변환 ---
const INTENSITY_MAP: Record<IntensityLevel, number> = { high: 3, medium: 2, low: 1 };

export function intensityToNum(level: IntensityLevel): number {
  return INTENSITY_MAP[level];
}

// --- 승률 계산 ---
/**
 * 듀얼 티어 + 스케일링 + 조우전 랜덤성을 종합해 예상 승률 산출.
 * 순수 결정론적 (같은 입력 = 같은 출력).
 */
export function calculateWinRate(my: JungleChampionProfile, enemy: JungleChampionProfile): number {
  // 초/중/후반 듀얼 가중 평균 (정글은 초반 비중 높음)
  const earlyDiff = tierDiff(my.profile.earlyDuel, enemy.profile.earlyDuel);
  const midDiff = tierDiff(my.profile.midDuel, enemy.profile.midDuel);
  const lateDiff = tierDiff(my.profile.lateDuel, enemy.profile.lateDuel);

  // 정글은 초반 비중 40%, 중반 35%, 후반 25%
  const weightedDiff = earlyDiff * 0.4 + midDiff * 0.35 + lateDiff * 0.25;

  // 클리어 속도 차이 반영 (정글 특성)
  const clearDiff = tierDiff(my.profile.clearSpeed, enemy.profile.clearSpeed);

  // 갱킹 능력 차이 반영
  const gankDiff = tierDiff(my.profile.gankPower, enemy.profile.gankPower);

  // 기본 50% + 각 요소 가중치
  const winRate = 50
    + weightedDiff * 2.5    // 듀얼 티어 1 차이 = ±2.5%
    + clearDiff * 1.0       // 클리어 1티어 = ±1%
    + gankDiff * 1.5;       // 갱 1티어 = ±1.5%

  // 35~65% 클램프
  return Math.round(Math.min(65, Math.max(35, winRate)) * 10) / 10;
}

// --- 텍스트 유틸 ---

/** 챔프 이름에 맞는 조사 (을/를, 이/가 등) */
export function 은는(name: string): string {
  const lastChar = name.charCodeAt(name.length - 1);
  const hasJongseong = (lastChar - 0xAC00) % 28 > 0;
  return hasJongseong ? "은" : "는";
}

export function 이가(name: string): string {
  const lastChar = name.charCodeAt(name.length - 1);
  const hasJongseong = (lastChar - 0xAC00) % 28 > 0;
  return hasJongseong ? "이" : "가";
}

export function 을를(name: string): string {
  const lastChar = name.charCodeAt(name.length - 1);
  const hasJongseong = (lastChar - 0xAC00) % 28 > 0;
  return hasJongseong ? "을" : "를";
}

/** hitEnables 배열을 한국어 서술로 변환 */
export function hitEnablesToKorean(enables: string[]): string {
  const map: Record<string, string> = {
    gap_close: "갭클로즈",
    execute: "처형",
    execute_missing_hp: "잃은 체력 비례 추가 데미지",
    cc_chain: "CC 연계",
    slow: "이동속도 감소",
    knockback: "넉백",
    knockup: "넉업",
    stun: "기절",
    shield: "실드",
    lifesteal_boost: "생명력 흡수 강화",
    attack_speed_slow: "공격속도 감소",
    aoe_collision_damage: "충돌 광역 피해",
    team_split: "팀 분리",
    untargetable: "무적",
    execute_mark: "사형선고 마크",
    shadow_swap: "그림자 교체",
    skill_clone: "스킬 복제",
    swap_position: "위치 교체",
    triple_shuriken_damage: "3중 수리검 데미지",
    reveal: "위치 노출",
  };

  return enables
    .map(e => map[e] || e)
    .join(" + ");
}

/**
 * 빌드 적응 조건을 상대 프로파일과 매칭.
 */
export function evaluateBuildCondition(
  condition: string,
  enemy: JungleChampionProfile
): boolean {
  switch (condition) {
    case "enemy_burst_high":
      return enemy.profile.burst === "high";
    case "enemy_sustain_high":
      return enemy.profile.sustain === "high";
    case "enemy_cc_hard":
      return enemy.profile.ccTypes.some(cc =>
        ["knockup", "stun", "suppress", "knockback"].includes(cc)
      );
    case "enemy_mobility_high":
      return enemy.profile.mobility === "high";
    case "enemy_scaling_late":
      return enemy.profile.scaling === "late";
    case "enemy_tank_heavy":
      // 추후 classes 참조 가능. 지금은 sustain+lateDuel 조합으로 판단
      return enemy.profile.sustain !== "low" && tierToNum(enemy.profile.lateDuel) >= 4;
    case "enemy_range_ranged":
      // 프로파일에 range 없음 — 기존 ChampionData에서 가져와야 함
      // TODO: 추후 연동
      return false;
    case "enemy_duel_early_S":
      return enemy.profile.earlyDuel === "S";
    default:
      return false;
  }
}

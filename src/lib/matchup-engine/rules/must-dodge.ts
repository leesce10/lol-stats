import type { ChampionSkill, JungleChampionProfile, MustDodgeSkill } from "@/types/matchup-engine";

/** CC 타입 토큰 → 한국어 매핑. */
const CC_TYPE_KR: Record<string, string> = {
  stun: "기절",
  slow: "슬로우",
  root: "속박",
  fear: "공포",
  charm: "매혹",
  suppress: "진압",
  silence: "침묵",
  knockup: "넉업",
  knockback: "넉백",
  polymorph: "변이",
  taunt: "도발",
  ground: "접지",
  hook: "끌어당김",
  pull: "끌어당김",
  nearsight: "근접 시야",
  blind: "실명",
  sleep: "수면",
  disarm: "무장 해제",
};

/**
 * skill.hitEnables 배열에서 구체적 CC 정보를 뽑아 "1.25초 기절" / "슬로우" 형태로 변환.
 * 알려진 토큰이 없으면 null 반환.
 */
function extractCcInfo(skill: ChampionSkill): string | null {
  for (const token of skill.hitEnables) {
    // 1) 타입_지속시간 패턴: "stun_1.25s", "knockup_0.75s", "slow_2s"
    const durMatch = token.match(/^(stun|slow|root|fear|charm|suppress|silence|knockup|knockback|polymorph|taunt|hook|pull|nearsight|blind|sleep|disarm)_(\d+(?:\.\d+)?)s?$/);
    if (durMatch) {
      const [, type, dur] = durMatch;
      const typeKr = CC_TYPE_KR[type] ?? type;
      return `${dur}초 ${typeKr}`;
    }
    // 2) 단순 토큰: "stun", "slow", "knockup"
    if (CC_TYPE_KR[token]) return CC_TYPE_KR[token];
    // 3) 복합 토큰: "knockup_aoe", "slow_aoe", "hook_pull", "stun_chain"
    for (const [key, kr] of Object.entries(CC_TYPE_KR)) {
      if (token.startsWith(key + "_") || token.endsWith("_" + key)) {
        // 광역/체인 수식어 추가
        if (token.includes("aoe")) return `광역 ${kr}`;
        if (token.includes("chain")) return `연쇄 ${kr}`;
        return kr;
      }
    }
  }
  return null;
}

/**
 * L2 카드 1 — 라인전 핵심 스킬 추출.
 *
 * 유저 요구: "R이 위험하다"는 모든 챔프에 해당되는 당연한 말.
 * 라인전 실전 대응은 Q/W/E 짧은 쿨 스킬에 대한 거리 관리가 핵심.
 *
 * 정렬 정책:
 *  1. R이 아닌 missPenalty critical/high 스킬 먼저 (Q/W/E)
 *  2. R은 마지막에 노출 (단, 라인전 영향도 높은 경우만)
 *  3. 최대 3개
 */
export function generateMustDodge(
  _my: JungleChampionProfile,
  enemy: JungleChampionProfile
): MustDodgeSkill[] {
  // 라인전 상시 주시할 스킬: critical 또는 high missPenalty
  const candidates = enemy.keySkills
    .filter(s => s.missPenalty === "critical" || s.missPenalty === "high");

  // 라인전 우선순위 점수 (높을수록 먼저)
  function laneScore(s: typeof enemy.keySkills[number]): number {
    let score = 0;
    // R은 대체로 teamfight/finisher 성격 → 감점
    if (s.key === "R") score -= 50;
    // missPenalty critical > high
    if (s.missPenalty === "critical") score += 30;
    else if (s.missPenalty === "high") score += 20;
    // 짧은 쿨 = 라인전 상시 위협 → 가점
    const cd = s.cooldownMaxRank ?? s.cooldownEarly ?? 20;
    if (cd <= 6) score += 25;
    else if (cd <= 10) score += 15;
    else if (cd <= 15) score += 5;
    // 스킬샷 = 회피 연습 대상 → 가점
    if (s.type === "skillshot") score += 5;
    // CC + 주 딜 = 라인전 핵심 → 가점
    if (s.roles.includes("cc")) score += 10;
    if (s.roles.includes("primary_damage")) score += 8;
    return score;
  }

  const sorted = [...candidates].sort((a, b) => laneScore(b) - laneScore(a));
  const top = sorted.slice(0, 3);

  return top.map(skill => ({
    skillKey: skill.key,
    skillName: skill.name,
    type: skill.type,
    range: skill.range,
    cooldown: skill.cooldownMaxRank ?? skill.cooldownEarly,
    hitConsequence: generateHitConsequence(skill, enemy),
    counterMethod: skill.counterMethod,
  }));
}

/**
 * 챔프의 버스트 티어(high/medium/low) + 스킬 역할/타입 기반
 * 구체적 체력 손해 밴드 추정.
 *
 * "맞으면 체력 크게 깎임" 같은 뭉뚱그린 표현 대신
 * "초반 7~12% · 코어템 15%+ · 풀콤 30%+" 처럼 단계별 체감을 제공.
 */
function damageImpact(skill: ChampionSkill, enemy: JungleChampionProfile): string | null {
  const burst = enemy.profile.burst;
  const roles = skill.roles;
  const isR = skill.key === "R";
  const hasPrimary = roles.includes("primary_damage");
  const hasSecondary = roles.includes("secondary_damage");
  const isExecute = roles.includes("execute");
  const isAoe = skill.type === "aoe";
  const isSkillshot = skill.type === "skillshot";
  const isLongRange = (skill.range ?? 0) >= 800;

  // CC 전용 스킬은 뎀 밴드 없음 (caller가 CC 서술 처리)
  if (!hasPrimary && !hasSecondary && !isExecute) return null;

  if (isExecute) {
    return burst === "high"
      ? "저체력 처형 각 + 풀체력 25~40% 한 방"
      : "저체력 처형용. 풀체력엔 15~25% 수준";
  }

  // 버스트 티어별 밴드
  const bands: Record<
    "high" | "medium" | "low",
    {
      R: string;
      aoe: string;
      skillshot_long: string;
      skillshot_short: string;
      generic: string;
      secondary: string;
    }
  > = {
    high: {
      R: "풀콤 피니시 25~40% 체력 · 저체력이면 즉사 각",
      aoe: "광역 15~20% 체력 · 풀콤 셋업용",
      skillshot_long: "초반 7~12% · 코어템 15~20% · 풀템 25%+ (쿨마다 견제 누적 치명적)",
      skillshot_short: "초반 10~15% · 풀콤 연결 시 30~40% (반피 각)",
      generic: "단일 10~15% · 풀콤 연결 30%+",
      secondary: "보조 딜 5~10% · 주 스킬 연계용",
    },
    medium: {
      R: "풀콤 마무리 15~25% · 단독 뎀보단 버스트 연결용",
      aoe: "광역 8~12% 체력 · 지속 교전 누적용",
      skillshot_long: "초반 5~8% · 코어템 10~15% (누적 견제 트레이드 강요)",
      skillshot_short: "초반 7~12% · 풀콤 연결 시 20~30%",
      generic: "단일 8~12% · 풀콤 연결 20~30%",
      secondary: "보조 딜 4~7% · 연계용",
    },
    low: {
      R: "뎀보다 유틸/탱킹 궁 · 직접 뎀 10~15%",
      aoe: "광역 5~8% · 범위/유틸 주목적",
      skillshot_long: "단일 3~6% · 포크 누적 역할",
      skillshot_short: "단일 5~8% · 풀콤 연결 10~15%",
      generic: "뎀은 낮음 (5~10%) · CC/유틸 연계가 본질",
      secondary: "보조 딜 2~5% · 뎀보단 유틸",
    },
  };

  const tier = bands[burst] ?? bands.medium;

  if (isR && hasPrimary) return tier.R;
  if (isAoe) return tier.aoe;
  if (isSkillshot && hasPrimary && isLongRange) return tier.skillshot_long;
  if (isSkillshot && hasPrimary) return tier.skillshot_short;
  if (hasPrimary) return tier.generic;
  return tier.secondary;
}

/**
 * 스킬 속성 + 챔프 버스트 티어 기반 자연어 결과 서술.
 * 이제 "맞으면 체력 크게 깎임" 같은 뭉뚱그린 표현 대신
 * 실제 체력 % 밴드를 포함한다.
 */
function generateHitConsequence(skill: ChampionSkill, enemy: JungleChampionProfile): string {
  const isR = skill.key === "R";
  const isCC = skill.roles.includes("cc");
  const isBurst = skill.roles.includes("primary_damage");
  const isExec = skill.roles.includes("execute");
  const isEngage = skill.roles.includes("engage");
  const penalty = skill.missPenalty;

  const cc = extractCcInfo(skill);
  const dmg = damageImpact(skill, enemy);

  // critical: 풀콤 성립 또는 게임 뒤집힐 수준
  if (penalty === "critical") {
    if (isCC && skill.type === "skillshot") {
      const ccText = cc ?? "CC";
      const dmgSuffix = dmg ? ` (뎀 ${dmg})` : "";
      return `맞으면 ${ccText} → 상대 풀콤 확정${dmgSuffix}. 즉시 점멸/수은 준비.`;
    }
    if (isCC && skill.type === "point_click") {
      const ccText = cc ?? "CC";
      const dmgSuffix = dmg ? ` + ${dmg}` : "";
      return `타겟팅이라 회피 불가. 맞으면 ${ccText} + 풀콤 연결${dmgSuffix}. 사거리 밖 유지가 유일한 방어.`;
    }
    if (isExec) {
      return `${dmg ?? "처형 수준 뎀"}. 체력 관리 필수 — 존야/QSS 슬롯 상시 확인.`;
    }
    if (isEngage) {
      const ccText = cc ? ` + ${cc}` : "";
      const dmgSuffix = dmg ? ` (${dmg})` : "";
      return `맞으면 근접 허용${ccText}${dmgSuffix} + 풀콤 이어짐. 점멸로 벗어나야 생존.`;
    }
    if (skill.type === "dash") {
      return `맞으면 상대가 거리 좁힘${dmg ? ` + ${dmg}` : ""} + 후속 스킬 확정 적중.`;
    }
    return `${dmg ?? "큰 뎀"} + 후속 스킬 확정. 교전 즉시 패배.`;
  }

  // high: 불리하지만 회복 가능한 수준
  if (isCC) {
    const ccText = cc ?? "CC";
    const dmgSuffix = dmg ? ` + ${dmg} 체력` : "";
    return `맞으면 ${ccText}${dmgSuffix} 연결. 트레이드 불리.`;
  }
  if (isBurst && skill.type === "skillshot") {
    return `${dmg ?? "체력 크게 깎임"}. 쿨마다 견제 누적되면 라인전 밀림.`;
  }
  if (isBurst) {
    return `${dmg ?? "뎀 손해"}. 트레이드 불리.`;
  }
  if (skill.type === "aoe") {
    return `광역 범위 — 맞으면 주변 아군도 같이 피해${dmg ? ` (${dmg})` : ""}. 분산 포지션 필수.`;
  }
  if (skill.type === "self_buff" && isR) {
    return "상대 버프 지속 시간 동안 뎀·탱킹 급증. 정면 교전 금지, 버프 풀릴 때까지 카이팅.";
  }
  if (skill.type === "self_buff") {
    return "상대 버프 켜진 동안 교전 회피. 풀릴 때 반격.";
  }
  if (skill.type === "dash") {
    return `맞으면 상대가 진입${dmg ? ` + ${dmg}` : ""} + 추가 딜 위협. 즉시 아군 근처 이동.`;
  }
  return "맞으면 교전 손해. 쿨 빠지고 나서 반격 시도.";
}

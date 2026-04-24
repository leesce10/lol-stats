import type { ChampionSkill, JungleChampionProfile, MustDodgeSkill } from "@/types/matchup-engine";

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
    hitConsequence: generateHitConsequence(skill),
    counterMethod: skill.counterMethod,
  }));
}

/**
 * 스킬 속성(타입·역할·missPenalty) 기반 자연어 결과 서술.
 * 영문 hitEnables 토큰을 노출하지 않고 "맞으면 어떻게 되는지"를 명확히 전달.
 */
function generateHitConsequence(skill: ChampionSkill): string {
  const isR = skill.key === "R";
  const isCC = skill.roles.includes("cc");
  const isBurst = skill.roles.includes("primary_damage");
  const isExec = skill.roles.includes("execute");
  const isEngage = skill.roles.includes("engage");
  const penalty = skill.missPenalty;

  // critical: 풀콤 성립 또는 게임 뒤집힐 수준
  if (penalty === "critical") {
    if (isCC && skill.type === "skillshot") {
      return "맞으면 CC 걸림 → 상대 풀콤 확정. 즉시 점멸/수은 준비.";
    }
    if (isCC && skill.type === "point_click") {
      return "타겟팅이라 회피 불가. 맞으면 CC + 풀콤 연결. 사거리 밖 유지가 유일한 방어.";
    }
    if (isExec) {
      return "맞으면 처형 각. 저체력 상태면 즉사, 풀체력이어도 큰 폭 손해.";
    }
    if (isEngage) {
      return "맞으면 근접 허용 + 풀콤 이어짐. 점멸로 벗어나야 생존.";
    }
    if (skill.type === "dash") {
      return "맞으면 상대가 거리 좁힘 + 추가 스킬 확정 적중. 트레이드 완패.";
    }
    return "맞으면 큰 뎀 + 후속 스킬 확정. 교전 즉시 패배.";
  }

  // high: 불리하지만 회복 가능한 수준
  if (isCC) {
    return "맞으면 짧은 CC + 주요 딜 연결. 체력 큰 폭 손해.";
  }
  if (isBurst && skill.type === "skillshot") {
    return "맞으면 체력 크게 깎임. 쿨마다 견제라 누적되면 라인전 밀림.";
  }
  if (isBurst) {
    return "맞으면 뎀 손해. 트레이드 불리.";
  }
  if (skill.type === "aoe") {
    return "광역 범위 — 맞으면 주변 아군도 같이 피해. 분산 포지션 필수.";
  }
  if (skill.type === "self_buff" && isR) {
    return "상대 버프 지속 시간 동안 뎀·탱킹 급증. 정면 교전 금지, 버프 풀릴 때까지 카이팅.";
  }
  if (skill.type === "self_buff") {
    return "상대 버프 켜진 동안 교전 회피. 풀릴 때 반격.";
  }
  if (skill.type === "dash") {
    return "맞으면 상대가 진입 + 추가 딜 위협. 즉시 아군 근처 이동.";
  }
  return "맞으면 교전 손해. 쿨 빠지고 나서 반격 시도.";
}

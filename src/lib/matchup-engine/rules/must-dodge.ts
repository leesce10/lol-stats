import type { JungleChampionProfile, MustDodgeSkill } from "@/types/matchup-engine";
import { hitEnablesToKorean } from "../utils";

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
    hitConsequence: generateHitConsequence(skill.hitEnables, skill.missPenalty),
    counterMethod: skill.counterMethod,
  }));
}

function generateHitConsequence(hitEnables: string[], penalty: string): string {
  const enablesText = hitEnablesToKorean(hitEnables);

  if (penalty === "critical") {
    return `맞으면 ${enablesText} 활성화. 풀콤보 확정.`;
  }
  return `맞으면 ${enablesText} 활성화. 불리한 교전 시작.`;
}

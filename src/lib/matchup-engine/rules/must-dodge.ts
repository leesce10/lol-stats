import type { JungleChampionProfile, MustDodgeSkill } from "@/types/matchup-engine";
import { hitEnablesToKorean } from "../utils";

/**
 * L2 카드 1 — 필수 회피 스킬 추출.
 * 상대의 missPenalty가 critical 또는 high인 스킬만.
 * 최대 2개.
 */
export function generateMustDodge(
  _my: JungleChampionProfile,
  enemy: JungleChampionProfile
): MustDodgeSkill[] {
  const dangerousSkills = enemy.keySkills
    .filter(s => s.missPenalty === "critical" || s.missPenalty === "high")
    .sort((a, b) => {
      // critical 먼저
      if (a.missPenalty === "critical" && b.missPenalty !== "critical") return -1;
      if (b.missPenalty === "critical" && a.missPenalty !== "critical") return 1;
      return 0;
    })
    .slice(0, 2);

  return dangerousSkills.map(skill => ({
    skillKey: skill.key,
    skillName: skill.name,
    type: skill.type,
    range: skill.range,
    cooldown: skill.cooldownEarly,
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

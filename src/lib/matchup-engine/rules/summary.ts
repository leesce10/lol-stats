import type { JungleChampionProfile, MatchupSummary, MatchupVerdict } from "@/types/matchup-engine";
import { tierDiff, 이가, 은는 } from "../utils";

/**
 * L1 — 3줄 요약 생성.
 * line1: 매치업의 본질 (상대 핵심 스킬)
 * line2: 이기는 조건 / 지는 조건
 * line3: 큰 그림 운영 방향
 */
export function generateSummary(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  verdict: MatchupVerdict
): MatchupSummary {
  return {
    line1: generateLine1(my, enemy),
    line2: generateLine2(my, enemy),
    line3: generateLine3(my, enemy, verdict),
  };
}

/** line1: 상대의 가장 치명적인 스킬 기반 본질 서술 */
function generateLine1(my: JungleChampionProfile, enemy: JungleChampionProfile): string {
  const criticalSkill = enemy.keySkills.find(s => s.missPenalty === "critical");

  if (criticalSkill) {
    const otherSkills = enemy.keySkills.filter(s => s.key !== criticalSkill.key);
    const otherThreatLevel = otherSkills.some(s => s.missPenalty === "high");

    if (otherThreatLevel) {
      return `상대 ${criticalSkill.key}(${criticalSkill.name}) 한 발에 풀콤보 성립. 다른 스킬도 경계 필요.`;
    }
    return `상대 ${criticalSkill.key}(${criticalSkill.name}) 한 발에 풀콤보 성립. 나머지 스킬은 상대적으로 덜 위협적.`;
  }

  // critical 없으면 high 기반
  const highSkill = enemy.keySkills.find(s => s.missPenalty === "high");
  if (highSkill) {
    return `상대 ${highSkill.key}(${highSkill.name})${이가(highSkill.name)} 핵심 위협. 빠지면 상대 전투력 크게 감소.`;
  }

  // 둘 다 없으면 듀얼 티어 기반
  const earlyDiff = tierDiff(my.profile.earlyDuel, enemy.profile.earlyDuel);
  if (earlyDiff <= -2) {
    return `${enemy.name}${은는(enemy.name)} 초반 듀얼 최강급. 정면 교전을 피해야 한다.`;
  }
  if (earlyDiff >= 2) {
    return `초반부터 ${my.name}${이가(my.name)} 강하다. 적극적으로 조우전을 잡아라.`;
  }
  return `특별히 위험한 스킬은 없다. 전반적 능력치 싸움.`;
}

/** line2: 이기는 조건 / 지는 조건 */
function generateLine2(my: JungleChampionProfile, enemy: JungleChampionProfile): string {
  // 상대의 최고 severity punish trigger 찾기
  const bestPunish = enemy.punishTriggers
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 };
      return order[a.severity] - order[b.severity];
    })[0];

  if (bestPunish) {
    const skillRef = bestPunish.skillKey
      ? enemy.keySkills.find(s => s.key === bestPunish.skillKey)
      : null;

    const dodgePart = skillRef
      ? `${skillRef.key} 피하면 해볼만하다`
      : `${bestPunish.condition.replace("_", " ")} 시 기회`;

    const hitPart = skillRef
      ? `${skillRef.key} 맞으면 불리한 교전`
      : "조건 충족 못하면 불리";

    return `${dodgePart}. ${hitPart}.`;
  }

  // punish trigger 없으면 듀얼 비교 기반
  const earlyDiff = tierDiff(my.profile.earlyDuel, enemy.profile.earlyDuel);
  if (earlyDiff >= 1) {
    return `초반 교전에서 우위를 잡을 수 있다. 레벨 차이를 유지하면 이긴다.`;
  }
  if (earlyDiff <= -1) {
    return `초반 교전은 피하고 파밍 우위를 노려라. 후반에 역전 가능.`;
  }
  return `실력과 스킬 적중률에 따라 갈리는 매치업. 먼저 실수하는 쪽이 진다.`;
}

/** line3: 큰 그림 운영 방향 */
function generateLine3(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  verdict: MatchupVerdict
): string {
  const scalingPhases = { early: 1, mid: 2, late: 3 };
  const myScale = scalingPhases[my.profile.scaling];
  const enemyScale = scalingPhases[enemy.profile.scaling];

  // 스케일링 비교
  if (myScale > enemyScale) {
    const weakPoint = enemy.weakAfter;
    if (weakPoint) {
      return `${weakPoint}렙 이후 내가 더 강하다. 그 전까진 수비적으로 버텨라.`;
    }
    return `후반으로 갈수록 유리해진다. 게임을 길게 끌어라.`;
  }

  if (myScale < enemyScale) {
    const myWeak = my.weakAfter;
    if (myWeak) {
      return `${myWeak}렙 이전에 리드를 확보해야 한다. 게임이 길어지면 불리.`;
    }
    return `초중반에 리드를 잡아야 한다. 후반으로 가면 상대가 더 강해진다.`;
  }

  // 같은 스케일링
  if (verdict.label === "유리") {
    return `같은 타이밍에 강해지지만 전반적으로 유리. 리드를 벌려서 확실하게.`;
  }
  if (verdict.label === "불리") {
    return `같은 타이밍에 강해지지만 전반적으로 불리. 팀원과 합류해서 싸워라.`;
  }
  return `피크 타이밍이 비슷하다. 아이템/레벨 차이가 승패를 가른다.`;
}

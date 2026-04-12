import type { JungleChampionProfile, PunishWindow } from "@/types/matchup-engine";

/**
 * L2 카드 2 — 반격 윈도우 생성.
 * 상대의 punishTriggers에서 추출 + 본인 챔프 기반 권장 행동 결정.
 * 최대 3개.
 */
export function generatePunishWindows(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): PunishWindow[] {
  const triggers = enemy.punishTriggers
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 3);

  return triggers.map(trigger => ({
    condition: formatCondition(trigger.condition, enemy),
    windowSec: trigger.windowSec,
    reason: trigger.explanation,
    action: generateAction(my, trigger.severity),
  }));
}

/** condition ID를 읽기 좋은 한국어로 변환 */
function formatCondition(condition: string, enemy: JungleChampionProfile): string {
  const skillKey = condition.split("_")[0]; // "Q_missed" → "Q"
  const skill = enemy.keySkills.find(s => s.key === skillKey);
  const skillName = skill ? `${skill.key}(${skill.name})` : condition;

  if (condition.includes("missed")) {
    return `${enemy.name} ${skillName} 빗나간 직후`;
  }
  if (condition.includes("used")) {
    return `${enemy.name} ${skillName} 사용 직후`;
  }
  return `${enemy.name} ${condition}`;
}

/** 본인 챔프 프로파일 기반 권장 행동 */
function generateAction(my: JungleChampionProfile, severity: string): string {
  // 본인 챔프 스킬 중 이동기 찾기
  const dashSkill = my.keySkills.find(
    s => s.type === "dash" && s.roles.includes("mobility")
  );
  // 본인 챔프 궁극기
  const ultSkill = my.keySkills.find(s => s.key === "R");
  // 본인 CC 스킬
  const ccSkill = my.keySkills.find(s => s.roles.includes("cc"));
  // 본인 주력 딜 스킬
  const dmgSkill = my.keySkills.find(s => s.roles.includes("primary_damage"));

  if (severity === "critical") {
    // 최고 기회 — 올인 권장
    const parts: string[] = [];
    if (dashSkill) parts.push(`${dashSkill.key}로 진입`);
    if (ccSkill) parts.push(`${ccSkill.key} 슬로우`);
    if (dmgSkill) parts.push(`${dmgSkill.key} 풀히트`);

    if (parts.length > 0) {
      return `${parts.join(" → ")} 올인`;
    }
    return "즉시 올인. 이 타이밍이 유일한 기회.";
  }

  if (severity === "high") {
    // 높은 기회 — 공격적 진입
    if (dashSkill) {
      return `${dashSkill.key}로 거리 좁히고 짧은 트레이드. 상대 도주력 약화 상태.`;
    }
    return "짧은 트레이드로 체력 우위 확보. 상대 주요 스킬 빠진 상태.";
  }

  // medium — 소극적 활용
  return "견제 or 시야 확보. 완전한 올인보단 유리한 포지션 선점.";
}

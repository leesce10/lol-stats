import type { JungleChampionProfile, MatchupVerdict } from "@/types/matchup-engine";
import { calculateWinRate, tierDiff, 이가 } from "../utils";

/**
 * L0 — 한 줄 판정 생성.
 * 승률 + 유리/비등/불리 라벨 + 본질 한 문장.
 */
export function generateVerdict(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): MatchupVerdict {
  const winRate = calculateWinRate(my, enemy);
  const label = winRate >= 53 ? "유리" : winRate <= 47 ? "불리" : "비등";

  // 본질 한 문장: 상대의 가장 critical/high한 스킬 기반
  const essence = generateEssence(my, enemy, label);

  return { winRate, label, essence };
}

function generateEssence(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  label: "유리" | "비등" | "불리"
): string {
  // 상대의 가장 치명적인 스킬 찾기
  const criticalSkill = enemy.keySkills.find(s => s.missPenalty === "critical");
  const highSkill = enemy.keySkills.find(s => s.missPenalty === "high");
  const keySkill = criticalSkill || highSkill;

  // 스케일링 비교
  const scalingPhases = { early: 1, mid: 2, late: 3 };
  const myScaling = scalingPhases[my.profile.scaling];
  const enemyScaling = scalingPhases[enemy.profile.scaling];

  if (keySkill && keySkill.missPenalty === "critical") {
    // 상대에게 critical miss penalty 스킬이 있음 → 이게 본질
    return `상대 ${keySkill.key}(${keySkill.name}) 하나가 모든 걸 결정한다`;
  }

  if (label === "유리") {
    const earlyDiff = tierDiff(my.profile.earlyDuel, enemy.profile.earlyDuel);
    if (earlyDiff >= 2) {
      return `초반부터 ${my.name}${이가(my.name)} 압도한다. 적극적으로 조우전을 잡아라`;
    }
    if (myScaling > enemyScaling) {
      return `시간이 지날수록 ${my.name}${이가(my.name)} 유리해진다. 게임을 길게 끌어라`;
    }
    return `${my.name}${이가(my.name)} 전반적으로 우위. 리드를 벌려라`;
  }

  if (label === "불리") {
    const earlyDiff = tierDiff(my.profile.earlyDuel, enemy.profile.earlyDuel);
    if (earlyDiff <= -2) {
      return `초반 1:1은 절대 금지. ${enemy.name}${이가(enemy.name)} 듀얼 최강급`;
    }
    if (myScaling < enemyScaling) {
      return `후반으로 갈수록 격차가 벌어진다. 중반까지 끝내야 한다`;
    }
    if (keySkill) {
      return `${enemy.name}의 ${keySkill.key}(${keySkill.name})${을를(keySkill.name)} 조심해야 한다`;
    }
    return `${enemy.name}${이가(enemy.name)} 전반적으로 우위. 수비적으로 플레이`;
  }

  // 비등
  if (keySkill) {
    return `스킬 적중률이 승패를 가른다. 상대 ${keySkill.key} 회피가 핵심`;
  }
  return `비등한 매치업. 조우전 타이밍과 스킬 적중률에 따라 갈린다`;
}

function 을를(name: string): string {
  const lastChar = name.charCodeAt(name.length - 1);
  const hasJongseong = (lastChar - 0xAC00) % 28 > 0;
  return hasJongseong ? "을" : "를";
}

import type { JungleChampionProfile, PowerSpikeSummary } from "@/types/matchup-engine";

/**
 * L2 카드 3 — 파워 스파이크 타임라인 생성.
 */
export function generatePowerSpikes(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): PowerSpikeSummary {
  return {
    mySpikes: my.powerSpikes,
    enemySpikes: enemy.powerSpikes,
    myWeakAfter: my.weakAfter ?? undefined,
    enemyWeakAfter: enemy.weakAfter ?? undefined,
    summary: generateSpikeSummary(my, enemy),
  };
}

function generateSpikeSummary(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): string {
  const parts: string[] = [];

  // 첫 파워 스파이크 비교
  const myFirst = my.powerSpikes[0] ?? 6;
  const enemyFirst = enemy.powerSpikes[0] ?? 6;

  if (enemyFirst < myFirst) {
    parts.push(`상대가 ${enemyFirst}렙에 먼저 강해진다. ${enemyFirst}렙 전후 조우전 주의.`);
  } else if (myFirst < enemyFirst) {
    parts.push(`내가 ${myFirst}렙에 먼저 강해진다. 이 타이밍에 공격적 플레이.`);
  }

  // weakAfter 비교
  if (enemy.weakAfter && !my.weakAfter) {
    parts.push(`상대는 ${enemy.weakAfter}렙 이후 약해진다. 그때까지 버텨라.`);
  } else if (my.weakAfter && !enemy.weakAfter) {
    parts.push(`내가 ${my.weakAfter}렙 이후 약해진다. 그 전에 리드를 확보해라.`);
  } else if (enemy.weakAfter && my.weakAfter) {
    if (enemy.weakAfter < my.weakAfter) {
      parts.push(`상대가 먼저 약해진다 (${enemy.weakAfter}렙). 중반 이후 역전 가능.`);
    } else if (my.weakAfter < enemy.weakAfter) {
      parts.push(`내가 먼저 약해진다 (${my.weakAfter}렙). 초반에 결판내야 한다.`);
    }
  }

  // 궁극기 스파이크 (6렙)
  const myHas6 = my.powerSpikes.includes(6);
  const enemyHas6 = enemy.powerSpikes.includes(6);
  if (myHas6 && !enemyHas6) {
    parts.push("6렙 궁 해금이 내 핵심 타이밍. 6렙 직후 공격적으로.");
  } else if (enemyHas6 && !myHas6) {
    parts.push("상대 6렙 궁 해금 주의. 6렙 전후로 조심.");
  }

  if (parts.length === 0) {
    return "파워 스파이크가 비슷하다. 아이템 완성 타이밍 차이가 승패를 가른다.";
  }

  return parts.join(" ");
}

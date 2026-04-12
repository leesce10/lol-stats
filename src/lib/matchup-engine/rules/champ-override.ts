import type { JungleChampionProfile } from "@/types/matchup-engine";
import { tierDiff } from "../utils";

/**
 * L4-B — 내 챔프의 이 매치업 한정 변형 생성.
 * 본인 챔프의 약점/강점 + 상대 프로파일 교차 매칭.
 */
export function generateChampOverride(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): string[] {
  const overrides: string[] = [];

  // 이동기 보존 규칙
  const myDash = my.keySkills.find(s => s.type === "dash" && s.roles.includes("mobility"));
  if (myDash && enemy.profile.earlyDuel === "S") {
    overrides.push(
      `${myDash.key}(${myDash.name})는 도주용으로 우선 유지. 상대 초반 듀얼 S급이라 공격적 ${myDash.key} 사용 위험.`
    );
  }

  // 궁 의존도 챔프 + 상대가 카운터 플레이 있을 때
  if (my.vulnerabilities.includes("r_dependent")) {
    const enemyDisengage = enemy.keySkills.find(s =>
      s.roles.includes("cc") || s.roles.includes("engage")
    );
    if (enemyDisengage) {
      overrides.push(
        `R 사용 전 상대 ${enemyDisengage.key}(${enemyDisengage.name}) 쿨 확인 필수. R 들어갔는데 ${enemyDisengage.key} 맞으면 역전당한다.`
      );
    }
  }

  // 서스테인 없는 챔프 vs 서스테인 높은 상대
  if (my.vulnerabilities.includes("no_sustain") && enemy.profile.sustain === "high") {
    overrides.push(
      "체젠 없어서 짧은 트레이드 반복은 불리. 올인 아니면 교전 자체를 피해라."
    );
  }

  // 스퀴시 챔프 vs 버스트 높은 상대
  if (my.vulnerabilities.includes("squishy") && enemy.profile.burst === "high") {
    overrides.push(
      "체력이 낮아 상대 버스트에 즉사 위험. 방어 아이템 서브 빌드 고려."
    );
  }

  // 점멸 용도 변경
  if (enemy.profile.earlyDuel === "S" || enemy.profile.burst === "high") {
    overrides.push(
      "점멸은 공격보다 도주용으로 간주. 상대 올인 대응 보험."
    );
  }

  // 클리어 느린 챔프 vs 카정 강한 상대
  if (
    my.vulnerabilities.includes("slow_first_clear") &&
    enemy.keyStrengths.some(s => s.includes("invade") || s.includes("duel"))
  ) {
    overrides.push(
      "첫 클리어 느림 + 상대 카정 강함. 시작 버프 반대편에서 출발. 안전 풀클 필수."
    );
  }

  // 후반 약화 상대 vs 본인 후반 강함
  if (
    enemy.weakAfter &&
    (my.profile.scaling === "late" || my.profile.scaling === "mid")
  ) {
    const duelDiff = tierDiff(my.profile.lateDuel, enemy.profile.lateDuel);
    if (duelDiff >= 2) {
      overrides.push(
        `${enemy.weakAfter}렙 이후 상대 급약화. 이때부터 적극적 1:1 가능. 게임 길게 끌기.`
      );
    }
  }

  // 최대 5개
  return overrides.slice(0, 5);
}

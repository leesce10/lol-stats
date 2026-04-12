import type { JungleChampionProfile, MatchupGuide } from "@/types/matchup-engine";
import { generateVerdict } from "./rules/verdict";
import { generateSummary } from "./rules/summary";
import { generateMustDodge } from "./rules/must-dodge";
import { generatePunishWindows } from "./rules/punish-windows";
import { generatePowerSpikes } from "./rules/power-spikes";
import { generateBuildAdvice } from "./rules/build-advice";
import { generatePhaseGuides } from "./rules/phase-guide";
import { generateChampOverride } from "./rules/champ-override";

/**
 * 매치업 가이드 생성.
 * 두 챔피언 프로파일을 받아 L0~L4-B 전체를 결정론적으로 생성.
 * LLM 호출 없음. 순수 룰 엔진.
 */
export function generateMatchupGuide(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): MatchupGuide {
  const verdict = generateVerdict(my, enemy);
  const summary = generateSummary(my, enemy, verdict);
  const mustDodge = generateMustDodge(my, enemy);
  const punishWindows = generatePunishWindows(my, enemy);
  const powerSpikes = generatePowerSpikes(my, enemy);
  const buildAdvice = generateBuildAdvice(my, enemy);
  const phases = generatePhaseGuides(my, enemy);
  const champOverride = generateChampOverride(my, enemy);

  return {
    myChampion: my.id,
    enemyChampion: enemy.id,
    position: "jungle",
    verdict,
    summary,
    mustDodge,
    punishWindows,
    powerSpikes,
    buildAdvice,
    phases,
    champOverride,
  };
}

export { type JungleChampionProfile, type MatchupGuide };

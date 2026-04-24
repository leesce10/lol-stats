import type { ChampionProfile, MatchupGuide } from "@/types/matchup-engine";
import { generateVerdict } from "./rules/verdict";
import { generateSummary } from "./rules/summary";
import { generateMustDodge } from "./rules/must-dodge";
import { generatePunishWindows } from "./rules/punish-windows";
import { generatePowerSpikes } from "./rules/power-spikes";
import { generateBuildAdvice } from "./rules/build-advice";
import { generatePhaseGuides } from "./rules/phase-guide";
import { generateChampOverride } from "./rules/champ-override";
import { generateKeyCombos } from "./rules/key-combos";

/**
 * 매치업 가이드 생성.
 * 두 챔피언 프로파일을 받아 L0~L4-B 전체를 결정론적으로 생성.
 * LLM 호출 없음. 순수 룰 엔진.
 *
 * 두 프로파일의 position은 같아야 한다 (타입 체크는 호출자 책임).
 */
export function generateMatchupGuide(
  my: ChampionProfile,
  enemy: ChampionProfile
): MatchupGuide {
  const verdict = generateVerdict(my, enemy);
  const summary = generateSummary(my, enemy, verdict);
  const keyCombos = generateKeyCombos(my, enemy);
  const mustDodge = generateMustDodge(my, enemy);
  const punishWindows = generatePunishWindows(my, enemy);
  const powerSpikes = generatePowerSpikes(my, enemy);
  const buildAdvice = generateBuildAdvice(my, enemy);
  const phases = generatePhaseGuides(my, enemy);
  const champOverride = generateChampOverride(my, enemy);

  return {
    myChampion: my.id,
    enemyChampion: enemy.id,
    position: my.position,
    verdict,
    summary,
    keyCombos,
    mustDodge,
    punishWindows,
    powerSpikes,
    buildAdvice,
    phases,
    champOverride,
  };
}

export { type ChampionProfile, type MatchupGuide };
export type { JungleChampionProfile } from "@/types/matchup-engine";

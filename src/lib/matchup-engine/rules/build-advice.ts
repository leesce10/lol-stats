import type { JungleChampionProfile, BuildAdvice } from "@/types/matchup-engine";
import { evaluateBuildCondition } from "../utils";

/**
 * L2 카드 4 — 빌드/룬/스펠 추천 생성.
 * 본인 챔프의 buildAdaptations 중 상대에 매칭되는 것 추출.
 */
export function generateBuildAdvice(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): BuildAdvice {
  // 매칭되는 빌드 적응 찾기
  const matchedAdaptations = my.buildAdaptations
    .filter(a => evaluateBuildCondition(a.condition, enemy));

  // 스펠 결정
  const { spells, spellReason } = determineSpells(my, enemy);

  // 룬 결정
  const { runes, runeReason } = determineRunes(my, enemy);

  // 아이템 (첫 번째 매칭된 적응)
  const itemAdaptation = matchedAdaptations[0];

  return {
    spells,
    spellReason,
    runes,
    runeReason,
    coreItem: itemAdaptation?.recommendation,
    itemReason: itemAdaptation?.reason,
  };
}

function determineSpells(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): { spells: string; spellReason: string } {
  // 기본: 점멸 + 강타 (정글 필수)
  const base = my.defaultSpells;

  // 상대가 초반 듀얼 S급이면 → 방어적 플레이 강조
  if (enemy.profile.earlyDuel === "S") {
    return {
      spells: base,
      spellReason: `${base} (기본). 점멸은 도주용으로 보존. 상대 초반 듀얼 S급.`,
    };
  }

  // 상대가 후반 스케일링이면 → 점화로 초반 킬각
  if (enemy.profile.scaling === "late" && my.profile.earlyDuel !== "D") {
    return {
      spells: base.includes("점화") ? base : base,
      spellReason: `${base}. 상대가 후반형이므로 초반 교전 적극 활용.`,
    };
  }

  return {
    spells: base,
    spellReason: `${base} (기본 세팅)`,
  };
}

function determineRunes(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): { runes: string; runeReason: string } {
  const base = my.defaultRunes;

  // 상대 sustain이 높으면 감전 계열 추천 (짧은 트레이드)
  if (enemy.profile.sustain === "high" && base !== "감전") {
    return {
      runes: "감전",
      runeReason: "상대 체젠이 강해 짧은 트레이드 극대화 필요.",
    };
  }

  // 상대가 탱키하면 정복자 추천 (지속 교전)
  if (enemy.profile.sustain !== "low" && enemy.profile.lateDuel !== "D") {
    if (base !== "정복자") {
      return {
        runes: "정복자",
        runeReason: "상대가 내구성 높아 지속 교전에서 이득 봐야 함.",
      };
    }
  }

  return {
    runes: base,
    runeReason: `${base} (기본 세팅). 이 매치업에서 변형 불필요.`,
  };
}

import { getChampionById, generateChampionStats } from "@/data/champions";
import { TeamCompResult, ChampionData } from "@/types";

interface TeamTraits {
  engage: number;
  poke: number;
  teamfight: number;
  splitpush: number;
  protection: number;
  burst: number;
  sustain: number;
  tankiness: number;
  dps: number;
  cc: number;
}

function getChampionTraits(champ: ChampionData): Partial<TeamTraits> {
  const traits: Partial<TeamTraits> = {};

  if (champ.classes.includes("tank")) {
    traits.tankiness = 3;
    traits.cc = 2;
    traits.engage = 2;
  }
  if (champ.classes.includes("fighter")) {
    traits.dps = 2;
    traits.splitpush = 2;
    traits.tankiness = 1;
  }
  if (champ.classes.includes("assassin")) {
    traits.burst = 3;
    traits.splitpush = 1;
  }
  if (champ.classes.includes("mage")) {
    traits.poke = 2;
    traits.teamfight = 2;
    traits.burst = 1;
  }
  if (champ.classes.includes("marksman")) {
    traits.dps = 3;
    traits.teamfight = 1;
  }
  if (champ.classes.includes("enchanter")) {
    traits.protection = 3;
    traits.sustain = 2;
    traits.teamfight = 1;
  }
  if (champ.classes.includes("controller")) {
    traits.cc = 2;
    traits.protection = 1;
    traits.engage = 1;
  }

  // Strength-based bonuses
  if (champ.strengths.includes("engage")) traits.engage = (traits.engage || 0) + 2;
  if (champ.strengths.includes("poke")) traits.poke = (traits.poke || 0) + 2;
  if (champ.strengths.includes("teamfight")) traits.teamfight = (traits.teamfight || 0) + 2;
  if (champ.strengths.includes("splitpush")) traits.splitpush = (traits.splitpush || 0) + 2;
  if (champ.strengths.includes("sustain") || champ.strengths.includes("healing"))
    traits.sustain = (traits.sustain || 0) + 2;
  if (champ.strengths.includes("peel") || champ.strengths.includes("protection"))
    traits.protection = (traits.protection || 0) + 2;

  return traits;
}

function calculateTeamTraits(champIds: string[]): TeamTraits {
  const total: TeamTraits = {
    engage: 0,
    poke: 0,
    teamfight: 0,
    splitpush: 0,
    protection: 0,
    burst: 0,
    sustain: 0,
    tankiness: 0,
    dps: 0,
    cc: 0,
  };

  for (const id of champIds) {
    const champ = getChampionById(id);
    if (!champ) continue;
    const traits = getChampionTraits(champ);
    for (const [key, value] of Object.entries(traits)) {
      total[key as keyof TeamTraits] += value as number;
    }
  }

  return total;
}

function getDamageBalance(champIds: string[]): { ad: number; ap: number; mixed: number } {
  const balance = { ad: 0, ap: 0, mixed: 0 };
  for (const id of champIds) {
    const champ = getChampionById(id);
    if (!champ) continue;
    balance[champ.damage]++;
  }
  return balance;
}

function getStrengths(traits: TeamTraits): string[] {
  const strengths: string[] = [];
  const sorted = Object.entries(traits).sort(([, a], [, b]) => b - a);

  const traitLabels: Record<string, string> = {
    engage: "강력한 이니시에이팅",
    poke: "우수한 포킹 능력",
    teamfight: "뛰어난 한타 능력",
    splitpush: "강력한 스플릿 푸시",
    protection: "우수한 아군 보호",
    burst: "높은 폭딜 능력",
    sustain: "강력한 지속 회복",
    tankiness: "높은 생존력",
    dps: "뛰어난 지속 딜",
    cc: "풍부한 군중제어",
  };

  for (const [key, value] of sorted.slice(0, 3)) {
    if (value >= 3) {
      strengths.push(traitLabels[key] || key);
    }
  }

  return strengths;
}

function getWeaknesses(traits: TeamTraits, damageBalance: { ad: number; ap: number }): string[] {
  const weaknesses: string[] = [];

  if (traits.engage < 2) weaknesses.push("이니시에이팅 부족");
  if (traits.tankiness < 2) weaknesses.push("프론트라인 부족");
  if (traits.dps < 2) weaknesses.push("지속 딜링 부족");
  if (traits.protection < 2 && traits.cc < 2) weaknesses.push("아군 보호 능력 부족");
  if (damageBalance.ad >= 4) weaknesses.push("물리 데미지 편중 (방어력 쌓기 쉬움)");
  if (damageBalance.ap >= 4) weaknesses.push("마법 데미지 편중 (마저 쌓기 쉬움)");

  return weaknesses.slice(0, 3);
}

export function analyzeTeamComp(
  blueTeamIds: string[],
  redTeamIds: string[]
): TeamCompResult {
  const blueTraits = calculateTeamTraits(blueTeamIds);
  const redTraits = calculateTeamTraits(redTeamIds);

  const blueDmg = getDamageBalance(blueTeamIds);
  const redDmg = getDamageBalance(redTeamIds);

  // Calculate team scores
  const allStats = generateChampionStats();

  function teamAvgWinRate(ids: string[]): number {
    let total = 0;
    let count = 0;
    for (const id of ids) {
      const stat = allStats.find((s) => s.championId === id);
      if (stat) {
        total += stat.winRate;
        count++;
      }
    }
    return count > 0 ? total / count : 50;
  }

  const blueAvgWR = teamAvgWinRate(blueTeamIds);
  const redAvgWR = teamAvgWinRate(redTeamIds);

  // Team comp synergy scoring
  function traitScore(traits: TeamTraits): number {
    let score = 0;
    // Balanced teams get bonus
    const values = Object.values(traits);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const hasEngageFront = traits.engage >= 3 && traits.tankiness >= 3;
    const hasDamage = traits.dps >= 3 || traits.burst >= 3;
    const hasProtection = traits.protection >= 2;

    if (hasEngageFront) score += 3;
    if (hasDamage) score += 3;
    if (hasProtection) score += 2;
    score += avg * 0.5;

    return score;
  }

  const blueCompScore = traitScore(blueTraits);
  const redCompScore = traitScore(redTraits);

  // Final win rate calculation
  const wrDiff = (blueAvgWR - redAvgWR) * 0.5;
  const compDiff = (blueCompScore - redCompScore) * 1.5;
  const baseBlueWR = 50 + wrDiff + compDiff;
  const blueWinRate = Math.min(70, Math.max(30, baseBlueWR));
  const redWinRate = 100 - blueWinRate;

  // Analysis text
  let analysis = "";
  if (blueWinRate >= 55) {
    analysis = "블루팀이 조합상 우위를 점하고 있습니다. ";
  } else if (redWinRate >= 55) {
    analysis = "레드팀이 조합상 우위를 점하고 있습니다. ";
  } else {
    analysis = "양 팀의 조합이 비교적 균형 잡혀 있습니다. ";
  }

  if (blueTraits.engage > redTraits.engage + 3) {
    analysis += "블루팀의 이니시에이팅 능력이 뛰어나므로 한타를 유도하는 것이 유리합니다. ";
  }
  if (redTraits.engage > blueTraits.engage + 3) {
    analysis += "레드팀의 이니시에이팅 능력이 뛰어나므로 블루팀은 한타 회피가 중요합니다. ";
  }

  if (blueDmg.ad >= 4 || blueDmg.ap >= 4) {
    analysis += "블루팀의 데미지 타입이 편중되어 있어 상대가 방어력을 쉽게 쌓을 수 있습니다. ";
  }
  if (redDmg.ad >= 4 || redDmg.ap >= 4) {
    analysis += "레드팀의 데미지 타입이 편중되어 있어 상대가 방어력을 쉽게 쌓을 수 있습니다. ";
  }

  return {
    blueWinRate: Math.round(blueWinRate * 10) / 10,
    redWinRate: Math.round(redWinRate * 10) / 10,
    blueStrengths: getStrengths(blueTraits),
    blueWeaknesses: getWeaknesses(blueTraits, blueDmg),
    redStrengths: getStrengths(redTraits),
    redWeaknesses: getWeaknesses(redTraits, redDmg),
    analysis,
  };
}

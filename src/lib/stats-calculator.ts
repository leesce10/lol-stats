import { Position } from "@/types";

// Riot API의 포지션 → 우리 포지션 매핑
const POSITION_MAP: Record<string, Position> = {
  TOP: "top",
  JUNGLE: "jungle",
  MIDDLE: "mid",
  BOTTOM: "adc",
  UTILITY: "support",
};

export interface CollectedMatch {
  matchId: string;
  gameVersion: string;
  gameDuration: number;
  participants: {
    championName: string;
    championId: number;
    position: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    teamId: number;
  }[];
  bans: { championId: number; teamId: number }[];
}

export interface RealChampionStats {
  championName: string;
  position: Position;
  wins: number;
  games: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  tier: 1 | 2 | 3 | 4 | 5;
  fpScore: number;
}

export interface CollectedData {
  totalMatches: number;
  lastUpdated: string;
  matches: CollectedMatch[];
}

export function calculateRealStats(data: CollectedData): RealChampionStats[] {
  const totalMatches = data.totalMatches;
  if (totalMatches === 0) return [];

  // 챔피언별 포지션별 데이터 누적
  const champStats: Record<
    string,
    {
      wins: number;
      games: number;
      kills: number;
      deaths: number;
      assists: number;
    }
  > = {};

  // 밴 카운트
  const banCounts: Record<string, number> = {};

  for (const match of data.matches) {
    // 참가자 통계
    for (const p of match.participants) {
      const pos = POSITION_MAP[p.position];
      if (!pos) continue;

      const key = `${p.championName}|${pos}`;
      if (!champStats[key]) {
        champStats[key] = { wins: 0, games: 0, kills: 0, deaths: 0, assists: 0 };
      }

      champStats[key].games++;
      if (p.win) champStats[key].wins++;
      champStats[key].kills += p.kills;
      champStats[key].deaths += p.deaths;
      champStats[key].assists += p.assists;
    }

    // 밴 통계
    for (const ban of match.bans) {
      if (ban.championId > 0) {
        const key = String(ban.championId);
        banCounts[key] = (banCounts[key] || 0) + 1;
      }
    }
  }

  // 통계 계산
  const results: RealChampionStats[] = [];

  for (const [key, stat] of Object.entries(champStats)) {
    const [championName, position] = key.split("|");

    // 최소 게임 수 필터 (데이터 신뢰도)
    if (stat.games < 3) continue;

    const winRate = (stat.wins / stat.games) * 100;
    const pickRate = (stat.games / totalMatches) * 100;
    const avgKills = stat.kills / stat.games;
    const avgDeaths = stat.deaths / stat.games;
    const avgAssists = stat.assists / stat.games;

    // 밴률은 championId 기반이라 정확하지 않을 수 있음 (이름→ID 매핑 필요)
    const banRate = 0; // TODO: championId 매핑 후 계산

    let tier: 1 | 2 | 3 | 4 | 5;
    if (winRate >= 53) tier = 1;
    else if (winRate >= 51.5) tier = 2;
    else if (winRate >= 50) tier = 3;
    else if (winRate >= 48.5) tier = 4;
    else tier = 5;

    const fpScore = Math.min(
      10,
      Math.max(0, (winRate - 47) * 1.2 + (10 - banRate * 0.5))
    );

    results.push({
      championName,
      position: position as Position,
      wins: stat.wins,
      games: stat.games,
      winRate: Math.round(winRate * 100) / 100,
      pickRate: Math.round(pickRate * 100) / 100,
      banRate: Math.round(banRate * 100) / 100,
      avgKills: Math.round(avgKills * 10) / 10,
      avgDeaths: Math.round(avgDeaths * 10) / 10,
      avgAssists: Math.round(avgAssists * 10) / 10,
      tier,
      fpScore: Math.round(fpScore * 10) / 10,
    });
  }

  // 승률 기준 정렬
  results.sort((a, b) => b.winRate - a.winRate);

  return results;
}

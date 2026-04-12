export type Position = "top" | "jungle" | "mid" | "adc" | "support";

export const POSITION_LABELS: Record<Position, string> = {
  top: "탑",
  jungle: "정글",
  mid: "미드",
  adc: "원딜",
  support: "서폿",
};

/** 이모지 폴백 (텍스트 전용 컨텍스트) */
export const POSITION_ICONS: Record<Position, string> = {
  top: "⚔️",
  jungle: "🌿",
  mid: "🔮",
  adc: "🏹",
  support: "🛡️",
};

/** 롤 공식 포지션 아이콘 URL (Community Dragon CDN) */
export const POSITION_ICON_URLS: Record<Position, string> = {
  top: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png",
  jungle: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png",
  mid: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png",
  adc: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png",
  support: "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png",
};

export type ChampionClass =
  | "fighter"
  | "tank"
  | "mage"
  | "assassin"
  | "marksman"
  | "enchanter"
  | "controller";

export type GamePhase = "early" | "mid" | "late";

export interface ChampionData {
  id: string;
  name: string;
  nameEn: string;
  positions: Position[];
  classes: ChampionClass[];
  damage: "ad" | "ap" | "mixed";
  range: "melee" | "ranged";
  strengths: string[];
}

export interface ChampionStats {
  championId: string;
  position: Position;
  winRate: number;
  pickRate: number;
  banRate: number;
  games: number;
  tier: 1 | 2 | 3 | 4 | 5;
  fpScore: number;
}

export interface MatchupResult {
  myChampion: string;
  enemyChampion: string;
  position: Position;
  winRate: number;
  laneAdvantage: "strong" | "even" | "weak";
  phases: {
    early: { advantage: "strong" | "even" | "weak"; description: string };
    mid: { advantage: "strong" | "even" | "weak"; description: string };
    late: { advantage: "strong" | "even" | "weak"; description: string };
  };
  tips: string[];
  keyPoints: string[];
}

export interface TeamCompResult {
  blueWinRate: number;
  redWinRate: number;
  blueStrengths: string[];
  blueWeaknesses: string[];
  redStrengths: string[];
  redWeaknesses: string[];
  analysis: string;
}

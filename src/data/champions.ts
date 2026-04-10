import { ChampionData, ChampionStats, Position } from "@/types";

export const champions: ChampionData[] = [
  // === TOP ===
  { id: "Aatrox", name: "아트록스", nameEn: "Aatrox", positions: ["top"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["teamfight", "sustain", "early"] },
  { id: "Camille", name: "카밀", nameEn: "Camille", positions: ["top"], classes: ["fighter"], damage: "mixed", range: "melee", strengths: ["splitpush", "mid", "late"] },
  { id: "Darius", name: "다리우스", nameEn: "Darius", positions: ["top"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["early", "lane", "snowball"] },
  { id: "Fiora", name: "피오라", nameEn: "Fiora", positions: ["top"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["splitpush", "late", "dueling"] },
  { id: "Garen", name: "가렌", nameEn: "Garen", positions: ["top"], classes: ["fighter", "tank"], damage: "ad", range: "melee", strengths: ["early", "sustain", "simple"] },
  { id: "Gwen", name: "그웬", nameEn: "Gwen", positions: ["top"], classes: ["fighter"], damage: "ap", range: "melee", strengths: ["late", "teamfight", "splitpush"] },
  { id: "Irelia", name: "이렐리아", nameEn: "Irelia", positions: ["top", "mid"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["mid", "outplay", "allIn"] },
  { id: "Jax", name: "잭스", nameEn: "Jax", positions: ["top"], classes: ["fighter"], damage: "mixed", range: "melee", strengths: ["late", "splitpush", "dueling"] },
  { id: "KSante", name: "크산테", nameEn: "K'Sante", positions: ["top"], classes: ["tank", "fighter"], damage: "ad", range: "melee", strengths: ["teamfight", "engage", "peel"] },
  { id: "Malphite", name: "말파이트", nameEn: "Malphite", positions: ["top"], classes: ["tank"], damage: "ap", range: "melee", strengths: ["teamfight", "engage", "armor"] },
  { id: "Mordekaiser", name: "모데카이저", nameEn: "Mordekaiser", positions: ["top"], classes: ["fighter"], damage: "ap", range: "melee", strengths: ["mid", "isolation", "sustain"] },
  { id: "Ornn", name: "오른", nameEn: "Ornn", positions: ["top"], classes: ["tank"], damage: "mixed", range: "melee", strengths: ["teamfight", "engage", "scaling"] },
  { id: "Renekton", name: "레넥톤", nameEn: "Renekton", positions: ["top"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["early", "lane", "dive"] },
  { id: "Sett", name: "세트", nameEn: "Sett", positions: ["top"], classes: ["fighter", "tank"], damage: "ad", range: "melee", strengths: ["early", "teamfight", "simple"] },
  { id: "Ambessa", name: "암베사", nameEn: "Ambessa", positions: ["top"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["early", "allIn", "mobility"] },

  // === JUNGLE ===
  { id: "LeeSin", name: "리 신", nameEn: "Lee Sin", positions: ["jungle"], classes: ["fighter", "assassin"], damage: "ad", range: "melee", strengths: ["early", "gank", "mobility"] },
  { id: "Vi", name: "바이", nameEn: "Vi", positions: ["jungle"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["gank", "lockdown", "mid"] },
  { id: "JarvanIV", name: "자르반 4세", nameEn: "Jarvan IV", positions: ["jungle"], classes: ["fighter", "tank"], damage: "ad", range: "melee", strengths: ["gank", "engage", "early"] },
  { id: "Graves", name: "그레이브즈", nameEn: "Graves", positions: ["jungle"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["farm", "invade", "mid"] },
  { id: "Viego", name: "비에고", nameEn: "Viego", positions: ["jungle"], classes: ["fighter", "assassin"], damage: "ad", range: "melee", strengths: ["mid", "cleanup", "outplay"] },
  { id: "Elise", name: "엘리스", nameEn: "Elise", positions: ["jungle"], classes: ["mage", "assassin"], damage: "ap", range: "ranged", strengths: ["early", "gank", "dive"] },
  { id: "RekSai", name: "렉사이", nameEn: "Rek'Sai", positions: ["jungle"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["early", "gank", "map"] },
  { id: "Khazix", name: "카직스", nameEn: "Kha'Zix", positions: ["jungle"], classes: ["assassin"], damage: "ad", range: "melee", strengths: ["mid", "isolation", "snowball"] },
  { id: "Hecarim", name: "헤카림", nameEn: "Hecarim", positions: ["jungle"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["mid", "engage", "teamfight"] },
  { id: "Warwick", name: "워윅", nameEn: "Warwick", positions: ["jungle"], classes: ["fighter", "tank"], damage: "ad", range: "melee", strengths: ["early", "sustain", "simple"] },
  { id: "Amumu", name: "아무무", nameEn: "Amumu", positions: ["jungle"], classes: ["tank"], damage: "ap", range: "melee", strengths: ["teamfight", "engage", "simple"] },
  { id: "Kayn", name: "케인", nameEn: "Kayn", positions: ["jungle"], classes: ["fighter", "assassin"], damage: "ad", range: "melee", strengths: ["scaling", "farm", "flexibility"] },
  { id: "Nidalee", name: "니달리", nameEn: "Nidalee", positions: ["jungle"], classes: ["mage", "assassin"], damage: "ap", range: "ranged", strengths: ["early", "invade", "poke"] },
  { id: "Kindred", name: "킨드레드", nameEn: "Kindred", positions: ["jungle"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["scaling", "invade", "objective"] },
  { id: "BelVeth", name: "벨베스", nameEn: "Bel'Veth", positions: ["jungle"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["late", "farm", "splitpush"] },

  // === MID ===
  { id: "Ahri", name: "아리", nameEn: "Ahri", positions: ["mid"], classes: ["mage", "assassin"], damage: "ap", range: "ranged", strengths: ["roam", "pick", "safe"] },
  { id: "Zed", name: "제드", nameEn: "Zed", positions: ["mid"], classes: ["assassin"], damage: "ad", range: "melee", strengths: ["mid", "assassination", "splitpush"] },
  { id: "Yasuo", name: "야스오", nameEn: "Yasuo", positions: ["mid"], classes: ["fighter"], damage: "ad", range: "melee", strengths: ["late", "outplay", "scaling"] },
  { id: "Yone", name: "요네", nameEn: "Yone", positions: ["mid"], classes: ["fighter", "assassin"], damage: "mixed", range: "melee", strengths: ["late", "teamfight", "scaling"] },
  { id: "Syndra", name: "신드라", nameEn: "Syndra", positions: ["mid"], classes: ["mage"], damage: "ap", range: "ranged", strengths: ["lane", "burst", "zoning"] },
  { id: "Orianna", name: "오리아나", nameEn: "Orianna", positions: ["mid"], classes: ["mage"], damage: "ap", range: "ranged", strengths: ["teamfight", "safe", "scaling"] },
  { id: "Viktor", name: "빅토르", nameEn: "Viktor", positions: ["mid"], classes: ["mage"], damage: "ap", range: "ranged", strengths: ["late", "waveclear", "zoning"] },
  { id: "Lux", name: "럭스", nameEn: "Lux", positions: ["mid", "support"], classes: ["mage"], damage: "ap", range: "ranged", strengths: ["poke", "burst", "pick"] },
  { id: "Katarina", name: "카타리나", nameEn: "Katarina", positions: ["mid"], classes: ["assassin"], damage: "mixed", range: "melee", strengths: ["roam", "teamfight", "snowball"] },
  { id: "Akali", name: "아칼리", nameEn: "Akali", positions: ["mid"], classes: ["assassin"], damage: "ap", range: "melee", strengths: ["mid", "assassination", "outplay"] },
  { id: "Fizz", name: "피즈", nameEn: "Fizz", positions: ["mid"], classes: ["assassin"], damage: "ap", range: "melee", strengths: ["mid", "burst", "roam"] },
  { id: "Leblanc", name: "르블랑", nameEn: "LeBlanc", positions: ["mid"], classes: ["assassin", "mage"], damage: "ap", range: "ranged", strengths: ["early", "pick", "roam"] },
  { id: "Sylas", name: "사일러스", nameEn: "Sylas", positions: ["mid"], classes: ["mage", "fighter"], damage: "ap", range: "melee", strengths: ["mid", "teamfight", "sustain"] },
  { id: "Azir", name: "아지르", nameEn: "Azir", positions: ["mid"], classes: ["mage"], damage: "ap", range: "ranged", strengths: ["late", "zoning", "dps"] },
  { id: "Hwei", name: "흐웨이", nameEn: "Hwei", positions: ["mid"], classes: ["mage"], damage: "ap", range: "ranged", strengths: ["poke", "waveclear", "teamfight"] },
  { id: "Aurora", name: "오로라", nameEn: "Aurora", positions: ["mid", "top"], classes: ["mage", "fighter"], damage: "ap", range: "ranged", strengths: ["roam", "teamfight", "mobility"] },

  // === ADC ===
  { id: "Jinx", name: "징크스", nameEn: "Jinx", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["late", "teamfight", "hypercarry"] },
  { id: "Kaisa", name: "카이사", nameEn: "Kai'Sa", positions: ["adc"], classes: ["marksman", "assassin"], damage: "mixed", range: "ranged", strengths: ["mid", "burst", "flexibility"] },
  { id: "Vayne", name: "베인", nameEn: "Vayne", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["late", "tankKiller", "dueling"] },
  { id: "Jhin", name: "진", nameEn: "Jhin", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["pick", "utility", "lane"] },
  { id: "Caitlyn", name: "케이틀린", nameEn: "Caitlyn", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["early", "siege", "range"] },
  { id: "Ezreal", name: "이즈리얼", nameEn: "Ezreal", positions: ["adc"], classes: ["marksman"], damage: "mixed", range: "ranged", strengths: ["safe", "poke", "mid"] },
  { id: "Aphelios", name: "아펠리오스", nameEn: "Aphelios", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["late", "teamfight", "dps"] },
  { id: "Xayah", name: "자야", nameEn: "Xayah", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["mid", "selfPeel", "burst"] },
  { id: "MissFortune", name: "미스 포츈", nameEn: "Miss Fortune", positions: ["adc"], classes: ["marksman"], damage: "mixed", range: "ranged", strengths: ["lane", "teamfight", "simple"] },
  { id: "Draven", name: "드레이븐", nameEn: "Draven", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["early", "snowball", "lane"] },
  { id: "Lucian", name: "루시안", nameEn: "Lucian", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["early", "lane", "burst"] },
  { id: "Ashe", name: "애쉬", nameEn: "Ashe", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["utility", "pick", "simple"] },
  { id: "Tristana", name: "트리스타나", nameEn: "Tristana", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["late", "siege", "selfPeel"] },
  { id: "Samira", name: "사미라", nameEn: "Samira", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["allIn", "teamfight", "snowball"] },
  { id: "Zeri", name: "제리", nameEn: "Zeri", positions: ["adc"], classes: ["marksman"], damage: "ad", range: "ranged", strengths: ["late", "mobility", "kiting"] },

  // === SUPPORT ===
  { id: "Thresh", name: "쓰레쉬", nameEn: "Thresh", positions: ["support"], classes: ["controller", "tank"], damage: "ap", range: "ranged", strengths: ["pick", "peel", "engage"] },
  { id: "Lulu", name: "룰루", nameEn: "Lulu", positions: ["support"], classes: ["enchanter"], damage: "ap", range: "ranged", strengths: ["peel", "buff", "protection"] },
  { id: "Nami", name: "나미", nameEn: "Nami", positions: ["support"], classes: ["enchanter"], damage: "ap", range: "ranged", strengths: ["lane", "sustain", "engage"] },
  { id: "Nautilus", name: "노틸러스", nameEn: "Nautilus", positions: ["support"], classes: ["tank"], damage: "ap", range: "melee", strengths: ["engage", "lockdown", "tanky"] },
  { id: "Leona", name: "레오나", nameEn: "Leona", positions: ["support"], classes: ["tank"], damage: "ap", range: "melee", strengths: ["engage", "lockdown", "allIn"] },
  { id: "Pyke", name: "파이크", nameEn: "Pyke", positions: ["support"], classes: ["assassin"], damage: "ad", range: "melee", strengths: ["pick", "roam", "execution"] },
  { id: "Senna", name: "세나", nameEn: "Senna", positions: ["support"], classes: ["marksman", "enchanter"], damage: "ad", range: "ranged", strengths: ["scaling", "poke", "healing"] },
  { id: "Renata", name: "레나타 글라스크", nameEn: "Renata Glasc", positions: ["support"], classes: ["enchanter", "controller"], damage: "ap", range: "ranged", strengths: ["teamfight", "peel", "utility"] },
  { id: "Milio", name: "밀리오", nameEn: "Milio", positions: ["support"], classes: ["enchanter"], damage: "ap", range: "ranged", strengths: ["protection", "range", "cleanse"] },
  { id: "Yuumi", name: "유미", nameEn: "Yuumi", positions: ["support"], classes: ["enchanter"], damage: "ap", range: "ranged", strengths: ["buff", "late", "healing"] },
  { id: "Janna", name: "잔나", nameEn: "Janna", positions: ["support"], classes: ["enchanter"], damage: "ap", range: "ranged", strengths: ["peel", "disengage", "protection"] },
  { id: "Soraka", name: "소라카", nameEn: "Soraka", positions: ["support"], classes: ["enchanter"], damage: "ap", range: "ranged", strengths: ["healing", "sustain", "global"] },
  { id: "Blitzcrank", name: "블리츠크랭크", nameEn: "Blitzcrank", positions: ["support"], classes: ["tank", "controller"], damage: "ap", range: "melee", strengths: ["pick", "engage", "simple"] },
  { id: "Karma", name: "카르마", nameEn: "Karma", positions: ["support"], classes: ["enchanter", "mage"], damage: "ap", range: "ranged", strengths: ["poke", "utility", "early"] },
  { id: "Braum", name: "브라움", nameEn: "Braum", positions: ["support"], classes: ["tank"], damage: "ap", range: "melee", strengths: ["peel", "protection", "engage"] },
];

// Seeded random for consistent stats generation
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateChampionStats(): ChampionStats[] {
  const stats: ChampionStats[] = [];

  for (const champ of champions) {
    for (const pos of champ.positions) {
      const seed = hashString(champ.id + pos);
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed + 1);
      const r3 = seededRandom(seed + 2);
      const r4 = seededRandom(seed + 3);

      const winRate = 47 + r1 * 8; // 47% ~ 55%
      const pickRate = 1 + r2 * 14; // 1% ~ 15%
      const banRate = r3 * 20; // 0% ~ 20%
      const games = Math.floor(5000 + r4 * 95000); // 5000 ~ 100000

      let tier: 1 | 2 | 3 | 4 | 5;
      if (winRate >= 53) tier = 1;
      else if (winRate >= 51.5) tier = 2;
      else if (winRate >= 50) tier = 3;
      else if (winRate >= 48.5) tier = 4;
      else tier = 5;

      // FP Score: higher for higher win rate + lower ban rate combo
      const fpScore = Math.min(10, Math.max(0, (winRate - 47) * 1.2 + (10 - banRate * 0.5)));

      stats.push({
        championId: champ.id,
        position: pos as Position,
        winRate: Math.round(winRate * 100) / 100,
        pickRate: Math.round(pickRate * 100) / 100,
        banRate: Math.round(banRate * 100) / 100,
        games,
        tier,
        fpScore: Math.round(fpScore * 10) / 10,
      });
    }
  }

  return stats;
}

export function getChampionById(id: string): ChampionData | undefined {
  return champions.find((c) => c.id === id);
}

export function getChampionsByPosition(position: Position): ChampionData[] {
  return champions.filter((c) => c.positions.includes(position));
}

export const DDRAGON_VERSION = "15.7.1";
export function getChampionImageUrl(championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`;
}

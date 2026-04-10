// op.gg KR Emerald+ 기준 데이터 (패치 26.07, 테스트용)
// !! Production Key 승인 전까지만 사용. 공개 홍보 금지 !!

export interface ExternalChampionStats {
  id: number;
  name: string;
  nameKr: string;
  position: "top" | "jungle" | "mid" | "adc" | "support";
  games: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  tier: 1 | 2 | 3 | 4 | 5;
  counters: { name: string; nameKr: string; winRate: number; games: number }[];
  easyMatchups: { name: string; nameKr: string; winRate: number; games: number }[];
}

const POSITION_MAP: Record<number, "top" | "jungle" | "mid" | "adc" | "support"> = {
  0: "top",
  1: "jungle",
  2: "mid",
  3: "adc",
  4: "support",
};

export const externalStats: ExternalChampionStats[] = [
  // === TOP ===
  { id: 2, name: "Olaf", nameKr: "올라프", position: "top", games: 9341, winRate: 53.0, pickRate: 2.93, banRate: 3.29, tier: 1,
    counters: [{ name: "Vayne", nameKr: "베인", winRate: 44.2, games: 312 }, { name: "Quinn", nameKr: "퀸", winRate: 44.8, games: 198 }, { name: "Cassiopeia", nameKr: "카시오페아", winRate: 45.1, games: 156 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 58.3, games: 421 }, { name: "Yone", nameKr: "요네", winRate: 57.1, games: 387 }, { name: "Irelia", nameKr: "이렐리아", winRate: 56.4, games: 512 }] },
  { id: 41, name: "Gangplank", nameKr: "갱플랭크", position: "top", games: 11544, winRate: 52.23, pickRate: 3.62, banRate: 8.47, tier: 1,
    counters: [{ name: "Irelia", nameKr: "이렐리아", winRate: 44.5, games: 623 }, { name: "Camille", nameKr: "카밀", winRate: 45.2, games: 412 }, { name: "Riven", nameKr: "리븐", winRate: 45.8, games: 389 }],
    easyMatchups: [{ name: "Malphite", nameKr: "말파이트", winRate: 57.1, games: 721 }, { name: "Ornn", nameKr: "오른", winRate: 56.3, games: 534 }, { name: "Sion", nameKr: "사이온", winRate: 55.8, games: 445 }] },
  { id: 54, name: "Malphite", nameKr: "말파이트", position: "top", games: 22301, winRate: 51.69, pickRate: 7.0, banRate: 20.58, tier: 1,
    counters: [{ name: "Gangplank", nameKr: "갱플랭크", winRate: 44.2, games: 721 }, { name: "Gwen", nameKr: "그웬", winRate: 44.8, games: 512 }, { name: "Mordekaiser", nameKr: "모데카이저", winRate: 45.3, games: 834 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 57.8, games: 623 }, { name: "Yone", nameKr: "요네", winRate: 56.5, games: 578 }, { name: "Tryndamere", nameKr: "트린다미어", winRate: 55.9, games: 412 }] },
  { id: 86, name: "Garen", nameKr: "가렌", position: "top", games: 21382, winRate: 51.14, pickRate: 6.71, banRate: 5.82, tier: 1,
    counters: [{ name: "Vayne", nameKr: "베인", winRate: 43.5, games: 534 }, { name: "Quinn", nameKr: "퀸", winRate: 44.1, games: 312 }, { name: "Teemo", nameKr: "티모", winRate: 45.2, games: 678 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 55.8, games: 534 }, { name: "Akali", nameKr: "아칼리", winRate: 54.3, games: 312 }, { name: "Kayle", nameKr: "케일", winRate: 54.1, games: 445 }] },
  { id: 39, name: "Irelia", nameKr: "이렐리아", position: "top", games: 18998, winRate: 50.27, pickRate: 5.96, banRate: 26.89, tier: 1,
    counters: [{ name: "Volibear", nameKr: "볼리베어", winRate: 44.1, games: 534 }, { name: "Warwick", nameKr: "워윅", winRate: 44.5, games: 267 }, { name: "Trundle", nameKr: "트런들", winRate: 45.3, games: 312 }],
    easyMatchups: [{ name: "Gangplank", nameKr: "갱플랭크", winRate: 56.8, games: 623 }, { name: "Jayce", nameKr: "제이스", winRate: 55.2, games: 534 }, { name: "Kennen", nameKr: "케넨", winRate: 54.7, games: 389 }] },
  { id: 24, name: "Jax", nameKr: "잭스", position: "top", games: 19721, winRate: 50.04, pickRate: 6.19, banRate: 14.48, tier: 1,
    counters: [{ name: "Malphite", nameKr: "말파이트", winRate: 44.8, games: 812 }, { name: "Garen", nameKr: "가렌", winRate: 45.5, games: 678 }, { name: "Illaoi", nameKr: "일라오이", winRate: 45.9, games: 423 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 56.1, games: 534 }, { name: "Kayle", nameKr: "케일", winRate: 55.4, games: 445 }, { name: "Nasus", nameKr: "나서스", winRate: 54.7, games: 523 }] },
  { id: 14, name: "Sion", nameKr: "사이온", position: "top", games: 16012, winRate: 52.06, pickRate: 5.05, banRate: 1.03, tier: 2,
    counters: [{ name: "Fiora", nameKr: "피오라", winRate: 43.8, games: 534 }, { name: "Darius", nameKr: "다리우스", winRate: 44.5, games: 612 }, { name: "Mordekaiser", nameKr: "모데카이저", winRate: 45.1, games: 489 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 57.2, games: 389 }, { name: "Akali", nameKr: "아칼리", winRate: 55.4, games: 267 }, { name: "Riven", nameKr: "리븐", winRate: 54.8, games: 312 }] },
  { id: 516, name: "Ornn", nameKr: "오른", position: "top", games: 10923, winRate: 51.55, pickRate: 3.45, banRate: 0.3, tier: 2,
    counters: [{ name: "Fiora", nameKr: "피오라", winRate: 43.2, games: 445 }, { name: "Gangplank", nameKr: "갱플랭크", winRate: 44.1, games: 534 }, { name: "Vayne", nameKr: "베인", winRate: 44.8, games: 267 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 56.5, games: 312 }, { name: "Yone", nameKr: "요네", winRate: 55.8, games: 289 }, { name: "Riven", nameKr: "리븐", winRate: 54.3, games: 267 }] },
  { id: 122, name: "Darius", nameKr: "다리우스", position: "top", games: 15234, winRate: 50.45, pickRate: 4.78, banRate: 8.12, tier: 2,
    counters: [{ name: "Vayne", nameKr: "베인", winRate: 42.8, games: 423 }, { name: "Quinn", nameKr: "퀸", winRate: 43.5, games: 234 }, { name: "Kayle", nameKr: "케일", winRate: 44.2, games: 534 }],
    easyMatchups: [{ name: "Yasuo", nameKr: "야스오", winRate: 57.3, games: 445 }, { name: "Nasus", nameKr: "나서스", winRate: 55.8, games: 534 }, { name: "Garen", nameKr: "가렌", winRate: 54.1, games: 612 }] },
  { id: 114, name: "Fiora", nameKr: "피오라", position: "top", games: 14567, winRate: 50.12, pickRate: 4.57, banRate: 5.23, tier: 2,
    counters: [{ name: "Malphite", nameKr: "말파이트", winRate: 44.5, games: 534 }, { name: "Quinn", nameKr: "퀸", winRate: 45.1, games: 267 }, { name: "Vayne", nameKr: "베인", winRate: 45.5, games: 312 }],
    easyMatchups: [{ name: "Sion", nameKr: "사이온", winRate: 57.5, games: 534 }, { name: "Ornn", nameKr: "오른", winRate: 56.8, games: 445 }, { name: "Cho'Gath", nameKr: "초가스", winRate: 55.4, games: 312 }] },

  // === JUNGLE ===
  { id: 64, name: "Lee Sin", nameKr: "리 신", position: "jungle", games: 91833, winRate: 50.97, pickRate: 28.83, banRate: 50.45, tier: 1,
    counters: [{ name: "Warwick", nameKr: "워윅", winRate: 45.2, games: 1234 }, { name: "Rammus", nameKr: "람머스", winRate: 45.8, games: 812 }, { name: "Amumu", nameKr: "아무무", winRate: 46.1, games: 934 }],
    easyMatchups: [{ name: "Nidalee", nameKr: "니달리", winRate: 55.8, games: 1523 }, { name: "Elise", nameKr: "엘리스", winRate: 54.3, games: 1234 }, { name: "Karthus", nameKr: "카서스", winRate: 54.1, games: 812 }] },
  { id: 950, name: "Naafiri", nameKr: "나피리", position: "jungle", games: 29179, winRate: 50.84, pickRate: 9.16, banRate: 30.13, tier: 1,
    counters: [{ name: "Amumu", nameKr: "아무무", winRate: 44.5, games: 534 }, { name: "Rammus", nameKr: "람머스", winRate: 45.2, games: 389 }, { name: "Warwick", nameKr: "워윅", winRate: 45.8, games: 445 }],
    easyMatchups: [{ name: "Nidalee", nameKr: "니달리", winRate: 56.2, games: 534 }, { name: "Lillia", nameKr: "릴리아", winRate: 55.1, games: 445 }, { name: "Karthus", nameKr: "카서스", winRate: 54.5, games: 389 }] },
  { id: 104, name: "Graves", nameKr: "그레이브즈", position: "jungle", games: 56316, winRate: 49.26, pickRate: 17.68, banRate: 36.35, tier: 1,
    counters: [{ name: "Rammus", nameKr: "람머스", winRate: 43.8, games: 812 }, { name: "Amumu", nameKr: "아무무", winRate: 44.5, games: 934 }, { name: "Warwick", nameKr: "워윅", winRate: 45.2, games: 723 }],
    easyMatchups: [{ name: "Nidalee", nameKr: "니달리", winRate: 55.4, games: 1234 }, { name: "Elise", nameKr: "엘리스", winRate: 54.1, games: 934 }, { name: "Lee Sin", nameKr: "리 신", winRate: 53.2, games: 2345 }] },
  { id: 5, name: "Xin Zhao", nameKr: "신 짜오", position: "jungle", games: 31221, winRate: 51.20, pickRate: 9.80, banRate: 6.33, tier: 1,
    counters: [{ name: "Warwick", nameKr: "워윅", winRate: 44.8, games: 534 }, { name: "Rammus", nameKr: "람머스", winRate: 45.5, games: 389 }, { name: "Volibear", nameKr: "볼리베어", winRate: 46.1, games: 445 }],
    easyMatchups: [{ name: "Nidalee", nameKr: "니달리", winRate: 56.8, games: 534 }, { name: "Karthus", nameKr: "카서스", winRate: 55.2, games: 389 }, { name: "Lillia", nameKr: "릴리아", winRate: 54.5, games: 445 }] },
  { id: 421, name: "Rek'Sai", nameKr: "렉사이", position: "jungle", games: 10699, winRate: 52.83, pickRate: 3.36, banRate: 4.25, tier: 1,
    counters: [{ name: "Warwick", nameKr: "워윅", winRate: 44.1, games: 267 }, { name: "Volibear", nameKr: "볼리베어", winRate: 45.5, games: 234 }, { name: "Amumu", nameKr: "아무무", winRate: 46.2, games: 312 }],
    easyMatchups: [{ name: "Nidalee", nameKr: "니달리", winRate: 58.1, games: 312 }, { name: "Karthus", nameKr: "카서스", winRate: 56.5, games: 234 }, { name: "Lillia", nameKr: "릴리아", winRate: 55.2, games: 267 }] },

  // === MID ===
  { id: 103, name: "Ahri", nameKr: "아리", position: "mid", games: 41143, winRate: 50.69, pickRate: 12.92, banRate: 7.14, tier: 1,
    counters: [{ name: "Akshan", nameKr: "아크샨", winRate: 44.8, games: 934 }, { name: "Katarina", nameKr: "카타리나", winRate: 45.5, games: 1234 }, { name: "Fizz", nameKr: "피즈", winRate: 46.1, games: 812 }],
    easyMatchups: [{ name: "Viktor", nameKr: "빅토르", winRate: 55.2, games: 1523 }, { name: "Veigar", nameKr: "베이가", winRate: 54.8, games: 812 }, { name: "Malzahar", nameKr: "말자하", winRate: 54.1, games: 934 }] },
  { id: 84, name: "Akali", nameKr: "아칼리", position: "mid", games: 23174, winRate: 50.38, pickRate: 7.28, banRate: 29.55, tier: 1,
    counters: [{ name: "Galio", nameKr: "갈리오", winRate: 43.8, games: 812 }, { name: "Malzahar", nameKr: "말자하", winRate: 44.5, games: 534 }, { name: "Lissandra", nameKr: "리산드라", winRate: 45.2, games: 623 }],
    easyMatchups: [{ name: "Viktor", nameKr: "빅토르", winRate: 56.4, games: 812 }, { name: "Orianna", nameKr: "오리아나", winRate: 55.1, games: 934 }, { name: "Xerath", nameKr: "제라스", winRate: 54.8, games: 723 }] },
  { id: 4, name: "Twisted Fate", nameKr: "트위스티드 페이트", position: "mid", games: 25573, winRate: 51.98, pickRate: 8.03, banRate: 4.38, tier: 1,
    counters: [{ name: "Fizz", nameKr: "피즈", winRate: 43.5, games: 812 }, { name: "Zed", nameKr: "제드", winRate: 44.2, games: 934 }, { name: "Katarina", nameKr: "카타리나", winRate: 45.1, games: 723 }],
    easyMatchups: [{ name: "Viktor", nameKr: "빅토르", winRate: 56.8, games: 934 }, { name: "Orianna", nameKr: "오리아나", winRate: 55.5, games: 812 }, { name: "Ryze", nameKr: "라이즈", winRate: 54.2, games: 623 }] },
  { id: 127, name: "Lissandra", nameKr: "리산드라", position: "mid", games: 15371, winRate: 52.55, pickRate: 4.83, banRate: 1.10, tier: 2,
    counters: [{ name: "Xerath", nameKr: "제라스", winRate: 44.5, games: 534 }, { name: "Vel'Koz", nameKr: "벨코즈", winRate: 45.2, games: 312 }, { name: "Anivia", nameKr: "애니비아", winRate: 45.8, games: 389 }],
    easyMatchups: [{ name: "Akali", nameKr: "아칼리", winRate: 55.8, games: 623 }, { name: "Katarina", nameKr: "카타리나", winRate: 55.1, games: 534 }, { name: "Fizz", nameKr: "피즈", winRate: 54.5, games: 445 }] },
  { id: 112, name: "Viktor", nameKr: "빅토르", position: "mid", games: 28129, winRate: 50.14, pickRate: 8.83, banRate: 5.88, tier: 2,
    counters: [{ name: "Fizz", nameKr: "피즈", winRate: 43.2, games: 812 }, { name: "Akali", nameKr: "아칼리", winRate: 43.8, games: 812 }, { name: "Katarina", nameKr: "카타리나", winRate: 44.5, games: 934 }],
    easyMatchups: [{ name: "Malzahar", nameKr: "말자하", winRate: 55.8, games: 534 }, { name: "Veigar", nameKr: "베이가", winRate: 55.1, games: 445 }, { name: "Orianna", nameKr: "오리아나", winRate: 54.2, games: 812 }] },
  { id: 142, name: "Zoe", nameKr: "조이", position: "mid", games: 14161, winRate: 51.44, pickRate: 4.45, banRate: 14.23, tier: 1,
    counters: [{ name: "Fizz", nameKr: "피즈", winRate: 43.5, games: 534 }, { name: "Katarina", nameKr: "카타리나", winRate: 44.8, games: 445 }, { name: "Zed", nameKr: "제드", winRate: 45.5, games: 534 }],
    easyMatchups: [{ name: "Viktor", nameKr: "빅토르", winRate: 56.2, games: 534 }, { name: "Orianna", nameKr: "오리아나", winRate: 55.5, games: 445 }, { name: "Ryze", nameKr: "라이즈", winRate: 54.1, games: 389 }] },
  { id: 101, name: "Xerath", nameKr: "제라스", position: "mid", games: 20568, winRate: 50.87, pickRate: 6.46, banRate: 10.54, tier: 2,
    counters: [{ name: "Fizz", nameKr: "피즈", winRate: 42.5, games: 623 }, { name: "Zed", nameKr: "제드", winRate: 43.8, games: 812 }, { name: "Katarina", nameKr: "카타리나", winRate: 44.2, games: 723 }],
    easyMatchups: [{ name: "Viktor", nameKr: "빅토르", winRate: 55.5, games: 723 }, { name: "Malzahar", nameKr: "말자하", winRate: 54.8, games: 534 }, { name: "Orianna", nameKr: "오리아나", winRate: 54.1, games: 623 }] },
  { id: 61, name: "Orianna", nameKr: "오리아나", position: "mid", games: 26497, winRate: 49.75, pickRate: 8.32, banRate: 2.89, tier: 2,
    counters: [{ name: "Fizz", nameKr: "피즈", winRate: 43.1, games: 812 }, { name: "Akali", nameKr: "아칼리", winRate: 44.2, games: 934 }, { name: "Zed", nameKr: "제드", winRate: 44.8, games: 812 }],
    easyMatchups: [{ name: "Malzahar", nameKr: "말자하", winRate: 54.5, games: 623 }, { name: "Veigar", nameKr: "베이가", winRate: 53.8, games: 445 }, { name: "Ryze", nameKr: "라이즈", winRate: 53.2, games: 534 }] },

  // === ADC ===
  { id: 22, name: "Ashe", nameKr: "애쉬", position: "adc", games: 42971, winRate: 51.80, pickRate: 13.49, banRate: 11.46, tier: 1,
    counters: [{ name: "Samira", nameKr: "사미라", winRate: 44.5, games: 934 }, { name: "Draven", nameKr: "드레이븐", winRate: 45.2, games: 812 }, { name: "Lucian", nameKr: "루시안", winRate: 45.8, games: 723 }],
    easyMatchups: [{ name: "Jinx", nameKr: "징크스", winRate: 54.8, games: 1523 }, { name: "Kog'Maw", nameKr: "코그모", winRate: 54.2, games: 534 }, { name: "Aphelios", nameKr: "아펠리오스", winRate: 53.5, games: 812 }] },
  { id: 222, name: "Jinx", nameKr: "징크스", position: "adc", games: 38688, winRate: 51.73, pickRate: 12.15, banRate: 5.54, tier: 1,
    counters: [{ name: "Draven", nameKr: "드레이븐", winRate: 43.8, games: 812 }, { name: "Lucian", nameKr: "루시안", winRate: 44.5, games: 934 }, { name: "Samira", nameKr: "사미라", winRate: 45.2, games: 723 }],
    easyMatchups: [{ name: "Kog'Maw", nameKr: "코그모", winRate: 55.8, games: 445 }, { name: "Aphelios", nameKr: "아펠리오스", winRate: 54.5, games: 812 }, { name: "Varus", nameKr: "바루스", winRate: 53.8, games: 723 }] },
  { id: 202, name: "Jhin", nameKr: "진", position: "adc", games: 85828, winRate: 49.28, pickRate: 26.95, banRate: 4.02, tier: 2,
    counters: [{ name: "Samira", nameKr: "사미라", winRate: 44.2, games: 1523 }, { name: "Draven", nameKr: "드레이븐", winRate: 44.8, games: 1234 }, { name: "Lucian", nameKr: "루시안", winRate: 45.5, games: 1523 }],
    easyMatchups: [{ name: "Kog'Maw", nameKr: "코그모", winRate: 53.8, games: 812 }, { name: "Aphelios", nameKr: "아펠리오스", winRate: 53.2, games: 1234 }, { name: "Varus", nameKr: "바루스", winRate: 52.8, games: 934 }] },
  { id: 21, name: "Miss Fortune", nameKr: "미스 포츈", position: "adc", games: 20456, winRate: 51.73, pickRate: 6.43, banRate: 2.66, tier: 2,
    counters: [{ name: "Samira", nameKr: "사미라", winRate: 44.8, games: 534 }, { name: "Draven", nameKr: "드레이븐", winRate: 45.2, games: 445 }, { name: "Lucian", nameKr: "루시안", winRate: 45.8, games: 534 }],
    easyMatchups: [{ name: "Jinx", nameKr: "징크스", winRate: 54.5, games: 812 }, { name: "Kog'Maw", nameKr: "코그모", winRate: 54.1, games: 389 }, { name: "Aphelios", nameKr: "아펠리오스", winRate: 53.2, games: 534 }] },
  { id: 498, name: "Xayah", nameKr: "자야", position: "adc", games: 15389, winRate: 52.03, pickRate: 4.84, banRate: 0.99, tier: 2,
    counters: [{ name: "Draven", nameKr: "드레이븐", winRate: 44.5, games: 389 }, { name: "Lucian", nameKr: "루시안", winRate: 45.1, games: 445 }, { name: "Kalista", nameKr: "칼리스타", winRate: 45.8, games: 267 }],
    easyMatchups: [{ name: "Kog'Maw", nameKr: "코그모", winRate: 56.2, games: 312 }, { name: "Aphelios", nameKr: "아펠리오스", winRate: 55.1, games: 445 }, { name: "Varus", nameKr: "바루스", winRate: 54.5, games: 389 }] },

  // === SUPPORT ===
  { id: 43, name: "Karma", nameKr: "카르마", position: "support", games: 52253, winRate: 50.84, pickRate: 16.41, banRate: 32.41, tier: 1,
    counters: [{ name: "Zyra", nameKr: "자이라", winRate: 44.5, games: 934 }, { name: "Xerath", nameKr: "제라스", winRate: 45.2, games: 812 }, { name: "Brand", nameKr: "브랜드", winRate: 45.8, games: 723 }],
    easyMatchups: [{ name: "Thresh", nameKr: "쓰레쉬", winRate: 54.8, games: 1523 }, { name: "Nautilus", nameKr: "노틸러스", winRate: 54.2, games: 1234 }, { name: "Leona", nameKr: "레오나", winRate: 53.5, games: 934 }] },
  { id: 201, name: "Braum", nameKr: "브라움", position: "support", games: 20266, winRate: 52.06, pickRate: 6.36, banRate: 17.85, tier: 1,
    counters: [{ name: "Zyra", nameKr: "자이라", winRate: 44.2, games: 534 }, { name: "Brand", nameKr: "브랜드", winRate: 44.8, games: 445 }, { name: "Vel'Koz", nameKr: "벨코즈", winRate: 45.5, games: 312 }],
    easyMatchups: [{ name: "Thresh", nameKr: "쓰레쉬", winRate: 55.8, games: 812 }, { name: "Blitzcrank", nameKr: "블리츠크랭크", winRate: 54.5, games: 623 }, { name: "Pyke", nameKr: "파이크", winRate: 53.8, games: 445 }] },
  { id: 412, name: "Thresh", nameKr: "쓰레쉬", position: "support", games: 39614, winRate: 51.26, pickRate: 12.44, banRate: 9.17, tier: 1,
    counters: [{ name: "Zyra", nameKr: "자이라", winRate: 44.8, games: 812 }, { name: "Karma", nameKr: "카르마", winRate: 45.2, games: 1523 }, { name: "Brand", nameKr: "브랜드", winRate: 45.8, games: 623 }],
    easyMatchups: [{ name: "Yuumi", nameKr: "유미", winRate: 56.5, games: 534 }, { name: "Soraka", nameKr: "소라카", winRate: 55.1, games: 623 }, { name: "Sona", nameKr: "소나", winRate: 54.2, games: 445 }] },
  { id: 111, name: "Nautilus", nameKr: "노틸러스", position: "support", games: 42883, winRate: 50.07, pickRate: 13.46, banRate: 19.22, tier: 1,
    counters: [{ name: "Morgana", nameKr: "모르가나", winRate: 43.5, games: 1234 }, { name: "Zyra", nameKr: "자이라", winRate: 44.2, games: 812 }, { name: "Brand", nameKr: "브랜드", winRate: 44.8, games: 723 }],
    easyMatchups: [{ name: "Yuumi", nameKr: "유미", winRate: 57.2, games: 534 }, { name: "Soraka", nameKr: "소라카", winRate: 55.8, games: 623 }, { name: "Sona", nameKr: "소나", winRate: 54.5, games: 445 }] },
  { id: 89, name: "Leona", nameKr: "레오나", position: "support", games: 23459, winRate: 51.95, pickRate: 7.37, banRate: 8.01, tier: 2,
    counters: [{ name: "Morgana", nameKr: "모르가나", winRate: 43.2, games: 812 }, { name: "Zyra", nameKr: "자이라", winRate: 44.5, games: 623 }, { name: "Brand", nameKr: "브랜드", winRate: 45.1, games: 534 }],
    easyMatchups: [{ name: "Yuumi", nameKr: "유미", winRate: 58.5, games: 445 }, { name: "Soraka", nameKr: "소라카", winRate: 56.2, games: 534 }, { name: "Lulu", nameKr: "룰루", winRate: 54.8, games: 623 }] },
  { id: 432, name: "Bard", nameKr: "바드", position: "support", games: 23706, winRate: 51.83, pickRate: 7.44, banRate: 2.85, tier: 2,
    counters: [{ name: "Zyra", nameKr: "자이라", winRate: 44.5, games: 534 }, { name: "Brand", nameKr: "브랜드", winRate: 45.2, games: 445 }, { name: "Xerath", nameKr: "제라스", winRate: 45.8, games: 389 }],
    easyMatchups: [{ name: "Yuumi", nameKr: "유미", winRate: 57.8, games: 389 }, { name: "Soraka", nameKr: "소라카", winRate: 55.5, games: 445 }, { name: "Lulu", nameKr: "룰루", winRate: 54.2, games: 534 }] },
  { id: 53, name: "Blitzcrank", nameKr: "블리츠크랭크", position: "support", games: 25465, winRate: 50.56, pickRate: 8.0, banRate: 22.93, tier: 2,
    counters: [{ name: "Morgana", nameKr: "모르가나", winRate: 42.8, games: 934 }, { name: "Sivir", nameKr: "시비르", winRate: 44.5, games: 312 }, { name: "Zyra", nameKr: "자이라", winRate: 45.1, games: 534 }],
    easyMatchups: [{ name: "Yuumi", nameKr: "유미", winRate: 58.2, games: 389 }, { name: "Soraka", nameKr: "소라카", winRate: 56.5, games: 445 }, { name: "Sona", nameKr: "소나", winRate: 55.8, games: 312 }] },
  { id: 117, name: "Lulu", nameKr: "룰루", position: "support", games: 35175, winRate: 50.14, pickRate: 11.04, banRate: 8.02, tier: 2,
    counters: [{ name: "Zyra", nameKr: "자이라", winRate: 44.2, games: 623 }, { name: "Brand", nameKr: "브랜드", winRate: 44.8, games: 534 }, { name: "Xerath", nameKr: "제라스", winRate: 45.5, games: 445 }],
    easyMatchups: [{ name: "Thresh", nameKr: "쓰레쉬", winRate: 54.2, games: 934 }, { name: "Nautilus", nameKr: "노틸러스", winRate: 53.5, games: 812 }, { name: "Leona", nameKr: "레오나", winRate: 53.1, games: 623 }] },
];

export function getExternalStatsByPosition(position: string): ExternalChampionStats[] {
  return externalStats.filter((s) => s.position === position)
    .sort((a, b) => b.winRate - a.winRate);
}

export function getExternalStatsById(name: string): ExternalChampionStats | undefined {
  return externalStats.find((s) => s.name === name);
}

export function getAllExternalStats(): ExternalChampionStats[] {
  return [...externalStats].sort((a, b) => b.winRate - a.winRate);
}

export const EXTERNAL_DATA_INFO = {
  source: "op.gg KR Emerald+",
  patch: "26.07",
  totalSamples: 3007232,
  lastUpdated: "2026-04-11",
  warning: "테스트용 데이터입니다. 실제 서비스에서는 자체 수집 데이터를 사용합니다.",
};

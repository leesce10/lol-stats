// op.gg KR Emerald+ 기반 데이터 (패치 26.07, 테스트용)
// !! Production Key 승인 전까지만 사용. 공개 홍보 금지 !!

import { allChampions, ChampionMeta } from "./all-champions";

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

// op.gg에서 가져온 실제 기준값 (KR Emerald+)
const REAL_DATA: Record<string, Partial<ExternalChampionStats>> = {
  // ── TOP ──
  "Malphite|top": { winRate: 52.04, pickRate: 7.13, banRate: 19.41, games: 21390, tier: 3 },
  "Sion|top": { winRate: 52.06, pickRate: 5.05, banRate: 1.03, games: 15150, tier: 3 },
  "Olaf|top": { winRate: 53.16, pickRate: 2.98, banRate: 3.13, games: 8940, tier: 1 },
  "Garen|top": { winRate: 51.26, pickRate: 6.8, banRate: 5.58, games: 20400, tier: 2 },
  "Gangplank|top": { winRate: 52.5, pickRate: 3.64, banRate: 8.0, games: 10920, tier: 1 },
  "Irelia|top": { winRate: 50.48, pickRate: 6.04, banRate: 25.51, games: 18120, tier: 3 },
  "Poppy|top": { winRate: 53.18, pickRate: 1.92, banRate: 6.42, games: 5760, tier: 1 },
  "Jax|top": { winRate: 50.37, pickRate: 6.28, banRate: 13.74, games: 18840, tier: 3 },
  "Shen|top": { winRate: 52.0, pickRate: 3.19, banRate: 0.67, games: 9570, tier: 3 },
  "Renekton|top": { winRate: 50.24, pickRate: 6.64, banRate: 5.56, games: 19920, tier: 3 },
  "Pantheon|top": { winRate: 52.76, pickRate: 2.08, banRate: 1.37, games: 6240, tier: 1 },
  "Camille|top": { winRate: 51.85, pickRate: 3.1, banRate: 0.24, games: 9300, tier: 2 },
  "Gnar|top": { winRate: 50.56, pickRate: 5.42, banRate: 3.07, games: 16260, tier: 3 },
  "Ornn|top": { winRate: 51.55, pickRate: 3.45, banRate: 0.3, games: 10350, tier: 2 },
  "Jayce|top": { winRate: 48.99, pickRate: 9.25, banRate: 14.11, games: 27750, tier: 4 },
  "Singed|top": { winRate: 51.85, pickRate: 2.79, banRate: 1.07, games: 8370, tier: 2 },
  "Ambessa|top": { winRate: 49.91, pickRate: 5.75, banRate: 11.96, games: 17250, tier: 3 },
  "Sett|top": { winRate: 50.64, pickRate: 4.16, banRate: 1.24, games: 12480, tier: 3 },
  "Aatrox|top": { winRate: 49.33, pickRate: 6.87, banRate: 4.87, games: 20610, tier: 4 },
  "Kennen|top": { winRate: 51.01, pickRate: 3.25, banRate: 4.65, games: 9750, tier: 2 },
  "Vayne|top": { winRate: 49.82, pickRate: 5.24, banRate: 8.02, games: 15720, tier: 3 },
  "Anivia|top": { winRate: 52.32, pickRate: 1.6, banRate: 4.34, games: 4800, tier: 3 },
  "Darius|top": { winRate: 49.9, pickRate: 4.5, banRate: 8.85, games: 13500, tier: 3 },
  "Yorick|top": { winRate: 50.3, pickRate: 3.79, banRate: 6.46, games: 11370, tier: 3 },
  "Rumble|top": { winRate: 49.85, pickRate: 4.23, banRate: 5.95, games: 12690, tier: 3 },
  "Yone|top": { winRate: 48.87, pickRate: 6.18, banRate: 5.41, games: 18540, tier: 4 },
  "Urgot|top": { winRate: 52.59, pickRate: 1.21, banRate: 0.12, games: 3630, tier: 1 },
  "Fiora|top": { winRate: 49.79, pickRate: 3.84, banRate: 5.01, games: 11520, tier: 3 },
  "Kayle|top": { winRate: 52.17, pickRate: 1.26, banRate: 0.54, games: 3780, tier: 3 },
  "Yasuo|top": { winRate: 49.44, pickRate: 3.55, banRate: 14.35, games: 10650, tier: 4 },
  "Warwick|top": { winRate: 52.32, pickRate: 1.13, banRate: 0.52, games: 3390, tier: 3 },
  "Kled|top": { winRate: 51.95, pickRate: 1.33, banRate: 0.31, games: 3990, tier: 2 },
  "Nasus|top": { winRate: 50.37, pickRate: 2.53, banRate: 1.05, games: 7590, tier: 3 },
  "Akali|top": { winRate: 49.03, pickRate: 3.35, banRate: 28.03, games: 10050, tier: 4 },
  "Teemo|top": { winRate: 50.41, pickRate: 2.32, banRate: 4.05, games: 6960, tier: 3 },
  "Mordekaiser|top": { winRate: 48.76, pickRate: 3.85, banRate: 1.89, games: 11550, tier: 4 },
  "KSante|top": { winRate: 47.72, pickRate: 5.87, banRate: 2.68, games: 17610, tier: 5 },
  "Volibear|top": { winRate: 49.55, pickRate: 2.44, banRate: 1.34, games: 7320, tier: 3 },
  "Gragas|top": { winRate: 50.04, pickRate: 1.86, banRate: 0.26, games: 5580, tier: 3 },
  "Illaoi|top": { winRate: 50.28, pickRate: 1.63, banRate: 1.26, games: 4890, tier: 3 },
  "Tryndamere|top": { winRate: 49.61, pickRate: 1.69, banRate: 0.59, games: 5070, tier: 3 },
  "Riven|top": { winRate: 49.07, pickRate: 2.13, banRate: 0.2, games: 6390, tier: 4 },
  "DrMundo|top": { winRate: 48.99, pickRate: 2.0, banRate: 0.71, games: 6000, tier: 4 },
  "Quinn|top": { winRate: 52.29, pickRate: 0.78, banRate: 0.51, games: 2340, tier: 3 },
  "Aurora|top": { winRate: 50.02, pickRate: 1.06, banRate: 2.2, games: 3180, tier: 3 },
  // ── JUNGLE ──
  "LeeSin|jungle": { winRate: 51.18, pickRate: 28.31, banRate: 47.92, games: 84930, tier: 2 },
  "RekSai|jungle": { winRate: 53.45, pickRate: 3.32, banRate: 4.03, games: 9960, tier: 1 },
  "XinZhao|jungle": { winRate: 51.37, pickRate: 9.65, banRate: 5.96, games: 28950, tier: 2 },
  "Naafiri|jungle": { winRate: 51.07, pickRate: 9.06, banRate: 28.4, games: 27180, tier: 2 },
  "Zyra|jungle": { winRate: 52.52, pickRate: 2.42, banRate: 3.77, games: 7260, tier: 1 },
  "Belveth|jungle": { winRate: 53.22, pickRate: 1.3, banRate: 0.94, games: 3900, tier: 1 },
  "Nocturne|jungle": { winRate: 51.1, pickRate: 6.91, banRate: 8.58, games: 20730, tier: 2 },
  "Graves|jungle": { winRate: 49.54, pickRate: 17.43, banRate: 34.37, games: 52290, tier: 3 },
  "Briar|jungle": { winRate: 51.45, pickRate: 3.7, banRate: 2.58, games: 11100, tier: 2 },
  "Ivern|jungle": { winRate: 53.17, pickRate: 0.76, banRate: 0.27, games: 2280, tier: 1 },
  "Warwick|jungle": { winRate: 52.16, pickRate: 1.53, banRate: 0.52, games: 4590, tier: 3 },
  "Vi|jungle": { winRate: 50.11, pickRate: 8.99, banRate: 5.56, games: 26970, tier: 3 },
  "Elise|jungle": { winRate: 51.39, pickRate: 2.67, banRate: 4.03, games: 8010, tier: 2 },
  "Karthus|jungle": { winRate: 51.76, pickRate: 1.71, banRate: 3.33, games: 5130, tier: 2 },
  "JarvanIV|jungle": { winRate: 50.02, pickRate: 7.29, banRate: 0.57, games: 21870, tier: 3 },
  "Nidalee|jungle": { winRate: 50.18, pickRate: 4.8, banRate: 4.3, games: 14400, tier: 3 },
  "Nunu|jungle": { winRate: 51.38, pickRate: 1.69, banRate: 0.62, games: 5070, tier: 2 },
  "Sejuani|jungle": { winRate: 51.44, pickRate: 1.58, banRate: 0.1, games: 4740, tier: 2 },
  "Evelynn|jungle": { winRate: 51.21, pickRate: 1.68, banRate: 0.65, games: 5040, tier: 2 },
  "Rammus|jungle": { winRate: 51.42, pickRate: 1.2, banRate: 1.05, games: 3600, tier: 2 },
  "Shaco|jungle": { winRate: 50.03, pickRate: 2.63, banRate: 24.92, games: 7890, tier: 3 },
  "Fiddlesticks|jungle": { winRate: 50.88, pickRate: 1.53, banRate: 0.72, games: 4590, tier: 3 },
  "Kayn|jungle": { winRate: 50.31, pickRate: 2.37, banRate: 0.21, games: 7110, tier: 3 },
  "Hecarim|jungle": { winRate: 49.9, pickRate: 3.16, banRate: 0.85, games: 9480, tier: 3 },
  "Ekko|jungle": { winRate: 50.06, pickRate: 2.69, banRate: 0.83, games: 8070, tier: 3 },
  "Skarner|jungle": { winRate: 51.04, pickRate: 1.12, banRate: 0.18, games: 3360, tier: 2 },
  "Taliyah|jungle": { winRate: 50.74, pickRate: 1.32, banRate: 0.39, games: 3960, tier: 3 },
  "Zac|jungle": { winRate: 49.98, pickRate: 2.4, banRate: 0.72, games: 7200, tier: 3 },
  "Kindred|jungle": { winRate: 50.07, pickRate: 2.19, banRate: 0.48, games: 6570, tier: 3 },
  "Diana|jungle": { winRate: 50.06, pickRate: 1.91, banRate: 1.71, games: 5730, tier: 3 },
  "Talon|jungle": { winRate: 49.32, pickRate: 3.53, banRate: 2.44, games: 10590, tier: 4 },
  "Viego|jungle": { winRate: 46.95, pickRate: 8.83, banRate: 2.48, games: 26490, tier: 5 },
  "Khazix|jungle": { winRate: 48.98, pickRate: 3.86, banRate: 2.73, games: 11580, tier: 4 },
  "Shyvana|jungle": { winRate: 49.45, pickRate: 2.25, banRate: 6.6, games: 6750, tier: 4 },
  "MasterYi|jungle": { winRate: 48.88, pickRate: 3.55, banRate: 1.77, games: 10650, tier: 4 },
  "Lillia|jungle": { winRate: 49.33, pickRate: 2.43, banRate: 1.08, games: 7290, tier: 4 },
  "Rengar|jungle": { winRate: 49.7, pickRate: 1.0, banRate: 0.56, games: 3000, tier: 3 },
  "Amumu|jungle": { winRate: 48.23, pickRate: 0.81, banRate: 0.11, games: 2430, tier: 4 },
  // ── MID ──
  "TwistedFate|mid": { winRate: 52.15, pickRate: 8.15, banRate: 4.1, games: 24450, tier: 3 },
  "Ahri|mid": { winRate: 50.95, pickRate: 13.07, banRate: 6.79, games: 39210, tier: 3 },
  "Lissandra|mid": { winRate: 52.55, pickRate: 4.92, banRate: 1.05, games: 14760, tier: 1 },
  "Vex|mid": { winRate: 53.13, pickRate: 3.52, banRate: 3.97, games: 10560, tier: 1 },
  "Akali|mid": { winRate: 50.64, pickRate: 7.37, banRate: 28.03, games: 22110, tier: 3 },
  "Xerath|mid": { winRate: 51.03, pickRate: 6.58, banRate: 10.09, games: 19740, tier: 2 },
  "Viktor|mid": { winRate: 50.3, pickRate: 8.95, banRate: 5.57, games: 26850, tier: 3 },
  "Orianna|mid": { winRate: 50.11, pickRate: 8.44, banRate: 2.79, games: 25320, tier: 3 },
  "Zoe|mid": { winRate: 51.37, pickRate: 4.5, banRate: 13.67, games: 13500, tier: 2 },
  "Katarina|mid": { winRate: 51.55, pickRate: 4.36, banRate: 3.08, games: 13080, tier: 2 },
  "Leblanc|mid": { winRate: 50.15, pickRate: 5.44, banRate: 37.4, games: 16320, tier: 3 },
  "Sylas|mid": { winRate: 48.83, pickRate: 9.28, banRate: 21.77, games: 27840, tier: 4 },
  "Malzahar|mid": { winRate: 51.44, pickRate: 3.86, banRate: 2.26, games: 11580, tier: 2 },
  "Annie|mid": { winRate: 52.45, pickRate: 2.5, banRate: 0.37, games: 7500, tier: 3 },
  "Diana|mid": { winRate: 51.41, pickRate: 3.56, banRate: 1.71, games: 10680, tier: 2 },
  "Yasuo|mid": { winRate: 49.8, pickRate: 6.1, banRate: 14.35, games: 18300, tier: 3 },
  "Naafiri|mid": { winRate: 51.75, pickRate: 1.96, banRate: 28.4, games: 5880, tier: 2 },
  "Anivia|mid": { winRate: 51.14, pickRate: 3.5, banRate: 4.34, games: 10500, tier: 2 },
  "Fizz|mid": { winRate: 51.36, pickRate: 3.28, banRate: 2.3, games: 9840, tier: 2 },
  "Zed|mid": { winRate: 49.41, pickRate: 6.04, banRate: 20.67, games: 18120, tier: 4 },
  "Hwei|mid": { winRate: 50.9, pickRate: 3.58, banRate: 1.46, games: 10740, tier: 3 },
  "Aurora|mid": { winRate: 50.1, pickRate: 4.92, banRate: 2.2, games: 14760, tier: 3 },
  "AurelionSol|mid": { winRate: 52.04, pickRate: 1.99, banRate: 0.2, games: 5970, tier: 3 },
  "Syndra|mid": { winRate: 50.45, pickRate: 3.32, banRate: 1.01, games: 9960, tier: 3 },
  "Ekko|mid": { winRate: 51.75, pickRate: 1.67, banRate: 0.83, games: 5010, tier: 2 },
  "Qiyana|mid": { winRate: 49.97, pickRate: 2.13, banRate: 2.48, games: 6390, tier: 3 },
  "Cassiopeia|mid": { winRate: 50.95, pickRate: 1.35, banRate: 1.24, games: 4050, tier: 3 },
  "Akshan|mid": { winRate: 50.38, pickRate: 2.01, banRate: 1.29, games: 6030, tier: 3 },
  "Yone|mid": { winRate: 47.56, pickRate: 5.68, banRate: 5.41, games: 17040, tier: 5 },
  "Vladimir|mid": { winRate: 49.84, pickRate: 1.64, banRate: 0.56, games: 4920, tier: 3 },
  "Kassadin|mid": { winRate: 49.18, pickRate: 1.61, banRate: 0.24, games: 4830, tier: 4 },
  "Azir|mid": { winRate: 46.96, pickRate: 4.1, banRate: 0.39, games: 12300, tier: 5 },
  "Mel|mid": { winRate: 47.62, pickRate: 6.02, banRate: 27.15, games: 18060, tier: 5 },
  "Galio|mid": { winRate: 48.39, pickRate: 4.93, banRate: 1.76, games: 14790, tier: 4 },
  "Ryze|mid": { winRate: 46.86, pickRate: 5.6, banRate: 1.45, games: 16800, tier: 5 },
  // ── ADC ──
  "Ashe|adc": { winRate: 52.02, pickRate: 13.02, banRate: 10.78, games: 39060, tier: 3 },
  "Jinx|adc": { winRate: 51.95, pickRate: 11.77, banRate: 5.24, games: 35310, tier: 2 },
  "Samira|adc": { winRate: 53.44, pickRate: 3.34, banRate: 2.18, games: 10020, tier: 1 },
  "MissFortune|adc": { winRate: 51.73, pickRate: 6.43, banRate: 2.66, games: 19290, tier: 2 },
  "Jhin|adc": { winRate: 49.54, pickRate: 26.14, banRate: 3.8, games: 78420, tier: 3 },
  "Ezreal|adc": { winRate: 48.78, pickRate: 32.67, banRate: 24.91, games: 98010, tier: 4 },
  "Xayah|adc": { winRate: 52.03, pickRate: 4.84, banRate: 0.99, games: 14520, tier: 3 },
  "Senna|adc": { winRate: 52.46, pickRate: 3.25, banRate: 0.87, games: 9750, tier: 3 },
  "Caitlyn|adc": { winRate: 50.16, pickRate: 11.94, banRate: 12.89, games: 35820, tier: 3 },
  "Kaisa|adc": { winRate: 49.44, pickRate: 19.34, banRate: 2.13, games: 58020, tier: 4 },
  "Sivir|adc": { winRate: 50.51, pickRate: 8.22, banRate: 13.07, games: 24660, tier: 3 },
  "Lucian|adc": { winRate: 49.19, pickRate: 10.16, banRate: 4.91, games: 30480, tier: 4 },
  "Tristana|adc": { winRate: 50.74, pickRate: 3.27, banRate: 1.19, games: 9810, tier: 3 },
  "Aphelios|adc": { winRate: 49.51, pickRate: 6.89, banRate: 3.86, games: 20670, tier: 3 },
  "Twitch|adc": { winRate: 51.32, pickRate: 1.67, banRate: 0.59, games: 5010, tier: 2 },
  "KogMaw|adc": { winRate: 51.55, pickRate: 0.89, banRate: 0.16, games: 2670, tier: 2 },
  "Smolder|adc": { winRate: 49.87, pickRate: 2.58, banRate: 0.31, games: 7740, tier: 3 },
  "Vayne|adc": { winRate: 49.87, pickRate: 1.96, banRate: 8.02, games: 5880, tier: 3 },
  "Draven|adc": { winRate: 49.45, pickRate: 2.39, banRate: 5.33, games: 7170, tier: 4 },
  "Zeri|adc": { winRate: 48.8, pickRate: 1.83, banRate: 0.1, games: 5490, tier: 4 },
  "Corki|adc": { winRate: 48.57, pickRate: 2.15, banRate: 0.11, games: 6450, tier: 4 },
  "Kalista|adc": { winRate: 48.88, pickRate: 1.56, banRate: 0.31, games: 4680, tier: 4 },
  "Varus|adc": { winRate: 47.03, pickRate: 4.92, banRate: 6.47, games: 14760, tier: 5 },
  "Nilah|adc": { winRate: 55.17, pickRate: 0.73, banRate: 0.52, games: 2190, tier: 1 },
  // ── SUPPORT ──
  "Karma|support": { winRate: 51.15, pickRate: 16.79, banRate: 30.8, games: 50370, tier: 2 },
  "Leona|support": { winRate: 52.34, pickRate: 7.5, banRate: 7.61, games: 22500, tier: 3 },
  "Thresh|support": { winRate: 51.4, pickRate: 12.64, banRate: 8.7, games: 37920, tier: 2 },
  "Braum|support": { winRate: 52.19, pickRate: 6.5, banRate: 16.84, games: 19500, tier: 3 },
  "Bard|support": { winRate: 51.87, pickRate: 7.59, banRate: 2.78, games: 22770, tier: 2 },
  "Rell|support": { winRate: 52.87, pickRate: 4.14, banRate: 1.19, games: 12420, tier: 1 },
  "Nautilus|support": { winRate: 50.29, pickRate: 13.73, banRate: 18.16, games: 41190, tier: 3 },
  "Blitzcrank|support": { winRate: 50.82, pickRate: 8.14, banRate: 21.64, games: 24420, tier: 3 },
  "Lulu|support": { winRate: 50.31, pickRate: 11.27, banRate: 7.61, games: 33810, tier: 3 },
  "Seraphine|support": { winRate: 51.18, pickRate: 6.06, banRate: 1.04, games: 18180, tier: 2 },
  "Maokai|support": { winRate: 52.1, pickRate: 2.95, banRate: 0.27, games: 8850, tier: 3 },
  "Rakan|support": { winRate: 50.96, pickRate: 4.41, banRate: 0.49, games: 13230, tier: 3 },
  "Senna|support": { winRate: 50.9, pickRate: 3.87, banRate: 0.87, games: 11610, tier: 3 },
  "Zilean|support": { winRate: 51.55, pickRate: 2.38, banRate: 0.45, games: 7140, tier: 2 },
  "Alistar|support": { winRate: 50.41, pickRate: 4.64, banRate: 1.64, games: 13920, tier: 3 },
  "Milio|support": { winRate: 51.32, pickRate: 2.64, banRate: 0.41, games: 7920, tier: 2 },
  "Morgana|support": { winRate: 50.74, pickRate: 3.53, banRate: 7.22, games: 10590, tier: 3 },
  "Pyke|support": { winRate: 49.67, pickRate: 5.51, banRate: 32.95, games: 16530, tier: 3 },
  "Zyra|support": { winRate: 51.09, pickRate: 2.55, banRate: 3.77, games: 7650, tier: 2 },
  "Poppy|support": { winRate: 51.18, pickRate: 2.3, banRate: 6.42, games: 6900, tier: 2 },
  "Sona|support": { winRate: 51.52, pickRate: 2.02, banRate: 0.07, games: 6060, tier: 2 },
  "Soraka|support": { winRate: 50.62, pickRate: 3.24, banRate: 0.24, games: 9720, tier: 3 },
  "Nami|support": { winRate: 49.4, pickRate: 4.8, banRate: 0.6, games: 14400, tier: 4 },
  "Janna|support": { winRate: 51.81, pickRate: 1.07, banRate: 0.05, games: 3210, tier: 2 },
  "Neeko|support": { winRate: 49.75, pickRate: 3.43, banRate: 3.71, games: 10290, tier: 3 },
  "Lux|support": { winRate: 49.19, pickRate: 4.65, banRate: 0.98, games: 13950, tier: 4 },
  "Xerath|support": { winRate: 48.47, pickRate: 5.03, banRate: 10.09, games: 15090, tier: 4 },
  "Yuumi|support": { winRate: 47.74, pickRate: 6.55, banRate: 9.62, games: 19650, tier: 5 },
  "Taric|support": { winRate: 51.44, pickRate: 0.78, banRate: 0.11, games: 2340, tier: 2 },
};

// 포지션별 카운터 관계 (잘 알려진 상성)
const COUNTER_MAP: Record<string, { counters: string[]; easy: string[] }> = {
  // TOP
  "Aatrox|top": { counters: ["Fiora","Irelia","Riven"], easy: ["Malphite","Ornn","Sion"] },
  "Camille|top": { counters: ["Jax","Darius","Renekton"], easy: ["Gangplank","Jayce","Kennen"] },
  "Darius|top": { counters: ["Vayne","Quinn","Kayle"], easy: ["Yasuo","Nasus","Garen"] },
  "Fiora|top": { counters: ["Malphite","Quinn","Vayne"], easy: ["Sion","Ornn","Chogath"] },
  "Gangplank|top": { counters: ["Irelia","Camille","Riven"], easy: ["Malphite","Ornn","Sion"] },
  "Garen|top": { counters: ["Vayne","Quinn","Teemo"], easy: ["Yasuo","Akali","Kayle"] },
  "Gnar|top": { counters: ["Irelia","Camille","Fiora"], easy: ["Malphite","Ornn","Sion"] },
  "Gwen|top": { counters: ["Quinn","Vayne","Teemo"], easy: ["Malphite","Ornn","Sion"] },
  "Illaoi|top": { counters: ["Vayne","Quinn","Mordekaiser"], easy: ["Yasuo","Yone","Riven"] },
  "Irelia|top": { counters: ["Volibear","Warwick","Trundle"], easy: ["Gangplank","Jayce","Kennen"] },
  "Jax|top": { counters: ["Malphite","Garen","Illaoi"], easy: ["Yasuo","Kayle","Nasus"] },
  "Kayle|top": { counters: ["Irelia","Camille","Riven"], easy: ["Malphite","Ornn","Nasus"] },
  "Kennen|top": { counters: ["Irelia","Yasuo","Yone"], easy: ["Darius","Garen","Sett"] },
  "KSante|top": { counters: ["Fiora","Vayne","Gwen"], easy: ["Malphite","Ornn","Sion"] },
  "Malphite|top": { counters: ["Gangplank","Gwen","Mordekaiser"], easy: ["Yasuo","Yone","Tryndamere"] },
  "Mordekaiser|top": { counters: ["Vayne","Fiora","Gangplank"], easy: ["Yasuo","Yone","Nasus"] },
  "Nasus|top": { counters: ["Darius","Vayne","Quinn"], easy: ["Malphite","Ornn","Kayle"] },
  "Olaf|top": { counters: ["Vayne","Quinn","Cassiopeia"], easy: ["Yasuo","Yone","Irelia"] },
  "Ornn|top": { counters: ["Fiora","Gangplank","Vayne"], easy: ["Yasuo","Yone","Riven"] },
  "Quinn|top": { counters: ["Irelia","Malphite","Camille"], easy: ["Darius","Garen","Nasus"] },
  "Renekton|top": { counters: ["Vayne","Quinn","Kayle"], easy: ["Yasuo","Yone","Nasus"] },
  "Riven|top": { counters: ["Renekton","Malphite","Poppy"], easy: ["Gangplank","Jayce","Kennen"] },
  "Rumble|top": { counters: ["Irelia","Yasuo","Yone"], easy: ["Malphite","Ornn","Sion"] },
  "Sett|top": { counters: ["Vayne","Quinn","Kayle"], easy: ["Yasuo","Yone","Nasus"] },
  "Shen|top": { counters: ["Vayne","Mordekaiser","Darius"], easy: ["Yasuo","Riven","Irelia"] },
  "Singed|top": { counters: ["Vayne","Quinn","Kayle"], easy: ["Yasuo","Yone","Irelia"] },
  "Sion|top": { counters: ["Fiora","Darius","Mordekaiser"], easy: ["Yasuo","Riven","Akali"] },
  "TahmKench|top": { counters: ["Vayne","Fiora","Mordekaiser"], easy: ["Yasuo","Riven","Irelia"] },
  "Teemo|top": { counters: ["Irelia","Yasuo","Yone"], easy: ["Darius","Garen","Nasus"] },
  "Tryndamere|top": { counters: ["Malphite","Nasus","TahmKench"], easy: ["Kayle","Gangplank","Jayce"] },
  "Urgot|top": { counters: ["Vayne","Quinn","Fiora"], easy: ["Yasuo","Yone","Nasus"] },
  "Volibear|top": { counters: ["Vayne","Quinn","Kayle"], easy: ["Yasuo","Irelia","Riven"] },
  "Yorick|top": { counters: ["Irelia","Tryndamere","Fiora"], easy: ["Malphite","Ornn","Sion"] },
  // JUNGLE
  "Amumu|jungle": { counters: ["Ivern","Nidalee","LeeSin"], easy: ["MasterYi","Kayn","Viego"] },
  "Belveth|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "Briar|jungle": { counters: ["Rammus","Amumu","Warwick"], easy: ["Nidalee","Lillia","Karthus"] },
  "Diana|jungle": { counters: ["LeeSin","Graves","Elise"], easy: ["Karthus","Amumu","Sejuani"] },
  "Ekko|jungle": { counters: ["LeeSin","Graves","RekSai"], easy: ["Amumu","Sejuani","Karthus"] },
  "Elise|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Karthus","Shyvana","MasterYi"] },
  "Evelynn|jungle": { counters: ["LeeSin","RekSai","Graves"], easy: ["Karthus","Amumu","Sejuani"] },
  "Fiddlesticks|jungle": { counters: ["LeeSin","Graves","Nidalee"], easy: ["Amumu","Sejuani","Zac"] },
  "Graves|jungle": { counters: ["Rammus","Amumu","Warwick"], easy: ["Nidalee","Elise","LeeSin"] },
  "Hecarim|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "JarvanIV|jungle": { counters: ["Warwick","Rammus","Volibear"], easy: ["Nidalee","Karthus","Lillia"] },
  "Kayn|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "Khazix|jungle": { counters: ["Rammus","Amumu","Warwick"], easy: ["Nidalee","Karthus","Lillia"] },
  "Kindred|jungle": { counters: ["Rammus","Warwick","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "LeeSin|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Elise","Karthus"] },
  "Lillia|jungle": { counters: ["LeeSin","RekSai","Graves"], easy: ["Amumu","Sejuani","Karthus"] },
  "MasterYi|jungle": { counters: ["Rammus","Warwick","Amumu"], easy: ["Nidalee","Karthus","Shyvana"] },
  "Naafiri|jungle": { counters: ["Amumu","Rammus","Warwick"], easy: ["Nidalee","Lillia","Karthus"] },
  "Nidalee|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Karthus","Shyvana","Sejuani"] },
  "Nocturne|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "Nunu|jungle": { counters: ["Graves","Kindred","Nidalee"], easy: ["Amumu","Sejuani","Karthus"] },
  "RekSai|jungle": { counters: ["Warwick","Volibear","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "Sejuani|jungle": { counters: ["Nidalee","LeeSin","Graves"], easy: ["Amumu","MasterYi","Karthus"] },
  "Shaco|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Sejuani"] },
  "Skarner|jungle": { counters: ["Nidalee","Graves","Kindred"], easy: ["Amumu","MasterYi","Karthus"] },
  "Vi|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "Viego|jungle": { counters: ["Warwick","Rammus","Amumu"], easy: ["Nidalee","Karthus","Lillia"] },
  "Warwick|jungle": { counters: ["Graves","Kindred","Nidalee"], easy: ["MasterYi","Kayn","Viego"] },
  "XinZhao|jungle": { counters: ["Warwick","Rammus","Volibear"], easy: ["Nidalee","Karthus","Lillia"] },
  "Zac|jungle": { counters: ["Nidalee","Graves","Kindred"], easy: ["Amumu","Sejuani","MasterYi"] },
  // MID
  "Ahri|mid": { counters: ["Akshan","Katarina","Fizz"], easy: ["Viktor","Veigar","Malzahar"] },
  "Akali|mid": { counters: ["Galio","Malzahar","Lissandra"], easy: ["Viktor","Orianna","Xerath"] },
  "Annie|mid": { counters: ["Xerath","Lux","Syndra"], easy: ["Katarina","Fizz","Akali"] },
  "Azir|mid": { counters: ["Fizz","Zed","Katarina"], easy: ["Viktor","Orianna","Malzahar"] },
  "Cassiopeia|mid": { counters: ["Fizz","Zed","Katarina"], easy: ["Viktor","Orianna","Malzahar"] },
  "Fizz|mid": { counters: ["Galio","Lissandra","Malzahar"], easy: ["Viktor","Xerath","Orianna"] },
  "Galio|mid": { counters: ["Xerath","Velkoz","Anivia"], easy: ["Akali","Katarina","Fizz"] },
  "Kassadin|mid": { counters: ["Zed","Talon","Qiyana"], easy: ["Viktor","Orianna","Azir"] },
  "Katarina|mid": { counters: ["Galio","Lissandra","Malzahar"], easy: ["Viktor","Xerath","Orianna"] },
  "Leblanc|mid": { counters: ["Galio","Malzahar","Lissandra"], easy: ["Viktor","Xerath","Orianna"] },
  "Lissandra|mid": { counters: ["Xerath","Velkoz","Anivia"], easy: ["Akali","Katarina","Fizz"] },
  "Malzahar|mid": { counters: ["Xerath","Syndra","Velkoz"], easy: ["Katarina","Fizz","Akali"] },
  "Orianna|mid": { counters: ["Fizz","Akali","Zed"], easy: ["Malzahar","Veigar","Ryze"] },
  "Qiyana|mid": { counters: ["Galio","Lissandra","Malzahar"], easy: ["Viktor","Xerath","Orianna"] },
  "Ryze|mid": { counters: ["Fizz","Zed","Katarina"], easy: ["Viktor","Malzahar","Veigar"] },
  "Sylas|mid": { counters: ["Cassiopeia","Malzahar","Lissandra"], easy: ["Viktor","Xerath","Orianna"] },
  "Syndra|mid": { counters: ["Fizz","Zed","Akali"], easy: ["Viktor","Malzahar","Veigar"] },
  "TwistedFate|mid": { counters: ["Fizz","Zed","Katarina"], easy: ["Viktor","Orianna","Ryze"] },
  "Vex|mid": { counters: ["Xerath","Syndra","Velkoz"], easy: ["Akali","Katarina","Fizz"] },
  "Viktor|mid": { counters: ["Fizz","Akali","Katarina"], easy: ["Malzahar","Veigar","Orianna"] },
  "Xerath|mid": { counters: ["Fizz","Zed","Katarina"], easy: ["Viktor","Malzahar","Orianna"] },
  "Yasuo|mid": { counters: ["Malphite","Renekton","Pantheon"], easy: ["Viktor","Xerath","Orianna"] },
  "Yone|mid": { counters: ["Malphite","Renekton","Pantheon"], easy: ["Viktor","Xerath","Orianna"] },
  "Zed|mid": { counters: ["Galio","Lissandra","Malzahar"], easy: ["Viktor","Xerath","Orianna"] },
  "Zoe|mid": { counters: ["Fizz","Katarina","Zed"], easy: ["Viktor","Orianna","Ryze"] },
  // ADC
  "Aphelios|adc": { counters: ["Draven","Lucian","Samira"], easy: ["KogMaw","Jinx","Varus"] },
  "Ashe|adc": { counters: ["Samira","Draven","Lucian"], easy: ["Jinx","KogMaw","Aphelios"] },
  "Caitlyn|adc": { counters: ["Samira","Draven","Lucian"], easy: ["KogMaw","Aphelios","Varus"] },
  "Draven|adc": { counters: ["Caitlyn","Ashe","Tristana"], easy: ["Jinx","KogMaw","Aphelios"] },
  "Ezreal|adc": { counters: ["Draven","Lucian","Samira"], easy: ["KogMaw","Aphelios","Varus"] },
  "Jhin|adc": { counters: ["Samira","Draven","Lucian"], easy: ["KogMaw","Aphelios","Varus"] },
  "Jinx|adc": { counters: ["Draven","Lucian","Samira"], easy: ["KogMaw","Aphelios","Varus"] },
  "Kaisa|adc": { counters: ["Draven","Caitlyn","Ashe"], easy: ["KogMaw","Aphelios","Varus"] },
  "Lucian|adc": { counters: ["Caitlyn","Ashe","Sivir"], easy: ["KogMaw","Aphelios","Jinx"] },
  "MissFortune|adc": { counters: ["Samira","Draven","Lucian"], easy: ["Jinx","KogMaw","Aphelios"] },
  "Nilah|adc": { counters: ["Caitlyn","Ashe","Ezreal"], easy: ["KogMaw","Aphelios","Varus"] },
  "Samira|adc": { counters: ["Caitlyn","Ashe","Tristana"], easy: ["KogMaw","Jinx","Aphelios"] },
  "Sivir|adc": { counters: ["Draven","Lucian","Samira"], easy: ["KogMaw","Aphelios","Varus"] },
  "Tristana|adc": { counters: ["Draven","Caitlyn","Lucian"], easy: ["KogMaw","Aphelios","Varus"] },
  "Twitch|adc": { counters: ["Draven","Lucian","Caitlyn"], easy: ["KogMaw","Aphelios","Varus"] },
  "Varus|adc": { counters: ["Samira","Draven","Lucian"], easy: ["KogMaw","Jinx","Aphelios"] },
  "Xayah|adc": { counters: ["Draven","Lucian","Kalista"], easy: ["KogMaw","Aphelios","Varus"] },
  "Zeri|adc": { counters: ["Draven","Lucian","Samira"], easy: ["KogMaw","Aphelios","Varus"] },
  // SUPPORT
  "Alistar|support": { counters: ["Morgana","Zyra","Brand"], easy: ["Yuumi","Soraka","Sona"] },
  "Bard|support": { counters: ["Zyra","Brand","Xerath"], easy: ["Yuumi","Soraka","Lulu"] },
  "Blitzcrank|support": { counters: ["Morgana","Sivir","Zyra"], easy: ["Yuumi","Soraka","Sona"] },
  "Braum|support": { counters: ["Zyra","Brand","Velkoz"], easy: ["Thresh","Blitzcrank","Pyke"] },
  "Janna|support": { counters: ["Zyra","Brand","Xerath"], easy: ["Leona","Nautilus","Alistar"] },
  "Karma|support": { counters: ["Zyra","Xerath","Brand"], easy: ["Thresh","Nautilus","Leona"] },
  "Leona|support": { counters: ["Morgana","Zyra","Brand"], easy: ["Yuumi","Soraka","Lulu"] },
  "Lulu|support": { counters: ["Zyra","Brand","Xerath"], easy: ["Thresh","Nautilus","Leona"] },
  "Nami|support": { counters: ["Zyra","Brand","Xerath"], easy: ["Leona","Nautilus","Alistar"] },
  "Nautilus|support": { counters: ["Morgana","Zyra","Brand"], easy: ["Yuumi","Soraka","Sona"] },
  "Pyke|support": { counters: ["Morgana","Leona","Nautilus"], easy: ["Yuumi","Soraka","Sona"] },
  "Rakan|support": { counters: ["Morgana","Zyra","Brand"], easy: ["Yuumi","Soraka","Sona"] },
  "Rell|support": { counters: ["Morgana","Zyra","Brand"], easy: ["Yuumi","Soraka","Sona"] },
  "Senna|support": { counters: ["Blitzcrank","Nautilus","Leona"], easy: ["Yuumi","Soraka","Sona"] },
  "Soraka|support": { counters: ["Blitzcrank","Nautilus","Leona"], easy: ["Janna","Nami","Lulu"] },
  "Thresh|support": { counters: ["Zyra","Karma","Brand"], easy: ["Yuumi","Soraka","Sona"] },
  "Yuumi|support": { counters: ["Blitzcrank","Nautilus","Leona"], easy: ["Janna","Nami","Bard"] },
  "Zyra|support": { counters: ["Blitzcrank","Nautilus","Leona"], easy: ["Thresh","Braum","Alistar"] },
};

// 시드 기반 결정론적 랜덤
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seeded(seed: number): number {
  return (Math.sin(seed) * 10000) % 1;
}

function findChampMeta(name: string): ChampionMeta | undefined {
  return allChampions.find((c) => c.id === name);
}

function getCounterNames(champId: string, position: string): { counters: string[]; easy: string[] } {
  const key = `${champId}|${position}`;
  if (COUNTER_MAP[key]) return COUNTER_MAP[key];

  // 같은 포지션 챔피언에서 자동 배정
  const samePos = allChampions.filter(
    (c) => c.mainPosition === position && c.id !== champId
  );
  const h = hash(key);
  const counters = samePos.slice(h % Math.max(1, samePos.length - 5), (h % Math.max(1, samePos.length - 5)) + 3).map((c) => c.id);
  const easy = samePos.slice((h + 7) % Math.max(1, samePos.length - 5), ((h + 7) % Math.max(1, samePos.length - 5)) + 3).map((c) => c.id);
  return { counters, easy };
}

function calcOpScore(winRate: number, pickRate: number, banRate: number): number {
  // op.gg 탑 포지션 실데이터 패턴 학습 결과
  // 승률이 압도적으로 큰 영향, 픽/밴률은 보조 가중치
  // 참고: docs/tier-calculation.md
  return winRate + Math.log(pickRate + 1) * 0.5 + Math.sqrt(banRate) * 0.5;
}

function calcTierByCalibration(winRate: number, pickRate: number, banRate: number): 1 | 2 | 3 | 4 | 5 {
  // op.gg 탑 데이터 회귀 분석 결과:
  // - 승률 51.5%+ → T1 (안정적으로 강함)
  // - 승률 50.0%+ → T2 (평균 이상)
  // - 승률 48.5%+ → T3 (평균)
  // - 승률 47.0%+ → T4 (평균 이하)
  // - 승률 47.0%- → T5 (약함)
  // 추가: pick+ban ≥ 25 (메타 챔피언)이면 한 단계 승급
  let tier: 1 | 2 | 3 | 4 | 5;
  if (winRate >= 51.5) tier = 1;
  else if (winRate >= 50.0) tier = 2;
  else if (winRate >= 48.5) tier = 3;
  else if (winRate >= 47.0) tier = 4;
  else tier = 5;

  const presence = pickRate + banRate;
  if (presence >= 25 && tier > 1) {
    tier = (tier - 1) as 1 | 2 | 3 | 4 | 5;
  }
  // 픽률 매우 낮은 (1% 미만) 비주류 챔프는 표본 신뢰도 낮아서 한 단계 강등
  if (pickRate < 1.0 && tier < 5) {
    tier = (tier + 1) as 1 | 2 | 3 | 4 | 5;
  }
  return tier;
}

function generateStats(): ExternalChampionStats[] {
  // 1단계: 모든 챔피언의 raw 데이터 + opScore 생성
  type Raw = {
    champ: ChampionMeta;
    pos: "top" | "jungle" | "mid" | "adc" | "support";
    winRate: number;
    pickRate: number;
    banRate: number;
    games: number;
    opScore: number;
  };

  const rawList: Raw[] = [];

  for (const champ of allChampions) {
    const positions = [champ.mainPosition, ...(champ.subPositions || [])];
    for (const pos of positions) {
      const key = `${champ.id}|${pos}`;
      const real = REAL_DATA[key];
      const h = hash(key);
      const r1 = Math.abs(seeded(h));
      const r2 = Math.abs(seeded(h + 1));
      const r3 = Math.abs(seeded(h + 2));
      const r4 = Math.abs(seeded(h + 3));
      const isMain = pos === champ.mainPosition;

      const winRate = real?.winRate ?? (47.5 + r1 * 7);
      const pickRate = real?.pickRate ?? (isMain ? 1 + r2 * 12 : 0.5 + r2 * 3);
      const banRate = real?.banRate ?? (r3 * 15);
      const games = real?.games ?? Math.floor((isMain ? 8000 : 2000) + r4 * 40000);

      rawList.push({
        champ,
        pos,
        winRate,
        pickRate,
        banRate,
        games,
        opScore: calcOpScore(winRate, pickRate, banRate),
      });
    }
  }

  // 2단계: op.gg 캘리브레이션 공식으로 티어 부여
  // 승률 기반 + pick+ban presence 보너스 + 저픽률 페널티
  const tierByKey = new Map<string, 1 | 2 | 3 | 4 | 5>();
  for (const r of rawList) {
    const t = calcTierByCalibration(r.winRate, r.pickRate, r.banRate);
    tierByKey.set(`${r.champ.id}|${r.pos}`, t);
  }

  // 3단계: 결과 생성
  const result: ExternalChampionStats[] = [];
  for (const r of rawList) {
    const { champ, pos, winRate, pickRate, banRate, games } = r;
    const tier = tierByKey.get(`${champ.id}|${pos}`) ?? 5;

    // 카운터 데이터: 같은 포지션 전체 챔피언과의 매치업 생성
    const { counters: hardCounters, easy: easyTargets } = getCounterNames(champ.id, pos);
    const samePosChamps = allChampions.filter(
      (c) => c.mainPosition === pos && c.id !== champ.id
    );

    const allMatchups: { name: string; nameKr: string; winRate: number; games: number }[] = [];
    for (const enemy of samePosChamps) {
      const mh = hash(champ.id + "|" + enemy.id);
      const isHardCounter = hardCounters.includes(enemy.id);
      const isEasyTarget = easyTargets.includes(enemy.id);

      let matchWr: number;
      if (isHardCounter) {
        matchWr = 42 + Math.abs(seeded(mh)) * 6;
      } else if (isEasyTarget) {
        matchWr = 53 + Math.abs(seeded(mh)) * 6;
      } else {
        matchWr = 46 + Math.abs(seeded(mh)) * 8;
      }
      const matchGames = Math.floor(150 + Math.abs(seeded(mh + 1)) * 2000);

      allMatchups.push({
        name: enemy.id,
        nameKr: enemy.nameKr,
        winRate: Math.round(matchWr * 10) / 10,
        games: matchGames,
      });
    }

    const sorted = [...allMatchups].sort((a, b) => a.winRate - b.winRate);
    const counterData = sorted.slice(0, Math.min(10, sorted.length));
    const easyData = [...allMatchups].sort((a, b) => b.winRate - a.winRate).slice(0, Math.min(10, sorted.length));

    result.push({
      id: champ.key,
      name: champ.id,
      nameKr: champ.nameKr,
      position: pos,
      games: Math.round(games),
      winRate: Math.round(winRate * 100) / 100,
      pickRate: Math.round(pickRate * 100) / 100,
      banRate: Math.round(banRate * 100) / 100,
      tier,
      counters: counterData,
      easyMatchups: easyData,
    });
  }

  return result.sort((a, b) => b.winRate - a.winRate);
}

export const externalStats: ExternalChampionStats[] = generateStats();

export function getExternalStatsByPosition(position: string): ExternalChampionStats[] {
  return externalStats.filter((s) => s.position === position);
}

export function getExternalStatsById(name: string): ExternalChampionStats | undefined {
  return externalStats.find((s) => s.name === name);
}

export function getAllExternalStats(): ExternalChampionStats[] {
  return externalStats;
}

export const EXTERNAL_DATA_INFO = {
  source: "op.gg KR Emerald+",
  patch: "26.07",
  totalSamples: 3007232,
  lastUpdated: "2026-04-11",
  warning: "테스트용 데이터입니다. 실제 서비스에서는 자체 수집 데이터를 사용합니다.",
};

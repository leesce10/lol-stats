import { externalStats } from "../src/data/external-stats";
import { lolpsTruth } from "./lolps-truth";

function spearman(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  let sumD2 = 0;
  for (let i = 0; i < n; i++) sumD2 += (a[i] - b[i]) ** 2;
  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

type PosKey = "top" | "jungle" | "mid" | "adc" | "support";
const POS_PARAMS: Record<PosKey, any> = {
  top: { wrCoef: 4.37, prCoef: 0.61, prExp: 0.4, brCoef: 0.56, brExp: 0.4, lpT1: 5.99, lpP1: 1.85, lpT2: 2.04, lpP2: 0.78, lpT3: 1.81, lpP3: 3.96, lpT4: 0.60, lpP4: 6.54, midPickMin: 2.84, midPickMax: 16.90, midPickWrMin: 48.79, midPickBonus: 0.53, pres1Threshold: 19.31, pres1WrMin: 50.76, pres1Bonus: 4.16, pres2Threshold: 52.43, pres2WrMin: 49.81, pres2Bonus: 3.42, hiWrLowPickWr: 54.71, hiWrLowPickPr: 1.56, hiWrLowPickPenalty: 0.81 },
  jungle: { wrCoef: 5.47, prCoef: 5.17, prExp: 0.3, brCoef: 1.72, brExp: 0.3, lpT1: 6.34, lpP1: 0.05, lpT2: 3.01, lpP2: 0.10, lpT3: 1.76, lpP3: 2.61, lpT4: 0.33, lpP4: 3.67, midPickMin: 2.24, midPickMax: 13.21, midPickWrMin: 50.05, midPickBonus: 1.85, pres1Threshold: 16.33, pres1WrMin: 48.01, pres1Bonus: 0.77, pres2Threshold: 53.02, pres2WrMin: 48.76, pres2Bonus: 4.85, hiWrLowPickWr: 53.52, hiWrLowPickPr: 1.24, hiWrLowPickPenalty: 4.26 },
  mid: { wrCoef: 4.82, prCoef: 3.98, prExp: 0.3, brCoef: 1.66, brExp: 0.4, lpT1: 5.26, lpP1: 2.37, lpT2: 2.71, lpP2: 4.05, lpT3: 1.96, lpP3: 4.12, lpT4: 0.56, lpP4: 4.78, midPickMin: 2.47, midPickMax: 22.62, midPickWrMin: 49.54, midPickBonus: 2.07, pres1Threshold: 15.93, pres1WrMin: 48.11, pres1Bonus: 3.12, pres2Threshold: 38.28, pres2WrMin: 48.72, pres2Bonus: 1.70, hiWrLowPickWr: 53.33, hiWrLowPickPr: 1.61, hiWrLowPickPenalty: 8.42 },
  adc: { wrCoef: 5.14, prCoef: 1.08, prExp: 0.5, brCoef: 2.10, brExp: 0.5, lpT1: 5.48, lpP1: 0.19, lpT2: 2.69, lpP2: 1.32, lpT3: 1.38, lpP3: 1.73, lpT4: 1.16, lpP4: 2.33, midPickMin: 2.52, midPickMax: 10.20, midPickWrMin: 48.38, midPickBonus: 1.37, pres1Threshold: 16.77, pres1WrMin: 51.22, pres1Bonus: 4.00, pres2Threshold: 56.06, pres2WrMin: 49.20, pres2Bonus: 3.88, hiWrLowPickWr: 54.42, hiWrLowPickPr: 0.53, hiWrLowPickPenalty: 1.13 },
  support: { wrCoef: 5.76, prCoef: 1.65, prExp: 0.4, brCoef: 0.59, brExp: 0.3, lpT1: 4.49, lpP1: 0.39, lpT2: 2.35, lpP2: 0.14, lpT3: 1.12, lpP3: 5.93, lpT4: 0.64, lpP4: 5.82, midPickMin: 3.14, midPickMax: 16.20, midPickWrMin: 50.46, midPickBonus: 0.08, pres1Threshold: 31.27, pres1WrMin: 48.52, pres1Bonus: 4.94, pres2Threshold: 44.31, pres2WrMin: 50.56, pres2Bonus: 4.87, hiWrLowPickWr: 53.85, hiWrLowPickPr: 1.45, hiWrLowPickPenalty: 2.99 },
};

function calcLolPsScore(winRate: number, pickRate: number, banRate: number, position: PosKey): number {
  const p = POS_PARAMS[position];
  let score = 50 + (winRate - 50) * p.wrCoef;
  score += Math.pow(Math.max(0, pickRate), p.prExp) * p.prCoef;
  score += Math.pow(Math.max(0, banRate), p.brExp) * p.brCoef;
  if (pickRate < p.lpT1) score -= p.lpP1;
  if (pickRate < p.lpT2) score -= p.lpP2;
  if (pickRate < p.lpT3) score -= p.lpP3;
  if (pickRate < p.lpT4) score -= p.lpP4;
  if (pickRate >= p.midPickMin && pickRate <= p.midPickMax && winRate >= p.midPickWrMin) score += p.midPickBonus;
  const presence = pickRate + banRate;
  if (presence >= p.pres1Threshold && winRate >= p.pres1WrMin) score += p.pres1Bonus;
  if (presence >= p.pres2Threshold && winRate >= p.pres2WrMin) score += p.pres2Bonus;
  if (winRate >= p.hiWrLowPickWr && pickRate <= p.hiWrLowPickPr) score -= p.hiWrLowPickPenalty;
  return score;
}

function computeSpearman(): { positionRho: Record<string, number>; avgRho: number } {
  const byPos: Record<string, typeof lolpsTruth> = { top: [], jungle: [], mid: [], adc: [], support: [] };
  for (const e of lolpsTruth) byPos[e.position].push(e);

  const positionRho: Record<string, number> = {};
  let sum = 0;
  let cnt = 0;
  for (const pos of Object.keys(byPos)) {
    const inPos = byPos[pos];
    if (inPos.length < 2) continue;

    // lol.ps 순위 (티어가 같으면 승률 높은 순)
    const lolpsOrdered = [...inPos].sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.winRate - a.winRate;
    });
    const lolpsRank = new Map<string, number>();
    lolpsOrdered.forEach((e, i) => lolpsRank.set(e.name, i + 1));

    // 우리 순위: lol.ps 챔피언과 동일한 챔피언만으로 점수 정렬
    const oursOrdered = inPos
      .map((e) => ({ name: e.name, score: calcLolPsScore(e.winRate, e.pickRate, e.banRate, pos as PosKey) }))
      .sort((a, b) => b.score - a.score);
    const ourRank = new Map<string, number>();
    oursOrdered.forEach((it, i) => ourRank.set(it.name, i + 1));

    const a: number[] = [];
    const b: number[] = [];
    for (const e of inPos) {
      a.push(lolpsRank.get(e.name)!);
      b.push(ourRank.get(e.name)!);
    }
    const rho = spearman(a, b);
    positionRho[pos] = rho;
    sum += rho;
    cnt++;
  }
  return { positionRho, avgRho: sum / cnt };
}

// lol.ps 실데이터 (스크래핑 결과)
const expected: Record<string, number> = {
  // TOP
  "Malphite|top": 1, "Irelia|top": 2, "Gangplank|top": 2, "Jax|top": 2, "Olaf|top": 2,
  "Garen|top": 2, "Renekton|top": 2, "Gnar|top": 2, "Pantheon|top": 2, "Shen|top": 2,
  "Sion|top": 2, "Aatrox|top": 2, "Camille|top": 2, "Singed|top": 2, "Vayne|top": 2,
  "Yorick|top": 2, "Darius|top": 2, "Rumble|top": 2,
  "Urgot|top": 3, "Kayle|top": 3, "Cassiopeia|top": 3, "Ambessa|top": 3, "Ornn|top": 3,
  "Fiora|top": 3, "Quinn|top": 3, "Gragas|top": 3, "Kled|top": 3, "Teemo|top": 3,
  "Warwick|top": 3, "Sett|top": 3, "Volibear|top": 3,
  "Illaoi|top": 4, "Tryndamere|top": 4, "Nasus|top": 4, "KSante|top": 4, "Riven|top": 4,
  "Maokai|top": 4, "Rammus|top": 4, "Mordekaiser|top": 4, "Yone|top": 4,
  "Jayce|top": 5,

  // JUNGLE
  "LeeSin|jungle": 1, "Naafiri|jungle": 1, "XinZhao|jungle": 1, "Graves|jungle": 1, "RekSai|jungle": 1,
  "Nocturne|jungle": 2, "JarvanIV|jungle": 2, "Vi|jungle": 2, "Briar|jungle": 2, "Elise|jungle": 2, "Ivern|jungle": 2,
  "Sylas|jungle": 3, "Kindred|jungle": 3, "Hecarim|jungle": 3, "Shaco|jungle": 3, "Ekko|jungle": 3,
  "Kayn|jungle": 3, "Warwick|jungle": 3, "Skarner|jungle": 3, "Evelynn|jungle": 3, "Nidalee|jungle": 3,
  "Karthus|jungle": 3, "Sejuani|jungle": 3, "Nunu|jungle": 3,
  "Rengar|jungle": 4, "MonkeyKing|jungle": 4, "Lillia|jungle": 4, "Khazix|jungle": 4, "Zac|jungle": 4,
  "MasterYi|jungle": 4, "Talon|jungle": 4, "Diana|jungle": 4,
  "Viego|jungle": 5,

  // MID
  "Ahri|mid": 1, "Zoe|mid": 1, "Akali|mid": 1, "TwistedFate|mid": 1, "Leblanc|mid": 1,
  "Viktor|mid": 2, "Vex|mid": 2, "Xerath|mid": 2, "Lissandra|mid": 2, "Orianna|mid": 2,
  "Yasuo|mid": 2, "Katarina|mid": 2, "Anivia|mid": 2, "Diana|mid": 2, "Annie|mid": 2, "Zed|mid": 2,
  "Fizz|mid": 3, "Malzahar|mid": 3, "Aurora|mid": 3, "Hwei|mid": 3, "Sylas|mid": 3,
  "Cassiopeia|mid": 3, "Qiyana|mid": 3, "Syndra|mid": 3, "Veigar|mid": 3,
  "Galio|mid": 4, "Talon|mid": 4, "Kassadin|mid": 4, "Lux|mid": 4, "Ryze|mid": 4,
  "Vladimir|mid": 4, "Azir|mid": 4, "Mel|mid": 4, "Akshan|mid": 4,

  // ADC
  "Ashe|adc": 1, "Jinx|adc": 1,
  "Ezreal|adc": 2, "MissFortune|adc": 2, "Caitlyn|adc": 2, "Sivir|adc": 2, "Xayah|adc": 2,
  "Samira|adc": 2, "Nilah|adc": 2, "Senna|adc": 2,
  "Jhin|adc": 3, "Kaisa|adc": 3, "Aphelios|adc": 3, "Tristana|adc": 3, "Twitch|adc": 3,
  "Lucian|adc": 4, "Draven|adc": 4, "Corki|adc": 4, "KogMaw|adc": 4, "Smolder|adc": 4,
  "Zeri|adc": 4, "Yuumi|adc": 4,
  "Kalista|adc": 5,

  // SUPPORT
  "Karma|support": 1,
  "Braum|support": 2, "Thresh|support": 2, "Nautilus|support": 2, "Leona|support": 2, "Lulu|support": 2,
  "Blitzcrank|support": 2, "Bard|support": 2, "Rell|support": 2, "Rakan|support": 2, "Pyke|support": 2,
  "Seraphine|support": 2, "Morgana|support": 2, "Maokai|support": 2,
  "Soraka|support": 3, "Janna|support": 3, "Sona|support": 3, "Milio|support": 3, "Velkoz|support": 3,
  "Nami|support": 4, "Yuumi|support": 4, "Lux|support": 4, "Xerath|support": 4,
};

let exact = 0;
let within1 = 0;
let total = 0;
const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const wrongs: string[] = [];

for (const [key, exp] of Object.entries(expected)) {
  const [name, pos] = key.split("|");
  const stat = externalStats.find((s) => s.name === name && s.position === pos);
  if (!stat) continue;
  total++;
  const diff = Math.abs(stat.tier - exp);
  if (diff === 0) exact++;
  if (diff <= 1) within1++;
  if (diff > 1) {
    wrongs.push(`${key}: expected T${exp}, got T${stat.tier} (wr ${stat.winRate} pr ${stat.pickRate} br ${stat.banRate})`);
  }
}

for (const s of externalStats) counts[s.tier]++;

console.log("Distribution:", counts, "Total:", externalStats.length);
console.log(`Exact match:  ${exact}/${total} = ${((exact / total) * 100).toFixed(1)}%`);
console.log(`Within ±1:    ${within1}/${total} = ${((within1 / total) * 100).toFixed(1)}%`);

// Spearman 순위 상관도
const sp = computeSpearman();
console.log("\n=== Spearman 순위 상관계수 (실제 순위 유사도) ===");
console.log(`평균 ρ: ${sp.avgRho.toFixed(4)}`);
for (const [pos, rho] of Object.entries(sp.positionRho)) {
  console.log(`  ${pos.padEnd(8)}: ${rho.toFixed(4)}`);
}
console.log(`목표 0.9 ${sp.avgRho >= 0.9 ? "✓ 달성" : "✗ 미달"}`);

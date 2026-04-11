import { lolpsTruth, TruthEntry } from "./lolps-truth";

interface Params {
  wrCoef: number;
  prCoef: number;
  brCoef: number;
  lowPickT1: number;
  lowPickP1: number;
  lowPickT2: number;
  lowPickP2: number;
  midPickBonus: number;
  pres1Threshold: number;
  pres1Bonus: number;
  pres2Threshold: number;
  pres2Bonus: number;
}

function calcScore(p: Params, wr: number, pr: number, br: number): number {
  let s = 50 + (wr - 50) * p.wrCoef;
  s += Math.sqrt(Math.max(0, pr)) * p.prCoef;
  s += Math.sqrt(Math.max(0, br)) * p.brCoef;
  if (pr < p.lowPickT1) s -= p.lowPickP1;
  if (pr < p.lowPickT2) s -= p.lowPickP2;
  if (pr >= 3 && pr <= 15 && wr >= 49) s += p.midPickBonus;
  const presence = pr + br;
  if (presence >= p.pres1Threshold && wr >= 49) s += p.pres1Bonus;
  if (presence >= p.pres2Threshold && wr >= 50) s += p.pres2Bonus;
  return s;
}

// lol.ps에서 같은 PS Score를 갖는 챔피언이 있을 수 있어서, 티어 + 점수 정렬을 해야 함
// 하지만 우리는 티어만 가지고 있으니, 같은 티어 내에서는 winRate로 정렬한 것을 lol.ps의 의도로 가정
function lolpsRanking(entries: TruthEntry[]): TruthEntry[] {
  return [...entries].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    // 같은 티어 내에서는 lol.ps가 보여주는 순서대로 (정의된 순서) - 우리는 winRate 내림차순 가정
    return b.winRate - a.winRate;
  });
}

function spearmanCorrelation(rankA: number[], rankB: number[]): number {
  const n = rankA.length;
  if (n < 2) return 0;
  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = rankA[i] - rankB[i];
    sumD2 += d * d;
  }
  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

function evaluate(p: Params): { positionRho: Record<string, number>; avgRho: number } {
  const byPos: Record<string, TruthEntry[]> = { top: [], jungle: [], mid: [], adc: [], support: [] };
  for (const e of lolpsTruth) byPos[e.position].push(e);

  const positionRho: Record<string, number> = {};
  let sumRho = 0;
  let count = 0;

  for (const pos of Object.keys(byPos)) {
    const inPos = byPos[pos];
    if (inPos.length < 2) continue;

    // lol.ps 순위 (1부터 시작)
    const lolpsOrdered = lolpsRanking(inPos);
    const lolpsRankMap = new Map<string, number>();
    lolpsOrdered.forEach((e, i) => lolpsRankMap.set(e.name, i + 1));

    // 우리 점수로 정렬한 순위
    const oursOrdered = [...inPos]
      .map((e) => ({ entry: e, score: calcScore(p, e.winRate, e.pickRate, e.banRate) }))
      .sort((a, b) => b.score - a.score);
    const oursRankMap = new Map<string, number>();
    oursOrdered.forEach((item, i) => oursRankMap.set(item.entry.name, i + 1));

    // Spearman 계산
    const rankA: number[] = [];
    const rankB: number[] = [];
    for (const e of inPos) {
      rankA.push(lolpsRankMap.get(e.name)!);
      rankB.push(oursRankMap.get(e.name)!);
    }

    const rho = spearmanCorrelation(rankA, rankB);
    positionRho[pos] = rho;
    sumRho += rho;
    count++;
  }

  return { positionRho, avgRho: sumRho / count };
}

// 그리드 서치
function* grid(): Generator<Params> {
  const wrCoefs = [2, 2.5, 3, 3.5, 4, 4.5, 5, 6];
  const prCoefs = [1, 1.5, 2, 2.5, 3, 4];
  const brCoefs = [0.3, 0.5, 0.8, 1, 1.5, 2];
  const lpT1s = [1.0, 1.5, 2.0, 2.5];
  const lpP1s = [0, 2, 4, 6];
  const lpT2s = [0.5, 0.7, 1.0];
  const lpP2s = [0, 2, 4];
  const midPicks = [0, 1, 2, 3];
  const pres1Ts = [20, 25, 30];
  const pres1Bs = [0, 2, 4];
  const pres2Ts = [40, 50];
  const pres2Bs = [0, 2, 4];

  for (const wr of wrCoefs)
    for (const pr of prCoefs)
      for (const br of brCoefs)
        for (const lt1 of lpT1s)
          for (const lp1 of lpP1s)
            for (const lt2 of lpT2s)
              for (const lp2 of lpP2s)
                for (const mp of midPicks)
                  for (const p1t of pres1Ts)
                    for (const p1b of pres1Bs)
                      for (const p2t of pres2Ts)
                        for (const p2b of pres2Bs)
                          yield {
                            wrCoef: wr, prCoef: pr, brCoef: br,
                            lowPickT1: lt1, lowPickP1: lp1, lowPickT2: lt2, lowPickP2: lp2,
                            midPickBonus: mp,
                            pres1Threshold: p1t, pres1Bonus: p1b,
                            pres2Threshold: p2t, pres2Bonus: p2b,
                          };
}

const allCombos: Params[] = [];
for (const p of grid()) {
  allCombos.push(p);
}
console.log(`Total combinations: ${allCombos.length}`);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SAMPLE = 100000;
const sampled = shuffle(allCombos).slice(0, SAMPLE);
console.log(`Sampling ${sampled.length}...`);

let bestRho = -2;
let bestParams: Params | null = null;
let bestPositionRho: Record<string, number> | null = null;

let iter = 0;
for (const p of sampled) {
  iter++;
  const r = evaluate(p);
  if (r.avgRho > bestRho) {
    bestRho = r.avgRho;
    bestParams = p;
    bestPositionRho = r.positionRho;
    console.log(`[${iter}] avg ρ=${bestRho.toFixed(4)} | ${Object.entries(r.positionRho).map(([k, v]) => `${k}:${v.toFixed(3)}`).join(" ")}`);
  }
}

console.log("\n=== BEST ===");
console.log(`Average Spearman ρ: ${bestRho.toFixed(4)}`);
console.log("Position breakdown:");
for (const [pos, rho] of Object.entries(bestPositionRho!)) {
  console.log(`  ${pos}: ${rho.toFixed(4)}`);
}
console.log("\nBest params:");
console.log(JSON.stringify(bestParams, null, 2));

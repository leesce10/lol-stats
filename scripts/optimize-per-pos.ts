import { lolpsTruth, TruthEntry } from "./lolps-truth";

// 포지션별로 독립 최적화
interface Params {
  wrCoef: number;
  prCoef: number;
  prExp: number;
  brCoef: number;
  brExp: number;
  lpT1: number; lpP1: number;
  lpT2: number; lpP2: number;
  lpT3: number; lpP3: number;
  lpT4: number; lpP4: number;
  midPickMin: number;
  midPickMax: number;
  midPickWrMin: number;
  midPickBonus: number;
  pres1Threshold: number;
  pres1WrMin: number;
  pres1Bonus: number;
  pres2Threshold: number;
  pres2WrMin: number;
  pres2Bonus: number;
  hiWrLowPickWr: number;
  hiWrLowPickPr: number;
  hiWrLowPickPenalty: number;
}

function calcScore(p: Params, wr: number, pr: number, br: number): number {
  let s = 50 + (wr - 50) * p.wrCoef;
  s += Math.pow(Math.max(0, pr), p.prExp) * p.prCoef;
  s += Math.pow(Math.max(0, br), p.brExp) * p.brCoef;
  if (pr < p.lpT1) s -= p.lpP1;
  if (pr < p.lpT2) s -= p.lpP2;
  if (pr < p.lpT3) s -= p.lpP3;
  if (pr < p.lpT4) s -= p.lpP4;
  if (pr >= p.midPickMin && pr <= p.midPickMax && wr >= p.midPickWrMin) s += p.midPickBonus;
  const presence = pr + br;
  if (presence >= p.pres1Threshold && wr >= p.pres1WrMin) s += p.pres1Bonus;
  if (presence >= p.pres2Threshold && wr >= p.pres2WrMin) s += p.pres2Bonus;
  if (wr >= p.hiWrLowPickWr && pr <= p.hiWrLowPickPr) s -= p.hiWrLowPickPenalty;
  return s;
}

function spearman(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  let sumD2 = 0;
  for (let i = 0; i < n; i++) sumD2 += (a[i] - b[i]) ** 2;
  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

const byPos: Record<string, TruthEntry[]> = { top: [], jungle: [], mid: [], adc: [], support: [] };
for (const e of lolpsTruth) byPos[e.position].push(e);

const lolpsRanks: Record<string, Map<string, number>> = {};
const lolpsTop3: Record<string, string[]> = {};
const lolpsTop5Set: Record<string, Set<string>> = {};

for (const pos of Object.keys(byPos)) {
  const ordered = [...byPos[pos]].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.winRate - a.winRate;
  });
  const m = new Map<string, number>();
  ordered.forEach((e, i) => m.set(e.name, i + 1));
  lolpsRanks[pos] = m;
  lolpsTop3[pos] = ordered.slice(0, 3).map((e) => e.name);
  lolpsTop5Set[pos] = new Set(ordered.slice(0, 5).map((e) => e.name));
}

function evaluatePosition(p: Params, pos: string): { rho: number; top3: number; top5: number; combined: number } {
  const inPos = byPos[pos];
  const oursOrdered = [...inPos]
    .map((e) => ({ entry: e, score: calcScore(p, e.winRate, e.pickRate, e.banRate) }))
    .sort((a, b) => b.score - a.score);
  const oursRank = new Map<string, number>();
  oursOrdered.forEach((it, i) => oursRank.set(it.entry.name, i + 1));

  const a: number[] = [];
  const b: number[] = [];
  for (const e of inPos) {
    a.push(lolpsRanks[pos].get(e.name)!);
    b.push(oursRank.get(e.name)!);
  }
  const rho = spearman(a, b);

  const oursTop3 = oursOrdered.slice(0, 3).map((it) => it.entry.name);
  let top3Score = 0;
  for (let i = 0; i < 3; i++) {
    if (oursTop3[i] === lolpsTop3[pos][i]) top3Score += 1.0;
    else if (lolpsTop3[pos].includes(oursTop3[i])) top3Score += 0.4;
  }
  top3Score /= 3;

  const oursTop5 = new Set(oursOrdered.slice(0, 5).map((it) => it.entry.name));
  let matched5 = 0;
  for (const name of oursTop5) if (lolpsTop5Set[pos].has(name)) matched5++;
  const top5 = matched5 / 5;

  const combined = rho * 0.3 + top3Score * 0.4 + top5 * 0.3;
  return { rho, top3: top3Score, top5, combined };
}

function randomParams(): Params {
  const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  const choice = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    wrCoef: r(1.5, 7),
    prCoef: r(0.3, 6),
    prExp: choice([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0]),
    brCoef: r(0, 2.5),
    brExp: choice([0.3, 0.4, 0.5, 0.6, 0.7]),
    lpT1: r(3, 7),
    lpP1: r(0, 5),
    lpT2: r(2, 4),
    lpP2: r(0, 5),
    lpT3: r(1, 2),
    lpP3: r(0, 6),
    lpT4: r(0.3, 1.2),
    lpP4: r(0, 8),
    midPickMin: r(2, 5),
    midPickMax: r(8, 25),
    midPickWrMin: r(48, 50.5),
    midPickBonus: r(0, 5),
    pres1Threshold: r(15, 35),
    pres1WrMin: r(48, 51.5),
    pres1Bonus: r(0, 5),
    pres2Threshold: r(35, 60),
    pres2WrMin: r(48, 51.5),
    pres2Bonus: r(0, 5),
    hiWrLowPickWr: r(51.5, 55),
    hiWrLowPickPr: r(0.4, 2),
    hiWrLowPickPenalty: r(0, 12),
  };
}

const ITER_PER_POS = 600000;
const positions = ["top", "jungle", "mid", "adc", "support"];
const bestPerPos: Record<string, Params> = {};
const bestResults: Record<string, { rho: number; top3: number; top5: number; combined: number }> = {};

for (const pos of positions) {
  console.log(`\n=== Optimizing ${pos.toUpperCase()} (${ITER_PER_POS} iterations) ===`);
  let best: { rho: number; top3: number; top5: number; combined: number } | null = null;
  let bestP: Params | null = null;

  for (let i = 0; i < ITER_PER_POS; i++) {
    const p = randomParams();
    const r = evaluatePosition(p, pos);
    if (!best || r.combined > best.combined) {
      best = r;
      bestP = p;
    }
  }

  bestPerPos[pos] = bestP!;
  bestResults[pos] = best!;
  console.log(
    `Best: combined=${best!.combined.toFixed(4)} ρ=${best!.rho.toFixed(3)} top3=${(best!.top3 * 100).toFixed(0)}% top5=${(best!.top5 * 100).toFixed(0)}%`
  );
}

console.log("\n\n=== FINAL SUMMARY ===");
let avgRho = 0;
let avgTop3 = 0;
let avgTop5 = 0;
for (const pos of positions) {
  const r = bestResults[pos];
  console.log(
    `${pos.padEnd(8)}: ρ=${r.rho.toFixed(3)}  top3=${(r.top3 * 100).toFixed(0)}%  top5=${(r.top5 * 100).toFixed(0)}%`
  );
  avgRho += r.rho;
  avgTop3 += r.top3;
  avgTop5 += r.top5;
}
console.log(`\nAvg: ρ=${(avgRho / 5).toFixed(4)}  top3=${(avgTop3 / 5 * 100).toFixed(1)}%  top5=${(avgTop5 / 5 * 100).toFixed(1)}%`);

console.log("\n=== PARAMS PER POSITION ===");
console.log("export const POS_PARAMS = " + JSON.stringify(bestPerPos, null, 2) + ";");

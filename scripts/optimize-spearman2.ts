import { lolpsTruth, TruthEntry } from "./lolps-truth";

// 더 넓은 파라미터 + 더 많은 항을 포함한 최적화
interface Params {
  wrCoef: number;
  prCoef: number;
  prExp: number;       // 픽률 지수 (sqrt이 아닌 다른 지수)
  brCoef: number;
  brExp: number;       // 밴률 지수
  lowPick1: number;
  lowPickP1: number;
  lowPick2: number;
  lowPickP2: number;
  midPickMin: number;
  midPickMax: number;
  midPickWrMin: number;
  midPickBonus: number;
  pres1Threshold: number;
  pres1WrMin: number;
  pres1Bonus: number;
  highWrThreshold: number;
  highWrBonus: number;
}

function calcScore(p: Params, wr: number, pr: number, br: number): number {
  let s = 50 + (wr - 50) * p.wrCoef;
  s += Math.pow(Math.max(0, pr), p.prExp) * p.prCoef;
  s += Math.pow(Math.max(0, br), p.brExp) * p.brCoef;
  if (pr < p.lowPick1) s -= p.lowPickP1;
  if (pr < p.lowPick2) s -= p.lowPickP2;
  if (pr >= p.midPickMin && pr <= p.midPickMax && wr >= p.midPickWrMin) s += p.midPickBonus;
  const presence = pr + br;
  if (presence >= p.pres1Threshold && wr >= p.pres1WrMin) s += p.pres1Bonus;
  if (wr >= p.highWrThreshold) s += p.highWrBonus;
  return s;
}

function lolpsRanking(entries: TruthEntry[]): TruthEntry[] {
  return [...entries].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.winRate - a.winRate;
  });
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

// lol.ps 순위는 미리 계산
const lolpsRanks: Record<string, Map<string, number>> = {};
for (const pos of Object.keys(byPos)) {
  const ordered = lolpsRanking(byPos[pos]);
  const m = new Map<string, number>();
  ordered.forEach((e, i) => m.set(e.name, i + 1));
  lolpsRanks[pos] = m;
}

function evaluate(p: Params): { positionRho: Record<string, number>; avgRho: number } {
  const positionRho: Record<string, number> = {};
  let sum = 0;
  let cnt = 0;
  for (const pos of Object.keys(byPos)) {
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
    positionRho[pos] = rho;
    sum += rho;
    cnt++;
  }
  return { positionRho, avgRho: sum / cnt };
}

// 랜덤 서치 - 더 큰 공간
function randomParams(): Params {
  const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  const ri = (lo: number, hi: number) => Math.floor(r(lo, hi + 1));
  const choice = <T>(arr: T[]) => arr[ri(0, arr.length - 1)];
  return {
    wrCoef: r(2, 7),
    prCoef: r(0.5, 5),
    prExp: choice([0.4, 0.5, 0.6, 0.7, 0.8]),
    brCoef: r(0, 2),
    brExp: choice([0.4, 0.5, 0.6, 0.7]),
    lowPick1: r(1.0, 3.0),
    lowPickP1: r(0, 6),
    lowPick2: r(0.4, 1.2),
    lowPickP2: r(0, 6),
    midPickMin: r(2, 5),
    midPickMax: r(10, 20),
    midPickWrMin: r(48, 50),
    midPickBonus: r(0, 4),
    pres1Threshold: r(20, 45),
    pres1WrMin: r(48, 51),
    pres1Bonus: r(0, 5),
    highWrThreshold: r(51, 53),
    highWrBonus: r(0, 4),
  };
}

const ITER = 500000;
let bestRho = -2;
let bestParams: Params | null = null;
let bestPos: Record<string, number> | null = null;
let printed = 0;

console.log(`Running ${ITER} iterations...`);

for (let i = 0; i < ITER; i++) {
  const p = randomParams();
  const r = evaluate(p);
  if (r.avgRho > bestRho) {
    bestRho = r.avgRho;
    bestParams = p;
    bestPos = r.positionRho;
    printed++;
    if (printed % 5 === 0 || bestRho >= 0.93) {
      console.log(`[${i}] avg ρ=${bestRho.toFixed(4)} | ${Object.entries(r.positionRho).map(([k, v]) => `${k}:${v.toFixed(3)}`).join(" ")}`);
    }
  }
}

console.log("\n=== BEST ===");
console.log(`Average ρ: ${bestRho.toFixed(4)}`);
for (const [pos, rho] of Object.entries(bestPos!)) console.log(`  ${pos}: ${rho.toFixed(4)}`);
console.log("\nParams:");
console.log(JSON.stringify(bestParams, null, 2));

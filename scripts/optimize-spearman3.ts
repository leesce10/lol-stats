import { lolpsTruth, TruthEntry } from "./lolps-truth";

// 더 강력한 최적화: Spearman + Top-N 일치율 + 페널티 강화
interface Params {
  wrCoef: number;
  prCoef: number;
  prExp: number;
  brCoef: number;
  brExp: number;
  // 픽률 임계값 + 페널티 (3단계)
  lowPickT1: number;
  lowPickP1: number;
  lowPickT2: number;
  lowPickP2: number;
  lowPickT3: number;
  lowPickP3: number;
  // 메인 픽률 보너스
  midPickMin: number;
  midPickMax: number;
  midPickWrMin: number;
  midPickBonus: number;
  // 메타 입지
  pres1Threshold: number;
  pres1WrMin: number;
  pres1Bonus: number;
}

function calcScore(p: Params, wr: number, pr: number, br: number): number {
  let s = 50 + (wr - 50) * p.wrCoef;
  s += Math.pow(Math.max(0, pr), p.prExp) * p.prCoef;
  s += Math.pow(Math.max(0, br), p.brExp) * p.brCoef;
  if (pr < p.lowPickT1) s -= p.lowPickP1;
  if (pr < p.lowPickT2) s -= p.lowPickP2;
  if (pr < p.lowPickT3) s -= p.lowPickP3;
  if (pr >= p.midPickMin && pr <= p.midPickMax && wr >= p.midPickWrMin) s += p.midPickBonus;
  const presence = pr + br;
  if (presence >= p.pres1Threshold && wr >= p.pres1WrMin) s += p.pres1Bonus;
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

// lol.ps 순위 미리 계산
const lolpsRanks: Record<string, Map<string, number>> = {};
const lolpsTopN: Record<string, Set<string>> = {};
const TOP_N = 5;
for (const pos of Object.keys(byPos)) {
  const ordered = [...byPos[pos]].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.winRate - a.winRate;
  });
  const m = new Map<string, number>();
  ordered.forEach((e, i) => m.set(e.name, i + 1));
  lolpsRanks[pos] = m;
  lolpsTopN[pos] = new Set(ordered.slice(0, TOP_N).map((e) => e.name));
}

interface EvalResult {
  spearmanAvg: number;
  topNAvg: number;
  combined: number; // 종합 점수: Spearman + topN 가중치
  positionRho: Record<string, number>;
  positionTopN: Record<string, number>;
}

function evaluate(p: Params): EvalResult {
  const positionRho: Record<string, number> = {};
  const positionTopN: Record<string, number> = {};
  let sumRho = 0;
  let sumTopN = 0;
  let cnt = 0;

  for (const pos of Object.keys(byPos)) {
    const inPos = byPos[pos];
    if (inPos.length < 2) continue;

    const oursOrdered = [...inPos]
      .map((e) => ({ entry: e, score: calcScore(p, e.winRate, e.pickRate, e.banRate) }))
      .sort((a, b) => b.score - a.score);
    const oursRank = new Map<string, number>();
    oursOrdered.forEach((it, i) => oursRank.set(it.entry.name, i + 1));

    // Spearman
    const a: number[] = [];
    const b: number[] = [];
    for (const e of inPos) {
      a.push(lolpsRanks[pos].get(e.name)!);
      b.push(oursRank.get(e.name)!);
    }
    const rho = spearman(a, b);
    positionRho[pos] = rho;
    sumRho += rho;

    // Top-N 일치율
    const oursTopN = new Set(oursOrdered.slice(0, TOP_N).map((it) => it.entry.name));
    let matched = 0;
    for (const name of oursTopN) {
      if (lolpsTopN[pos].has(name)) matched++;
    }
    const topNRate = matched / TOP_N;
    positionTopN[pos] = topNRate;
    sumTopN += topNRate;

    cnt++;
  }

  const spearmanAvg = sumRho / cnt;
  const topNAvg = sumTopN / cnt;
  // 종합: Spearman 50% + Top-N 50%
  const combined = spearmanAvg * 0.5 + topNAvg * 0.5;

  return { spearmanAvg, topNAvg, combined, positionRho, positionTopN };
}

function randomParams(): Params {
  const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  const choice = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    wrCoef: r(1.5, 6),
    prCoef: r(0.5, 6),
    prExp: choice([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0]),
    brCoef: r(0, 2),
    brExp: choice([0.3, 0.4, 0.5, 0.6, 0.7]),
    lowPickT1: r(2, 5),
    lowPickP1: r(0, 5),
    lowPickT2: r(1, 2.5),
    lowPickP2: r(0, 6),
    lowPickT3: r(0.3, 1),
    lowPickP3: r(0, 8),
    midPickMin: r(2, 5),
    midPickMax: r(10, 25),
    midPickWrMin: r(48, 50.5),
    midPickBonus: r(0, 5),
    pres1Threshold: r(20, 50),
    pres1WrMin: r(48, 51.5),
    pres1Bonus: r(0, 6),
  };
}

const ITER = 500000;
let best: EvalResult | null = null;
let bestParams: Params | null = null;

console.log(`Running ${ITER} iterations (Combined = 50% Spearman + 50% Top-${TOP_N})...`);

for (let i = 0; i < ITER; i++) {
  const p = randomParams();
  const r = evaluate(p);
  if (!best || r.combined > best.combined) {
    best = r;
    bestParams = p;
    if (i % 1 === 0 && (i < 100 || i % 1000 === 0 || r.combined >= 0.92)) {
      console.log(
        `[${i}] combined=${r.combined.toFixed(4)} ρ=${r.spearmanAvg.toFixed(4)} top${TOP_N}=${r.topNAvg.toFixed(4)}`
      );
    }
  }
}

console.log("\n=== BEST ===");
console.log(`Combined: ${best!.combined.toFixed(4)}`);
console.log(`Spearman avg: ${best!.spearmanAvg.toFixed(4)}`);
console.log(`Top-${TOP_N} avg: ${best!.topNAvg.toFixed(4)}`);
console.log("\nPer position:");
for (const pos of Object.keys(best!.positionRho)) {
  console.log(`  ${pos.padEnd(8)}  ρ=${best!.positionRho[pos].toFixed(3)}  top${TOP_N}=${(best!.positionTopN[pos] * 100).toFixed(0)}%`);
}
console.log("\nParams:");
console.log(JSON.stringify(bestParams, null, 2));

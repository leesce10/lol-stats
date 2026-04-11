import { lolpsTruth, TruthEntry } from "./lolps-truth";

// 더 정교한 최적화: Spearman + Top-3 ordered + Top-5 set + 픽률 페널티 강화
interface Params {
  wrCoef: number;
  prCoef: number;
  prExp: number;
  brCoef: number;
  brExp: number;
  // 4단계 픽률 페널티
  lpT1: number; lpP1: number;
  lpT2: number; lpP2: number;
  lpT3: number; lpP3: number;
  lpT4: number; lpP4: number;
  // 메인 픽률 보너스
  midPickMin: number;
  midPickMax: number;
  midPickWrMin: number;
  midPickBonus: number;
  // 메타 입지 (2단계)
  pres1Threshold: number;
  pres1WrMin: number;
  pres1Bonus: number;
  pres2Threshold: number;
  pres2WrMin: number;
  pres2Bonus: number;
  // 고승률 + 저픽률 가산 페널티 (Nilah 케이스)
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
  // 고승률 + 저픽률 케이스 강력 페널티 (Nilah, Cassiopeia 같은 비주류)
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

// lol.ps 정답 데이터 미리 계산
const lolpsRanks: Record<string, Map<string, number>> = {};
const lolpsTop3: Record<string, string[]> = {}; // 순서 있음
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

interface EvalResult {
  spearmanAvg: number;
  top3OrderedAvg: number;
  top5SetAvg: number;
  combined: number;
  positionRho: Record<string, number>;
  positionTop3: Record<string, number>;
  positionTop5: Record<string, number>;
}

function evaluate(p: Params): EvalResult {
  const positionRho: Record<string, number> = {};
  const positionTop3: Record<string, number> = {};
  const positionTop5: Record<string, number> = {};
  let sumRho = 0;
  let sumTop3 = 0;
  let sumTop5 = 0;
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

    // Top-3 ordered: 정확한 순서 일치 가산점 (1.0, 0.66, 0.33)
    const oursTop3 = oursOrdered.slice(0, 3).map((it) => it.entry.name);
    let top3Score = 0;
    for (let i = 0; i < 3; i++) {
      if (oursTop3[i] === lolpsTop3[pos][i]) top3Score += 1.0; // 정확
      else if (lolpsTop3[pos].includes(oursTop3[i])) top3Score += 0.4; // 들어있음
    }
    top3Score /= 3;
    positionTop3[pos] = top3Score;
    sumTop3 += top3Score;

    // Top-5 set
    const oursTop5 = new Set(oursOrdered.slice(0, 5).map((it) => it.entry.name));
    let matched5 = 0;
    for (const name of oursTop5) if (lolpsTop5Set[pos].has(name)) matched5++;
    const top5 = matched5 / 5;
    positionTop5[pos] = top5;
    sumTop5 += top5;

    cnt++;
  }

  const spearmanAvg = sumRho / cnt;
  const top3OrderedAvg = sumTop3 / cnt;
  const top5SetAvg = sumTop5 / cnt;
  // 종합: Spearman 30% + Top-3 ordered 40% + Top-5 set 30%
  const combined = spearmanAvg * 0.3 + top3OrderedAvg * 0.4 + top5SetAvg * 0.3;

  return { spearmanAvg, top3OrderedAvg, top5SetAvg, combined, positionRho, positionTop3, positionTop5 };
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
    lpT1: r(3, 6),
    lpP1: r(0, 4),
    lpT2: r(2, 3),
    lpP2: r(0, 4),
    lpT3: r(1, 2),
    lpP3: r(0, 5),
    lpT4: r(0.3, 1),
    lpP4: r(0, 8),
    midPickMin: r(2, 5),
    midPickMax: r(10, 25),
    midPickWrMin: r(48, 50.5),
    midPickBonus: r(0, 5),
    pres1Threshold: r(15, 35),
    pres1WrMin: r(48, 51.5),
    pres1Bonus: r(0, 5),
    pres2Threshold: r(35, 55),
    pres2WrMin: r(48, 51.5),
    pres2Bonus: r(0, 5),
    // Nilah 케이스 페널티
    hiWrLowPickWr: r(52, 55),
    hiWrLowPickPr: r(0.5, 2),
    hiWrLowPickPenalty: r(0, 12),
  };
}

const ITER = 1500000;
let best: EvalResult | null = null;
let bestParams: Params | null = null;

console.log(`Running ${ITER} iterations...`);
console.log("Combined = 30% Spearman + 40% Top-3 ordered + 30% Top-5 set\n");

for (let i = 0; i < ITER; i++) {
  const p = randomParams();
  const r = evaluate(p);
  if (!best || r.combined > best.combined) {
    best = r;
    bestParams = p;
    if (r.combined >= 0.85 || i < 100 || i % 10000 === 0) {
      console.log(
        `[${i}] combined=${r.combined.toFixed(4)} ρ=${r.spearmanAvg.toFixed(3)} top3=${r.top3OrderedAvg.toFixed(3)} top5=${r.top5SetAvg.toFixed(3)}`
      );
    }
  }
}

console.log("\n=== BEST ===");
console.log(`Combined: ${best!.combined.toFixed(4)}`);
console.log(`Spearman avg: ${best!.spearmanAvg.toFixed(4)}`);
console.log(`Top-3 ordered: ${best!.top3OrderedAvg.toFixed(4)}`);
console.log(`Top-5 set: ${best!.top5SetAvg.toFixed(4)}`);
console.log("\nPer position:");
for (const pos of Object.keys(best!.positionRho)) {
  console.log(
    `  ${pos.padEnd(8)} ρ=${best!.positionRho[pos].toFixed(3)}  top3=${(best!.positionTop3[pos] * 100).toFixed(0)}%  top5=${(best!.positionTop5[pos] * 100).toFixed(0)}%`
  );
}
console.log("\nParams:");
console.log(JSON.stringify(bestParams, null, 2));

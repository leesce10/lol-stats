import { lolpsTruth, TruthEntry } from "./lolps-truth";

interface Params {
  wrCoef: number;
  prCoef: number;
  brCoef: number;
  lowPickT1: number;  // 첫 페널티 임계
  lowPickP1: number;  // 첫 페널티 양
  lowPickT2: number;  // 두번째 페널티 임계
  lowPickP2: number;  // 두번째 페널티 양
  midPickBonus: number; // 적당한 픽률 보너스
  pres1Threshold: number;
  pres1Bonus: number;
  pres2Threshold: number;
  pres2Bonus: number;
  c1: number;  // T1 백분위
  c2: number;  // T2 백분위
  c3: number;  // T3 백분위
  c4: number;  // T4 백분위
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

function evaluate(p: Params): { exact: number; within1: number; total: number } {
  // 포지션별로 분리
  const byPos: Record<string, TruthEntry[]> = { top: [], jungle: [], mid: [], adc: [], support: [] };
  for (const e of lolpsTruth) byPos[e.position].push(e);

  let exact = 0;
  let within1 = 0;
  let total = 0;

  for (const pos of Object.keys(byPos)) {
    const inPos = byPos[pos];
    if (inPos.length === 0) continue;

    // 점수 계산 후 정렬
    const scored = inPos
      .map((e) => ({ entry: e, score: calcScore(p, e.winRate, e.pickRate, e.banRate) }))
      .sort((a, b) => b.score - a.score);

    // 백분위 컷오프로 티어 부여
    const n = scored.length;
    scored.forEach((item, i) => {
      const pct = i / n;
      let predicted: number;
      if (pct < p.c1) predicted = 1;
      else if (pct < p.c2) predicted = 2;
      else if (pct < p.c3) predicted = 3;
      else if (pct < p.c4) predicted = 4;
      else predicted = 5;

      const diff = Math.abs(predicted - item.entry.tier);
      total++;
      if (diff === 0) exact++;
      if (diff <= 1) within1++;
    });
  }

  return { exact, within1, total };
}

// 그리드 서치
function* grid(): Generator<Params> {
  const wrCoefs = [3, 3.5, 4, 4.5, 5];
  const prCoefs = [1.5, 2, 2.5, 3];
  const brCoefs = [0.5, 0.8, 1, 1.5];
  const lpT1s = [1.5, 2.0];
  const lpP1s = [2, 3, 4];
  const lpT2s = [0.7, 1.0];
  const lpP2s = [2, 3, 4];
  const midPicks = [0, 1, 2, 3];
  const pres1Ts = [25, 30];
  const pres1Bs = [2, 3, 4];
  const pres2Ts = [40, 50];
  const pres2Bs = [2, 3];
  const c1s = [0.05, 0.07, 0.1, 0.12];
  const c2s = [0.40, 0.45, 0.50, 0.55];
  const c3s = [0.65, 0.70, 0.75];
  const c4s = [0.93, 0.95, 0.97];

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
                          for (const c1 of c1s)
                            for (const c2 of c2s)
                              for (const c3 of c3s)
                                for (const c4 of c4s)
                                  yield {
                                    wrCoef: wr,
                                    prCoef: pr,
                                    brCoef: br,
                                    lowPickT1: lt1,
                                    lowPickP1: lp1,
                                    lowPickT2: lt2,
                                    lowPickP2: lp2,
                                    midPickBonus: mp,
                                    pres1Threshold: p1t,
                                    pres1Bonus: p1b,
                                    pres2Threshold: p2t,
                                    pres2Bonus: p2b,
                                    c1, c2, c3, c4,
                                  };
}

// 너무 큰 그리드는 랜덤 샘플링
const MAX_ITERS = 50000;
let bestExact = 0;
let bestWithin1 = 0;
let bestParams: Params | null = null;
let bestExactCount = 0;
let bestWithin1Count = 0;
let bestTotal = 0;
let iter = 0;

const allCombos: Params[] = [];
for (const p of grid()) {
  allCombos.push(p);
  if (allCombos.length >= MAX_ITERS * 4) break;
}

console.log(`Total candidate combinations: ${allCombos.length}`);
console.log(`Sampling ${Math.min(MAX_ITERS, allCombos.length)} ...`);

// 랜덤 샘플링
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sampled = shuffle(allCombos).slice(0, MAX_ITERS);

for (const p of sampled) {
  iter++;
  const r = evaluate(p);
  // within1을 우선시
  if (r.within1 > bestWithin1Count || (r.within1 === bestWithin1Count && r.exact > bestExactCount)) {
    bestWithin1Count = r.within1;
    bestExactCount = r.exact;
    bestTotal = r.total;
    bestExact = r.exact / r.total;
    bestWithin1 = r.within1 / r.total;
    bestParams = p;
    console.log(`[${iter}] within1=${(bestWithin1 * 100).toFixed(1)}% exact=${(bestExact * 100).toFixed(1)}%`);
  }
}

console.log("\n=== BEST RESULT ===");
console.log(`within1: ${bestWithin1Count}/${bestTotal} = ${(bestWithin1 * 100).toFixed(1)}%`);
console.log(`exact:   ${bestExactCount}/${bestTotal} = ${(bestExact * 100).toFixed(1)}%`);
console.log("\nBest params:");
console.log(JSON.stringify(bestParams, null, 2));

import { externalStats } from "../src/data/external-stats";
import { lolpsTruth } from "./lolps-truth";

function spearman(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 2) return 0;
  let sumD2 = 0;
  for (let i = 0; i < n; i++) sumD2 += (a[i] - b[i]) ** 2;
  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

function calcLolPsScore(winRate: number, pickRate: number, banRate: number): number {
  // src/data/external-stats.ts의 공식과 동일해야 함
  let score = 50 + (winRate - 50) * 3.4;
  score += Math.pow(Math.max(0, pickRate), 0.4) * 2.78;
  score += Math.pow(Math.max(0, banRate), 0.6) * 0.66;
  if (pickRate < 1.84) score -= 0.16;
  if (pickRate < 0.53) score -= 5.7;
  if (pickRate >= 2.14 && pickRate <= 13.44 && winRate >= 49.7) score += 3.73;
  const presence = pickRate + banRate;
  if (presence >= 36.58 && winRate >= 50.45) score += 2.98;
  if (winRate >= 52.6) score += 1.03;
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
      .map((e) => ({ name: e.name, score: calcLolPsScore(e.winRate, e.pickRate, e.banRate) }))
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

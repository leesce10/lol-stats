import { lolpsTruth } from "./lolps-truth";
import { externalStats } from "../src/data/external-stats";

const adcTruth = lolpsTruth.filter((e) => e.position === "adc");
console.log("=== lol.ps 원딜 정답 ===");
adcTruth
  .sort((a, b) => a.tier - b.tier || b.winRate - a.winRate)
  .forEach((e, i) => {
    console.log(`${i + 1}. ${e.name.padEnd(15)} T${e.tier}  wr:${e.winRate}  pr:${e.pickRate}  br:${e.banRate}`);
  });

console.log("\n=== 우리 사이트 원딜 ===");
const adcOurs = externalStats.filter((s) => s.position === "adc");
adcOurs
  .sort((a, b) => a.tier - b.tier || b.winRate - a.winRate)
  .forEach((s, i) => {
    console.log(`${i + 1}. ${s.name.padEnd(15)} T${s.tier}  wr:${s.winRate}  pr:${s.pickRate}  br:${s.banRate}`);
  });

// 닐라/사미라 데이터 비교
console.log("\n=== 닐라/사미라/애쉬/징크스 비교 ===");
for (const name of ["Nilah", "Samira", "Ashe", "Jinx"]) {
  const truth = adcTruth.find((e) => e.name === name);
  const ours = adcOurs.find((s) => s.name === name);
  console.log(`${name}:`);
  console.log(`  lol.ps  → T${truth?.tier} (wr ${truth?.winRate}, pr ${truth?.pickRate}, br ${truth?.banRate})`);
  console.log(`  우리    → T${ours?.tier} (wr ${ours?.winRate}, pr ${ours?.pickRate}, br ${ours?.banRate})`);
}

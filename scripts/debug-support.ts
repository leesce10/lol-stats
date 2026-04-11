import { lolpsTruth } from "./lolps-truth";
import { externalStats } from "../src/data/external-stats";

const truth = lolpsTruth.filter((e) => e.position === "support")
  .sort((a, b) => a.tier - b.tier || b.winRate - a.winRate);
const ours = externalStats.filter((s) => s.position === "support")
  .sort((a, b) => a.tier - b.tier || b.winRate - a.winRate);

console.log("=== lol.ps 서포터 ===");
truth.forEach((e, i) => console.log(`${(i+1).toString().padStart(2)}. ${e.name.padEnd(15)} T${e.tier}  wr:${e.winRate}  pr:${e.pickRate}  br:${e.banRate}`));

console.log("\n=== 우리 서포터 ===");
ours.slice(0, 25).forEach((s, i) => console.log(`${(i+1).toString().padStart(2)}. ${s.name.padEnd(15)} T${s.tier}  wr:${s.winRate}  pr:${s.pickRate}  br:${s.banRate}`));

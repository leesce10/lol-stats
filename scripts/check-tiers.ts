import { externalStats } from "../src/data/external-stats";

const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
for (const s of externalStats) counts[s.tier]++;
console.log("Distribution:", counts, "Total:", externalStats.length);

const scores = externalStats.map((s) => {
  return 50 + (s.winRate - 50) * 5 + Math.log(s.pickRate + 1) * 3 + Math.sqrt(s.banRate) * 1.5;
}).sort((a, b) => b - a);
console.log("Top 30:", scores.slice(0, 30).map(s => s.toFixed(1)).join(", "));
console.log("Percentiles");
console.log("  top 5%:", scores[Math.floor(scores.length * 0.05)].toFixed(1));
console.log("  top 10%:", scores[Math.floor(scores.length * 0.10)].toFixed(1));
console.log("  top 15%:", scores[Math.floor(scores.length * 0.15)].toFixed(1));
console.log("  top 25%:", scores[Math.floor(scores.length * 0.25)].toFixed(1));
console.log("  top 50%:", scores[Math.floor(scores.length * 0.50)].toFixed(1));
console.log("  top 75%:", scores[Math.floor(scores.length * 0.75)].toFixed(1));

import { externalStats } from "../src/data/external-stats";
import { championGuides } from "../src/data/champion-guides";

const done = new Set(championGuides.map((g) => g.championId));

// 챔피언별 최고 픽률 (대표 포지션) 추출
const byChamp = new Map<string, { id: string; nameKr: string; pickRate: number; position: string }>();
for (const s of externalStats) {
  const cur = byChamp.get(s.name);
  if (!cur || s.pickRate > cur.pickRate) {
    byChamp.set(s.name, {
      id: s.name,
      nameKr: s.nameKr,
      pickRate: s.pickRate,
      position: s.position,
    });
  }
}

// 처리 안 된 챔피언만, 픽률 내림차순
const remaining = [...byChamp.values()]
  .filter((c) => !done.has(c.id))
  .sort((a, b) => b.pickRate - a.pickRate);

console.log(`Already done: ${done.size} champions`);
console.log(`Remaining: ${remaining.length} champions`);
console.log("\nNext 30 by pick rate:");
remaining.slice(0, 30).forEach((c, i) => {
  console.log(`${(i + 1).toString().padStart(3)}. ${c.id.padEnd(20)} ${c.nameKr.padEnd(12)} ${c.position.padEnd(10)} ${c.pickRate}%`);
});

// JSON으로도 저장
import { writeFileSync } from "fs";
writeFileSync(
  "scripts/data/remaining-champions.json",
  JSON.stringify(remaining, null, 2),
  "utf-8"
);
console.log(`\nSaved to scripts/data/remaining-champions.json`);

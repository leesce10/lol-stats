// 픽률 상위 챔피언들의 영상 자막을 일괄 수집
// 사용: npx tsx scripts/bulk-collect.ts <start> <end>
//   예: npx tsx scripts/bulk-collect.ts 0 30

import { searchYoutube } from "./search-youtube";
import { YoutubeTranscript } from "youtube-transcript";
import { promises as fs } from "fs";
import path from "path";

interface RemainingChamp {
  id: string;
  nameKr: string;
  pickRate: number;
  position: string;
}

function parseViewCount(text: string): number {
  const m = text.match(/[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/,/g, ""), 10);
}

function parseDurationToSeconds(text: string): number {
  const parts = text.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

const POSITION_KR: Record<string, string> = {
  top: "탑",
  jungle: "정글",
  mid: "미드",
  adc: "원딜",
  support: "서포터",
};

async function collectChampion(champ: RemainingChamp) {
  console.log(`\n=== ${champ.nameKr} (${champ.id}, ${champ.position}) ===`);

  const queries = [
    `${champ.nameKr} 강의`,
    `${champ.nameKr} 공략`,
    `${champ.nameKr} ${POSITION_KR[champ.position]} 강의`,
    `롤 ${champ.nameKr} 강의`,
  ];

  const all = new Map<string, any>();
  for (const q of queries) {
    try {
      const results = await searchYoutube(q, 15);
      for (const v of results) {
        if (!all.has(v.videoId)) all.set(v.videoId, v);
      }
      await new Promise((r) => setTimeout(r, 600));
    } catch (e) {
      console.warn(`  Search "${q}" failed`);
    }
  }

  // 필터: 5분~30분, 조회수 5000+, 오버워치/와일드리프트 제외
  const filtered = [...all.values()].filter((v) => {
    const sec = parseDurationToSeconds(v.duration);
    const views = parseViewCount(v.viewCount);
    const t = v.title.toLowerCase();
    if (sec < 300 || sec > 1800) return false;
    if (views < 5000) return false;
    if (t.includes("오버워치") || t.includes("와일드리프트") || t.includes("wildrift")) return false;
    return true;
  });

  // 점수: 조회수 + 키워드 가중치
  const scored = filtered.map((v) => {
    const t = v.title.toLowerCase();
    let score = parseViewCount(v.viewCount);
    if (t.includes("강의")) score *= 1.5;
    if (t.includes("공략")) score *= 1.3;
    if (t.includes("장인")) score *= 1.2;
    if (t.includes("기초") || t.includes("입문")) score *= 1.2;
    if (t.includes(champ.nameKr.toLowerCase())) score *= 1.3;
    return { ...v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  // 자막 추출
  const withTranscripts: any[] = [];
  for (const v of top) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(v.videoId, { lang: "ko" });
      const text = segments.map((s) => s.text).join(" ");
      if (text.length < 500) {
        console.log(`    ✗ ${v.videoId}: too short (${text.length} chars)`);
        continue;
      }
      console.log(`    ✓ ${v.videoId}: ${text.length} chars - ${v.title.substring(0, 50)}`);
      withTranscripts.push({
        videoId: v.videoId,
        title: v.title,
        channel: v.channel,
        duration: v.duration,
        viewCount: v.viewCount,
        transcript: text,
      });
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      // 자막 없음
    }
  }

  return {
    champion: { id: champ.id, nameKr: champ.nameKr, position: champ.position, pickRate: champ.pickRate, searchQueries: queries },
    videos: withTranscripts,
  };
}

async function main() {
  const start = parseInt(process.argv[2] || "0", 10);
  const end = parseInt(process.argv[3] || "30", 10);

  const remaining: RemainingChamp[] = JSON.parse(
    await fs.readFile("scripts/data/remaining-champions.json", "utf-8")
  );
  const targets = remaining.slice(start, end);
  console.log(`Processing ${targets.length} champions [${start}~${end})`);

  const outputDir = path.join(process.cwd(), "scripts", "data");
  await fs.mkdir(outputDir, { recursive: true });

  for (const champ of targets) {
    try {
      const data = await collectChampion(champ);
      await fs.writeFile(
        path.join(outputDir, `${champ.id}-raw.json`),
        JSON.stringify(data, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.error(`Failed: ${champ.nameKr}:`, e);
    }
  }

  console.log(`\n✓ Done. Range [${start}~${end})`);
}

main();

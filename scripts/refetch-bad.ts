import { searchYoutube } from "./search-youtube";
import { YoutubeTranscript } from "youtube-transcript";
import { promises as fs } from "fs";
import path from "path";

interface Champion {
  id: string;
  nameKr: string;
  searchQueries: string[];
}

// 문제 챔피언만 다시 수집
const CHAMPIONS: Champion[] = [
  {
    id: "Zed",
    nameKr: "제드",
    searchQueries: ["제드 미드 강의", "제드 라인전 강의", "제드 운영 강의", "롤 제드 강의"],
  },
  {
    id: "Zeri",
    nameKr: "제리",
    searchQueries: ["제리 원딜 강의", "제리 라인전 강의", "롤 제리 강의", "제리 챌린저 강의"],
  },
  {
    id: "Ashe",
    nameKr: "애쉬",
    searchQueries: ["롤 애쉬 강의", "애쉬 원딜 강의", "애쉬 라인전 강의", "리그오브레전드 애쉬 공략"],
  },
];

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

async function collectChampion(champ: Champion) {
  console.log(`\n=== ${champ.nameKr} (${champ.id}) ===`);

  const all = new Map<string, any>();
  for (const q of champ.searchQueries) {
    try {
      const results = await searchYoutube(q, 20);
      for (const v of results) {
        if (!all.has(v.videoId)) all.set(v.videoId, v);
      }
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.warn(`  Search "${q}": ${e instanceof Error ? e.message : e}`);
    }
  }

  // 강의 영상만: 5분 이상, 30분 이하, 조회수 10,000 이상
  // 추가 필터: 제목에 "오버워치", "와일드리프트" 포함된 것 제외, "강의" 또는 "공략" 또는 "장인" 키워드 우대
  const filtered = [...all.values()].filter((v) => {
    const sec = parseDurationToSeconds(v.duration);
    const views = parseViewCount(v.viewCount);
    const title = v.title.toLowerCase();
    if (sec < 300 || sec > 1800) return false; // 5~30분
    if (views < 10000) return false;
    if (title.includes("오버워치") || title.includes("와일드리프트") || title.includes("wildrift")) return false;
    return true;
  });

  // 강의/공략/장인 키워드 가중치 점수
  const scored = filtered.map((v) => {
    const t = v.title.toLowerCase();
    let score = parseViewCount(v.viewCount);
    if (t.includes("강의")) score *= 1.5;
    if (t.includes("공략")) score *= 1.3;
    if (t.includes("장인")) score *= 1.2;
    if (t.includes("기초") || t.includes("입문")) score *= 1.2;
    return { ...v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  console.log(`  ${top.length} videos selected:`);
  for (const v of top) {
    console.log(`  - ${v.title.substring(0, 60)} (${v.channel})`);
  }

  const withTranscripts: any[] = [];
  for (const v of top) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(v.videoId, { lang: "ko" });
      const text = segments.map((s) => s.text).join(" ");
      console.log(`    ✓ ${v.videoId}: ${text.length} chars`);
      withTranscripts.push({
        videoId: v.videoId,
        title: v.title,
        channel: v.channel,
        duration: v.duration,
        viewCount: v.viewCount,
        transcript: text,
      });
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.log(`    ✗ ${v.videoId}: no transcript`);
    }
  }

  return { champion: champ, videos: withTranscripts };
}

async function main() {
  const outputDir = path.join(process.cwd(), "scripts", "data");
  for (const champ of CHAMPIONS) {
    const data = await collectChampion(champ);
    await fs.writeFile(
      path.join(outputDir, `${champ.id}-raw.json`),
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }
  console.log("\n✓ Done");
}

main();

// 10개 챔피언에 대해 유튜브 공략 영상 검색 + 자막 추출
// 결과를 JSON 파일로 저장 (LLM 가공은 별도 단계)

import { searchYoutube } from "./search-youtube";
import { YoutubeTranscript } from "youtube-transcript";
import { promises as fs } from "fs";
import path from "path";

interface Champion {
  id: string;        // Data Dragon ID
  nameKr: string;
  searchQueries: string[]; // 검색어 (여러 개로 다양하게)
}

const CHAMPIONS: Champion[] = [
  { id: "Zed", nameKr: "제드", searchQueries: ["제드 공략", "제드 강의", "제드 콤보"] },
  { id: "Vi", nameKr: "바이", searchQueries: ["바이 공략", "바이 정글 강의"] },
  { id: "MissFortune", nameKr: "미스 포츈", searchQueries: ["미스포츈 공략", "미포 강의"] },
  { id: "Ezreal", nameKr: "이즈리얼", searchQueries: ["이즈리얼 공략", "이즈리얼 강의"] },
  { id: "Zeri", nameKr: "제리", searchQueries: ["제리 공략", "제리 강의"] },
  { id: "Draven", nameKr: "드레이븐", searchQueries: ["드레이븐 공략", "드레이븐 강의"] },
  { id: "Jinx", nameKr: "징크스", searchQueries: ["징크스 공략", "징크스 강의"] },
  { id: "Ashe", nameKr: "애쉬", searchQueries: ["애쉬 공략", "애쉬 강의"] },
  { id: "Ahri", nameKr: "아리", searchQueries: ["아리 공략", "아리 강의"] },
  { id: "Jayce", nameKr: "제이스", searchQueries: ["제이스 공략", "제이스 강의"] },
];

interface VideoData {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  viewCount: string;
  transcript?: string;
}

interface ChampionData {
  champion: Champion;
  videos: VideoData[];
}

function parseViewCount(text: string): number {
  // "조회수 1,308,369회" → 1308369
  const m = text.match(/[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/,/g, ""), 10);
}

function parseDurationToSeconds(text: string): number {
  // "13:34" → 814
  const parts = text.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

async function collectChampion(champ: Champion): Promise<ChampionData> {
  console.log(`\n=== ${champ.nameKr} (${champ.id}) ===`);

  // 1. 여러 검색어로 영상 수집
  const allVideos = new Map<string, VideoData>();
  for (const q of champ.searchQueries) {
    try {
      const results = await searchYoutube(q, 15);
      for (const v of results) {
        if (!allVideos.has(v.videoId)) {
          allVideos.set(v.videoId, v);
        }
      }
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.warn(`  Search failed for "${q}": ${e instanceof Error ? e.message : e}`);
    }
  }

  // 2. 필터링: 30초 이상 ~ 40분 이하, 조회수 5,000 이상
  const filtered = [...allVideos.values()].filter((v) => {
    const sec = parseDurationToSeconds(v.duration);
    const views = parseViewCount(v.viewCount);
    return sec >= 30 && sec <= 2400 && views >= 5000;
  });

  // 3. 조회수 순 정렬, 상위 5개
  filtered.sort((a, b) => parseViewCount(b.viewCount) - parseViewCount(a.viewCount));
  const top = filtered.slice(0, 5);

  console.log(`  Filtered ${top.length} videos:`);
  for (const v of top) {
    console.log(`  - ${v.title.substring(0, 60)} (${v.channel}, ${v.viewCount})`);
  }

  // 4. 자막 추출
  const withTranscripts: VideoData[] = [];
  for (const v of top) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(v.videoId, { lang: "ko" });
      const text = segments.map((s) => s.text).join(" ");
      console.log(`    ✓ ${v.videoId}: ${text.length} chars`);
      withTranscripts.push({ ...v, transcript: text });
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.log(`    ✗ ${v.videoId}: no transcript`);
    }
  }

  return { champion: champ, videos: withTranscripts };
}

async function main() {
  const outputDir = path.join(process.cwd(), "scripts", "data");
  await fs.mkdir(outputDir, { recursive: true });

  const allData: ChampionData[] = [];
  for (const champ of CHAMPIONS) {
    try {
      const data = await collectChampion(champ);
      allData.push(data);
      // 챔피언별로 개별 저장 (중간에 끊겨도 복구 가능)
      await fs.writeFile(
        path.join(outputDir, `${champ.id}-raw.json`),
        JSON.stringify(data, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.error(`Failed for ${champ.nameKr}:`, e);
    }
  }

  await fs.writeFile(
    path.join(outputDir, "all-raw.json"),
    JSON.stringify(allData, null, 2),
    "utf-8"
  );

  console.log(`\n✓ Done. Saved to ${outputDir}`);
  console.log(`Champions: ${allData.length}`);
  console.log(`Total videos with transcripts: ${allData.reduce((s, c) => s + c.videos.length, 0)}`);
}

main();

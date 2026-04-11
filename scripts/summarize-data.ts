// 각 챔피언의 자막을 요약 (긴 자막 → 핵심 키워드 + 짧은 발췌)
// 가이드 작성 시 빠르게 참고 가능

import { promises as fs } from "fs";
import path from "path";

interface Champion {
  id: string;
  nameKr: string;
  position: string;
}

async function loadAllRaw(): Promise<any[]> {
  const dir = path.join(process.cwd(), "scripts", "data");
  const files = await fs.readdir(dir);
  const rawFiles = files.filter((f) => f.endsWith("-raw.json") && f !== "all-raw.json");

  const all = [];
  for (const f of rawFiles) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(dir, f), "utf-8"));
      all.push(data);
    } catch {}
  }
  return all;
}

function summarize(transcript: string): string {
  // 간단한 정리: 반복 제거, 너무 짧은 단어 제거
  return transcript
    .replace(/\[음악\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const all = await loadAllRaw();
  const summaries: Record<string, any> = {};

  for (const data of all) {
    const champ = data.champion;
    const id = champ.id;
    if (!id) continue;

    const videos = data.videos || [];
    summaries[id] = {
      championId: id,
      nameKr: champ.nameKr,
      position: champ.position || "unknown",
      videoCount: videos.length,
      totalChars: videos.reduce((s: number, v: any) => s + (v.transcript || "").length, 0),
      videos: videos.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        channel: v.channel,
        duration: v.duration,
        viewCount: v.viewCount,
        transcriptPreview: summarize(v.transcript || "").substring(0, 800),
      })),
    };
  }

  await fs.writeFile(
    "scripts/data/summaries.json",
    JSON.stringify(summaries, null, 2),
    "utf-8"
  );
  console.log(`Summarized ${Object.keys(summaries).length} champions`);
  console.log(`Saved to scripts/data/summaries.json`);
}

main();

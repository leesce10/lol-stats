// 유튜브 검색 결과에서 영상 메타데이터 추출
// 공식 API 키 없이 검색 결과 페이지에서 직접 파싱

interface VideoInfo {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  viewCount: string;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export async function searchYoutube(query: string, limit = 10): Promise<VideoInfo[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=ko&gl=KR`;
  const html = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko" } }).then((r) => r.text());

  // ytInitialData 추출
  const match = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
  if (!match) {
    throw new Error("Failed to find ytInitialData");
  }

  const data = JSON.parse(match[1]);
  const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  const videos: VideoInfo[] = [];
  for (const section of sections) {
    const items = section?.itemSectionRenderer?.contents || [];
    for (const item of items) {
      const v = item?.videoRenderer;
      if (!v) continue;
      videos.push({
        videoId: v.videoId,
        title: v.title?.runs?.[0]?.text || v.title?.simpleText || "",
        channel: v.ownerText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || "",
        duration: v.lengthText?.simpleText || "",
        viewCount: v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || "",
      });
      if (videos.length >= limit) return videos;
    }
  }
  return videos;
}

if (process.argv[1].endsWith("search-youtube.ts")) {
  const query = process.argv[2] || "야스오 공략";
  searchYoutube(query, 10).then((vids) => {
    console.log(`Found ${vids.length} videos for "${query}":`);
    vids.forEach((v, i) => {
      console.log(`${i + 1}. [${v.videoId}] ${v.title.substring(0, 60)}`);
      console.log(`   ${v.channel} · ${v.duration} · ${v.viewCount}`);
    });
  }).catch((e) => console.error(e));
}

import { YoutubeTranscript } from "youtube-transcript";

// 테스트: 야스오 공략 영상 (도파 채널 영상 ID)
const TEST_VIDEO_ID = process.argv[2] || "dQw4w9WgXcQ";

async function main() {
  console.log(`Fetching transcript for video: ${TEST_VIDEO_ID}`);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(TEST_VIDEO_ID, {
      lang: "ko",
    });

    console.log(`✓ ${transcript.length} segments fetched`);
    console.log(`First 5 segments:`);
    transcript.slice(0, 5).forEach((seg, i) => {
      console.log(`  [${i}] ${seg.offset.toFixed(1)}s: ${seg.text.substring(0, 80)}`);
    });

    const fullText = transcript.map((s) => s.text).join(" ");
    console.log(`\nTotal characters: ${fullText.length}`);
    console.log(`First 500 chars:\n${fullText.substring(0, 500)}`);
  } catch (e) {
    console.error("Failed:", e instanceof Error ? e.message : e);
  }
}

main();

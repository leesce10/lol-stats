import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// 제공자 무관 TTS 엔드포인트. 현재 구현: Edge TTS(키 불필요, Azure와 동일한 ko-KR 신경망 음성).
// 정식화 시 이 파일의 synthesize()만 Azure REST로 교체하면 됨(설계: docs/features/live-api.md).

// 허용 음성 화이트리스트 (임의 voiceName 주입 방지)
const VOICES: Record<string, string> = {
  female: "ko-KR-SunHiNeural", // 여성
  male: "ko-KR-InJoonNeural", // 남성
  hyunsu: "ko-KR-HyunsuMultilingualNeural", // 남성, 멀티스타일
};
const DEFAULT_VOICE = "female"; // ko-KR-SunHi (여성)

// 친근한 대화체 보정(딱딱한 낭독 톤 완화). 기본값 — 살짝 빠르고 밝게.
// 쿼리(rate/pitch)로 미세조정 가능. SSML prosody에 그대로 전달.
const FRIENDLY_RATE = "+9%"; // 약간 빠르게(대화 호흡)
const FRIENDLY_PITCH = "+8%"; // 약간 높게(밝고 친근)

type Prosody = { rate: string; pitch: string };

const CORS = { "Access-Control-Allow-Origin": "*" };

// ===== 영구 캐시 (Supabase 테이블 tts_cache). 테이블 없으면 조용히 미스 처리 =====

function cacheKey(text: string, voiceName: string, p: Prosody): string {
  return createHash("sha256")
    .update(`${voiceName}|${p.rate}|${p.pitch}\n${text}`)
    .digest("hex");
}

async function cacheGet(hash: string): Promise<Buffer | null> {
  try {
    const { data, error } = await supabase
      .from("tts_cache")
      .select("audio")
      .eq("hash", hash)
      .maybeSingle();
    if (error || !data?.audio) return null;
    return Buffer.from(data.audio as string, "base64");
  } catch {
    return null; // 테이블 미존재 등 → 미스
  }
}

async function cachePut(
  hash: string,
  voiceName: string,
  audio: Buffer,
  chars: number
): Promise<void> {
  try {
    await supabase
      .from("tts_cache")
      .upsert(
        { hash, voice: voiceName, audio: audio.toString("base64"), chars },
        { onConflict: "hash" }
      );
  } catch {
    /* best-effort: 실패해도 응답엔 영향 없음 */
  }
}

async function synthesize(
  text: string,
  voiceName: string,
  p: Prosody
): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, {
    rate: p.rate,
    pitch: p.pitch,
    volume: 100,
  });

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    audioStream.on("data", (c: Buffer) => chunks.push(c));
    audioStream.on("end", finish);
    audioStream.on("close", finish);
    audioStream.on("error", reject);
  });
  return Buffer.concat(chunks);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const text = (url.searchParams.get("text") || "").slice(0, 600);
  const voiceKey = url.searchParams.get("voice") || DEFAULT_VOICE;
  const voiceName = VOICES[voiceKey] || VOICES[DEFAULT_VOICE];
  // 프로소디: 쿼리로 미세조정 가능, 없으면 친근한 기본값
  const prosody: Prosody = {
    rate: url.searchParams.get("rate") || FRIENDLY_RATE,
    pitch: url.searchParams.get("pitch") || FRIENDLY_PITCH,
  };

  if (!text.trim()) {
    return Response.json(
      { ok: false, error: "text 필요" },
      { status: 400, headers: CORS }
    );
  }

  const hash = cacheKey(text, voiceName, prosody);

  try {
    // 2단 캐시: ① Vercel CDN(헤더) → 미스 시 함수 진입 → ② Supabase 영구 캐시
    const cached = await cacheGet(hash);
    const audio = cached ?? (await synthesize(text, voiceName, prosody));
    if (!audio.length) throw new Error("빈 오디오");
    if (!cached) await cachePut(hash, voiceName, audio, text.length);

    return new Response(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        // CDN/브라우저 캐시 — 동일 text는 함수 실행 없이 엣지에서 응답
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": cached ? "hit" : "miss",
        ...CORS,
      },
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: (e as Error).message },
      { status: 502, headers: CORS }
    );
  }
}

import { NextResponse } from "next/server";
import {
  buildMockTeamAnalysis,
  type TeamAnalysisRequest,
  type LiveParticipant,
} from "@/lib/live-analysis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 오버레이 앱은 다른 origin(overwolf-extension://…)에서 호출 → CORS 허용.
// 인증/키 없는 공개 분석이라 와일드카드 허용. (민감정보 없음)
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function isValid(body: unknown): body is TeamAnalysisRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.participants)) return false;
  if (b.participants.length === 0 || b.participants.length > 10) return false;
  return b.participants.every((p: unknown) => {
    if (!p || typeof p !== "object") return false;
    const part = p as Partial<LiveParticipant>;
    return part.teamId === 100 || part.teamId === 200;
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400, headers: CORS }
    );
  }

  if (!isValid(body)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "participants[] 필요 (1~10명), 각 항목 teamId는 100 또는 200",
      },
      { status: 400, headers: CORS }
    );
  }

  // TODO(live): RIOT_API_KEY가 프로덕션 키이고 LIVE_API_ENABLED=1 이면
  //   실제 Riot 조회 기반 buildLiveTeamAnalysis 로 분기. 그 전까진 mock.
  //   (account-v1 riot-id→puuid, match-v5 최근 전적 → form 계산)
  const result = buildMockTeamAnalysis(body, new Date().toISOString());

  return NextResponse.json(result, { status: 200, headers: CORS });
}

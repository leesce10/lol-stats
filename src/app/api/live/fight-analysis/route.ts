import { NextResponse } from "next/server";
import { analyzeFight, type FightInput } from "@/lib/fight-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  let body: FightInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400, headers: CORS }
    );
  }

  if (!Array.isArray(body.players) || typeof body.secondsToObjective !== "number") {
    return NextResponse.json(
      { ok: false, error: "players[]와 secondsToObjective(number) 필요" },
      { status: 400, headers: CORS }
    );
  }

  try {
    const result = await analyzeFight(body);
    return NextResponse.json(result, { status: 200, headers: CORS });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 502, headers: CORS }
    );
  }
}

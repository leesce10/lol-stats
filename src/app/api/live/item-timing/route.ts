import { NextResponse } from "next/server";
import { computeItemTiming, type TimingInput } from "@/lib/item-timing";

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
  let body: TimingInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON" },
      { status: 400, headers: CORS }
    );
  }

  if (typeof body.currentGold !== "number" || !Array.isArray(body.items)) {
    return NextResponse.json(
      { ok: false, error: "currentGold(number)와 items(number[]) 필요" },
      { status: 400, headers: CORS }
    );
  }

  try {
    const result = await computeItemTiming(body);
    return NextResponse.json(result, { status: 200, headers: CORS });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 502, headers: CORS }
    );
  }
}

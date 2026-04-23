import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Vercel Cron이 매일 호출하여 Supabase 프로젝트 비활성화를 방지한다.
// 무료 플랜은 7일 이상 비활성 시 자동 일시정지되므로 일 1회 쿼리로 충분.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const isCron = request.headers.get("user-agent")?.includes("vercel-cron") ?? false;
  const hasSecret =
    process.env.CRON_SECRET &&
    url.searchParams.get("secret") === process.env.CRON_SECRET;

  if (!isCron && !hasSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const started = Date.now();

  try {
    const { count, error } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, elapsedMs: Date.now() - started },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      matches: count,
      elapsedMs: Date.now() - started,
      at: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { ok: false, error: message, elapsedMs: Date.now() - started },
      { status: 500 }
    );
  }
}

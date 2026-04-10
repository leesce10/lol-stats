import { NextResponse } from "next/server";
import {
  CollectedData,
  CollectedMatch,
  calculateRealStats,
} from "@/lib/stats-calculator";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Supabase에서 모든 매치 데이터 조회
    const { data: matches, error } = await supabase
      .from("matches")
      .select("data")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        totalMatches: 0,
        lastUpdated: null,
        championCount: 0,
        stats: [],
        message: "수집된 데이터가 없습니다. /api/collect를 먼저 호출하세요.",
      });
    }

    const collectedData: CollectedData = {
      totalMatches: matches.length,
      lastUpdated: new Date().toISOString(),
      matches: matches.map((m: { data: CollectedMatch }) => m.data),
    };

    const stats = calculateRealStats(collectedData);

    return NextResponse.json({
      totalMatches: collectedData.totalMatches,
      lastUpdated: collectedData.lastUpdated,
      championCount: stats.length,
      stats,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

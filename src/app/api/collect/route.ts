import { NextResponse } from "next/server";
import {
  getChallengerLeague,
  getMatchIds,
  getMatchDetail,
} from "@/lib/riot-api";
import { CollectedMatch } from "@/lib/stats-calculator";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.RIOT_API_KEY) {
      return NextResponse.json(
        { error: "RIOT_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 기존 매치 ID 조회
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("match_id");
    const existingMatchIds = new Set(
      (existingMatches || []).map((m: { match_id: string }) => m.match_id)
    );

    // 1. 챌린저 리그 플레이어 가져오기
    const league = await getChallengerLeague();
    if (!league) {
      return NextResponse.json(
        { error: "챌린저 리그 데이터를 가져올 수 없습니다." },
        { status: 500 }
      );
    }

    // LP 기준 상위 15명
    const topPlayers = league.entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, 15);

    const newMatches: CollectedMatch[] = [];
    let processedPlayers = 0;
    let apiCalls = 1;

    for (const player of topPlayers) {
      if (apiCalls >= 85) break;
      if (!player.puuid) continue;

      const matchIds = await getMatchIds(player.puuid, 10);
      apiCalls++;

      const newMatchIds = matchIds.filter((id) => !existingMatchIds.has(id));

      for (const matchId of newMatchIds.slice(0, 3)) {
        if (apiCalls >= 85) break;

        const detail = await getMatchDetail(matchId);
        apiCalls++;

        if (!detail || detail.info.queueId !== 420) continue;
        if (detail.info.gameDuration < 900) continue;

        const match: CollectedMatch = {
          matchId: detail.metadata.matchId,
          gameVersion: detail.info.gameVersion,
          gameDuration: detail.info.gameDuration,
          participants: detail.info.participants.map((p) => ({
            championName: p.championName,
            championId: p.championId,
            position: p.teamPosition,
            win: p.win,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            teamId: p.teamId,
          })),
          bans: detail.info.teams.flatMap((t) =>
            t.bans.map((b) => ({
              championId: b.championId,
              teamId: t.teamId,
            }))
          ),
        };

        // Supabase에 저장
        await supabase.from("matches").insert({
          match_id: match.matchId,
          game_version: match.gameVersion,
          game_duration: match.gameDuration,
          data: match,
        });

        newMatches.push(match);
        existingMatchIds.add(matchId);
      }

      processedPlayers++;
    }

    // 총 매치 수 조회
    const { count } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      message: "데이터 수집 완료",
      stats: {
        processedPlayers,
        newMatches: newMatches.length,
        totalMatches: count || 0,
        apiCalls,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

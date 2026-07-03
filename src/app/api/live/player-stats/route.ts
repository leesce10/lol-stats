import {
  getAccountByRiotId,
  getLeagueEntriesByPuuid,
  getMasteryByChampion,
} from "@/lib/riot-api";
import { allChampions, type ChampionMeta } from "@/data/all-champions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// 게임 시작 시 10명의 riotId로 솔로랭크 티어 + 해당 챔프 숙련도를 조회해
// 브리핑 음성용 요약(tts)을 만든다. Riot API 사용(공개 데이터 — op.gg류와 동일).
// Development 키는 24h 만료 + 저레이트리밋 → 본인 테스트용. 배포엔 프로덕션 키 필요.

const CORS = { "Access-Control-Allow-Origin": "*" };

const champByDdragonId = new Map(
  allChampions.map((c) => [c.id.toLowerCase(), c])
);
function champMeta(key?: string, name?: string): ChampionMeta | null {
  if (key) {
    const m = champByDdragonId.get(key.toLowerCase());
    if (m) return m;
  }
  if (name) {
    const m = allChampions.find((c) => c.nameKr === name || c.id === name);
    if (m) return m;
  }
  return null;
}

const TIER_KR: Record<string, string> = {
  IRON: "아이언", BRONZE: "브론즈", SILVER: "실버", GOLD: "골드",
  PLATINUM: "플래티넘", EMERALD: "에메랄드", DIAMOND: "다이아몬드",
  MASTER: "마스터", GRANDMASTER: "그랜드마스터", CHALLENGER: "챌린저",
};
const TIER_ORDER = [
  "IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM",
  "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER",
];
const POS_KR: Record<string, string> = {
  TOP: "탑", JUNGLE: "정글", MIDDLE: "미드", BOTTOM: "원딜", UTILITY: "서포터",
};

// 받침 유무로 조사 선택
function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  if (!word) return withoutBatchim;
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return withoutBatchim;
  return (last - 0xac00) % 28 !== 0 ? withBatchim : withoutBatchim;
}

interface PlayerStat {
  riotId: string;
  teamId: number;
  position: string;
  championKey?: string;
  nameKr: string;
  tier: string | null;
  rank: string | null;
  lp: number | null;
  masteryLevel: number | null;
  masteryPoints: number | null;
}

// 숙련도 점수 → 자연스러운 한 마디(존댓말; 엔진에서 반말 변환)
function masteryFlavor(points: number | null): string {
  if (points == null) return "";
  if (points >= 150000) return " 이 챔프 장인이에요. 초반부터 신중하게 플레이하세요.";
  if (points >= 40000) return " 이 챔프를 잘 다뤄요.";
  if (points < 8000) return " 이 챔프가 익숙하지 않아 보여요. 초반에 압박해보세요.";
  return "";
}

function avgTierKr(players: PlayerStat[]): string | null {
  const ords = players
    .map((p) => (p.tier ? TIER_ORDER.indexOf(p.tier) : -1))
    .filter((i) => i >= 0);
  if (!ords.length) return null;
  const avg = Math.round(ords.reduce((a, b) => a + b, 0) / ords.length);
  return TIER_KR[TIER_ORDER[Math.max(0, Math.min(TIER_ORDER.length - 1, avg))]];
}

function buildStatsTts(
  players: PlayerStat[],
  myTeamId: number,
  me: { position?: string }
): string {
  const parts: string[] = [];
  const enemies = players.filter((p) => p.teamId !== myTeamId);

  // 1) 내 라인 상대의 이 챔프 숙련도(가장 유용)
  const myPos = me.position || "";
  const opp = myPos ? enemies.find((p) => p.position === myPos) : null;
  if (opp && opp.masteryLevel != null) {
    const posKr = POS_KR[opp.position] ? POS_KR[opp.position] + " " : "";
    parts.push(
      `상대 ${posKr}${opp.nameKr} 숙련도 ${opp.masteryLevel}레벨이에요.${masteryFlavor(
        opp.masteryPoints
      )}`
    );
  }

  // 2) 상대 팀 평균 티어
  const enemyAvg = avgTierKr(enemies);
  if (enemyAvg) parts.push(`상대 팀 평균 티어는 ${enemyAvg} 정도예요.`);

  return parts.join(" ");
}

export async function POST(req: Request) {
  if (!process.env.RIOT_API_KEY) {
    return Response.json({ ok: false, reason: "no-key" }, { headers: CORS });
  }
  const body = await req.json().catch(() => null);
  const participants: Array<{
    riotId?: string;
    teamId?: number;
    position?: string;
    championKey?: string;
    championName?: string;
  }> = (body && body.participants) || [];
  const myTeamId: number = (body && body.myTeamId) || 100;
  const me: { position?: string } = (body && body.me) || {};

  const results = await Promise.all(
    participants.map(async (p): Promise<PlayerStat | null> => {
      const rid = p.riotId || "";
      const hash = rid.lastIndexOf("#");
      if (hash < 0) return null; // 태그 없으면 puuid 해석 불가
      const gameName = rid.slice(0, hash);
      const tagLine = rid.slice(hash + 1);
      const acct = await getAccountByRiotId(gameName, tagLine);
      if (!acct || !acct.puuid) return null;
      const meta = champMeta(p.championKey, p.championName);
      const [entries, mastery] = await Promise.all([
        getLeagueEntriesByPuuid(acct.puuid),
        meta ? getMasteryByChampion(acct.puuid, meta.key) : Promise.resolve(null),
      ]);
      const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
      return {
        riotId: rid,
        teamId: p.teamId || 100,
        position: p.position || "",
        championKey: p.championKey,
        nameKr: (meta && meta.nameKr) || p.championName || rid,
        tier: (solo && solo.tier) || null,
        rank: (solo && solo.rank) || null,
        lp: solo ? solo.leaguePoints : null,
        masteryLevel: mastery ? mastery.championLevel : null,
        masteryPoints: mastery ? mastery.championPoints : null,
      };
    })
  );

  const players = results.filter((r): r is PlayerStat => r !== null);
  if (!players.length) {
    return Response.json({ ok: false, reason: "no-data" }, { headers: CORS });
  }
  const tts = buildStatsTts(players, myTeamId, me);
  return Response.json({ ok: true, players, tts }, { headers: CORS });
}

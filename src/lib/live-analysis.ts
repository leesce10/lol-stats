// live-analysis.ts — 오버레이 /api/live/team-analysis 의 타입 + 평가 로직.
//
// 현재는 mock 빌더만 구현. Riot 프로덕션 키 승인 후 buildLiveTeamAnalysis 를
// 추가하고 라우트에서 분기한다(설계: docs/features/live-api.md).

// ===== 요청 타입 =====

export type Position = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export interface LiveParticipant {
  riotId?: string;
  puuid?: string | null;
  championId?: number;
  championName?: string;
  teamId: number; // 100 | 200
  position?: Position | string;
}

export interface TeamAnalysisRequest {
  region?: string;
  participants: LiveParticipant[];
}

// ===== 응답 타입 =====

export type Form = "good" | "neutral" | "struggling";

export interface LaneEvaluation {
  teamId: number;
  position: string;
  riotId: string | null;
  championName: string | null;
  recentGames: number;
  winRate: number; // 0..1
  form: Form;
  note: string;
  onChampion: { games: number; winRate: number } | null;
}

export interface TeamLuck {
  score: number; // -2..+2
  label: string;
  reason: string;
}

export interface TeamAnalysis {
  ok: true;
  generatedAt: string;
  source: "mock" | "live";
  team: {
    luck: TeamLuck;
    lanes: LaneEvaluation[];
  };
}

// ===== 공용 heuristic =====

const POSITION_ORDER: Position[] = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
];

export function formFromWinRate(winRate: number, games: number): Form {
  if (games < 5) return "neutral";
  if (winRate >= 0.55) return "good";
  if (winRate <= 0.45) return "struggling";
  return "neutral";
}

export function noteFor(form: Form, games: number, winRate: number): string {
  const pct = Math.round(winRate * 100);
  if (games < 5) return `최근 표본 적음(${games}판) — 판단 보류`;
  if (form === "good") return `최근 ${games}판 승률 ${pct}% — 폼 좋음`;
  if (form === "struggling") return `최근 ${games}판 승률 ${pct}% — 라인 꼬일 수 있음`;
  return `최근 ${games}판 승률 ${pct}% — 평범`;
}

// 팀운: 우리/상대 form 평균 차이를 -2..+2 로. "단정 금지" 원칙(reality-check).
export function computeLuck(lanes: LaneEvaluation[]): TeamLuck {
  const formScore = (f: Form) => (f === "good" ? 1 : f === "struggling" ? -1 : 0);
  const avg = (id: number) => {
    const ls = lanes.filter((l) => l.teamId === id);
    if (!ls.length) return 0;
    return ls.reduce((s, l) => s + formScore(l.form), 0) / ls.length;
  };
  const diff = avg(100) - avg(200);
  const score = Math.max(-2, Math.min(2, Math.round(diff * 2)));
  const label =
    score >= 1 ? "팀운 좋은 편" : score <= -1 ? "팀운 나쁜 편" : "팀운 평범";
  const reason =
    score >= 1
      ? "우리팀 라인들이 상대보다 폼이 좋은 편"
      : score <= -1
        ? "상대 라인들이 폼이 더 좋은 편 — 신중하게"
        : "양팀 폼이 비슷";
  return { score, label, reason };
}

// ===== mock 빌더 (프로덕션 키 없이 계약 검증용) =====

// 입력 문자열을 0..1 의사난수로 (결정적 — 같은 입력 = 같은 결과)
function seed01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function buildMockTeamAnalysis(
  req: TeamAnalysisRequest,
  generatedAt: string
): TeamAnalysis {
  const lanes: LaneEvaluation[] = req.participants.map((p) => {
    const key = p.riotId || p.puuid || `${p.teamId}-${p.position}`;
    const r = seed01(key);
    const games = 10 + Math.floor(seed01(key + "g") * 20); // 10..29
    const winRate = 0.4 + r * 0.25; // 0.40..0.65
    const form = formFromWinRate(winRate, games);
    const champGames = 3 + Math.floor(seed01(key + "c") * 10);
    return {
      teamId: p.teamId,
      position: String(p.position ?? ""),
      riotId: p.riotId ?? null,
      championName: p.championName ?? null,
      recentGames: games,
      winRate: Math.round(winRate * 100) / 100,
      form,
      note: noteFor(form, games, winRate),
      onChampion: {
        games: champGames,
        winRate: Math.round((0.45 + seed01(key + "cw") * 0.2) * 100) / 100,
      },
    };
  });

  // 포지션 순으로 정렬해 표시 안정성 확보
  lanes.sort((a, b) => {
    if (a.teamId !== b.teamId) return a.teamId - b.teamId;
    return (
      POSITION_ORDER.indexOf(a.position as Position) -
      POSITION_ORDER.indexOf(b.position as Position)
    );
  });

  return {
    ok: true,
    generatedAt,
    source: "mock",
    team: { luck: computeLuck(lanes), lanes },
  };
}

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
  championKey?: string; // Data Dragon id (예: "Aatrox") — 조합 분석에 사용
  teamId: number; // 100 | 200
  position?: Position | string;
}

export interface TeamAnalysisRequest {
  region?: string;
  myTeamId?: number; // 100 | 200 — 브리핑을 우리팀 관점으로 작성
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

export type CompEdge = "ahead" | "behind" | "even";
export type Timing = "early" | "late" | "balanced";

export interface CompBriefing {
  ourTeamId: number;
  compEdge: CompEdge;
  ourWinRate: number; // 조합상 추정 승률(%)
  ourStrengths: string[];
  ourWeaknesses: string[];
  theirStrengths: string[];
  theirWeaknesses: string[];
  timing: Timing;
  gamePlan: string[]; // 화면 표시용 액션 아이템
  tts: string; // TTS로 읽어줄 한 문단
}

export interface TeamAnalysis {
  ok: true;
  generatedAt: string;
  source: "mock" | "live"; // 라인 폼(전적) 데이터 출처. 프로덕션 키 전엔 mock.
  team: {
    luck: TeamLuck;
    lanes: LaneEvaluation[];
  };
  briefing: CompBriefing | null; // 조합 기반 게임플랜 — 챔피언 데이터만으로 산출(실데이터)
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

// ===== 조합 기반 게임플랜 (실데이터 — 챔피언 데이터만 사용) =====

import { analyzeTeamComp } from "./teamcomp";
import { getChampionById } from "@/data/champions";

function championKeys(participants: LiveParticipant[], teamId: number): string[] {
  return participants
    .filter((p) => p.teamId === teamId)
    .map((p) => p.championKey)
    .filter((k): k is string => !!k);
}

function timingProfile(keys: string[]): Timing {
  let early = 0;
  let late = 0;
  for (const k of keys) {
    const c = getChampionById(k);
    if (!c) continue;
    if (
      c.strengths.includes("early") ||
      c.strengths.includes("snowball") ||
      c.strengths.includes("lane")
    )
      early++;
    if (c.strengths.includes("late")) late++;
  }
  if (early - late >= 2) return "early";
  if (late - early >= 2) return "late";
  return "balanced";
}

function has(list: string[], kw: string): boolean {
  return list.some((s) => s.includes(kw));
}

// 우리팀 관점의 액션 플랜 생성
function makeGamePlan(
  ourS: string[],
  ourW: string[],
  theirS: string[],
  timing: Timing,
  edge: CompEdge
): string[] {
  const plan: string[] = [];

  // 한타 vs 회피
  if (has(ourS, "이니시") || has(ourS, "한타")) {
    plan.push("한타를 적극적으로 열어라 — 우리 교전력이 강하다");
  } else if (has(theirS, "이니시") || has(theirS, "한타")) {
    plan.push("상대 이니시를 조심하고 진형을 유지하라 — 무리한 한타 회피");
  }
  // 스플릿/사이드
  if (has(ourS, "스플릿")) {
    plan.push("사이드 운영으로 압박 — 스플릿 푸시가 강하다");
  }
  // 포킹
  if (has(ourS, "포킹")) {
    plan.push("포킹으로 체력을 빼고 화력 우위에서 교전하라");
  }
  // 약점 대응
  if (has(ourW, "프론트라인")) {
    plan.push("탱커가 부족하다 — 포지셔닝 신경, 적 진입 라인을 차단");
  }
  if (has(ourW, "편중")) {
    plan.push("데미지 타입이 편중 — 상대가 방어템 갖추기 전에 끝내라");
  }
  // 타이밍
  if (timing === "early") {
    plan.push("초반에 강한 조합 — 라인전부터 주도권 잡고 스노우볼");
  } else if (timing === "late") {
    plan.push("후반 캐리 조합 — 초반 손해를 최소화하고 후반을 도모");
  }
  // 엣지에 따른 마무리 톤 (단정 금지)
  if (edge === "behind" && plan.length) {
    plan.push("조합상 불리한 편 — 실수 줄이고 상대 약점을 노려라");
  }
  return plan.slice(0, 4);
}

// 한글 받침 유무로 조사 선택 (이/가, 은/는 등)
function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return withoutBatchim; // 한글 아니면 받침 없음 취급
  const hasBatchim = (last - 0xac00) % 28 !== 0;
  return hasBatchim ? withBatchim : withoutBatchim;
}

function buildTts(b: Omit<CompBriefing, "tts">): string {
  const parts: string[] = ["게임 브리핑입니다."];
  if (b.ourStrengths.length) {
    const s = b.ourStrengths.slice(0, 2);
    parts.push(`우리 조합은 ${s.join(", ")}${josa(s[s.length - 1], "이", "가")} 강점입니다.`);
  }
  if (b.theirStrengths.length) {
    const t = b.theirStrengths[0];
    parts.push(`상대는 ${t}${josa(t, "이", "가")} 강하니 주의하세요.`);
  }
  if (b.gamePlan.length) parts.push(`핵심 플랜. ${b.gamePlan.slice(0, 2).join(". ")}.`);
  const edgeKo =
    b.compEdge === "ahead"
      ? "조합상 우리가 유리한 편입니다."
      : b.compEdge === "behind"
        ? "조합상 다소 불리하지만 충분히 풀 수 있습니다."
        : "양팀 조합은 비슷합니다.";
  parts.push(edgeKo);
  return parts.join(" ");
}

export function buildCompBriefing(
  participants: LiveParticipant[],
  myTeamId: number = 100
): CompBriefing | null {
  const blue = championKeys(participants, 100);
  const red = championKeys(participants, 200);
  // 양팀 모두 챔피언 정보가 어느 정도 있어야 의미 있음
  if (blue.length + red.length < 2) return null;

  const r = analyzeTeamComp(blue, red);
  const ours = myTeamId === 200 ? "red" : "blue";
  const ourWinRate = ours === "blue" ? r.blueWinRate : r.redWinRate;
  const ourStrengths = ours === "blue" ? r.blueStrengths : r.redStrengths;
  const ourWeaknesses = ours === "blue" ? r.blueWeaknesses : r.redWeaknesses;
  const theirStrengths = ours === "blue" ? r.redStrengths : r.blueStrengths;
  const theirWeaknesses = ours === "blue" ? r.redWeaknesses : r.blueWeaknesses;

  const edge: CompEdge =
    ourWinRate >= 53 ? "ahead" : ourWinRate <= 47 ? "behind" : "even";
  const timing = timingProfile(ours === "blue" ? blue : red);
  const gamePlan = makeGamePlan(
    ourStrengths,
    ourWeaknesses,
    theirStrengths,
    timing,
    edge
  );

  const base = {
    ourTeamId: myTeamId,
    compEdge: edge,
    ourWinRate,
    ourStrengths,
    ourWeaknesses,
    theirStrengths,
    theirWeaknesses,
    timing,
    gamePlan,
  };
  return { ...base, tts: buildTts(base) };
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
    briefing: buildCompBriefing(req.participants, req.myTeamId),
  };
}

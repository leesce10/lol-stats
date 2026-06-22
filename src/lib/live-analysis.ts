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
  // 내 라인 맞라인 코칭용 — 내가 누구인지(챔프/포지션). 없으면 라인 코칭 생략(폴백).
  me?: { championKey?: string; position?: string };
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
  tts: string; // 1부 — 팀 5:5 조합(시작 직후 재생)
  laneTts: string | null; // 2부 — 내 라인 코칭(약 3초 뒤 재생). 없으면 null
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
import { generateMatchupGuide, type ChampionProfile } from "./matchup-engine";
import { getProfileByKey } from "@/data/champion-profiles";
import { tierToNum } from "./matchup-engine/utils";

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
    plan.push("우리팀은 교전력이 좋기 때문에 한타를 적극적으로 열면 유리합니다.");
  } else if (has(theirS, "이니시") || has(theirS, "한타")) {
    plan.push("상대 교전력이 강하니 무리한 한타는 피하고 진형을 유지하는 게 좋습니다.");
  }
  // 스플릿/사이드
  if (has(ourS, "스플릿")) {
    plan.push("스플릿 푸시가 강한 조합이라 사이드 운영으로 압박하는 게 좋습니다.");
  }
  // 포킹
  if (has(ourS, "포킹")) {
    plan.push("포킹이 강하니 상대 체력을 빼면서 화력이 앞설 때 교전하세요.");
  }
  // 약점 대응
  if (has(ourW, "프론트라인")) {
    plan.push("탱커가 부족하니 포지셔닝에 주의하고 상대의 진입을 차단하세요.");
  }
  if (has(ourW, "편중")) {
    plan.push(
      "데미지 타입이 한쪽으로 치우쳐 있어 상대가 방어 아이템을 갖추기 전에 승부를 보는 게 좋습니다."
    );
  }
  // 타이밍
  if (timing === "early") {
    plan.push("초반에 강한 조합이니 라인전부터 주도권을 잡고 스노우볼을 굴리세요.");
  } else if (timing === "late") {
    plan.push("후반 캐리 조합이라 초반 손해를 줄이고 후반을 도모하는 게 좋습니다.");
  }
  // 엣지에 따른 마무리 (단정 금지)
  if (edge === "behind" && plan.length) {
    plan.push("조합상 다소 불리하니 실수를 줄이고 상대의 약점을 노리세요.");
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

// ----- 텍스트 정리 헬퍼 -----
function stripMd(s: string): string {
  return (s || "").replace(/\*/g, "").replace(/ or /g, " 또는 ").trim();
}
function firstSentence(s: string): string {
  return stripMd(s).split(/[.!?。\n]/)[0].trim();
}
function lastClause(s: string): string {
  const parts = stripMd(s).split(/[.!?。\n]/).map((t) => t.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}
function ensureDot(s: string): string {
  const t = (s || "").trim();
  if (!t) return "";
  return /[.!?。]$/.test(t) ? t : t + ".";
}

// 라이브 포지션 → 프로파일 라인(top/jungle/mid/adc/support)
function liveToLane(pos?: string): string | null {
  switch ((pos || "").toUpperCase()) {
    case "TOP": return "top";
    case "JUNGLE": return "jungle";
    case "MIDDLE": case "MID": return "mid";
    case "BOTTOM": case "BOT": case "ADC": return "adc";
    case "UTILITY": case "SUPPORT": return "support";
    default: return null;
  }
}
const LANE_LABEL: Record<string, string> = {
  top: "탑", jungle: "정글", mid: "미드", adc: "바텀", support: "서폿",
};

// 블록1: 내 라인 맞라인. 프로파일 없음/포지션 불명/포지션 불일치 → null(폴백).
function buildLaneCoaching(
  participants: LiveParticipant[],
  myTeamId: number,
  me?: { championKey?: string; position?: string }
): string | null {
  if (!me || !me.championKey) return null;
  const lane = liveToLane(me.position);
  if (!lane) return null;
  const enemyTeam = myTeamId === 200 ? 100 : 200;
  const opp = participants.find(
    (p) => p.teamId === enemyTeam && liveToLane(p.position) === lane
  );
  if (!opp || !opp.championKey) return null;
  const myP = getProfileByKey(me.championKey, lane);
  const enP = getProfileByKey(opp.championKey, lane);
  if (!myP || !enP || myP.position !== enP.position) return null;
  let guide;
  try {
    guide = generateMatchupGuide(myP, enP);
  } catch {
    return null;
  }
  const label = LANE_LABEL[lane] || "내 라인";
  const enemyName = enP.name || opp.championName || opp.championKey;
  // 판정은 존댓말로 통일(맞라인 원문은 반말/명령조라 음성에 안 맞음)
  const vl = guide.verdict?.label;
  const vtxt =
    vl === "유리" ? "해볼 만한 매치업이에요"
    : vl === "불리" ? "불리하니 조심하세요"
    : "비등한 매치업이에요";
  const parts = [`${label}${josa(label, "은", "는")} ${enemyName} 상대예요. ${vtxt}.`];
  // 회피 스킬: 스킬명 + 스킬샷이면 "꼭 피하세요" (counterMethod는 절 추출이 들쭉날쭉해 제외)
  const md = guide.mustDodge?.[0];
  if (md) {
    const verb = (md.type as string) === "skillshot" ? "꼭 피하세요" : "조심하세요";
    // 키만 말하면 못 알아들으니 "Q 스킬명" 형태로
    const skill = md.skillKey ? `${md.skillKey} ${md.skillName}` : md.skillName;
    parts.push(`${skill} ${verb}.`);
  }
  return parts.join(" ");
}

// 블록2: 내 라인 밖 최대 위협 1명(콤보 있으면 격상). 위협 미미하면 null.
const HARD_CC = ["stun", "knockup", "knockback", "suppress", "charm", "root", "taunt", "fear", "sleep"];
function threatScore(p: ChampionProfile): number {
  const pr = p.profile;
  if (!pr) return 0;
  let s = 0;
  if (pr.burst === "high") s += 2;
  else if (pr.burst === "medium") s += 1;
  if ((pr.ccTypes || []).some((c) => HARD_CC.includes(c))) s += 2;
  if (pr.mobility === "high") s += 1;
  return s;
}
// 1부 보조: 내 라인 밖 최대 위협 1명. (바텀이면 적 원딜+서폿 둘 다 제외)
function buildTopThreat(
  participants: LiveParticipant[],
  myTeamId: number,
  me?: { position?: string }
): string | null {
  const enemyTeam = myTeamId === 200 ? 100 : 200;
  const myLane = me ? liveToLane(me.position) : null;
  const exclude =
    myLane === "adc" || myLane === "support" ? ["adc", "support"] : myLane ? [myLane] : [];
  const cands = participants
    .filter((p) => p.teamId === enemyTeam)
    .filter((p) => !exclude.includes(liveToLane(p.position) || "")) // 내 라인 밖
    .map((p) => ({ p, prof: getProfileByKey(p.championKey, liveToLane(p.position)) }))
    .filter((x): x is { p: LiveParticipant; prof: ChampionProfile } => !!x.prof);
  if (!cands.length) return null;
  cands.sort((a, b) => threatScore(b.prof) - threatScore(a.prof));
  const top = cands[0];
  if (threatScore(top.prof) < 2) return null;
  const name = top.prof.name || top.p.championName || top.prof.id;
  const combo = top.prof.keyCombos?.[0];
  if (combo?.counter) {
    return `팀에서 가장 위험한 건 ${name}예요. ${ensureDot(firstSentence(combo.counter))}`;
  }
  const pr = top.prof.profile;
  const caution =
    (pr?.ccTypes || []).some((c) => HARD_CC.includes(c))
      ? "한 방 CC 조심하세요"
      : pr?.burst === "high"
        ? "순식간에 녹으니 거리 두세요"
        : "조심하세요";
  return `팀에서 가장 위험한 건 ${name}예요. ${caution}.`;
}

// 1부: 적 조합을 챔프 이름 + 구체적 특성으로 설명 + 우리 이기는 법
function buildEnemyCompLine(
  participants: LiveParticipant[],
  myTeamId: number,
  edge: CompEdge,
  timing: Timing,
  ourStrengths: string[]
): string {
  const enemyTeam = myTeamId === 200 ? 100 : 200;
  const en = participants
    .filter((p) => p.teamId === enemyTeam)
    .map((p) => {
      const c = getChampionById(p.championKey || "");
      return {
        nm: p.championName || c?.name || p.championKey || "?",
        classes: c?.classes || [],
        damage: c?.damage || "",
        strengths: c?.strengths || [],
      };
    });
  const by = (pred: (x: (typeof en)[number]) => boolean) =>
    en.filter(pred).map((x) => x.nm);
  const assassins = by((x) => x.classes.includes("assassin"));
  const engagers = by((x) => x.classes.includes("tank") || x.strengths.includes("engage"));
  const pokers = by((x) => x.strengths.includes("poke"));
  const adCount = en.filter((x) => x.damage === "ad").length;
  const apCount = en.filter((x) => x.damage === "ap").length;

  const parts: string[] = [];
  // ① 가장 정의적인 특징(챔프 이름 포함)
  if (assassins.length) {
    parts.push(`상대는 ${assassins.slice(0, 2).join("·")} 같은 암살자가 있어서, 한타 때 뒷라인 위치를 조심해야 해요.`);
  } else if (engagers.length >= 2) {
    parts.push(`상대는 ${engagers.slice(0, 2).join("·")}처럼 이니시·CC가 강해서, 한타 진입 타이밍을 조심해야 해요.`);
  } else if (pokers.length >= 2) {
    parts.push(`상대는 ${pokers.slice(0, 2).join("·")} 중심 포킹 조합이라, 라인 비울 때 체력 관리가 중요해요.`);
  } else {
    parts.push(`상대 조합은 ${en.slice(0, 3).map((x) => x.nm).join(", ")} 등이에요.`);
  }
  // ② 데미지 타입(아이템 선택에 직결)
  if (adCount - apCount >= 3) parts.push("데미지가 거의 AD라 방어구가 효과적이에요.");
  else if (apCount - adCount >= 3) parts.push("AP 데미지가 많아 마법저항을 챙기면 좋아요.");

  // ③ 구도 + 우리 이기는 법
  const edgeTxt =
    edge === "ahead" ? "조합은 우리가 유리해요"
    : edge === "behind" ? "조합은 상대가 유리하지만 충분히 풀 수 있어요"
    : "조합은 비등해요";
  let win = "";
  if (has(ourStrengths, "한타") || has(ourStrengths, "이니시")) win = "한타로 풀어가세요";
  else if (has(ourStrengths, "스플릿")) win = "사이드 운영이 좋아요";
  else if (has(ourStrengths, "포킹")) win = "포킹으로 체력 빼고 싸우세요";
  else if (timing === "late") win = "초반만 버티면 후반이 우리 거예요";
  else if (timing === "early") win = "초반에 굴려야 해요";
  parts.push(win ? `${edgeTxt}. ${win}.` : `${edgeTxt}.`);
  return parts.join(" ");
}

// ----- 2부 보조: 바텀 2v2 듀오 분석 -----
function earlyScore(key?: string, lane?: string): number {
  const prof = getProfileByKey(key, lane);
  if (prof?.profile?.earlyDuel) return tierToNum(prof.profile.earlyDuel); // 1..5
  const s = getChampionById(key || "")?.strengths || [];
  if (s.includes("early") || s.includes("lane") || s.includes("snowball")) return 4;
  if (s.includes("late")) return 2;
  return 3;
}
function scalingScore(key?: string, lane?: string): number {
  const sc = getProfileByKey(key, lane)?.profile?.scaling;
  if (sc === "late") return 3;
  if (sc === "mid") return 2;
  if (sc === "early") return 1;
  const s = getChampionById(key || "")?.strengths || [];
  if (s.includes("late")) return 3;
  if (s.includes("early") || s.includes("lane")) return 1;
  return 2;
}
const CC_KO: [RegExp, string][] = [
  [/stun/i, "기절"], [/root|snare|bind/i, "속박"], [/charm/i, "매혹"],
  [/knockup|airborne/i, "에어본"], [/knock/i, "넉백"], [/suppress/i, "제압"],
  [/fear|flee|terrify/i, "공포"], [/taunt/i, "도발"], [/sleep|drowsy/i, "수면"],
];
function findCcSkill(prof: ChampionProfile) {
  for (const s of prof.keySkills || []) {
    const roles = s.roles as unknown as string[];
    const isCc = roles?.includes("cc") || (s.hitEnables || []).some((h) => CC_KO.some(([re]) => re.test(h)));
    if (isCc) {
      let ko = "CC";
      for (const h of s.hitEnables || []) {
        const m = CC_KO.find(([re]) => re.test(h));
        if (m) { ko = m[1]; break; }
      }
      return { key: s.key as string, name: s.name, ko, dodgeable: (s.type as string) === "skillshot" };
    }
  }
  return null;
}
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function buildDuoCoaching(
  participants: LiveParticipant[],
  myTeamId: number,
  me?: { position?: string }
): string | null {
  const myLane = liveToLane(me?.position);
  if (myLane !== "adc" && myLane !== "support") return null;
  const enemyTeam = myTeamId === 200 ? 100 : 200;
  const slot = (team: number, lane: string) => {
    const k = participants.find(
      (p) => p.teamId === team && liveToLane(p.position) === lane
    )?.championKey;
    return k ? { key: k, lane } : null;
  };
  const myDuo = [slot(myTeamId, "adc"), slot(myTeamId, "support")].filter(
    (d): d is { key: string; lane: string } => !!d
  );
  const enDuo = [slot(enemyTeam, "adc"), slot(enemyTeam, "support")].filter(
    (d): d is { key: string; lane: string } => !!d
  );
  if (!myDuo.length || !enDuo.length) return null;

  // 라인전 강약
  const diff =
    avg(enDuo.map((d) => earlyScore(d.key, d.lane))) -
    avg(myDuo.map((d) => earlyScore(d.key, d.lane)));
  const laneLine =
    diff >= 1 ? "라인전은 상대가 더 강해요" : diff <= -1 ? "라인전은 우리가 더 강해요" : "라인전은 반반 구도예요";
  // 스케일링 승리조건
  const sdiff =
    avg(myDuo.map((d) => scalingScore(d.key, d.lane))) -
    avg(enDuo.map((d) => scalingScore(d.key, d.lane)));
  const winLine =
    sdiff >= 0.5 ? "반반만 잘 넘기면 후반에 유리해져요"
    : sdiff <= -0.5 ? "후반보다 초반에 승부를 보세요"
    : "";
  // 콤보 경고(프로파일 있을 때만): 적 듀오 CC 개시자 + 파트너 연계
  let comboLine = "";
  const enProfs = enDuo
    .map((d) => getProfileByKey(d.key, d.lane))
    .filter((p): p is ChampionProfile => !!p);
  for (const ip of enProfs) {
    const cc = findCcSkill(ip);
    if (!cc) continue;
    const skill = `${cc.key} ${cc.name}`; // "Q 면도날 표창" 처럼 키+스킬명
    const partner = enProfs.find((p) => p.id !== ip.id);
    if (partner) {
      comboLine =
        `${ip.name} ${skill}(${cc.ko})에 맞으면 ${partner.name} 연계로 위험해요.` +
        (cc.dodgeable ? ` ${skill} 꼭 피하세요.` : ` 거리 유지하세요.`);
    } else {
      comboLine = `${ip.name} ${skill}${cc.dodgeable ? " 꼭 피하세요." : " 조심하세요."}`;
    }
    break;
  }

  const parts = [ensureDot(laneLine)];
  if (winLine) parts.push(ensureDot(winLine));
  if (comboLine) parts.push(comboLine);
  return parts.join(" ");
}

// 오늘의 우선순위 1개
function buildPriority(edge: CompEdge, timing: Timing, ourStrengths: string[]): string {
  let p: string;
  if (edge === "behind") p = "무리하지 말고 상대 실수 날 때만 받아치기";
  else if (timing === "early") p = "초반 주도권 잡고 굴리기";
  else if (timing === "late") p = "초반 손해 줄이고 후반 보기";
  else if (has(ourStrengths, "한타") || has(ourStrengths, "이니시")) p = "진형 갖추고 한타 열기";
  else p = "큰 실수 없이 차근차근";
  return `이 판 핵심 하나 — ${p}.`;
}

export function buildCompBriefing(
  participants: LiveParticipant[],
  myTeamId: number = 100,
  me?: { championKey?: string; position?: string }
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
  const gamePlan = makeGamePlan(ourStrengths, ourWeaknesses, theirStrengths, timing, edge);

  const priority = buildPriority(edge, timing, ourStrengths);

  // 1부 — 팀 5:5 (시작 직후): 조합 구도 + 내 라인 밖 최대 위협
  const part1 = [
    buildEnemyCompLine(participants, myTeamId, edge, timing, ourStrengths),
    buildTopThreat(participants, myTeamId, me),
  ]
    .filter(Boolean)
    .join(" ");

  // 2부 — 내 라인 (약 3초 뒤): 바텀=2v2 듀오, 그 외=1v1 맞라인
  const myLane = liveToLane(me?.position);
  let laneCore: string | null = null;
  if (myLane === "adc" || myLane === "support")
    laneCore = buildDuoCoaching(participants, myTeamId, me);
  if (!laneCore) laneCore = buildLaneCoaching(participants, myTeamId, me);

  const laneTts = laneCore ? `${laneCore} ${priority}` : null;
  // 라인 코칭이 없으면 우선순위를 1부 끝에 붙인다
  const tts = laneTts ? part1 : `${part1} ${priority}`;

  return {
    ourTeamId: myTeamId,
    compEdge: edge,
    ourWinRate,
    ourStrengths,
    ourWeaknesses,
    theirStrengths,
    theirWeaknesses,
    timing,
    gamePlan,
    tts,
    laneTts,
  };
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
    briefing: buildCompBriefing(req.participants, req.myTeamId, req.me),
  };
}

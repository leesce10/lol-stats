/**
 * 챔셀 코치 분석 엔진.
 * 5v5 팀 조합을 받아 시간대별 행동 지침, 흔한 함정, 한타 우선순위를 산출한다.
 */

import { allChampions, type ChampionMeta } from "@/data/all-champions";

export type TeamSlot = string | null; // 챔피언 ID or null

export interface TeamComp {
  blue: TeamSlot[]; // 5슬롯
  red: TeamSlot[]; // 5슬롯
}

export type PowerPhase = "early" | "mid" | "late";
export type CompArchetype =
  | "dive"
  | "poke"
  | "pick"
  | "teamfight"
  | "splitpush"
  | "scaling"
  | "balanced";

export interface TeamAnalysis {
  archetype: CompArchetype;
  archetypeKr: string;
  powerPeak: PowerPhase;
  tankCount: number;
  adCount: number;
  apCount: number;
  ccCount: number;
  engageCount: number;
  summary: string;
}

export interface ChampSelectGuide {
  blueAnalysis: TeamAnalysis;
  redAnalysis: TeamAnalysis;
  /** 한 줄 핵심 */
  oneLineKey: string;
  /** 시간대별 행동 지침 */
  phases: { phase: PowerPhase; label: string; guidance: string[] }[];
  /** 흔한 함정 */
  pitfalls: string[];
  /** 한타 우선순위 (적 5명 순서) */
  priorityOrder: Array<{ championId: string; nameKr: string; reason: string }>;
}

function toMeta(id: string | null): ChampionMeta | null {
  if (!id) return null;
  return allChampions.find((c) => c.id === id) ?? null;
}

function analyzeTeam(team: TeamSlot[]): TeamAnalysis {
  const metas = team.map(toMeta).filter((m): m is ChampionMeta => m !== null);

  const tankCount = metas.filter((m) => m.tags.includes("Tank")).length;
  const apCount = metas.filter((m) => m.tags.includes("Mage")).length;
  const adCount = metas.filter((m) =>
    m.tags.includes("Marksman") || m.tags.includes("Fighter")
  ).length;
  const assassinCount = metas.filter((m) => m.tags.includes("Assassin")).length;
  const supportCount = metas.filter((m) => m.tags.includes("Support")).length;

  // 아키타입 휴리스틱
  const diveChamps = ["Malphite", "Kennen", "Diana", "Hecarim", "Nocturne", "Rell", "Sejuani", "Leona", "Nautilus", "Amumu"];
  const pokeChamps = ["Jayce", "Xerath", "Varus", "Nidalee", "Caitlyn", "Zoe", "Lux"];
  const scalingChamps = ["Kassadin", "Vayne", "Jinx", "Kayle", "Nasus", "Veigar", "Kogmaw", "Aphelios"];

  const diveCount = metas.filter((m) => diveChamps.includes(m.id)).length;
  const pokeCount = metas.filter((m) => pokeChamps.includes(m.id)).length;
  const scalingCount = metas.filter((m) => scalingChamps.includes(m.id)).length;

  let archetype: CompArchetype = "balanced";
  let archetypeKr = "균형 잡힌 조합";

  if (diveCount >= 3 && tankCount >= 1) {
    archetype = "dive";
    archetypeKr = "하드 다이브 조합";
  } else if (pokeCount >= 2 && apCount >= 2) {
    archetype = "poke";
    archetypeKr = "포크 조합";
  } else if (assassinCount >= 2) {
    archetype = "pick";
    archetypeKr = "픽오프 조합";
  } else if (scalingCount >= 2) {
    archetype = "scaling";
    archetypeKr = "후반 스케일링 조합";
  } else if (tankCount >= 2 && metas.length >= 4) {
    archetype = "teamfight";
    archetypeKr = "한타 조합";
  } else if (metas.some((m) => ["Fiora", "Jax", "Tryndamere", "Camille", "Yorick"].includes(m.id))) {
    archetype = "splitpush";
    archetypeKr = "스플릿 조합";
  }

  // 파워 피크 추정
  let powerPeak: PowerPhase = "mid";
  if (archetype === "dive" || archetype === "poke") powerPeak = "early";
  else if (archetype === "scaling") powerPeak = "late";
  else if (archetype === "splitpush") powerPeak = "mid";

  // CC 수 (태그 기반)
  const ccCount = tankCount + supportCount;
  const engageCount = diveCount + tankCount;

  const summary =
    archetypeKr +
    " · 파워 피크 " +
    (powerPeak === "early" ? "초반(1~14분)" : powerPeak === "mid" ? "중반(14~25분)" : "후반(25분+)") +
    " · 탱 " + tankCount + " / AD " + adCount + " / AP " + apCount;

  return {
    archetype,
    archetypeKr,
    powerPeak,
    tankCount,
    adCount,
    apCount,
    ccCount,
    engageCount,
    summary,
  };
}

/** 한 줄 핵심 생성 */
function buildOneLineKey(mine: TeamAnalysis, enemy: TeamAnalysis): string {
  if (mine.powerPeak === "early" && enemy.powerPeak === "late") {
    return "15~20분 안에 끝내야 한다. 적 풀템 가면 못 이긴다.";
  }
  if (mine.powerPeak === "late" && enemy.powerPeak === "early") {
    return "초반 15분 버티기. 라인전 손해 감수하고 파밍 유지.";
  }
  if (mine.archetype === "dive" && enemy.archetype === "poke") {
    return "포크 셋업 전 이니시해서 한타 강제하라.";
  }
  if (mine.archetype === "poke" && enemy.archetype === "dive") {
    return "이니시 거리 주지 말고 지속 포크로 체력 깎아라.";
  }
  if (mine.archetype === "pick" && enemy.tankCount >= 3) {
    return "탱커 한타 피하고 고립된 적 캐리만 원콜하라.";
  }
  if (mine.archetype === "splitpush") {
    return "스플릿으로 맵 압박. 한타 각 안 나오면 사이드 유지.";
  }
  if (mine.archetype === "scaling" && enemy.archetype === "scaling") {
    return "양쪽 후반 스케일링. 오브젝트(용·바론) 통제가 승부처.";
  }
  if (mine.ccCount >= 4) {
    return "CC 체인으로 한타 이니시. 뭉쳐 다녀서 시너지 극대화.";
  }
  return `${mine.archetypeKr}. 파워 피크 타이밍에 오브젝트 강제하라.`;
}

/** 시간대별 행동 지침 */
function buildPhases(mine: TeamAnalysis, enemy: TeamAnalysis): ChampSelectGuide["phases"] {
  const phases: ChampSelectGuide["phases"] = [];

  // 초반
  const earlyGuide: string[] = [];
  if (mine.powerPeak === "early") earlyGuide.push("파워 피크 — 킬/오브젝트 적극 강제");
  else if (mine.powerPeak === "late") earlyGuide.push("파밍 우선. 킬 노리지 말고 CS 유지");
  if (enemy.archetype === "dive") earlyGuide.push("다이브 조합 주의 — 포탑 아래에서도 안전 금지, 와드 유지");
  if (enemy.archetype === "poke") earlyGuide.push("포크 버티기용 포션/도란 방패 추천");
  if (mine.ccCount >= 3) earlyGuide.push("CC 있는 정글과 협공 갱 적극");
  if (earlyGuide.length === 0) earlyGuide.push("라인전 안정 + 정글 주도권 경쟁");
  phases.push({ phase: "early", label: "라인전 (1~14분)", guidance: earlyGuide });

  // 중반
  const midGuide: string[] = [];
  if (mine.archetype === "dive" || mine.archetype === "teamfight") midGuide.push("뭉쳐서 오브젝트 강제. 용/전령에 5인 한타 유도");
  if (mine.archetype === "splitpush") midGuide.push("1-3-1 스플릿. 사이드 라인 압박 + 바론 시야");
  if (mine.archetype === "pick") midGuide.push("시야 장악 + 고립 적 픽오프");
  if (enemy.archetype === "scaling") midGuide.push("적 스케일링 누적되기 전 오브젝트 선점");
  if (midGuide.length === 0) midGuide.push("오브젝트 싸움 타이밍 맞춤. 포지션 유지");
  phases.push({ phase: "mid", label: "중반 (14~25분)", guidance: midGuide });

  // 후반
  const lateGuide: string[] = [];
  if (mine.powerPeak === "late") lateGuide.push("파워 피크 — 한타 강제, 바론/엘더 압박");
  if (enemy.archetype === "dive" && mine.archetype !== "dive") lateGuide.push("진입각 주지 말고 개활지 한타 피하기");
  if (mine.archetype === "poke") lateGuide.push("바론 시야 확보 후 장거리 포크로 초반 한타 승");
  if (mine.ccCount >= 4) lateGuide.push("CC 체인 이니시 + 아군 딜러 보호");
  if (lateGuide.length === 0) lateGuide.push("바론/엘더 중심 운영. 한 번 진 한타로 게임 끝날 수 있음");
  phases.push({ phase: "late", label: "후반 (25분+)", guidance: lateGuide });

  return phases;
}

/** 흔한 함정 */
function buildPitfalls(mine: TeamAnalysis, enemy: TeamAnalysis): string[] {
  const pitfalls: string[] = [];

  if (mine.powerPeak === "early" && enemy.powerPeak === "late") {
    pitfalls.push("초반 유리하다고 파밍만 하다 후반 밀림 — 15~20분에 승부 내야 함");
  }
  if (mine.archetype === "dive" && mine.tankCount < 2) {
    pitfalls.push("다이브 조합인데 앞라인 부족 — 혼자 진입 시 전멸");
  }
  if (mine.archetype === "poke" && enemy.archetype === "dive") {
    pitfalls.push("이니시 각 1번 내줘도 한타 즉사 — 포지션 안 무너뜨리기");
  }
  if (mine.apCount === 0) {
    pitfalls.push("마법 뎀 0 — 적 탱커가 방어력만 올려도 딜 반감");
  }
  if (mine.adCount === 0) {
    pitfalls.push("물리 뎀 0 — 적 탱커가 마저만 올려도 딜 반감");
  }
  if (mine.tankCount === 0 && mine.archetype !== "poke" && mine.archetype !== "scaling") {
    pitfalls.push("앞라인 제로 — 한타 시작 불가, 스플릿/픽오프 강제");
  }
  if (mine.ccCount < 2) {
    pitfalls.push("CC 부족 — 적 캐리 접근 시 끊을 수단 제로");
  }

  return pitfalls.slice(0, 4);
}

/** 한타 우선순위 (적 캐리부터 잘라야 할 순서) */
function buildPriorityOrder(enemyTeam: TeamSlot[]): ChampSelectGuide["priorityOrder"] {
  const metas = enemyTeam.map(toMeta).filter((m): m is ChampionMeta => m !== null);

  // 우선순위: Marksman > Assassin > Mage > Support > Fighter > Tank
  const priority = (m: ChampionMeta): number => {
    if (m.tags.includes("Marksman")) return 0;
    if (m.tags.includes("Assassin")) return 1;
    if (m.tags.includes("Mage") && !m.tags.includes("Support")) return 2;
    if (m.tags.includes("Support")) return 3;
    if (m.tags.includes("Fighter")) return 4;
    if (m.tags.includes("Tank")) return 5;
    return 6;
  };

  const sorted = [...metas].sort((a, b) => priority(a) - priority(b));

  return sorted.map((m) => {
    let reason = "";
    if (m.tags.includes("Marksman")) reason = "지속딜 — 녹이면 한타 뎀 90% 감소";
    else if (m.tags.includes("Assassin")) reason = "버스트 암살자 — 제거 시 아군 딜러 생존";
    else if (m.tags.includes("Mage")) reason = "AP 캐리 — 포크/버스트 원천";
    else if (m.tags.includes("Support")) reason = "유틸/피 — 유지력 차단";
    else if (m.tags.includes("Fighter")) reason = "브루저 — 앞라인";
    else if (m.tags.includes("Tank")) reason = "탱커 — 마지막. 딜 부족, 시간 낭비";
    return { championId: m.id, nameKr: m.nameKr, reason };
  });
}

/** 메인 엔트리 */
export function generateChampSelectGuide(comp: TeamComp): ChampSelectGuide {
  const blueAnalysis = analyzeTeam(comp.blue);
  const redAnalysis = analyzeTeam(comp.red);

  return {
    blueAnalysis,
    redAnalysis,
    oneLineKey: buildOneLineKey(blueAnalysis, redAnalysis),
    phases: buildPhases(blueAnalysis, redAnalysis),
    pitfalls: buildPitfalls(blueAnalysis, redAnalysis),
    priorityOrder: buildPriorityOrder(comp.red),
  };
}

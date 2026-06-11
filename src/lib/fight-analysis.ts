// fight-analysis.ts — 오브젝트 교전 분석.
// 오브젝트 스폰 임박 시, 양팀의 (1) 실질 교전 인원(죽은 팀원이 제시간에 올 수 있는지)
// (2) 평균 레벨 (3) 아이템 골드 가치를 종합해 "지금 싸우면 유리/불리"를 판정.
// 입력값은 모두 화면에 보이는 정보(레벨·아이템·사망)에서 나오고, 부활은 결정적 계산.

import { loadItems } from "./item-timing";

const TRAVEL = 12; // 부활 후 오브젝트까지 이동(추정, 초)
const SETUP_MARGIN = 8; // 도착 후 자리잡는 데 필요한 여유(초). 이보다 빠듯하면 반쪽 전력

// 판정 가중치 — 실게임 데이터로 보정 예정(현재는 추정값)
const W_NUMBERS = 3; // 수적 우위(가장 지배적)
const W_LEVEL = 0.8; // 평균 레벨 차
const W_GOLD = 1 / 1500; // 아이템 골드 차

function respawnSeconds(level: number, gameSec: number): number {
  const BRW = [
    10, 10, 12, 12, 14, 16, 20, 25, 28.5, 32.5, 35, 37.5, 40, 42.5, 45, 47.5,
    50, 52.5,
  ];
  const lvl = Math.max(1, Math.min(18, Math.round(level || 1)));
  const min = (gameSec || 0) / 60;
  const tif = min > 15 ? Math.min(0.5, (min - 15) * 0.02) : 0;
  return BRW[lvl - 1] * (1 + tif);
}

export interface FightPlayer {
  teamId: number; // 100 | 200
  level: number;
  items?: number[];
  isDead?: boolean;
  respawnTimer?: number; // 클라가 주면 사용, 없으면 공식으로 추정
}

export interface FightInput {
  secondsToObjective: number; // 오브젝트까지 남은 초
  gameTime: number;
  myTeamId: number; // 100 | 200
  objective?: string; // "드래곤" 등 표시용
  players: FightPlayer[];
}

interface TeamStat {
  members: number;
  effective: number; // 교전 시점에 싸울 수 있는 인원
  lateReturns: number; // 제시간에 못 오는 사망자 수
  avgLevel: number;
  gold: number;
}

export type Verdict = "매우 유리" | "유리" | "호각" | "불리" | "매우 불리";

export interface FightAnalysis {
  ok: true;
  verdict: Verdict;
  score: number;
  reason: string;
  objective: string;
  secondsToObjective: number;
  my: TeamStat;
  enemy: TeamStat;
  numbersDiff: number;
  avgLevelDiff: number;
  goldDiff: number;
}

export async function analyzeFight(input: FightInput): Promise<FightAnalysis> {
  const items = await loadItems();
  const itemVal = (ids: number[] = []) =>
    ids.reduce((s, id) => s + (items[String(id)]?.gold.total || 0), 0);

  const teamStat = (teamId: number): TeamStat => {
    const ps = input.players.filter((p) => p.teamId === teamId);
    let effective = 0;
    let lateReturns = 0;
    let levelSum = 0;
    let gold = 0;
    for (const p of ps) {
      levelSum += p.level || 1;
      gold += itemVal(p.items);
      if (!p.isDead) {
        effective++;
        continue;
      }
      const backIn =
        (p.respawnTimer && p.respawnTimer > 0
          ? p.respawnTimer
          : respawnSeconds(p.level, input.gameTime)) + TRAVEL;
      const margin = input.secondsToObjective - backIn;
      if (margin >= SETUP_MARGIN)
        effective++; // 여유 있게 도착
      else if (margin >= 0)
        effective += 0.5; // 가까스로 도착 → 반쪽 전력
      else lateReturns++; // 제시간에 못 옴
    }
    return {
      members: ps.length,
      effective,
      lateReturns,
      avgLevel: ps.length ? levelSum / ps.length : 0,
      gold,
    };
  };

  const enemyId = input.myTeamId === 100 ? 200 : 100;
  const my = teamStat(input.myTeamId);
  const enemy = teamStat(enemyId);

  const numbersDiff = my.effective - enemy.effective;
  const avgLevelDiff = my.avgLevel - enemy.avgLevel;
  const goldDiff = my.gold - enemy.gold;

  // 수적 우위가 가장 지배적, 그다음 레벨, 골드
  const score =
    numbersDiff * W_NUMBERS + avgLevelDiff * W_LEVEL + goldDiff * W_GOLD;

  const verdict: Verdict =
    score >= 3
      ? "매우 유리"
      : score >= 1
        ? "유리"
        : score <= -3
          ? "매우 불리"
          : score <= -1
            ? "불리"
            : "호각";

  // 이유: 지배적 요인 위주
  const parts: string[] = [];
  if (numbersDiff !== 0) {
    parts.push(
      numbersDiff > 0
        ? `수적 우위 ${my.effective}:${enemy.effective}` +
            (enemy.lateReturns ? ` (적 ${enemy.lateReturns}명 복귀 못 함)` : "")
        : `수적 열세 ${my.effective}:${enemy.effective}` +
            (my.lateReturns ? ` (아군 ${my.lateReturns}명 복귀 못 함)` : "")
    );
  }
  if (Math.abs(avgLevelDiff) >= 0.5)
    parts.push(`평균 레벨 ${avgLevelDiff > 0 ? "+" : ""}${avgLevelDiff.toFixed(1)}`);
  if (Math.abs(goldDiff) >= 800)
    parts.push(`아이템 골드 ${goldDiff > 0 ? "+" : ""}${Math.round(goldDiff)}`);
  if (!parts.length) parts.push("양팀 전력 비슷");

  return {
    ok: true,
    verdict,
    score: Math.round(score * 10) / 10,
    reason: parts.join(" · "),
    objective: input.objective || "오브젝트",
    secondsToObjective: input.secondsToObjective,
    my,
    enemy,
    numbersDiff,
    avgLevelDiff: Math.round(avgLevelDiff * 10) / 10,
    goldDiff: Math.round(goldDiff),
  };
}

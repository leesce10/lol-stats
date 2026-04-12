import type { JungleChampionProfile, PhaseGuide } from "@/types/matchup-engine";
import { tierDiff, tierDiffLabel, 이가 } from "../utils";

/**
 * L3 — 페이즈별 운영 가이드 생성 (정글 프레임).
 * 양 챔프의 phase strategy를 교차 조합.
 */
export function generatePhaseGuides(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): { early: PhaseGuide; mid: PhaseGuide; late: PhaseGuide } {
  return {
    early: generatePhase(my, enemy, "early"),
    mid: generatePhase(my, enemy, "mid"),
    late: generatePhase(my, enemy, "late"),
  };
}

function generatePhase(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  phase: "early" | "mid" | "late"
): PhaseGuide {
  const myPhase = my.phases[phase];
  const enemyPhase = enemy.phases[phase];

  // 해당 페이즈의 듀얼 티어
  const duelKey = phase === "early" ? "earlyDuel" : phase === "mid" ? "midDuel" : "lateDuel";
  const duelDiff = tierDiff(my.profile[duelKey], enemy.profile[duelKey]);
  const duelLabel = tierDiffLabel(duelDiff);

  // 클리어 속도 비교 (초반에만 의미)
  const clearDiff = tierDiff(my.profile.clearSpeed, enemy.profile.clearSpeed);

  return {
    goal: generateGoal(my, myPhase, duelLabel, phase),
    enemyIntent: generateEnemyIntent(enemy, enemyPhase, phase),
    dangerTiming: generateDangerTiming(my, enemy, myPhase, enemyPhase, phase, duelDiff),
    opportunityTiming: generateOpportunityTiming(my, enemy, myPhase, enemyPhase, phase, duelDiff),
    pathing: generatePathing(my, enemy, myPhase, phase, clearDiff),
    gankCounterjungle: generateGankCJ(my, enemy, myPhase, phase, duelDiff, clearDiff),
  };
}

function generateGoal(
  my: JungleChampionProfile,
  myPhase: { goal: string },
  duelLabel: string,
  phase: string
): string {
  // 기본은 프로파일의 goal 직접 사용 + 듀얼 상태 추가
  return `${myPhase.goal} (이 매치업 듀얼 ${duelLabel})`;
}

function generateEnemyIntent(
  enemy: JungleChampionProfile,
  enemyPhase: { goal: string; danger: string },
  phase: string
): string {
  // 상대의 goal이 곧 "상대가 노리는 것"
  return `${enemy.name}${이가(enemy.name)} 노리는 것: ${enemyPhase.goal}`;
}

function generateDangerTiming(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  myPhase: { danger: string },
  enemyPhase: { opportunity: string },
  phase: string,
  duelDiff: number
): string {
  const parts: string[] = [];

  // 본인 위험 시점
  parts.push(myPhase.danger);

  // 상대 파워 스파이크가 이 페이즈에 있으면 경고
  const phaseRange = phase === "early" ? [1, 6] : phase === "mid" ? [6, 14] : [14, 18];
  const enemySpikesInPhase = enemy.powerSpikes.filter(
    lvl => lvl >= phaseRange[0] && lvl <= phaseRange[1]
  );
  if (enemySpikesInPhase.length > 0) {
    parts.push(`상대 파워 스파이크: ${enemySpikesInPhase.join(", ")}렙.`);
  }

  // 듀얼 불리 시 추가 경고
  if (duelDiff <= -2) {
    parts.push("1:1 교전 절대 금지.");
  } else if (duelDiff === -1) {
    parts.push("1:1 교전 비추. 아군 합류 시에만.");
  }

  return parts.join(" ");
}

function generateOpportunityTiming(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  myPhase: { opportunity: string },
  enemyPhase: { danger: string },
  phase: string,
  duelDiff: number
): string {
  const parts: string[] = [];

  // 상대 약점이 곧 나의 기회
  parts.push(`상대 약점: ${enemyPhase.danger}`);

  // 본인 기회
  parts.push(myPhase.opportunity);

  // 본인 파워 스파이크
  const phaseRange = phase === "early" ? [1, 6] : phase === "mid" ? [6, 14] : [14, 18];
  const mySpikesInPhase = my.powerSpikes.filter(
    lvl => lvl >= phaseRange[0] && lvl <= phaseRange[1]
  );
  if (mySpikesInPhase.length > 0) {
    parts.push(`내 파워 스파이크: ${mySpikesInPhase.join(", ")}렙.`);
  }

  return parts.join(" ");
}

function generatePathing(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  myPhase: { pathing?: string; objective?: string },
  phase: string,
  clearDiff: number
): string {
  const parts: string[] = [];

  if (myPhase.pathing) {
    parts.push(myPhase.pathing);
  }

  // 클리어 속도 차이 기반 동선 조언 (초반에 특히 중요)
  if (phase === "early") {
    if (clearDiff <= -2) {
      parts.push("상대 클리어가 압도적으로 빠름. 카정 당할 위험. 안전한 동선 유지.");
    } else if (clearDiff <= -1) {
      parts.push("상대 클리어가 더 빠름. 3캠프차 접촉 회피 권장.");
    } else if (clearDiff >= 2) {
      parts.push("본인 클리어가 더 빠름. 레벨 이득 활용 가능.");
    }
  }

  if (myPhase.objective) {
    parts.push(myPhase.objective);
  }

  return parts.join(" ");
}

function generateGankCJ(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile,
  myPhase: { gank?: string },
  phase: string,
  duelDiff: number,
  clearDiff: number
): string {
  const parts: string[] = [];

  if (myPhase.gank) {
    parts.push(myPhase.gank);
  }

  // 카정 가능성 판단
  if (phase === "early") {
    if (duelDiff >= 2) {
      parts.push("카정 적극 가능. 1:1에서 압도적 우위.");
    } else if (duelDiff >= 1) {
      parts.push("카정 시 유리. 단, 상대 라이너 합류 주의.");
    } else if (duelDiff <= -1) {
      parts.push("카정 금지. 마주치면 진다.");
    }
  }

  return parts.join(" ");
}

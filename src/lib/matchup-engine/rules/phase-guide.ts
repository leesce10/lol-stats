import type { ChampionProfile, Lane, PhaseGuide } from "@/types/matchup-engine";
import { tierDiff, tierDiffLabel, 이가 } from "../utils";

/**
 * L3 — 페이즈별 운영 가이드 생성 (라인별 분기).
 * 양 챔프의 phase strategy를 교차 조합.
 */
export function generatePhaseGuides(
  my: ChampionProfile,
  enemy: ChampionProfile
): { early: PhaseGuide; mid: PhaseGuide; late: PhaseGuide } {
  return {
    early: generatePhase(my, enemy, "early"),
    mid: generatePhase(my, enemy, "mid"),
    late: generatePhase(my, enemy, "late"),
  };
}

function generatePhase(
  my: ChampionProfile,
  enemy: ChampionProfile,
  phase: "early" | "mid" | "late"
): PhaseGuide {
  const myPhase = my.phases[phase];
  const enemyPhase = enemy.phases[phase];

  // 해당 페이즈의 듀얼 티어
  const duelKey = phase === "early" ? "earlyDuel" : phase === "mid" ? "midDuel" : "lateDuel";
  const duelDiff = tierDiff(my.profile[duelKey], enemy.profile[duelKey]);
  const duelLabel = tierDiffLabel(duelDiff);

  // 클리어 속도 비교 (정글 초반에만 의미)
  const clearDiff = tierDiff(my.profile.clearSpeed, enemy.profile.clearSpeed);

  return {
    goal: generateGoal(my, myPhase, duelLabel, phase),
    enemyIntent: generateEnemyIntent(enemy, enemyPhase, phase),
    dangerTiming: generateDangerTiming(my, enemy, myPhase, enemyPhase, phase, duelDiff),
    opportunityTiming: generateOpportunityTiming(my, enemy, myPhase, enemyPhase, phase, duelDiff),
    pathing: generatePathing(my, enemy, myPhase, phase, clearDiff),
    gankCounterjungle: generateLaneTactic(my, enemy, myPhase, phase, duelDiff, clearDiff),
  };
}

function generateGoal(
  my: ChampionProfile,
  myPhase: { goal: string },
  duelLabel: string,
  phase: string
): string {
  // 기본은 프로파일의 goal 직접 사용 + 듀얼 상태 추가
  return `${myPhase.goal} (이 매치업 듀얼 ${duelLabel})`;
}

function generateEnemyIntent(
  enemy: ChampionProfile,
  enemyPhase: { goal: string; danger: string },
  phase: string
): string {
  // 상대의 goal이 곧 "상대가 노리는 것"
  return `${enemy.name}${이가(enemy.name)} 노리는 것: ${enemyPhase.goal}`;
}

function generateDangerTiming(
  my: ChampionProfile,
  enemy: ChampionProfile,
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
  my: ChampionProfile,
  enemy: ChampionProfile,
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
  my: ChampionProfile,
  enemy: ChampionProfile,
  myPhase: { pathing?: string; objective?: string },
  phase: string,
  clearDiff: number
): string {
  const parts: string[] = [];

  if (myPhase.pathing) {
    parts.push(myPhase.pathing);
  }

  // 라인별 보조 조언
  if (my.position === "jungle") {
    if (phase === "early") {
      if (clearDiff <= -2) {
        parts.push("상대 클리어가 압도적으로 빠름. 카정 당할 위험. 안전한 동선 유지.");
      } else if (clearDiff <= -1) {
        parts.push("상대 클리어가 더 빠름. 3캠프차 접촉 회피 권장.");
      } else if (clearDiff >= 2) {
        parts.push("본인 클리어가 더 빠름. 레벨 이득 활용 가능.");
      }
    }
  } else if (my.position === "top" || my.position === "mid") {
    // 솔로라인: 웨이브 상태 자동 조언
    const myDuelTier = my.profile[phase === "early" ? "earlyDuel" : phase === "mid" ? "midDuel" : "lateDuel"];
    const enemyDuelTier = enemy.profile[phase === "early" ? "earlyDuel" : phase === "mid" ? "midDuel" : "lateDuel"];
    const duel = tierDiff(myDuelTier, enemyDuelTier);
    if (phase === "early") {
      if (duel <= -1) {
        parts.push("웨이브를 내 포탑 쪽에서 프리즈. 상대 접근 거리 강제.");
      } else if (duel >= 1) {
        parts.push("웨이브를 상대 쪽으로 밀어 CS 손해 + 갱 노출 유도.");
      }
    }
  } else if (my.position === "adc") {
    if (phase === "early") {
      if (my.profile.mobility === "low") {
        parts.push("부시 뒤편보다 라인 중앙에서 사거리 유지. 부시 시야는 서폿 와드로.");
      } else {
        parts.push("부시 끼고 트레이드 각 잡기. 서폿 갱 각 신호 주시.");
      }
    }
  } else if (my.position === "support") {
    if (phase === "early") {
      parts.push("3분 30초 강 스커틀 주변 와드 · 7분 적 정글 입구 와드 권장.");
    }
  }

  if (myPhase.objective) {
    parts.push(myPhase.objective);
  }

  return parts.join(" ");
}

function generateLaneTactic(
  my: ChampionProfile,
  enemy: ChampionProfile,
  myPhase: { gank?: string },
  phase: string,
  duelDiff: number,
  clearDiff: number
): string {
  const parts: string[] = [];

  if (myPhase.gank) {
    parts.push(myPhase.gank);
  }

  if (my.position === "jungle") {
    if (phase === "early") {
      if (duelDiff >= 2) {
        parts.push("카정 적극 가능. 1:1에서 압도적 우위.");
      } else if (duelDiff >= 1) {
        parts.push("카정 시 유리. 단, 상대 라이너 합류 주의.");
      } else if (duelDiff <= -1) {
        parts.push("카정 금지. 마주치면 진다.");
      }
    }
  } else if (my.position === "top") {
    if (phase === "mid" || phase === "late") {
      parts.push("텔 타이밍: 바텀 드래곤 한타 최우선. 탑은 웨이브 손해 감수.");
    } else if (duelDiff >= 1) {
      parts.push("상대 솔킬 낼 수 있음. 단, 적 정글 시야 필수.");
    } else if (duelDiff <= -1) {
      parts.push("솔킬 시도 금지. 텔로 아군 지원 만이라도 확실히.");
    }
  } else if (my.position === "mid") {
    if (phase === "mid" || phase === "late") {
      parts.push("로밍 타이밍: 6렙 궁 확보 후 웨이브 밀고 사이드 합류.");
    } else if (my.profile.mobility === "high") {
      parts.push("상대 무궁 틈 이용 로밍. 웨이브 밀고 부시 대기 플레이 가능.");
    }
  } else if (my.position === "adc") {
    if (phase === "early" || phase === "mid") {
      if (my.profile.burst === "high") {
        parts.push("서폿 이니시에 맞춰 풀딜. 2인 콤보 우선.");
      } else {
        parts.push("서폿 engage 대신 지속딜 포지션 유지. DPS 극대화.");
      }
    }
    if (phase === "late") {
      parts.push("한타 포지셔닝: 탱커 뒤, 팀원 시야 밖 회피. 스펠 낭비 금지.");
    }
  } else if (my.position === "support") {
    if (phase === "early") {
      parts.push("3분 이전 상대 부시 체크. 서폿 스킬 쿨다운과 와드 슬롯 동시 관리.");
    } else if (phase === "mid") {
      parts.push("미드 로밍 타이밍: ADC 플래시 있고 웨이브 안정 시만.");
    } else {
      parts.push("한타 전 강과 바론 입구 시야. 핑크 와드 아끼지 말 것.");
    }
  }

  return parts.join(" ");
}

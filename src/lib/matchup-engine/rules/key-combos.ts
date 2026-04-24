import type { ChampionProfile, KeyCombo } from "@/types/matchup-engine";

/**
 * L2 카드 상단 — 상대 챔프의 핵심 콤보/스킬 연계 추출.
 *
 * 유저 피드백: "이 스킬 하나 조심"은 실전적이지 않다.
 * 예: 트페 Q는 너무 느려서 단독으로 못 맞힘 — 진짜 위협은 W 금색→Q 콤보.
 * → 셋업(W 금색) + 페이오프(Q 확정) + 뎀 밴드로 표현.
 *
 * 1순위: 프로파일에 keyCombos가 있으면 그대로 사용 (핸드크래프트).
 * 2순위: keySkills에서 기본 콤보 자동 합성 (자동 생성 폴백).
 */
export function generateKeyCombos(
  _my: ChampionProfile,
  enemy: ChampionProfile
): KeyCombo[] {
  if (enemy.keyCombos && enemy.keyCombos.length > 0) {
    return enemy.keyCombos.slice(0, 3);
  }
  return synthesizeFallbackCombos(enemy);
}

/**
 * 핸드크래프트 콤보가 없을 때, 스킬 정보로 기본 콤보 합성.
 * 가장 자주 쓰이는 패턴: Q(딜) + 주요 CC 스킬 + R 피니시.
 */
function synthesizeFallbackCombos(enemy: ChampionProfile): KeyCombo[] {
  const q = enemy.keySkills.find(s => s.key === "Q");
  const w = enemy.keySkills.find(s => s.key === "W");
  const e = enemy.keySkills.find(s => s.key === "E");
  const r = enemy.keySkills.find(s => s.key === "R");

  const ccSkill = enemy.keySkills.find(
    s => s.roles.includes("cc") && (s.missPenalty === "critical" || s.missPenalty === "high")
  );
  const mainDmg = enemy.keySkills.find(s => s.roles.includes("primary_damage"));

  const combos: KeyCombo[] = [];
  const burst = enemy.profile.burst;
  const damageBand =
    burst === "high"
      ? "초반 20~30% · 코어템 40%+ · 풀템 반피 이상"
      : burst === "medium"
        ? "초반 15~20% · 코어템 25~30%"
        : "초반 10~15% · 지속딜 누적";

  // 패턴 1: CC 셋업 → 주 딜 풀콤
  if (ccSkill && mainDmg && ccSkill.key !== mainDmg.key) {
    combos.push({
      name: `${ccSkill.key} 셋업 → ${mainDmg.key} 풀히트 콤보`,
      setup: `${ccSkill.key}(${ccSkill.name}) 적중`,
      payoff: `CC 걸린 대상에게 ${mainDmg.key}(${mainDmg.name}) + 평타 확정 적중`,
      damage: damageBand,
      whenUsed: `라인전 상시 (${ccSkill.key} 쿨 ${ccSkill.cooldownMaxRank ?? ccSkill.cooldownEarly ?? "?"}초)`,
      counter: `${ccSkill.key} 예측·회피가 콤보 전체를 무력화하는 열쇠. ${ccSkill.key} 빠지면 ${mainDmg.key}는 단독으론 맞히기 어려움.`,
    });
  }

  // 패턴 2: R 포함 풀콤 (암살 각)
  if (r && (r.roles.includes("primary_damage") || r.roles.includes("execute") || r.roles.includes("engage"))) {
    const setupParts: string[] = [];
    if (e && e.roles.includes("mobility")) setupParts.push(`${e.key}(${e.name}) 진입`);
    if (q && q.roles.includes("primary_damage")) setupParts.push(`${q.key} 적중`);
    const setup = setupParts.length > 0 ? setupParts.join(" → ") : `${q?.key ?? "스킬"} 견제로 체력 깎기`;

    const rPayoff = r.roles.includes("execute")
      ? `${r.key}(${r.name})로 처형 — 저체력이면 즉사`
      : `${r.key}(${r.name})로 풀콤 마무리 — 생존 불가`;

    combos.push({
      name: `6렙 이후 ${r.key} 피니시 콤보`,
      setup,
      payoff: rPayoff,
      damage: burst === "high" ? "저체력 처형 각 · 풀체력 40%+" : "풀콤 25~35%",
      whenUsed: `6렙 이후 (R 쿨 ${r.cooldownMaxRank ?? r.cooldownEarly ?? "?"}초)`,
      counter: `체력 처형 임계치 이상 유지. ${r.key} 사거리 밖에서 시작하는 게 예방. 맞으면 즉시 점멸/존야/QSS.`,
    });
  }

  // 패턴 3: 짧은 쿨 포크 누적
  if (q && q.roles.includes("primary_damage") && q.type === "skillshot" && (q.cooldownMaxRank ?? 10) <= 6) {
    combos.push({
      name: `${q.key} 단타 포크 누적`,
      setup: `${q.key}(${q.name}) 쿨마다 상시 견제`,
      payoff: `한 번은 작지만 3~4회 연속 누적 시 반피`,
      damage: `단발 5~10% · 10분간 누적되면 HP 40%+ 손해`,
      whenUsed: `라인전 상시 (${q.key} 쿨 ${q.cooldownMaxRank ?? q.cooldownEarly}초)`,
      counter: `미니언 뒤 고정 포지션. 한 번 피격되면 포션/체젠으로 즉시 복구. 쿨마다 회피 연습.`,
    });
  }

  return combos.slice(0, 3);
}

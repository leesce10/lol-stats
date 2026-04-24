import type { JungleChampionProfile, PunishTrigger, PunishWindow } from "@/types/matchup-engine";

/**
 * L2 카드 2 — 라인전 약점 타이밍 생성.
 *
 * 유저 피드백 반영: R_used 같은 큰 창보다 **라인전 짧은 쿨 윈도우**가 실전 가치 높음.
 * 프로파일에 선언된 triggers + **라인전 공통 윈도우 자동 보강**으로 최대 4개 표시.
 *
 * 보강 규칙:
 *  - 짧은 쿨(≤8초) Q/W/E 중 라인전 주력 스킬 → 사용 직후 창
 *  - 상대 자원 타입(mana/energy/fury) 고갈 창
 *  - pre-6 약점 창 (R 의존 챔프)
 *  - R이 유일한 트리거면 Q/E 트리거로 보강
 */
export function generatePunishWindows(
  my: JungleChampionProfile,
  enemy: JungleChampionProfile
): PunishWindow[] {
  const enriched = [...enemy.punishTriggers, ...synthesizeLaningWindows(enemy)];

  // 중복 제거 (같은 condition 우선순위: profile 선언본 먼저)
  const seen = new Set<string>();
  const deduped = enriched.filter(t => {
    const key = t.condition;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 정렬: R 윈도우 뒤로, 나머지는 severity
  const triggers = deduped
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 };
      const aR = a.skillKey === "R" ? 1 : 0;
      const bR = b.skillKey === "R" ? 1 : 0;
      if (aR !== bR) return aR - bR;
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 4);

  return triggers.map(trigger => ({
    condition: formatCondition(trigger.condition, enemy),
    windowSec: trigger.windowSec,
    reason: trigger.explanation,
    action: generateAction(my, trigger.severity),
  }));
}

/**
 * 프로파일에 선언된 triggers가 라인전 위주가 아닐 때,
 * keySkills에서 짧은 쿨/주력 딜 스킬을 기반으로 라인전 윈도우를 자동 생성.
 */
function synthesizeLaningWindows(enemy: JungleChampionProfile): PunishTrigger[] {
  const existingConds = new Set(enemy.punishTriggers.map(t => t.condition));
  const existingKeys = new Set(
    enemy.punishTriggers.map(t => t.skillKey).filter(Boolean)
  );
  const synthesized: PunishTrigger[] = [];

  // 1) 짧은 쿨 Q/E 스킬 사용 직후 창 (라인전 실전 타이밍)
  const shortCdLaneSkills = enemy.keySkills
    .filter(s => s.key !== "R")
    .filter(s => {
      const cd = s.cooldownMaxRank ?? s.cooldownEarly ?? 20;
      return cd <= 10;
    })
    .filter(s => !existingKeys.has(s.key))
    .slice(0, 1); // 1개만 보강

  for (const s of shortCdLaneSkills) {
    const cd = s.cooldownMaxRank ?? s.cooldownEarly ?? 10;
    const cond = `${s.key}_used`;
    if (existingConds.has(cond)) continue;
    const isMainDamage = s.roles.includes("primary_damage");
    const isCC = s.roles.includes("cc");
    const descriptor = isCC ? "CC" : isMainDamage ? "주 딜" : "핵심";
    synthesized.push({
      condition: cond,
      skillKey: s.key,
      windowSec: cd,
      severity: cd <= 6 ? "high" : "medium",
      explanation: `${enemy.name} ${descriptor} 스킬 ${s.key}(${s.name}) 사용 직후 ${cd}초. 쿨 돌기 전이 거리 좁히는 트레이드 창.`,
    });
  }

  // 2) R 의존 챔프의 pre-6 창 (이미 가진 경우 스킵)
  if (!existingConds.has("pre_level_6") && enemy.profile.scaling !== "early") {
    synthesized.push({
      condition: "pre_level_6",
      windowSec: 300,
      severity: "high",
      explanation: `6렙 이전 ${enemy.name}은(는) R 없어 풀콤 불가. 초반 6분이 솔킬 확률 가장 높은 시기.`,
    });
  }

  return synthesized;
}

/** condition ID를 읽기 좋은 한국어로 변환 */
function formatCondition(condition: string, enemy: JungleChampionProfile): string {
  // 자원/레벨 기반 특수 윈도우
  if (condition === "no_mana" || condition === "no_mana_resource" || condition === "no_energy_mana" || condition === "no_mana_low_level") {
    return `${enemy.name} 자원 고갈`;
  }
  if (condition === "no_support") {
    return `${enemy.name} 서폿 없음`;
  }
  if (condition === "pre_level_6") {
    return `${enemy.name} 6렙 이전`;
  }
  if (condition === "Q_used_missed") {
    const skill = enemy.keySkills.find(s => s.key === "Q");
    return `${enemy.name} Q(${skill?.name ?? "Q"}) 사용/빗나감 직후`;
  }
  if (condition === "E_used_charging") {
    const skill = enemy.keySkills.find(s => s.key === "E");
    return `${enemy.name} E(${skill?.name ?? "E"}) 차징 중`;
  }
  if (condition === "E_both_used") {
    const skill = enemy.keySkills.find(s => s.key === "E");
    return `${enemy.name} E(${skill?.name ?? "E"}) 2스택 모두 사용`;
  }
  if (condition === "Q_cd") {
    const skill = enemy.keySkills.find(s => s.key === "Q");
    return `${enemy.name} Q(${skill?.name ?? "Q"}) 쿨 중`;
  }
  if (condition === "no_fury" || condition === "no_passive_stack" || condition === "no_doom_stack") {
    return `${enemy.name} 패시브/자원 미구축`;
  }
  if (condition === "mini_form") {
    return `${enemy.name} 미니 폼 상태`;
  }
  if (condition === "form_not_chosen") {
    return `${enemy.name} 변신 전`;
  }
  if (condition === "low_hp_soraka") {
    return `${enemy.name} 저체력`;
  }
  if (condition === "ball_far_away") {
    return `${enemy.name} 공 멀리 있음`;
  }
  if (condition === "no_orb_near") {
    return `${enemy.name} 구체 주변 미구축`;
  }
  if (condition === "ball_position") {
    return `${enemy.name} 공 위치`;
  }
  if (condition === "no_minions_nearby") {
    return `${enemy.name} 주변 미니언 없음`;
  }
  if (condition === "no_possession") {
    return `${enemy.name} 빙의 미사용`;
  }
  if (condition === "not_isolated") {
    return `아군 뭉쳐있음 (고립 해제)`;
  }
  if (condition === "no_style_stack") {
    return `${enemy.name} 스타일 미달`;
  }
  if (condition === "no_strut") {
    return `${enemy.name} 이속 버프 미구축`;
  }
  if (condition === "minigun_mode") {
    return `${enemy.name} 기관총 모드`;
  }
  if (condition === "W_cast_anim") {
    return `${enemy.name} W 차징 중`;
  }
  if (condition === "weak_weapon_pair") {
    return `${enemy.name} 약한 무기 조합`;
  }
  if (condition === "no_mobility_weapon") {
    return `${enemy.name} 이동기 무기 부재`;
  }
  if (condition === "no_style_stack" || condition === "stack_dependent") {
    return `${enemy.name} 스택 부족`;
  }
  if (condition === "R_channeling" || condition === "R_channeling") {
    return `${enemy.name} R 채널링 중`;
  }

  // 일반 패턴
  const skillKey = condition.split("_")[0]; // "Q_missed" → "Q"
  const skill = enemy.keySkills.find(s => s.key === skillKey);
  const skillName = skill ? `${skill.key}(${skill.name})` : condition;

  if (condition.includes("missed")) {
    return `${enemy.name} ${skillName} 빗나간 직후`;
  }
  if (condition.includes("used")) {
    return `${enemy.name} ${skillName} 사용 직후`;
  }
  if (condition.includes("charging")) {
    return `${enemy.name} ${skillName} 차징 중`;
  }
  return `${enemy.name} ${condition}`;
}

/** 본인 챔프 프로파일 기반 권장 행동 */
function generateAction(my: JungleChampionProfile, severity: string): string {
  // 본인 챔프 스킬 중 이동기 찾기
  const dashSkill = my.keySkills.find(
    s => s.type === "dash" && s.roles.includes("mobility")
  );
  // 본인 챔프 궁극기
  const ultSkill = my.keySkills.find(s => s.key === "R");
  // 본인 CC 스킬
  const ccSkill = my.keySkills.find(s => s.roles.includes("cc"));
  // 본인 주력 딜 스킬
  const dmgSkill = my.keySkills.find(s => s.roles.includes("primary_damage"));

  if (severity === "critical") {
    // 최고 기회 — 올인 권장
    const parts: string[] = [];
    if (dashSkill) parts.push(`${dashSkill.key}로 진입`);
    if (ccSkill) parts.push(`${ccSkill.key} 슬로우`);
    if (dmgSkill) parts.push(`${dmgSkill.key} 풀히트`);

    if (parts.length > 0) {
      return `${parts.join(" → ")} 올인`;
    }
    return "즉시 올인. 이 타이밍이 유일한 기회.";
  }

  if (severity === "high") {
    // 높은 기회 — 공격적 진입
    if (dashSkill) {
      return `${dashSkill.key}로 거리 좁히고 짧은 트레이드. 상대 도주력 약화 상태.`;
    }
    return "짧은 트레이드로 체력 우위 확보. 상대 주요 스킬 빠진 상태.";
  }

  // medium — 소극적 활용
  return "견제 or 시야 확보. 완전한 올인보단 유리한 포지션 선점.";
}

/**
 * 챔피언 프로파일 자동 생성기.
 * 핸드크래프트 프로파일이 없는 챔프에 대해 태그(Tank/Fighter/Mage/Assassin/Marksman/Support)
 * 기반 템플릿으로 기본 L0~L4 가이드를 생성한다. 개별 스킬 설명이 없어 L2 "필수 회피/반격 윈도우"
 * 카드는 숨겨지지만 verdict/summary/power-spikes/build/phase-guide는 정상 동작한다.
 */

import type { ChampionProfile, ChampionSkill, Lane, PhaseStrategy, PunishTrigger } from "@/types/matchup-engine";
import type { ChampionMeta } from "@/data/all-champions";

type PrimaryTag = "Tank" | "Fighter" | "Mage" | "Assassin" | "Marksman" | "Support";

function getPrimaryTag(champ: ChampionMeta): PrimaryTag {
  const first = champ.tags[0];
  if (first === "Tank" || first === "Fighter" || first === "Mage" || first === "Assassin" || first === "Marksman" || first === "Support") {
    return first;
  }
  return "Fighter";
}

const TAG_PROFILE: Record<PrimaryTag, ChampionProfile["profile"]> = {
  Tank: {
    clearSpeed: "B", earlyDuel: "B", midDuel: "B", lateDuel: "B", gankPower: "A",
    scaling: "mid", mobility: "low", burst: "low", sustain: "high", ccTypes: ["knockup", "slow"],
  },
  Fighter: {
    clearSpeed: "C", earlyDuel: "A", midDuel: "A", lateDuel: "B", gankPower: "B",
    scaling: "mid", mobility: "medium", burst: "medium", sustain: "medium", ccTypes: ["slow"],
  },
  Mage: {
    clearSpeed: "B", earlyDuel: "B", midDuel: "A", lateDuel: "A", gankPower: "B",
    scaling: "late", mobility: "low", burst: "high", sustain: "low", ccTypes: ["slow"],
  },
  Assassin: {
    clearSpeed: "C", earlyDuel: "B", midDuel: "A", lateDuel: "A", gankPower: "B",
    scaling: "mid", mobility: "high", burst: "high", sustain: "low", ccTypes: [],
  },
  Marksman: {
    clearSpeed: "B", earlyDuel: "C", midDuel: "B", lateDuel: "A", gankPower: "C",
    scaling: "late", mobility: "low", burst: "high", sustain: "low", ccTypes: [],
  },
  Support: {
    clearSpeed: "D", earlyDuel: "B", midDuel: "B", lateDuel: "B", gankPower: "B",
    scaling: "mid", mobility: "medium", burst: "low", sustain: "medium", ccTypes: ["slow"],
  },
};

const TAG_SPIKES: Record<PrimaryTag, number[]> = {
  Tank: [6, 11],
  Fighter: [3, 6, 11],
  Mage: [6, 11, 16],
  Assassin: [6, 11],
  Marksman: [6, 11, 16],
  Support: [3, 6, 11],
};

const LANE_BASE_PHASES: Record<Lane, ChampionProfile["phases"]> = {
  top: {
    early: {
      goal: "CS 안정 + 견제. 웨이브 상태 관리로 유리 각 잡기.",
      danger: "카운터 매치업 시 체력 손해. 아군 정글 부재 시 다이브 위험.",
      opportunity: "레벨 우위 타이밍에 솔킬 시도. 상대 스펠 뺐으면 적극.",
      pathing: "웨이브 프리즈/푸시 결정. 부시 시야 확보 후 CS.",
      objective: "전령 타이밍 맞춰 솔킬. 솔킬 1회 > 오브젝트 참여.",
      gank: "아군 정글 갱 호응. 텔 타이밍 협동.",
    },
    mid: {
      goal: "첫 코어템 완성. 사이드 스플릿 or 한타 합류 선택.",
      danger: "한타 진입 타이밍 실수 시 즉사. 스플릿 시 고립 위험.",
      opportunity: "탑 1차 포탑 파괴. 스플릿으로 맵 인원 차 만들기.",
      pathing: "탑 웨이브 크게 밀고 TP 합류. 드래곤 타이밍 조율.",
      objective: "바론보다 탑 포탑 우선. 드래곤은 TP 합류.",
      gank: "바텀 드래곤 TP 필수. 탑 웨이브 2개 손해 감수.",
    },
    late: {
      goal: "한타 전방 진입 or 반대편 사이드 스플릿.",
      danger: "CC 체인에 취약. 진입 타이밍 실수 치명적.",
      opportunity: "풀빌드 탑라이너 1:1 강함. 스플릿으로 압박.",
      pathing: "사이드 1-3-1 운영. 한타 측면 진입.",
      objective: "바론 싸움 이니시 or 반대 사이드 압박.",
      gank: "팀과 동선 맞춤. 혼자 깊숙이 진입 금지.",
    },
  },
  jungle: {
    early: {
      goal: "풀클 후 갱 시도. 카정/오브젝트 주도권 확보.",
      danger: "카정 당하거나 상대 정글 1:1 취약.",
      opportunity: "아군 라인 우위 활용 갱 성공 → 스노우볼.",
      pathing: "블루/레드 스타트 → 풀클리어. 상대 정글 시야 확보.",
      objective: "첫 드래곤/전령 경쟁. 갱 스노우볼 우선.",
      gank: "3~4렙부터 갱. 아군 CC 있는 라인 우선 방문.",
    },
    mid: {
      goal: "코어템 완성. 오브젝트 주변 시야 장악.",
      danger: "팀파이트 이니시/딜 역할 혼동 시 한타 패배.",
      opportunity: "갱 성공 후 오브젝트 확보. 카정 가능.",
      pathing: "정글 풀클 + 적 정글 카정.",
      objective: "드래곤 시야 먼저. 한타 이니시 준비.",
      gank: "파밍 + 갱 균형. 스노우볼 유지.",
    },
    late: {
      goal: "한타 이니시 or 픽오프로 적 캐리 제거.",
      danger: "CC 체인 맞으면 즉사. 진입 타이밍 중요.",
      opportunity: "풀빌드 후 1:1 강함. 오브젝트 경쟁 우위.",
      pathing: "바론/엘더 시야 확보. 와드 유지.",
      objective: "바론 싸움 선제 이니시 or 스틸 시도.",
      gank: "팀 동선 따라감. 혼자 카정 금지.",
    },
  },
  mid: {
    early: {
      goal: "CS + 견제. 6렙까지 생존 or 솔킬 각 노리기.",
      danger: "사이드 로밍에 취약. 근접 암살자/원거리 포크에 체력 손해.",
      opportunity: "6렙 궁 확보 시 로밍/올인. 플래시 뺀 상대 적극.",
      pathing: "라인 컨트롤. 부시 시야 + 정글 위치 추적.",
      objective: "6렙 R 확보 후 사이드 합류.",
      gank: "아군 정글 갱 호응. R 연계 풀콤.",
    },
    mid: {
      goal: "코어템 완성. 로밍으로 원콜 만들기.",
      danger: "R 쿨 관리. 한타 진입 타이밍 중요.",
      opportunity: "R로 사이드 라이너 픽오프. 바텀 다이브.",
      pathing: "미드 웨이브 밀고 사이드 합류.",
      objective: "드래곤 한타 적극. 미드 타워 압박.",
      gank: "바텀 로밍 우선. 웨이브 안전 시 이동.",
    },
    late: {
      goal: "한타 R 원콜 + 포지션 유지.",
      danger: "앞라인 뚫리면 즉사. 타이밍 실수 치명적.",
      opportunity: "풀빌드 미드 캐리 원콜 기회.",
      pathing: "한타 측면 진입 or 후방 지속딜.",
      objective: "바론 싸움 R 핵심.",
      gank: "혼자 이동 금지. 팀과 동선 맞춤.",
    },
  },
  adc: {
    early: {
      goal: "CS 안정. 서포터와 조율된 트레이드.",
      danger: "이동기 없음. 서폿 이니시/카운터 hook에 취약.",
      opportunity: "킬압 서폿 이니시 호응. 트레이드 각 노리기.",
      pathing: "라인 중앙 포지션. 부시 시야 확보.",
      objective: "첫 드래곤 타이밍 시야 + 위치 잡기.",
      gank: "서폿 hook + 풀콤 연계. 정글 갱 호응.",
    },
    mid: {
      goal: "2코어 완성. 오브젝트 싸움 DPS 역할.",
      danger: "암살자 진입에 원콜 당함. 서폿 없으면 즉사.",
      opportunity: "드래곤 싸움 지속딜 + 오브젝트 스틸 시도.",
      pathing: "드래곤 근처 포지션. 서폿 보호선 안.",
      objective: "드래곤 싸움 적극 참여.",
      gank: "서폿 이니시 + 풀콤. 제어 와드 유지.",
    },
    late: {
      goal: "한타 후방 지속딜. 포지션 유지가 승패 결정.",
      danger: "진입 당하면 즉사. 포지션 실수 치명적.",
      opportunity: "풀빌드 하이퍼캐리. 한타 DPS 최상.",
      pathing: "한타 후방. 벽 옆 포지션.",
      objective: "바론/엘더 DPS 핵심.",
      gank: "혼자 이동 금지. 탱커 뒤 고정.",
    },
  },
  support: {
    early: {
      goal: "시야 + ADC 보호. 라인전 지속.",
      danger: "CC 당해 ADC 노출. 부시 기습 취약.",
      opportunity: "이니시 서폿 2렙 솔킬. 인챈터 지속 교전 우위.",
      pathing: "부시 시야 + 3분 이전 정글 입구 와드.",
      objective: "첫 드래곤 시야 우선.",
      gank: "정글 갱 호응. CC 체인 콤보.",
    },
    mid: {
      goal: "시야 장악. 한타 이니시 or 보호 역할.",
      danger: "혼자 로밍 시 잘림. ADC 시야 밖 이탈 금지.",
      opportunity: "드래곤 싸움 이니시 or 아군 포크 연계. 미드 로밍.",
      pathing: "강 입구 + 드래곤 부시 와드 3개 이상 유지.",
      objective: "드래곤 한타 시야 선점.",
      gank: "미드 로밍 신중. ADC 보호 우선.",
    },
    late: {
      goal: "한타 이니시 or 보호. 시야 끝까지 유지.",
      danger: "진입 당하면 한타 패배 직결.",
      opportunity: "풀빌드 유틸 극대화. 아군 캐리 보호.",
      pathing: "한타 후방 보호 or 전방 이니시 결정.",
      objective: "바론/엘더 시야 + R 활용.",
      gank: "팀과 동선 맞춤.",
    },
  },
};

const TAG_BUILDS: Record<PrimaryTag, ChampionProfile["buildAdaptations"]> = {
  Tank: [
    { condition: "enemy_burst_high_ap", recommendation: "밴시 장막 + 가고일 돌갑옷", reason: "AP 버스트 차단." },
    { condition: "enemy_burst_high_ad", recommendation: "가고일 돌갑옷 + 쇠사슬 조끼", reason: "AD 버스트 방어." },
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수호자", reason: "CC 감소." },
    { condition: "enemy_sustain_high", recommendation: "지크의 융합", reason: "아군 DPS 강화." },
  ],
  Fighter: [
    { condition: "enemy_burst_high", recommendation: "죽음의 무도 + 가고일 돌갑옷", reason: "버스트 분산." },
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수은 장식띠", reason: "CC 감소." },
    { condition: "enemy_tank_heavy", recommendation: "흑요석 절단기 + 몰락한 왕의 검", reason: "방관 + % 뎀." },
    { condition: "enemy_sustain_high", recommendation: "몰락한 왕의 검", reason: "치유 감소." },
  ],
  Mage: [
    { condition: "enemy_burst_high", recommendation: "존야의 모래시계 + 밴시 장막", reason: "무적 + 스펠 방어." },
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수은 장식띠", reason: "CC 감소." },
    { condition: "enemy_tank_heavy", recommendation: "공허의 지팡이 + 라바돈", reason: "% 마관 + AP 극대화." },
    { condition: "enemy_sustain_high", recommendation: "모렐로노미콘", reason: "치유 감소." },
  ],
  Assassin: [
    { condition: "enemy_burst_high", recommendation: "존야의 모래시계 or 수호천사", reason: "진입 후 생존." },
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수은 장식띠", reason: "CC 감소." },
    { condition: "enemy_tank_heavy", recommendation: "흑요석 절단기 + 세릴다 (AD) or 공허의 지팡이 (AP)", reason: "% 뎀 or 마관." },
    { condition: "enemy_sustain_high", recommendation: "몰락한 왕의 검 or 모렐로", reason: "치유 감소." },
  ],
  Marksman: [
    { condition: "enemy_burst_high", recommendation: "수호천사 + 죽음의 무도", reason: "부활 + 버스트 분산." },
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수은 장식띠", reason: "CC 감소." },
    { condition: "enemy_tank_heavy", recommendation: "몰락한 왕의 검 + 독사의 송곳니", reason: "% 뎀 + 치감." },
    { condition: "enemy_sustain_high", recommendation: "몰락한 왕의 검", reason: "치유 감소." },
  ],
  Support: [
    { condition: "enemy_burst_high", recommendation: "수호자 룬 + 수호천사", reason: "팀 보호." },
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수은 장식띠", reason: "CC 감소." },
    { condition: "enemy_tank_heavy", recommendation: "지크의 융합", reason: "아군 AA 강화." },
    { condition: "enemy_poke_heavy", recommendation: "수호자 룬 + 조율", reason: "포크 버티기." },
  ],
};

const TAG_VULN: Record<PrimaryTag, string[]> = {
  Tank: ["kited_by_ranged", "low_damage", "late_scale_weak", "slow_mobility"],
  Fighter: ["kited_by_ranged", "cc_locked", "burst_vulnerable", "item_dependent"],
  Mage: ["no_mobility", "cc_locked", "mana_starved", "melee_assassin"],
  Assassin: ["cc_locked", "no_sustain", "tanky_mid_enemies", "squishy"],
  Marksman: ["no_mobility", "cc_locked", "support_dependent", "early_weak"],
  Support: ["no_mobility", "engage_vulnerable", "low_damage", "vision_dependent"],
};

const TAG_STR: Record<PrimaryTag, string[]> = {
  Tank: ["tanky_frontline", "aoe_cc", "team_engage", "peel_specialist"],
  Fighter: ["sustained_damage", "bruiser_trade", "teamfight_fighter", "dueling_strong"],
  Mage: ["aoe_burst", "long_range_poke", "teamfight_caster", "late_scaling"],
  Assassin: ["high_burst", "pick_off", "roaming_threat", "backline_dive"],
  Marksman: ["sustained_dps", "long_range_aa", "teamfight_carry", "late_hypercarry"],
  Support: ["utility_kit", "peel_ally", "team_sustain", "vision_control"],
};

const DEFAULT_SPELLS: Record<Lane, string> = {
  top: "점멸 + 순간이동",
  jungle: "점멸 + 강타",
  mid: "점멸 + 점화",
  adc: "점멸 + 회복",
  support: "점멸 + 점화",
};

const DEFAULT_RUNES: Record<PrimaryTag, string> = {
  Tank: "여진",
  Fighter: "정복자",
  Mage: "신비로운 유성",
  Assassin: "감전",
  Marksman: "치명적 속도",
  Support: "소환: 아이리",
};

/** 챔프 이름 + 태그 + 라인 기반으로 phase 문구를 살짝 개인화 (챔프명 삽입). */
function personalizePhases(phases: ChampionProfile["phases"], champName: string): ChampionProfile["phases"] {
  const add = (s: PhaseStrategy): PhaseStrategy => ({
    ...s,
    goal: s.goal,
    opportunity: s.opportunity,
  });
  // 현재는 문구 변형 없음 (라인별 기본 가이드 그대로). 추후 챔프명 삽입 포인트 확장 여지.
  return { early: add(phases.early), mid: add(phases.mid), late: add(phases.late) };
}

/**
 * 스킬 타입별 대응 문구 자동 생성.
 * "필수 회피"라는 프레임 대신 **타입에 맞는 실전 대응**을 생성한다:
 * - skillshot → 측면 회피 / 미니언 뒤 (회피 가능)
 * - point_click → 사거리 밖 유지 (회피 불가, 포지션이 유일한 방어)
 * - dash → 지형 활용 + 직후 CC (궤적 차단)
 * - aoe → 즉시 범위 이탈
 * - self_buff → 버프 지속 중 거리 유지, 버프 종료 후 공격
 * - toggle/summon → 상태/소환물 관리
 */
function counterFor(params: {
  type: import("@/types/matchup-engine").SkillType;
  role: "damage" | "cc" | "mobility" | "buff" | "ultimate";
  range?: number;
  cooldown?: number;
  key: string; // "Q"/"W"/"E"/"R"
}): string {
  const { type, role, range, cooldown, key } = params;
  const cdNote = cooldown ? `쿨 ${cooldown}초` : "쿨 관리";

  switch (type) {
    case "skillshot": {
      const rangeNote = range ? `사거리 ${range}` : "중거리";
      const dmgAdvice = role === "cc"
        ? "맞으면 풀콤 성립. 미니언 뒤 숨기 최우선, 여의치 않으면 측면 예측 회피."
        : "쿨마다 견제. 미니언 뒤/측면 회피로 뎀 누적 최소화.";
      return `${rangeNote} 스킬샷. ${dmgAdvice} ${cdNote} 후 재사용 주시.`;
    }
    case "point_click": {
      const rangeNote = range ? `사거리 ${range}` : "근거리";
      return `타겟팅 스킬(조준 회피 불가). ${rangeNote} 밖 유지가 **유일한 예방**. 맞으면 즉시 점멸/존야/QSS 중 하나는 반드시 활용. ${cdNote}까지 거리 강제.`;
    }
    case "dash": {
      const rangeNote = range ? `${range} 거리` : "중거리";
      if (role === "ultimate") {
        return `${rangeNote} 돌진 궁 (타겟팅성). 회피 불가이므로 **사거리 밖 포지션이 핵심**. 돌진 직후 경직 타이밍에 CC 또는 존야로 버스트 차단. ${cdNote}.`;
      }
      return `${rangeNote} 돌진. 벽/지형 근처 포지션으로 각 차단. 대시 직후 짧은 취약 창에 CC. 사용 후 ${cdNote} 동안 이동기 제로.`;
    }
    case "aoe": {
      const rangeNote = range ? `범위 ${range}` : "광역";
      return `${rangeNote} 공격. 지연 발동 있으면 즉시 범위 이탈. 뭉쳐 있으면 다중 적중 — 분산 포지션 유지.`;
    }
    case "self_buff": {
      if (role === "ultimate") {
        return `상대 자가 강화 궁. 발동 순간 뎀/탱킹 급증. 지속 시간(보통 5~8초) 동안 **거리 유지 + 교전 회피**, 끝나면 쿨 긴 동안 올인.`;
      }
      return `자가 버프. 발동 중 뎀/체젠 급증. 교전 시작 전이면 소진 유도 후 공격. ${cdNote}.`;
    }
    case "toggle":
      return `스탠스 토글. 켜진 상태에서 상성 변화. 끄는 타이밍(보통 기력/마나 고갈) 주시.`;
    case "summon":
      return `소환물 생성. 소환물 먼저 제거 or 범위 밖 이동. 소환물 있는 동안 ${cdNote}.`;
  }
}

/** 태그별 4스킬 템플릿. 실전 대응 중심. */
function tagKeySkills(tag: PrimaryTag, champName: string): ChampionSkill[] {
  const n = champName;
  switch (tag) {
    case "Tank":
      return [
        { key: "Q", name: `${n} 근접 CC`, type: "point_click", roles: ["cc"], missPenalty: "high",
          hitEnables: ["stun_or_slow"],
          counterMethod: counterFor({ type: "point_click", role: "cc", range: 300, cooldown: 7, key: "Q" }),
          range: 300, cooldownEarly: 10, cooldownMaxRank: 7 },
        { key: "W", name: `${n} 방어 버프`, type: "self_buff", roles: ["defense"], missPenalty: "none",
          hitEnables: ["shield_or_tenacity"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 9, key: "W" }),
          cooldownEarly: 14, cooldownMaxRank: 9 },
        { key: "E", name: `${n} 돌진 이니시`, type: "dash", roles: ["engage", "cc"], missPenalty: "high",
          hitEnables: ["gap_close", "knockup"],
          counterMethod: counterFor({ type: "dash", role: "mobility", range: 700, cooldown: 10, key: "E" }),
          range: 700, cooldownEarly: 16, cooldownMaxRank: 10 },
        { key: "R", name: `${n} 광역 CC 궁`, type: "aoe", roles: ["engage", "cc"], missPenalty: "high",
          hitEnables: ["aoe_cc"],
          counterMethod: counterFor({ type: "aoe", role: "ultimate", range: 600, cooldown: 80, key: "R" }),
          range: 600, cooldownEarly: 120, cooldownMaxRank: 80 },
      ];
    case "Fighter":
      return [
        { key: "Q", name: `${n} 주 딜`, type: "skillshot", roles: ["primary_damage"], missPenalty: "medium",
          hitEnables: ["core_damage"],
          counterMethod: counterFor({ type: "skillshot", role: "damage", range: 500, cooldown: 5, key: "Q" }),
          range: 500, cooldownEarly: 8, cooldownMaxRank: 5 },
        { key: "W", name: `${n} 지속 버프`, type: "self_buff", roles: ["defense"], missPenalty: "none",
          hitEnables: ["heal_or_empower"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 8, key: "W" }),
          cooldownEarly: 12, cooldownMaxRank: 8 },
        { key: "E", name: `${n} 이동기`, type: "dash", roles: ["mobility", "cc"], missPenalty: "high",
          hitEnables: ["gap_close", "cc_combo"],
          counterMethod: counterFor({ type: "dash", role: "mobility", range: 500, cooldown: 10, key: "E" }),
          range: 500, cooldownEarly: 18, cooldownMaxRank: 10 },
        { key: "R", name: `${n} 강화 궁`, type: "self_buff", roles: ["primary_damage", "defense"], missPenalty: "none",
          hitEnables: ["burst_window"],
          counterMethod: counterFor({ type: "self_buff", role: "ultimate", cooldown: 60, key: "R" }),
          cooldownEarly: 100, cooldownMaxRank: 60 },
      ];
    case "Mage":
      return [
        { key: "Q", name: `${n} 원거리 포크`, type: "skillshot", roles: ["primary_damage"], missPenalty: "high",
          hitEnables: ["long_range_poke"],
          counterMethod: counterFor({ type: "skillshot", role: "damage", range: 900, cooldown: 5, key: "Q" }),
          range: 900, cooldownEarly: 7, cooldownMaxRank: 5 },
        { key: "W", name: `${n} CC`, type: "skillshot", roles: ["cc"], missPenalty: "high",
          hitEnables: ["slow_or_stun"],
          counterMethod: counterFor({ type: "skillshot", role: "cc", range: 700, cooldown: 9, key: "W" }),
          range: 700, cooldownEarly: 14, cooldownMaxRank: 9 },
        { key: "E", name: `${n} 유틸/방어`, type: "self_buff", roles: ["defense", "utility"], missPenalty: "none",
          hitEnables: ["shield_or_blink"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 10, key: "E" }),
          cooldownEarly: 18, cooldownMaxRank: 10 },
        { key: "R", name: `${n} 버스트 궁`, type: "aoe", roles: ["primary_damage"], missPenalty: "high",
          hitEnables: ["aoe_burst"],
          counterMethod: counterFor({ type: "aoe", role: "ultimate", range: 700, cooldown: 80, key: "R" }),
          range: 700, cooldownEarly: 120, cooldownMaxRank: 80 },
      ];
    case "Assassin":
      return [
        { key: "Q", name: `${n} 주 버스트`, type: "skillshot", roles: ["primary_damage"], missPenalty: "medium",
          hitEnables: ["burst_damage"],
          counterMethod: counterFor({ type: "skillshot", role: "damage", range: 600, cooldown: 4, key: "Q" }),
          range: 600, cooldownEarly: 7, cooldownMaxRank: 4 },
        { key: "W", name: `${n} 유틸/표식`, type: "self_buff", roles: ["utility"], missPenalty: "none",
          hitEnables: ["mark_or_empower"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 8, key: "W" }),
          cooldownEarly: 12, cooldownMaxRank: 8 },
        { key: "E", name: `${n} 장거리 이동기`, type: "dash", roles: ["mobility"], missPenalty: "low",
          hitEnables: ["gap_close", "escape"],
          counterMethod: counterFor({ type: "dash", role: "mobility", range: 700, cooldown: 12, key: "E" }),
          range: 700, cooldownEarly: 18, cooldownMaxRank: 12 },
        { key: "R", name: `${n} 타겟팅 처형 궁`, type: "dash", roles: ["execute"], missPenalty: "high",
          hitEnables: ["execute_or_reset"],
          counterMethod: counterFor({ type: "dash", role: "ultimate", range: 650, cooldown: 70, key: "R" }),
          range: 650, cooldownEarly: 100, cooldownMaxRank: 70 },
      ];
    case "Marksman":
      return [
        { key: "Q", name: `${n} 견제기`, type: "skillshot", roles: ["primary_damage"], missPenalty: "medium",
          hitEnables: ["aa_empower_or_poke"],
          counterMethod: counterFor({ type: "skillshot", role: "damage", range: 900, cooldown: 5, key: "Q" }),
          range: 900, cooldownEarly: 8, cooldownMaxRank: 5 },
        { key: "W", name: `${n} 온히트/유틸`, type: "self_buff", roles: ["primary_damage"], missPenalty: "none",
          hitEnables: ["true_damage_or_vision"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 6, key: "W" }),
          cooldownEarly: 10, cooldownMaxRank: 6 },
        { key: "E", name: `${n} 이탈기/덫`, type: "dash", roles: ["mobility"], missPenalty: "medium",
          hitEnables: ["escape", "trap"],
          counterMethod: counterFor({ type: "dash", role: "mobility", range: 450, cooldown: 10, key: "E" }),
          range: 450, cooldownEarly: 18, cooldownMaxRank: 10 },
        { key: "R", name: `${n} 피니시 궁`, type: "skillshot", roles: ["execute", "primary_damage"], missPenalty: "high",
          hitEnables: ["long_range_finish"],
          counterMethod: counterFor({ type: "skillshot", role: "ultimate", range: 1500, cooldown: 70, key: "R" }),
          range: 1500, cooldownEarly: 100, cooldownMaxRank: 70 },
      ];
    case "Support":
      return [
        { key: "Q", name: `${n} 포크/CC`, type: "skillshot", roles: ["cc"], missPenalty: "high",
          hitEnables: ["hook_or_damage"],
          counterMethod: counterFor({ type: "skillshot", role: "cc", range: 950, cooldown: 8, key: "Q" }),
          range: 950, cooldownEarly: 12, cooldownMaxRank: 8 },
        { key: "W", name: `${n} 쉴드/체젠`, type: "self_buff", roles: ["defense", "utility"], missPenalty: "none",
          hitEnables: ["shield_ally", "heal"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 6, key: "W" }),
          cooldownEarly: 12, cooldownMaxRank: 6 },
        { key: "E", name: `${n} 유틸`, type: "self_buff", roles: ["utility"], missPenalty: "low",
          hitEnables: ["ms_or_cc"],
          counterMethod: counterFor({ type: "self_buff", role: "buff", cooldown: 10, key: "E" }),
          cooldownEarly: 14, cooldownMaxRank: 10 },
        { key: "R", name: `${n} 팀 궁`, type: "aoe", roles: ["cc", "defense"], missPenalty: "high",
          hitEnables: ["team_buff_or_aoe_cc"],
          counterMethod: counterFor({ type: "aoe", role: "ultimate", range: 800, cooldown: 80, key: "R" }),
          range: 800, cooldownEarly: 140, cooldownMaxRank: 80 },
      ];
  }
}

/**
 * 라인 인식 반격 윈도우 템플릿.
 *
 * 유저 피드백: "R 빠진 후 80초" 같은 큰 창보다 **라인전 짧은 쿨** 윈도우가 더 실전적.
 * 그래서 Q/E 같은 짧은 쿨 스킬 사용 직후 + 자원(마나/기력) 고갈 창을 앞세우고,
 * R 윈도우는 참고용으로 뒤에 배치.
 *
 * 라인 컨텍스트:
 *  - adc 라인: 서폿 의존 윈도우 적용 가능
 *  - top/jungle/mid/support: 서폿 윈도우 대신 마나/레벨 기반 윈도우
 */
function tagPunishTriggers(tag: PrimaryTag, lane: Lane, champName: string): PunishTrigger[] {
  const n = champName;

  switch (tag) {
    case "Tank":
      return [
        { condition: "E_used", skillKey: "E", windowSec: 10, severity: "critical",
          explanation: `${n} 주 이니시 E 빠진 직후 10초. 이동기/CC 사용 불가 — 거리 유지만 해도 위협도 제로, 트레이드 우위.` },
        { condition: "Q_missed", skillKey: "Q", windowSec: 6, severity: "high",
          explanation: `${n} Q(CC) 빗나가면 6초간 붙잡을 수단 없음. 이 창에 포크 or 라인 푸시.` },
        { condition: "no_mana_resource", windowSec: 20, severity: "medium",
          explanation: `${n} 마나 40% 이하면 스킬 연발 불가. 파밍 약해지므로 웨이브 밀어 다이브 or 로밍.` },
        { condition: "R_used", skillKey: "R", windowSec: 80, severity: "medium",
          explanation: `R 한타 기여 기대치 급감 — 오브젝트 타이밍 활용.` },
      ];
    case "Fighter":
      return [
        { condition: "E_used", skillKey: "E", windowSec: 10, severity: "critical",
          explanation: `${n} 이동기 E 빠진 직후 10초. 추격/이탈 불가 — 카이팅 or 역공 타이밍.` },
        { condition: "Q_used", skillKey: "Q", windowSec: 5, severity: "high",
          explanation: `${n} 주 딜 Q 사용 직후 5초. 쿨 돌기 전이 트레이드 창.` },
        { condition: "pre_level_6", windowSec: 300, severity: "high",
          explanation: `6렙 이전 ${n} 파이터는 R 강화 없어 1:1 약함. 솔킬/견제 적극.` },
        { condition: "R_used", skillKey: "R", windowSec: 60, severity: "medium",
          explanation: `R 강화 버프 끝난 뒤 60초는 평범한 근접 — 카이팅 교전 유도.` },
      ];
    case "Mage":
      return [
        { condition: "Q_used_missed", skillKey: "Q", windowSec: 5, severity: "critical",
          explanation: `${n} 주 포크 Q 쿨 돌기 전 5초. 메이지의 유일한 견제 수단 → 이 창에 거리 좁혀 트레이드.` },
        { condition: "no_mana", windowSec: 15, severity: "critical",
          explanation: `${n} 마나 30% 이하면 스킬 1~2개만 사용 가능. 포크 불가 상태 — 적극 올인.` },
        { condition: "E_used", skillKey: "E", windowSec: 10, severity: "high",
          explanation: `${n} 방어/블링크 E 빠진 직후 10초. 암살/근접 올인 최적 창.` },
        { condition: "R_used", skillKey: "R", windowSec: 80, severity: "medium",
          explanation: `버스트 궁 쿨 중 80초 — 메이지 한타 위협도 급감. 오브젝트 타이밍.` },
      ];
    case "Assassin":
      return [
        { condition: "E_used", skillKey: "E", windowSec: 12, severity: "critical",
          explanation: `${n} 이동기 E 빠진 직후 12초. 진입/이탈 수단 제로 — CC 걸고 올인 확정.` },
        { condition: "Q_cd", skillKey: "Q", windowSec: 4, severity: "high",
          explanation: `${n} 주 버스트 Q 쿨 중 4초. 버스트 반감 — 트레이드 창.` },
        { condition: "no_energy_mana", windowSec: 10, severity: "high",
          explanation: `${n} 자원(기력/마나) 고갈 = 풀콤 불가. 10초간 올인 대응 가능.` },
        { condition: "R_used", skillKey: "R", windowSec: 70, severity: "medium",
          explanation: `처형/진입 R 쿨 중. 한타 시작 타이밍 양보 가능.` },
      ];
    case "Marksman":
      // adc 라인은 서폿 의존 윈도우 적용, 미드/탑 마크스맨(코르키·애쉬 등)은 별도
      if (lane === "adc") {
        return [
          { condition: "E_used", skillKey: "E", windowSec: 10, severity: "critical",
            explanation: `${n} 이탈/회피 E 빠진 직후 10초. 이동기 제로 — 서폿 이니시 + 풀콤.` },
          { condition: "Q_used", skillKey: "Q", windowSec: 5, severity: "high",
            explanation: `${n} 주 포크 Q 사용 직후. 쿨 돌기 전 5초가 거리 좁히는 창.` },
          { condition: "no_support", windowSec: 15, severity: "high",
            explanation: `${n} 서폿 사이드 로밍/귀환 시 1:1 약함. 미니맵에서 상대 서폿 위치 확인.` },
          { condition: "R_used", skillKey: "R", windowSec: 80, severity: "medium",
            explanation: `ADC R 피니시 빠짐. 한타 지속딜만 남은 상태.` },
        ];
      }
      // 미드/탑 마크스맨 (코르키·애쉬-지원·아크샨 등): 서폿 의존 없음
      return [
        { condition: "E_used", skillKey: "E", windowSec: 10, severity: "critical",
          explanation: `${n} 이동기 E 빠진 직후 10초. 솔로라인에서 도주 수단 제로 — 암살 올인 최적.` },
        { condition: "Q_used", skillKey: "Q", windowSec: 5, severity: "high",
          explanation: `${n} 주 포크 Q 사용 직후 5초. 쿨 돌기 전이 거리 좁히는 창.` },
        { condition: "no_mana", windowSec: 12, severity: "high",
          explanation: `${n} 마나 30% 이하면 포크/스킬 연발 불가. 이 창에 웨이브 푸시 + 올인.` },
        { condition: "R_used", skillKey: "R", windowSec: 80, severity: "medium",
          explanation: `장거리 피니시 R 빠짐. 로밍 영향력 감소.` },
      ];
    case "Support":
      return [
        { condition: "Q_missed", skillKey: "Q", windowSec: 8, severity: "critical",
          explanation: `${n} 주 hook/CC Q 빗나간 직후 8초. 이니시 수단 제로 — 이 창에 공격적 트레이드.` },
        { condition: "E_used", skillKey: "E", windowSec: 12, severity: "high",
          explanation: `${n} E(이동/추가 CC) 빠진 직후 12초. 풀콤 연결 불가.` },
        { condition: "no_mana_low_level", windowSec: 15, severity: "high",
          explanation: `${n} 마나 부족 + 6렙 이하면 스킬 연발 불가. ADC 보호력 약화 상태.` },
        { condition: "R_used", skillKey: "R", windowSec: 80, severity: "medium",
          explanation: `팀 궁 쿨 중. 한타 기여도 반감.` },
      ];
  }
}

/** 챔피언 메타 + 라인으로 기본 프로파일 생성. */
export function generateProfile(champ: ChampionMeta, lane: Lane): ChampionProfile {
  const tag = getPrimaryTag(champ);
  return {
    id: champ.id,
    name: champ.nameKr,
    nameEn: champ.id,
    position: lane,
    patch: "15.7",
    profile: { ...TAG_PROFILE[tag] },
    powerSpikes: [...TAG_SPIKES[tag]],
    keySkills: tagKeySkills(tag, champ.nameKr),
    punishTriggers: tagPunishTriggers(tag, lane, champ.nameKr),
    phases: personalizePhases(LANE_BASE_PHASES[lane], champ.nameKr),
    defaultSpells: DEFAULT_SPELLS[lane],
    defaultRunes: DEFAULT_RUNES[tag],
    buildAdaptations: [...TAG_BUILDS[tag]],
    vulnerabilities: [...TAG_VULN[tag]],
    keyStrengths: [...TAG_STR[tag]],
  };
}

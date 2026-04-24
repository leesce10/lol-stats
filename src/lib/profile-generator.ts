/**
 * 챔피언 프로파일 자동 생성기.
 * 핸드크래프트 프로파일이 없는 챔프에 대해 태그(Tank/Fighter/Mage/Assassin/Marksman/Support)
 * 기반 템플릿으로 기본 L0~L4 가이드를 생성한다. 개별 스킬 설명이 없어 L2 "필수 회피/반격 윈도우"
 * 카드는 숨겨지지만 verdict/summary/power-spikes/build/phase-guide는 정상 동작한다.
 */

import type { ChampionProfile, Lane, PhaseStrategy } from "@/types/matchup-engine";
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
    { condition: "enemy_cc_hard", recommendation: "머큐리 부츠 + 수호의 역류", reason: "CC 감소." },
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
    { condition: "enemy_poke_heavy", recommendation: "수호자 룬 + 에테르 환상", reason: "포크 버티기." },
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
  Mage: "신비로운 보석",
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
    keySkills: [],
    punishTriggers: [],
    phases: personalizePhases(LANE_BASE_PHASES[lane], champ.nameKr),
    defaultSpells: DEFAULT_SPELLS[lane],
    defaultRunes: DEFAULT_RUNES[tag],
    buildAdaptations: [...TAG_BUILDS[tag]],
    vulnerabilities: [...TAG_VULN[tag]],
    keyStrengths: [...TAG_STR[tag]],
  };
}

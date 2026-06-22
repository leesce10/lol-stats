// cc-skills.ts — 듀오 콤보 경고용 "개시 CC 스킬" 큐레이션.
// 리치 프로파일(champion-profiles)이 없는 챔프도 콤보를 짚어주기 위해 핵심 CC만 수기 정리.
// dodgeable=true → 스킬샷(피할 수 있음 "꼭 피하세요"), false → 논타겟/덫(거리 유지).

export interface CcSkill {
  key: string; // Q/W/E/R
  name: string; // 한국어 스킬명
  cc: string; // 한국어 CC 종류
  dodgeable: boolean; // 스킬샷이라 피할 수 있나
  trap?: boolean; // 덫류(밟지 않기)
}

export const CC_SKILLS: Record<string, CcSkill> = {
  // --- 서포터 (개시 CC) ---
  Lux: { key: "Q", name: "빛의 속박", cc: "속박", dodgeable: true },
  Morgana: { key: "Q", name: "속박의 어둠", cc: "속박", dodgeable: true },
  Thresh: { key: "Q", name: "사형 선고", cc: "끌어당김", dodgeable: true },
  Blitzcrank: { key: "Q", name: "로켓 손", cc: "끌어당김", dodgeable: true },
  Nautilus: { key: "Q", name: "닻줄 사격", cc: "속박", dodgeable: true },
  Pyke: { key: "Q", name: "바다의 가호", cc: "기절", dodgeable: true },
  Nami: { key: "Q", name: "거품 감옥", cc: "기절", dodgeable: true },
  Bard: { key: "Q", name: "우주의 속박", cc: "기절", dodgeable: true },
  Zyra: { key: "E", name: "휘감는 뿌리", cc: "속박", dodgeable: true },
  Janna: { key: "Q", name: "폭풍 소환", cc: "에어본", dodgeable: true },
  Rakan: { key: "W", name: "화려한 등장", cc: "에어본", dodgeable: true },
  Leona: { key: "E", name: "천상의 검", cc: "기절", dodgeable: true },
  Sona: { key: "R", name: "크레센도", cc: "기절", dodgeable: true },
  Lulu: { key: "W", name: "변이", cc: "변이", dodgeable: false },
  Senna: { key: "Q", name: "단죄", cc: "속박", dodgeable: true },
  Karma: { key: "Q", name: "내면의 불꽃", cc: "둔화", dodgeable: true },
  // --- 원딜/미드 등 (연계/펀처가 될 핵심 CC) ---
  Ashe: { key: "R", name: "마법의 수정 화살", cc: "기절", dodgeable: true },
  Varus: { key: "R", name: "부패의 사슬", cc: "속박", dodgeable: true },
  Jhin: { key: "W", name: "치명적인 우아함", cc: "속박", dodgeable: true },
  Caitlyn: { key: "W", name: "요들 덫", cc: "속박", dodgeable: false, trap: true },
};

export function getCcSkill(key?: string | null): CcSkill | null {
  if (!key) return null;
  const c = CC_SKILLS[key];
  return c && c.name ? c : null;
}

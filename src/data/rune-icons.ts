/**
 * 룬 이미지 URL 맵 (Community Dragon CDN)
 * 한국어 룬 이름 → 이미지 URL
 * 모든 URL은 2026-04 기준 200 OK 확인됨
 */

const P = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles";

// 룬 카테고리 (스타일) 아이콘
export const RUNE_STYLE_ICONS: Record<string, string> = {
  "정밀": `${P}/7201_precision.png`,
  "지배": `${P}/7200_domination.png`,
  "마법": `${P}/7202_sorcery.png`,
  "결의": `${P}/7204_resolve.png`,
  "영감": `${P}/7203_whimsy.png`,
};

// 개별 룬 아이콘
export const RUNE_ICONS: Record<string, string> = {
  // === 정밀 ===
  "집중 공격": `${P}/precision/presstheattack/presstheattack.png`,
  "치명적 속도": `${P}/precision/lethaltempo/lethaltempotemp.png`,
  "기민한 발놀림": `${P}/precision/fleetfootwork/fleetfootwork.png`,
  "정복자": `${P}/precision/conqueror/conqueror.png`,
  "과다치유": `${P}/precision/absorblife/absorblife.png`,
  "침착": `${P}/precision/presenceofmind/presenceofmind.png`,
  "전설: 민첩함": `${P}/precision/legendalacrity/legendalacrity.png`,
  "전설: 강인함": `${P}/precision/legendhaste/legendhaste.png`,
  "전설: 핏빛": `${P}/precision/legendbloodline/legendbloodline.png`,
  "최후의 일격": `${P}/precision/coupdegrace/coupdegrace.png`,
  "한 방 노리개": `${P}/precision/cutdown/cutdown.png`,
  "최후의 저항": `${P}/precision/laststand/laststand.png`,

  // === 지배 ===
  "감전": `${P}/domination/electrocute/electrocute.png`,
  "포식자": `${P}/domination/predator/predator.png`,
  "어둠의 수확": `${P}/domination/darkharvest/darkharvest.png`,
  "칼날비": `${P}/domination/hailofblades/hailofblades.png`,
  "값싼 마술": `${P}/domination/cheapshot/cheapshot.png`,
  "피의 맛": `${P}/domination/tasteofblood/greenterror_tasteofblood.png`,
  "돌발 일격": `${P}/domination/suddenimpact/suddenimpact.png`,
  "좀비 와드": `${P}/domination/zombieward/zombieward.png`,
  "유령 포로": `${P}/domination/ghostporo/ghostporo.png`,
  "사냥의 증표": `${P}/domination/eyeballcollection/eyeballcollection.png`,
  "보물 사냥꾼": `${P}/domination/treasurehunter/treasurehunter.png`,
  "영리한 사냥꾼": `${P}/domination/ingenioushunter/ingenioushunter.png`,
  "가차 없는 사냥꾼": `${P}/domination/relentlesshunter/relentlesshunter.png`,
  "궁극의 사냥꾼": `${P}/domination/ultimatehunter/ultimatehunter.png`,

  // === 마법 ===
  "콩콩이 소환": `${P}/sorcery/summonaery/summonaery.png`,
  "신비로운 유성": `${P}/sorcery/arcanecomet/arcanecomet.png`,
  "난입": `${P}/sorcery/phaserush/phaserush.png`,
  "무효화 구체": `${P}/sorcery/nullifyingorb/pokeshield.png`,
  "마나순환 팔찌": `${P}/sorcery/manaflowband/manaflowband.png`,
  "빛의 망토": `${P}/sorcery/nimbuscloak/6401_nimbuscloak.png`,
  "초월": `${P}/sorcery/transcendence/transcendence.png`,
  "신속함": `${P}/sorcery/celerity/celeritytemp.png`,
  "절대 집중": `${P}/sorcery/absolutefocus/absolutefocus.png`,
  "주문 작열": `${P}/sorcery/scorch/scorch.png`,
  "난기류": `${P}/sorcery/waterwalking/waterwalking.png`,
  "폭풍 모으기": `${P}/sorcery/gatheringstorm/gatheringstorm.png`,

  // === 결의 ===
  "착취의 손아귀": `${P}/resolve/graspoftheundying/graspoftheundying.png`,
  "여진": `${P}/resolve/veteranaftershock/veteranaftershock.png`,
  "수호자": `${P}/resolve/guardian/guardian.png`,
  "철거": `${P}/resolve/demolish/demolish.png`,
  "생명의 샘": `${P}/resolve/fontoflife/fontoflife.png`,
  "보호막 강타": `${P}/resolve/mirrorshell/mirrorshell.png`,
  "컨디셔닝": `${P}/resolve/conditioning/conditioning.png`,
  "재생의 바람": `${P}/resolve/secondwind/secondwind.png`,
  "뼈 방패": `${P}/resolve/boneplating/boneplating.png`,
  "과잉 성장": `${P}/resolve/overgrowth/overgrowth.png`,
  "활기": `${P}/resolve/revitalize/revitalize.png`,
  "불굴의 의지": `${P}/resolve/unflinching/unflinching.png`,

  // === 영감 ===
  "빙결 강화": `${P}/inspiration/glacialaugment/glacialaugment.png`,
  "봉인 해제": `${P}/inspiration/unsealedspellbook/unsealedspellbook.png`,
  "선행": `${P}/inspiration/firststrike/firststrike.png`,
  "육각 플래시": `${P}/inspiration/hextechflashtraption/hextechflashtraption.png`,
  "마법의 신발": `${P}/inspiration/magicalfootwear/magicalfootwear.png`,
  "완벽한 타이밍": `${P}/inspiration/perfecttiming/perfecttiming.png`,
  "미래의 시장": `${P}/inspiration/kleptomancy/kleptomancy.png`,
  "쿠키 배달": `${P}/inspiration/biscuitdelivery/biscuitdelivery.png`,
  "물약 변환기": `${P}/inspiration/timewarptonic/timewarptonic.png`,
  "우주적 통찰력": `${P}/inspiration/cosmicinsight/cosmicinsight.png`,
  "질풍 접근": `${P}/inspiration/approachvelocity/approachvelocity.png`,
  "잭 오브 올 트레이드": `${P}/inspiration/jackofalltrades/jackofalltrades.png`,
};

// === 룬 트리 전체 구조 ===

export interface RuneTree {
  name: string;
  rows: string[][];
}

export const RUNE_TREES: Record<string, RuneTree> = {
  "정밀": {
    name: "정밀",
    rows: [
      ["집중 공격", "치명적 속도", "기민한 발놀림", "정복자"],
      ["과다치유", "침착"],
      ["전설: 민첩함", "전설: 강인함", "전설: 핏빛"],
      ["최후의 일격", "한 방 노리개", "최후의 저항"],
    ],
  },
  "지배": {
    name: "지배",
    rows: [
      ["감전", "포식자", "어둠의 수확", "칼날비"],
      ["값싼 마술", "피의 맛", "돌발 일격"],
      ["좀비 와드", "유령 포로", "사냥의 증표"],
      ["보물 사냥꾼", "영리한 사냥꾼", "가차 없는 사냥꾼", "궁극의 사냥꾼"],
    ],
  },
  "마법": {
    name: "마법",
    rows: [
      ["콩콩이 소환", "신비로운 유성", "난입"],
      ["무효화 구체", "마나순환 팔찌", "빛의 망토"],
      ["초월", "신속함", "절대 집중"],
      ["주문 작열", "난기류", "폭풍 모으기"],
    ],
  },
  "결의": {
    name: "결의",
    rows: [
      ["착취의 손아귀", "여진", "수호자"],
      ["철거", "생명의 샘", "보호막 강타"],
      ["컨디셔닝", "재생의 바람", "뼈 방패"],
      ["과잉 성장", "활기", "불굴의 의지"],
    ],
  },
  "영감": {
    name: "영감",
    rows: [
      ["빙결 강화", "봉인 해제", "선행"],
      ["육각 플래시", "마법의 신발", "완벽한 타이밍"],
      ["미래의 시장", "쿠키 배달", "물약 변환기"],  // 물약변환기 = timewarptonic
      ["우주적 통찰력", "질풍 접근", "잭 오브 올 트레이드"],
    ],
  },
};

// === 유틸 ===

export function parseRuneString(str: string): { style: string; runes: string[] } {
  const [stylePart, runePart] = str.split(" - ");
  const style = stylePart?.trim() ?? "";
  const runes = runePart?.split("/").map(r => r.trim()).filter(Boolean) ?? [];
  return { style, runes };
}

export function getRuneIconUrl(name: string): string | null {
  return RUNE_ICONS[name] ?? null;
}

export function getRuneStyleIconUrl(style: string): string | null {
  return RUNE_STYLE_ICONS[style] ?? null;
}

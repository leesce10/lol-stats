/**
 * 룬 이미지 URL 맵 (Community Dragon CDN)
 * 한국어 룬 이름 → 이미지 URL
 */

const CDN = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";

// 룬 카테고리 (스타일)
export const RUNE_STYLE_ICONS: Record<string, string> = {
  "정밀": `${CDN}/perk-images/styles/7201_precision.png`,
  "지배": `${CDN}/perk-images/styles/7200_domination.png`,
  "마법": `${CDN}/perk-images/styles/7202_sorcery.png`,
  "결의": `${CDN}/perk-images/styles/7204_resolve.png`,
  "영감": `${CDN}/perk-images/styles/7203_whimsy.png`,
};

// 키스톤 + 하위 룬
export const RUNE_ICONS: Record<string, string> = {
  // === 정밀 ===
  "집중 공격": `${CDN}/perk-images/styles/precision/presstheattack/presstheattack.png`,
  "치명적 속도": `${CDN}/perk-images/styles/precision/lethaltempotemp/lethaltempotemp.png`,
  "기민한 발놀림": `${CDN}/perk-images/styles/precision/fleetfootwork/fleetfootwork.png`,
  "정복자": `${CDN}/perk-images/styles/precision/conqueror/conqueror.png`,
  "과다치유": `${CDN}/perk-images/styles/precision/overheal.png`,
  "침착": `${CDN}/perk-images/styles/precision/presenceofmind/presenceofmind.png`,
  "피의 환희": `${CDN}/perk-images/styles/precision/bloodlinelifesteal/bloodlinelifesteal.png`, // legacy
  "전설: 핏빛": `${CDN}/perk-images/styles/precision/legendbloodline/legendbloodline.png`,
  "전설: 민첩함": `${CDN}/perk-images/styles/precision/legendalacrity/legendalacrity.png`,
  "전설: 강인함": `${CDN}/perk-images/styles/precision/legendtenacity/legendtenacity.png`,
  "최후의 일격": `${CDN}/perk-images/styles/precision/coupdegrace/coupdegrace.png`,
  "체력 회복": `${CDN}/perk-images/styles/precision/laststand/laststand.png`,
  "최후의 저항": `${CDN}/perk-images/styles/precision/laststand/laststand.png`,
  "한 방 노리개": `${CDN}/perk-images/styles/precision/cutdown/cutdown.png`,

  // === 지배 ===
  "감전": `${CDN}/perk-images/styles/domination/electrocute/electrocute.png`,
  "포식자": `${CDN}/perk-images/styles/domination/predator/predator.png`,
  "어둠의 수확": `${CDN}/perk-images/styles/domination/darkharvest/darkharvest.png`,
  "칼날비": `${CDN}/perk-images/styles/domination/hailofblades/hailofblades.png`,
  "피의 맛": `${CDN}/perk-images/styles/domination/tasteofblood/greentertasteofblood.png`,
  "값싼 마술": `${CDN}/perk-images/styles/domination/cheapshot/cheapshot.png`,
  "돌발 일격": `${CDN}/perk-images/styles/domination/suddenimpact/suddenimpact.png`,
  "좀비 와드": `${CDN}/perk-images/styles/domination/zombieward/zombieward.png`,
  "유령 포로": `${CDN}/perk-images/styles/domination/ghostporo/ghostporo.png`,
  "사냥의 증표": `${CDN}/perk-images/styles/domination/eyeballcollection/eyeballcollection.png`,
  "영리한 사냥꾼": `${CDN}/perk-images/styles/domination/ingenioushunter/ingenioushunter.png`,
  "굶주린 사냥꾼": `${CDN}/perk-images/styles/domination/ravnoushunter/ravnoushunter.png`,
  "가차 없는 사냥꾼": `${CDN}/perk-images/styles/domination/relentlesshunter/relentlesshunter.png`,
  "궁극의 사냥꾼": `${CDN}/perk-images/styles/domination/ultimatehunter/ultimatehunter.png`,
  "보물 사냥꾼": `${CDN}/perk-images/styles/domination/treasurehunter/treasurehunter.png`,

  // === 마법 ===
  "신비로운 유성": `${CDN}/perk-images/styles/sorcery/arcanecomet/arcanecomet.png`,
  "콩콩이 소환": `${CDN}/perk-images/styles/sorcery/summonaery/summonaery.png`,
  "난입": `${CDN}/perk-images/styles/sorcery/phaserush/phaserush.png`,
  "무효화 구체": `${CDN}/perk-images/styles/sorcery/nullifyingorb/nullifyingorb.png`,
  "마나순환 팔찌": `${CDN}/perk-images/styles/sorcery/manaflowband/manaflowband.png`,
  "빛의 망토": `${CDN}/perk-images/styles/sorcery/nimbuscloak/nimbuscloak.png`,
  "초월": `${CDN}/perk-images/styles/sorcery/transcendence/transcendence.png`,
  "신속함": `${CDN}/perk-images/styles/sorcery/celerity/celeritytemp.png`,
  "절대 집중": `${CDN}/perk-images/styles/sorcery/absolutefocus/absolutefocus.png`,
  "주문 작열": `${CDN}/perk-images/styles/sorcery/scorch/scorch.png`,
  "폭풍 모으기": `${CDN}/perk-images/styles/sorcery/gatheringstorm/gatheringstorm.png`,
  "난기류": `${CDN}/perk-images/styles/sorcery/waterwalking/waterwalking.png`,

  // === 결의 ===
  "착취의 손아귀": `${CDN}/perk-images/styles/resolve/graspoftheundying/graspoftheundying.png`,
  "여진": `${CDN}/perk-images/styles/resolve/aftershock/aftershock.png`,
  "수호자": `${CDN}/perk-images/styles/resolve/guardian/guardian.png`,
  "철거": `${CDN}/perk-images/styles/resolve/demolish/demolish.png`,
  "생명의 샘": `${CDN}/perk-images/styles/resolve/fontoflife/fontoflife.png`,
  "보호막 강타": `${CDN}/perk-images/styles/resolve/shieldbash/shieldbash.png`,
  "컨디셔닝": `${CDN}/perk-images/styles/resolve/conditioning/conditioning.png`,
  "재생의 바람": `${CDN}/perk-images/styles/resolve/secondwind/secondwind.png`,
  "뼈 방패": `${CDN}/perk-images/styles/resolve/boneplating/boneplating.png`,
  "과잉 성장": `${CDN}/perk-images/styles/resolve/overgrowth/overgrowth.png`,
  "활기": `${CDN}/perk-images/styles/resolve/revitalize/revitalize.png`,
  "불굴의 의지": `${CDN}/perk-images/styles/resolve/unflinching/unflinching.png`,

  // === 영감 ===
  "빙결 강화": `${CDN}/perk-images/styles/inspiration/glacialaugment/glacialaugment.png`,
  "봉인 해제": `${CDN}/perk-images/styles/inspiration/unsealedspellbook/unsealedspellbook.png`,
  "선행": `${CDN}/perk-images/styles/inspiration/firststrike/firststrike.png`,
  "육각 플래시": `${CDN}/perk-images/styles/inspiration/hexflash/hexflash.png`,
  "마법의 신발": `${CDN}/perk-images/styles/inspiration/magicalfootwear/magicalfootwear.png`,
  "완벽한 타이밍": `${CDN}/perk-images/styles/inspiration/perfecttiming/perfecttiming.png`,
  "미래의 시장": `${CDN}/perk-images/styles/inspiration/futuresmarket/futuresmarket.png`,
  "물약 변환기": `${CDN}/perk-images/styles/inspiration/potionbiscuitdelivery/potionbiscuitdelivery.png`,  // biscuit
  "빚진 자의 시간": `${CDN}/perk-images/styles/inspiration/timewarptonic/timewarptonic.png`,
  "우주적 통찰력": `${CDN}/perk-images/styles/inspiration/cosmicinsight/cosmicinsight.png`,
  "쿠키 배달": `${CDN}/perk-images/styles/inspiration/potionbiscuitdelivery/potionbiscuitdelivery.png`,
  "질풍 접근": `${CDN}/perk-images/styles/inspiration/approachvelocity/approachvelocity.png`,
  "잭 오브 올 트레이드": `${CDN}/perk-images/styles/inspiration/jackofalltrades/jackofalltrades.png`,
};

/**
 * 룬 문자열 파싱.
 * "지배 - 감전 / 피의 맛 / 사냥의 증표 / 굶주린 사냥꾼"
 * → { style: "지배", runes: ["감전", "피의 맛", ...] }
 */
export function parseRuneString(str: string): { style: string; runes: string[] } {
  const [stylePart, runePart] = str.split(" - ");
  const style = stylePart?.trim() ?? "";
  const runes = runePart?.split("/").map(r => r.trim()).filter(Boolean) ?? [];
  return { style, runes };
}

/** 룬 이름으로 아이콘 URL 반환. 없으면 null. */
export function getRuneIconUrl(name: string): string | null {
  return RUNE_ICONS[name] ?? null;
}

/** 룬 스타일 이름으로 아이콘 URL 반환. */
export function getRuneStyleIconUrl(style: string): string | null {
  return RUNE_STYLE_ICONS[style] ?? null;
}
